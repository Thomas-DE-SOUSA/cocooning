# Messages

Cette page décrit comment le contexte `messaging` est construit : ses couches, ses use cases, la lecture du fil et le stockage des photos. À lire avant de modifier `packages/couple/server-business-logic/src/messaging/`.

## Rôle et limites

`messaging` porte le fil à deux du couple : les mots flash et les photos instantanées, gardés du plus récent au plus ancien, chacun avec son auteur et son heure ([décision 0050](../../decisions/messaging/0050-regles-des-messages.md)). Les deux partenaires voient tout le fil ; seul l'auteur retire ce qu'il a envoyé. Le contexte reçoit le `coupleId` par un port étroit ([décision 0041](../../decisions/0041-couple-de-la-requete.md)). Les octets d'une photo vivent sur le disque de la VM derrière le port `FileStorage` ([décision 0027](../../decisions/0027-stockage-des-photos.md)), jamais en base.

Construit aujourd'hui : domaine et application des mots flash, des photos spontanées et de la photo du jour (R7 à R9), tables `flash_message`, `instant_photo`, `photo_prompt` et `messaging_event` (voir [les tables](tables.md)), adaptateurs Prisma, tâche planifiée de l'invitation, contrat HTTP et huit routes de l'API. À venir avec les PR suivantes : le relais de l'outbox et le Web Push (R10, R11), puis le client et l'onglet « Messages ».

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `FlashMessage`, `InstantPhoto`, `PhotoPrompt` | Agrégats : un mot flash, une photo instantanée (spontanée ou photo du jour), l'invitation photo d'un couple pour un jour de Paris (voir [les agrégats](aggregate.md)) | `domain/models/` |
| `FlashMessageId`, `FlashMessageText`, `InstantPhotoId`, `InstantPhotoContent`, `PhotoPromptId` | Value objects : identités UUID v7, texte de 1 à `FLASH_MESSAGE_TEXT_MAX_LENGTH` signes (R2), octets d'une photo JPEG, PNG, WebP ou HEIC d'au plus `INSTANT_PHOTO_MAX_BYTES` (R3) | `domain/value-objects/` |
| `coupleCalendarDayAt`, `coupleInstantOf` | Jour de Paris d'un instant, instant d'une minute de l'horloge de Paris (changements d'heure compris) | `domain/value-objects/couple-time.ts` |
| `drawPhotoPromptTime`, `photoPromptClosingOf`, `photoPromptLateFrom` | Minute tirée entre 9 h et 21 h par `SecureRandomGenerator` (R7), minuit qui clôt le jour, seuil des 10 minutes (R8) | `domain/value-objects/photo-prompt-schedule.ts` |
| `photoPromptsAnsweredBy`, `isHiddenFrom` | Les invitations auxquelles un partenaire a répondu ; la photo du jour de l'autre cachée à qui n'a pas répondu (R9) | `domain/models/photo-of-the-day.ts` |
| `detectInstantPhotoContentType` | Reconnaît le format par les premiers octets du fichier, jamais par le type déclaré | `domain/value-objects/instant-photo-signature.ts` |
| `InstantPhotoContentTypeEnum`, `MessageFeedItemTypeEnum` | Formats acceptés et sortes d'élément du fil, partagés avec la PWA | `packages/couple/shared-kernel/src/enums/` |
| `MessagingException` | Exception du contexte, codes de `MessagingExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/messaging/exceptions/exception-codes.ts` |
| `FlashMessageRepository`, `InstantPhotoRepository` | Ports : `save`, `findById` (élément vivant du couple), `findNewest` (au plus `count` éléments vivants sous un identifiant, du plus récent au plus ancien) ; `InstantPhotoRepository.findOfPhotoPrompts` (les photos du jour vivantes de ces invitations, en une requête) | `domain/ports/` |
| `PhotoPromptRepository` | Port : `saveAll` (les invitations d'un passage de la tâche et leurs événements, une transaction), `findById`, `findOfDay` (l'invitation d'un jour de Paris pour une liste de couples, une requête) | `domain/ports/photo-prompt.repository.ts` |
| `PairedCoupleProvider` | Port : `findPairedCoupleIdOf`, le couple formé d'un partenaire (décision 0041), et `findPairedCoupleIds`, tous les couples formés pour la tâche planifiée (R7) : les deux seules recherches sans `coupleId` du contexte | `domain/ports/paired-couple.provider.ts` |
| `FlashMessagePreconditionService`, `InstantPhotoPreconditionService` | Domain services : l'élément vivant du couple, sinon `*_NOT_FOUND` ; le fichier d'une photo, sinon `INSTANT_PHOTO_DATA_CORRUPTED` | `domain/services/` |
| `MessageFeedService` | Domain service : une page du fil, fusion des deux sortes (R5) | `domain/services/message-feed.service.ts` |
| `PhotoPromptScheduleService` | Domain service : les invitations du jour à tirer et à envoyer pour tous les couples formés (R7) | `domain/services/photo-prompt-schedule.service.ts` |
| `PhotoPromptPreconditionService`, `PhotoPromptAnswerValidator` | L'invitation du couple, sinon `PHOTO_PROMPT_NOT_FOUND` ; une seule photo du jour par partenaire (`PHOTO_PROMPT_ALREADY_ANSWERED`) ; envoyée, avant minuit (`PHOTO_PROMPT_EXPIRED`, R8) | `domain/services/` |
| `PhotoOfTheDayService` | Domain service : l'invitation envoyée du jour et ses réponses (R7), les invitations auxquelles le lecteur a répondu parmi une page du fil (R9) | `domain/services/photo-of-the-day.service.ts` |
| `MessagingCoupleGuardService` | Guard service : construit l'`ExecutionContext` depuis le `PartnerContext`, sinon `MESSAGING_COUPLE_NOT_PAIRED` (R4, décision 0006) | `application/services/messaging-couple-guard.service.ts` |
| `SendFlashMessageUseCase`, `SendInstantPhotoUseCase`, `ListMessageFeedUseCase`, `WithdrawFlashMessageUseCase`, `WithdrawInstantPhotoUseCase`, `GetInstantPhotoFileUseCase`, `GetTodayPhotoPromptUseCase`, `AnswerPhotoPromptUseCase` | Use cases, `execute(context, command)` | `application/use-cases/` |
| `SchedulePhotoPromptsUseCase` | Use case de la tâche planifiée, `execute()` sans contexte ni commande : aucun partenaire ne le lance (R7) | `application/use-cases/schedule-photo-prompts.use-case.ts` |
| `toMessageFeedItemView`, `toMessageFeedPageView`, `toInstantPhotoFileView`, `toTodayPhotoPromptView` | Vues : élément du fil (sorte, identifiant, auteur, `isOwner`, heure d'envoi, texte ou type de contenu, invitation, retard, photo cachée), page, octets d'une photo, invitation du jour | `application/mappers/` |
| `FlashMessagePrismaRepository`, `InstantPhotoPrismaRepository`, `PhotoPromptPrismaRepository`, `PairedCouplePrismaProvider` | Adaptateurs : élément et outbox dans une transaction, verrou optimiste, `coupleId` dans chaque `where` | `apps/couple/api/src/modules/messaging/secondary/` |
| `PhotoPromptScheduler` | Adaptateur primaire de la tâche planifiée : un passage par minute dans le processus de l'API, jamais deux à la fois ; un échec est journalisé et repris au passage suivant | `apps/couple/api/src/modules/messaging/primary/scheduler/` |
| `StorageModule`, `LocalDiskFileStorage` | Fournit `FileStorage` à toute l'API, sous `FILE_STORAGE_DIRECTORY` | `packages/server-infrastructure/src/storage/` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/messaging/`.

## Endpoints

Toutes les routes demandent une session (cookie `cocooning_session`, [décision 0034](../../decisions/0034-session-revocable.md)), puis un couple formé : le garde `MessagingCoupleGuard` (`apps/couple/api/src/modules/messaging/primary/couple/`) pose l'`ExecutionContext` que `@CurrentCouple()` donne au contrôleur. Sans session `401`, sans couple formé `404` `MESSAGING_COUPLE_NOT_PAIRED`. Un élément du fil suit `MessageFeedItemResponseSchema`, union discriminée par `type` : `FLASH_MESSAGE` avec `text`, `INSTANT_PHOTO` avec `photoPromptId` (`null` pour une photo spontanée), `isLate` et `isHidden`, puis `contentType` seulement si `isHidden` vaut `false` (R9) ; tous portent `id`, `ownerId`, `isOwner` et `sentAt` (instant ISO).

| Route | Clé de `ApiRouterEnum` | Use case | Succès | Refus |
|---|---|---|---|---|
| `GET /message-feed?cursor&limit` | `MESSAGE_FEED_GET` | `ListMessageFeedUseCase` | `200`, `MessageFeedPageResponseSchema` (`items`, `nextCursor`) | `422` curseur ou limite invalides |
| `POST /flash-messages`, corps `SendFlashMessageRequestSchema` | `FLASH_MESSAGE_SEND` | `SendFlashMessageUseCase` | `201`, élément `FLASH_MESSAGE` | `422` texte vide ou trop long (R2) |
| `DELETE /flash-messages/:flashMessageId` | `FLASH_MESSAGE_WITHDRAW` | `WithdrawFlashMessageUseCase` | `204` | `403` `FLASH_MESSAGE_RESERVED_TO_OWNER` ; `404` `FLASH_MESSAGE_NOT_FOUND` ; `409` `FLASH_MESSAGE_VERSION_CONFLICT` |
| `POST /instant-photos`, `multipart/form-data`, champ `photo` (`INSTANT_PHOTO_FORM_FIELD`) | `INSTANT_PHOTO_SEND` | `SendInstantPhotoUseCase` | `201`, élément `INSTANT_PHOTO` | `422` `INSTANT_PHOTO_CONTENT_INVALID` : format refusé, trop lourd, champ absent (R3) |
| `DELETE /instant-photos/:instantPhotoId` | `INSTANT_PHOTO_WITHDRAW` | `WithdrawInstantPhotoUseCase` | `204` | `403` `INSTANT_PHOTO_RESERVED_TO_OWNER` ; `404` `INSTANT_PHOTO_NOT_FOUND` ; `409` `INSTANT_PHOTO_VERSION_CONFLICT` |
| `GET /instant-photos/:instantPhotoId/file` | `INSTANT_PHOTO_FILE_GET` | `GetInstantPhotoFileUseCase` | `200`, les octets, `Content-Type` du format détecté | `404` `INSTANT_PHOTO_NOT_FOUND`, aussi pour la photo du jour de l'autre tant que le lecteur n'a pas envoyé la sienne (R9) ; `500` fichier disparu (`INSTANT_PHOTO_DATA_CORRUPTED`) |
| `GET /photo-prompts/today` | `PHOTO_PROMPT_TODAY_GET` | `GetTodayPhotoPromptUseCase` | `200`, `TodayPhotoPromptResponseSchema` : `photoPrompt` vaut `null` avant l'envoi, sinon `id`, `issuedAt`, `lateFrom`, `closesAt`, `myInstantPhotoId`, `isAnsweredByPartner` | aucun propre |
| `POST /photo-prompts/:photoPromptId/instant-photos`, `multipart/form-data`, champ `photo` | `PHOTO_PROMPT_ANSWER` | `AnswerPhotoPromptUseCase` | `201`, élément `INSTANT_PHOTO` avec `photoPromptId` et `isLate` | `404` `PHOTO_PROMPT_NOT_FOUND` (inconnue, d'un autre couple ou pas encore envoyée) ; `409` `PHOTO_PROMPT_ALREADY_ANSWERED`, `PHOTO_PROMPT_EXPIRED` ; `422` photo ou identifiant invalides |

## Points d'attention

- **Le fil par curseur.** Le curseur est l'identifiant UUID v7 du dernier élément reçu ([décision 0025](../../decisions/0025-pagination.md)), et `CursorPaginationQuerySchema` de `@cocooning/couple-contract/shared` le valide. `MessageFeedService` lit `limit + 1` éléments de chaque table sous ce curseur, deux requêtes en parallèle, fusionne par identifiant décroissant et coupe : un élément de plus que la page dit qu'une autre page suit. L'identifiant suit l'ordre de création ; l'heure d'envoi (`sentAt`) est celle de l'horloge injectée.
- **Le format vient des octets.** `InstantPhotoContent.create` lit la signature du fichier (JPEG `FF D8 FF`, PNG, `RIFF…WEBP`, boîte `ftyp` d'une marque HEIF) ; le type déclaré par le téléphone n'est jamais lu. Multer s'arrête à `INSTANT_PHOTO_MAX_BYTES` et `InstantPhotoTooHeavyInterceptor` rend ce refus en `422`, comme toute photo refusée.
- **Fichier, puis ligne.** L'envoi dépose le fichier avant d'écrire la ligne ; le retrait retire la ligne avant de supprimer le fichier. Un échec entre les deux laisse un fichier que rien ne lit, jamais une photo du fil sans octets.
- **La clé ne sort pas de l'API.** `InstantPhoto.fileKey` vaut `<coupleId>/instant-photos/<instantPhotoId>` ; la PWA lit la photo par `INSTANT_PHOTO_FILE_GET`, filtrée par couple comme le reste.
- **La tâche planifiée vit dans l'API.** `PhotoPromptScheduler` démarre à `onApplicationBootstrap` un `setInterval` d'une minute (`PHOTO_PROMPT_TICK_INTERVAL_MS`) si `PHOTO_PROMPT_SCHEDULER_ENABLED` vaut `true`, et l'arrête à `onModuleDestroy` après le passage en cours. Pas de worker ni de file ([décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)), pas de `@nestjs/schedule`. Chaque passage lit deux fois la base (les couples formés, puis leurs invitations du jour) et écrit une transaction : `createMany` des invitations tirées, un seul `UPDATE … FROM unnest(…)` des invitations envoyées, l'outbox en un `createMany`. Les E2E coupent le minuteur et appellent `tick()` sur une horloge déterministe.
- **Rien n'est tiré ni envoyé deux fois.** L'heure tirée et l'envoi sont gardés en base : un redémarrage relit l'invitation du jour. Deux passages concurrents (deux processus) se heurtent à l'index unique `(couple_id, day)` ou à la version, `PHOTO_PROMPT_VERSION_CONFLICT`, et toute la transaction est annulée ; le passage suivant reprend.
- **Le jour est celui de Paris.** Le jour d'une invitation, la fenêtre de 9 h à 21 h et minuit sont calculés à l'heure de Paris par `couple-time.ts`, qui relit le décalage à l'instant visé : un jour de changement d'heure dure 23 ou 25 heures. L'heure tirée est gardée en instant UTC, comme `issuedAt` : la tâche la compare à l'horloge ([décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md), « Risques »).
- **La photo cachée ne sort pas de l'API.** Le fil ne rend ni `contentType` ni URL de la photo du jour de l'autre tant que le lecteur n'a pas répondu à la même invitation, et son fichier répond `404` comme une photo inconnue (R9). Une requête par page du fil suffit (`findOfPhotoPrompts`), aucune sans photo du jour.
- **Le contenu appartient au couple.** Aucun événement de domaine ni aucun log ne porte le texte d'un mot ni la photo (`core.md` règle 33).

## Décisions liées

- [Décision 0050](../../decisions/messaging/0050-regles-des-messages.md) : règles des messages
- [Décision 0027](../../decisions/0027-stockage-des-photos.md) : photos sur disque derrière `FileStorage`
- [Décision 0025](../../decisions/0025-pagination.md) : curseur pour le défilement infini
- [Décision 0041](../../decisions/0041-couple-de-la-requete.md) : le couple de la requête vient de `pairing`
- [Décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md) : outbox PostgreSQL
