# Notes

Cette page décrit comment le contexte `notes` est construit : ses couches, ses use cases et la façon dont il trouve le couple de la requête. À lire avant de modifier `packages/couple/server-business-logic/src/notes/`.

## Rôle et limites

`notes` porte les notes du couple : leur titre, leur propriétaire, leur visibilité et leur cycle de vie. Le contenu riche, document Yjs édité à deux, arrive avec le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)). Le contexte ne connaît ni les sessions (`authentication`) ni le code d'invitation (`pairing`) : il reçoit le `coupleId` par un port étroit ([décision 0041](../../decisions/0041-couple-de-la-requete.md)).

Construit aujourd'hui : domaine et application, tables `note` et `note_event` (voir [les tables](tables.md)), adaptateur Prisma de `NoteRepository` et de `PairedCoupleProvider`. Contrat HTTP et six routes de l'API, canal temps réel (voir [l'édition à deux](collaboration.md)). À venir dans l'étape « notes » : écrans de la PWA.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Note` | Agrégat : titre, propriétaire, visibilité (voir [l'agrégat](aggregate.md)) | `domain/models/note.aggregate.ts` |
| `NoteId`, `NoteTitle` | Value objects : identité UUID v7, titre de 1 à `NOTE_TITLE_MAX_LENGTH` signes (R8) | `domain/value-objects/` |
| `NoteVisibilityEnum` | `PRIVATE`, `SHARED`, partagé avec la PWA | `packages/couple/shared-kernel/src/enums/note-visibility.enum.ts` |
| `NoteException` | Exception du contexte, codes de `NoteExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/notes/exceptions/exception-codes.ts` |
| `NoteRepository` | Port : `save`, `findVisibleById`, `findVisible` (une page par offset et le total, [décision 0025](../../decisions/0025-pagination.md)) ; la visibilité est filtrée par la requête (R4) | `domain/ports/note.repository.ts` |
| `NoteContentRepository`, `NoteCollaborationProvider` | Ports du canal temps réel : état Yjs de la note ; déconnexion des éditeurs qui perdent la note (R5, R7) | `domain/ports/` |
| `AuthorizeNoteDocumentUseCase`, `LoadNoteDocumentUseCase`, `SaveNoteDocumentUseCase` | Use cases du canal : accès à l'ouverture, chargement, enregistrement du document | `application/use-cases/` |
| `PairedCoupleProvider` | Port : le couple formé d'un partenaire, seule recherche sans `coupleId` du contexte (décision 0041) | `domain/ports/paired-couple.provider.ts` |
| `NotePreconditionService` | Domain service : la note visible pour le partenaire, sinon `NOTE_NOT_FOUND` | `domain/services/note-precondition.service.ts` |
| `NoteAccessValidator` | Contrôle statique : action réservée à la propriétaire (R5, R7) | `domain/services/note-access.validator.ts` |
| `NoteCoupleGuardService` | Guard service : construit l'`ExecutionContext` depuis le `PartnerContext`, sinon `NOTE_COUPLE_NOT_PAIRED` (R3, décision 0006) | `application/services/note-couple-guard.service.ts` |
| `CreateNoteUseCase`, `ListNotesUseCase` (page `OffsetPage<NoteView>`), `RenameNoteUseCase`, `ShareNoteUseCase`, `MakeNotePrivateUseCase`, `DeleteNoteUseCase` | Use cases, `execute(context)` ou `execute(context, command)` | `application/use-cases/` |
| `NotePrismaRepository`, `PairedCouplePrismaProvider` | Adaptateurs : note et outbox dans une transaction, verrou optimiste, visibilité dans le `where` ; lecture seule du couple formé dans les tables de `pairing` (couple supprimé exclu) | `apps/couple/api/src/modules/notes/secondary/` |
| `toNoteView` | Vue rendue pour le partenaire qui lit : identifiant, propriétaire, `isOwner` (la lectrice est la propriétaire, pour les actions de R5 et R7), titre, visibilité, dernière modification | `application/mappers/note-view.mapper.ts` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/notes/`.

## Endpoints

Toutes les routes demandent une session (cookie `cocooning_session`, [décision 0034](../../decisions/0034-session-revocable.md)), puis un couple formé : le garde `NoteCoupleGuard` (`apps/couple/api/src/modules/notes/primary/couple/`) pose l'`ExecutionContext` que `@CurrentCouple()` donne au contrôleur. Sans session `401`, sans couple formé `404` `NOTE_COUPLE_NOT_PAIRED`. Le corps d'une réponse suit `NoteResponseSchema`.

| Route | Clé de `ApiRouterEnum` | Use case | Succès | Refus |
|---|---|---|---|---|
| `POST /notes`, corps `CreateNoteRequestSchema` | `NOTE_CREATE` | `CreateNoteUseCase` | `201` | `422` titre invalide |
| `GET /notes?page&pageSize` | `NOTE_LIST` | `ListNotesUseCase` | `200`, `NotePageResponseSchema` | `422` pagination invalide |
| `PATCH /notes/:noteId`, corps `RenameNoteRequestSchema` | `NOTE_RENAME` | `RenameNoteUseCase` | `200` | `404` `NOTE_NOT_FOUND` ; `409` `NOTE_VERSION_CONFLICT` ; `422` |
| `POST /notes/:noteId/share` | `NOTE_SHARE` | `ShareNoteUseCase` | `200` | `403` `NOTE_RESERVED_TO_OWNER` ; `404` |
| `POST /notes/:noteId/make-private` | `NOTE_MAKE_PRIVATE` | `MakeNotePrivateUseCase` | `200` | `403` ; `404` |
| `DELETE /notes/:noteId` | `NOTE_DELETE` | `DeleteNoteUseCase` | `204` | `403` ; `404` |

## Points d'attention

- **Couple de la requête.** Les use cases reçoivent un `ExecutionContext` complet. L'API le construit par `NoteCoupleGuardService` avant d'appeler un use case ; sans couple formé, `404` `NOTE_COUPLE_NOT_PAIRED`.
- **Visibilité dans la requête.** `findVisibleById` et `findVisible` ne rendent que les notes vivantes du couple, partagées ou à ce partenaire (`core-backend.md` règle 12) : la note privée de l'autre répond `NOTE_NOT_FOUND`, comme une note inexistante (R4).
- **Le titre est un contenu du couple.** Aucun événement ne le porte (`core.md` règle 33).

## Décisions liées

- [Décision 0039](../../decisions/notes/0039-regles-des-notes.md) : règles des notes
- [Décision 0041](../../decisions/0041-couple-de-la-requete.md) : le couple de la requête vient de `pairing`
- [Décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md) : portée par couple et propriétaire
