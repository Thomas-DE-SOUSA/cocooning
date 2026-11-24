# Messages

Cette page décrit comment le contexte `messaging` est construit : ses couches, ses use cases, la lecture du fil et le stockage des photos. À lire avant de modifier `packages/couple/server-business-logic/src/messaging/`.

## Rôle et limites

`messaging` porte le fil à deux du couple : les mots flash et les photos instantanées, gardés du plus récent au plus ancien, chacun avec son auteur et son heure ([décision 0050](../../decisions/messaging/0050-regles-des-messages.md)). Les deux partenaires voient tout le fil ; seul l'auteur retire ce qu'il a envoyé. Le contexte reçoit le `coupleId` par un port étroit ([décision 0041](../../decisions/0041-couple-de-la-requete.md)). Les octets d'une photo vivent sur le disque de la VM derrière le port `FileStorage` ([décision 0027](../../decisions/0027-stockage-des-photos.md)), jamais en base.

Construit aujourd'hui : domaine et application des mots flash et des photos spontanées, tables `flash_message`, `instant_photo` et `messaging_event` (voir [les tables](tables.md)), adaptateurs Prisma, contrat HTTP et six routes de l'API. À venir avec les PR suivantes : la photo du jour (R7 à R9), le relais de l'outbox et le Web Push (R10, R11), puis le client et l'onglet « Messages ».

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `FlashMessage`, `InstantPhoto` | Agrégats : un mot flash, une photo instantanée (voir [les agrégats](aggregate.md)) | `domain/models/` |
| `FlashMessageId`, `FlashMessageText`, `InstantPhotoId`, `InstantPhotoContent` | Value objects : identités UUID v7, texte de 1 à `FLASH_MESSAGE_TEXT_MAX_LENGTH` signes (R2), octets d'une photo JPEG, PNG, WebP ou HEIC d'au plus `INSTANT_PHOTO_MAX_BYTES` (R3) | `domain/value-objects/` |
| `detectInstantPhotoContentType` | Reconnaît le format par les premiers octets du fichier, jamais par le type déclaré | `domain/value-objects/instant-photo-signature.ts` |
| `InstantPhotoContentTypeEnum`, `MessageFeedItemTypeEnum` | Formats acceptés et sortes d'élément du fil, partagés avec la PWA | `packages/couple/shared-kernel/src/enums/` |
| `MessagingException` | Exception du contexte, codes de `MessagingExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/messaging/exceptions/exception-codes.ts` |
| `FlashMessageRepository`, `InstantPhotoRepository` | Ports : `save`, `findById` (élément vivant du couple), `findNewest` (au plus `count` éléments vivants sous un identifiant, du plus récent au plus ancien) | `domain/ports/` |
| `PairedCoupleProvider` | Port : le couple formé d'un partenaire, seule recherche sans `coupleId` du contexte (décision 0041) | `domain/ports/paired-couple.provider.ts` |
| `FlashMessagePreconditionService`, `InstantPhotoPreconditionService` | Domain services : l'élément vivant du couple, sinon `*_NOT_FOUND` ; le fichier d'une photo, sinon `INSTANT_PHOTO_DATA_CORRUPTED` | `domain/services/` |
| `MessageFeedService` | Domain service : une page du fil, fusion des deux sortes (R5) | `domain/services/message-feed.service.ts` |
| `MessagingCoupleGuardService` | Guard service : construit l'`ExecutionContext` depuis le `PartnerContext`, sinon `MESSAGING_COUPLE_NOT_PAIRED` (R4, décision 0006) | `application/services/messaging-couple-guard.service.ts` |
| `SendFlashMessageUseCase`, `SendInstantPhotoUseCase`, `ListMessageFeedUseCase`, `WithdrawFlashMessageUseCase`, `WithdrawInstantPhotoUseCase`, `GetInstantPhotoFileUseCase` | Use cases, `execute(context, command)` | `application/use-cases/` |
| `toMessageFeedItemView`, `toMessageFeedPageView`, `toInstantPhotoFileView` | Vues : élément du fil (sorte, identifiant, auteur, `isOwner`, heure d'envoi, texte ou type de contenu), page, octets d'une photo | `application/mappers/` |
| `FlashMessagePrismaRepository`, `InstantPhotoPrismaRepository`, `PairedCouplePrismaProvider` | Adaptateurs : élément et outbox dans une transaction, verrou optimiste, `coupleId` dans chaque `where` | `apps/couple/api/src/modules/messaging/secondary/` |
| `StorageModule`, `LocalDiskFileStorage` | Fournit `FileStorage` à toute l'API, sous `FILE_STORAGE_DIRECTORY` | `packages/server-infrastructure/src/storage/` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/messaging/`.

## Endpoints

Toutes les routes demandent une session (cookie `cocooning_session`, [décision 0034](../../decisions/0034-session-revocable.md)), puis un couple formé : le garde `MessagingCoupleGuard` (`apps/couple/api/src/modules/messaging/primary/couple/`) pose l'`ExecutionContext` que `@CurrentCouple()` donne au contrôleur. Sans session `401`, sans couple formé `404` `MESSAGING_COUPLE_NOT_PAIRED`. Un élément du fil suit `MessageFeedItemResponseSchema`, union discriminée par `type` : `FLASH_MESSAGE` avec `text`, `INSTANT_PHOTO` avec `contentType` ; tous deux portent `id`, `ownerId`, `isOwner` et `sentAt` (instant ISO).

| Route | Clé de `ApiRouterEnum` | Use case | Succès | Refus |
|---|---|---|---|---|
| `GET /message-feed?cursor&limit` | `MESSAGE_FEED_GET` | `ListMessageFeedUseCase` | `200`, `MessageFeedPageResponseSchema` (`items`, `nextCursor`) | `422` curseur ou limite invalides |
| `POST /flash-messages`, corps `SendFlashMessageRequestSchema` | `FLASH_MESSAGE_SEND` | `SendFlashMessageUseCase` | `201`, élément `FLASH_MESSAGE` | `422` texte vide ou trop long (R2) |
| `DELETE /flash-messages/:flashMessageId` | `FLASH_MESSAGE_WITHDRAW` | `WithdrawFlashMessageUseCase` | `204` | `403` `FLASH_MESSAGE_RESERVED_TO_OWNER` ; `404` `FLASH_MESSAGE_NOT_FOUND` ; `409` `FLASH_MESSAGE_VERSION_CONFLICT` |
| `POST /instant-photos`, `multipart/form-data`, champ `photo` (`INSTANT_PHOTO_FORM_FIELD`) | `INSTANT_PHOTO_SEND` | `SendInstantPhotoUseCase` | `201`, élément `INSTANT_PHOTO` | `422` `INSTANT_PHOTO_CONTENT_INVALID` : format refusé, trop lourd, champ absent (R3) |
| `DELETE /instant-photos/:instantPhotoId` | `INSTANT_PHOTO_WITHDRAW` | `WithdrawInstantPhotoUseCase` | `204` | `403` `INSTANT_PHOTO_RESERVED_TO_OWNER` ; `404` `INSTANT_PHOTO_NOT_FOUND` ; `409` `INSTANT_PHOTO_VERSION_CONFLICT` |
| `GET /instant-photos/:instantPhotoId/file` | `INSTANT_PHOTO_FILE_GET` | `GetInstantPhotoFileUseCase` | `200`, les octets, `Content-Type` du format détecté | `404` `INSTANT_PHOTO_NOT_FOUND` ; `500` fichier disparu (`INSTANT_PHOTO_DATA_CORRUPTED`) |

## Points d'attention

- **Le fil par curseur.** Le curseur est l'identifiant UUID v7 du dernier élément reçu ([décision 0025](../../decisions/0025-pagination.md)), et `CursorPaginationQuerySchema` de `@cocooning/couple-contract/shared` le valide. `MessageFeedService` lit `limit + 1` éléments de chaque table sous ce curseur, deux requêtes en parallèle, fusionne par identifiant décroissant et coupe : un élément de plus que la page dit qu'une autre page suit. L'identifiant suit l'ordre de création ; l'heure d'envoi (`sentAt`) est celle de l'horloge injectée.
- **Le format vient des octets.** `InstantPhotoContent.create` lit la signature du fichier (JPEG `FF D8 FF`, PNG, `RIFF…WEBP`, boîte `ftyp` d'une marque HEIF) ; le type déclaré par le téléphone n'est jamais lu. Multer s'arrête à `INSTANT_PHOTO_MAX_BYTES` et `InstantPhotoTooHeavyInterceptor` rend ce refus en `422`, comme toute photo refusée.
- **Fichier, puis ligne.** L'envoi dépose le fichier avant d'écrire la ligne ; le retrait retire la ligne avant de supprimer le fichier. Un échec entre les deux laisse un fichier que rien ne lit, jamais une photo du fil sans octets.
- **La clé ne sort pas de l'API.** `InstantPhoto.fileKey` vaut `<coupleId>/instant-photos/<instantPhotoId>` ; la PWA lit la photo par `INSTANT_PHOTO_FILE_GET`, filtrée par couple comme le reste.
- **Le contenu appartient au couple.** Aucun événement de domaine ni aucun log ne porte le texte d'un mot ni la photo (`core.md` règle 33).

## Décisions liées

- [Décision 0050](../../decisions/messaging/0050-regles-des-messages.md) : règles des messages
- [Décision 0027](../../decisions/0027-stockage-des-photos.md) : photos sur disque derrière `FileStorage`
- [Décision 0025](../../decisions/0025-pagination.md) : curseur pour le défilement infini
- [Décision 0041](../../decisions/0041-couple-de-la-requete.md) : le couple de la requête vient de `pairing`
- [Décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md) : outbox PostgreSQL
