# Notes

Cette page décrit comment le contexte `notes` est construit : ses couches, ses use cases et la façon dont il trouve le couple de la requête. À lire avant de modifier `packages/couple/server-business-logic/src/notes/`.

## Rôle et limites

`notes` porte les notes du couple : leur titre, leur propriétaire, leur visibilité, leur dossier et leur cycle de vie, ainsi que les deux espaces et les dossiers où elles se rangent ([décision 0052](../../decisions/notes/0052-dossiers-et-dossiers-ia.md), lot 1 sans IA). Le contenu riche, document Yjs édité à deux, arrive avec le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)). Le contexte ne connaît ni les sessions (`authentication`) ni le code d'invitation (`pairing`) : il reçoit le `coupleId` par un port étroit ([décision 0041](../../decisions/0041-couple-de-la-requete.md)).

Construit aujourd'hui : domaine et application, tables `note`, `folder`, `note_card` et `note_event` (voir [les tables](tables.md)), adaptateurs Prisma de `NoteRepository`, `FolderRepository` et `PairedCoupleProvider`. Contrat HTTP et routes de l'API, canal temps réel (voir [l'édition à deux](collaboration.md)), liste, page et éditeur d'une note dans la PWA. À venir : les espaces et les dossiers dans la PWA (lot 1 des dossiers), la route `/collab` en production.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Note` | Agrégat : titre, propriétaire, visibilité, dossier (voir [les agrégats](aggregate.md)) | `domain/models/note.aggregate.ts` |
| `Folder` | Agrégat : espace, genre (classique ou IA), dossier parent, nom, sujet et fiche type en haut d'un arbre IA (R13 à R18) | `domain/models/folder.aggregate.ts` |
| `NoteId`, `NoteTitle`, `FolderId`, `FolderName`, `FolderSubject`, `CardTemplate` | Value objects : identités UUID v7, titre de 1 à `NOTE_TITLE_MAX_LENGTH` signes (R8), nom de dossier de 1 à `FOLDER_NAME_MAX_LENGTH` (R13), sujet et fiche type d'un dossier IA (R17) | `domain/value-objects/` |
| `NoteVisibilityEnum`, `NoteSpaceEnum` | `PRIVATE`, `SHARED` ; l'espace d'une note est celui de sa visibilité (`visibilityOfSpace`, `spaceOfVisibility`, `domain/models/note-space.ts`), partagés avec la PWA | `packages/couple/shared-kernel/src/enums/` |
| `NoteException` | Exception du contexte, codes de `NoteExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/notes/exceptions/exception-codes.ts` |
| `NoteRepository` | Port : `save`, `findVisibleById`, `findVisible` (une page par offset et le total, [décision 0025](../../decisions/0025-pagination.md)), `findVisibleIn` (les notes d'un dossier ou d'une racine), `countVisibleByFolder`, `countVisibleBySpace` ; la visibilité est filtrée par la requête (R4) | `domain/ports/note.repository.ts` |
| `FolderRepository` | Port : `save`, `findVisibleById`, `findVisibleChildren` (par nom), `findPath` (de la racine au dossier, une requête), `findLineage` (les dossiers de la racine au dossier, R18), `countVisibleChildren`, `countVisibleBySpace`, `moveContentUp` (R16) ; visibilité dans la requête (R14) | `domain/ports/folder.repository.ts` |
| `NoteContentRepository`, `NoteCollaborationProvider` | Ports du canal temps réel : état Yjs de la note ; déconnexion des éditeurs qui perdent la note (R5, R7) | `domain/ports/` |
| `AuthorizeNoteDocumentUseCase`, `LoadNoteDocumentUseCase`, `SaveNoteDocumentUseCase` | Use cases du canal : accès à l'ouverture, chargement, enregistrement du document | `application/use-cases/` |
| `PairedCoupleProvider` | Port : le couple formé d'un partenaire, seule recherche sans `coupleId` du contexte (décision 0041) | `domain/ports/paired-couple.provider.ts` |
| `NotePreconditionService` | Domain service : la note visible pour le partenaire, sinon `NOTE_NOT_FOUND` | `domain/services/note-precondition.service.ts` |
| `NoteAccessValidator` | Contrôle statique : action réservée à la propriétaire (R5, R7) | `domain/services/note-access.validator.ts` |
| `FolderPreconditionService` | Domain service : le dossier visible, sinon `FOLDER_NOT_FOUND` ; la destination d'une note ou d'un dossier, dans l'espace demandé | `domain/services/folder-precondition.service.ts` |
| `FolderPlacementValidator` | Contrôle statique : dossier du bon espace (`FOLDER_SPACE_MISMATCH`), déplacement sans cycle ni changement d'espace (`FOLDER_MOVE_INVALID`) | `domain/services/folder-placement.validator.ts` |
| `SmartFolderValidator`, `CardContextService` | Contrôle statique du genre d'un dossier créé et du dossier qui porte la fiche type (R17, R18) ; domain service qui lit la lignée d'un dossier et en tire le contexte des fiches, sinon `FOLDER_NOT_SMART` | `domain/services/` |
| `WebSearchProvider`, `WebPageReader` | Ports de la recherche ([décision 0054](../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md)) : les premiers résultats de SearXNG (`SearxngWebSearchProvider`, `GET /search?format=json&language=fr`, `WEB_SEARCH_RESULT_COUNT`), le texte des premières pages lues en parallèle (`FetchWebPageReader`, `htmlToText`, `WEB_PAGE_TEXT_MAX_LENGTH`), bornés par `WEB_SEARCH_TIMEOUT_MS` ; panne : `NOTE_CARD_SEARCH_UNAVAILABLE` | `domain/ports/`, `apps/couple/api/src/modules/notes/secondary/providers/` |
| `NoteCardWriter` | Port de l'IA ([décision 0054](../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md)) : `proposeTemplate`, `writeCard` (candidats ou une valeur par case et les sources, `NoteCardWriting`) ; adaptateur `GeminiNoteCardWriter` (API Interactions par `fetch`, réponse JSON validée par Zod, `NOTE_CARD_WRITER_UNAVAILABLE` sinon) | `domain/ports/note-card.writer.ts`, `apps/couple/api/src/modules/notes/secondary/providers/` |
| `NoteCard`, `NoteCardRepository` | Agrégat de la fiche d'une note d'un dossier IA (voir [les agrégats](aggregate.md)) ; port `save`, `saveAll`, `findByNoteId`, `findByNoteIds`, `findInTree` (fiches d'un dossier et de ses sous-dossiers), adaptateur `NoteCardPrismaRepository` | `domain/models/note-card.aggregate.ts`, `domain/ports/note-card.repository.ts` |
| `NoteCardPreconditionService` | Domain service : la fiche d'une note visible, sinon `NOTE_CARD_NOT_FOUND` | `domain/services/note-card-precondition.service.ts` |
| `AddNoteCardUseCase`, `ChooseNoteCardCandidateUseCase`, `RefineNoteCardUseCase`, `RefreshNoteCardUseCase`, `CorrectNoteCardFieldUseCase` | Use cases des fiches (R19 à R22) ; `GetNoteUseCase` et `GetNoteSpaceContentsUseCase` rendent la fiche de chaque note (`NoteDetailView`) et le contexte du dossier IA ouvert | `application/use-cases/` |
| `NoteRevocationService` | Domain service : une note passée dans « Privé » par `MoveNoteUseCase` ne reste ouverte que pour sa propriétaire (R5, R11) | `domain/services/note-revocation.service.ts` |
| `NoteCoupleGuardService` | Guard service : construit l'`ExecutionContext` depuis le `PartnerContext`, sinon `NOTE_COUPLE_NOT_PAIRED` (R3, décision 0006) | `application/services/note-couple-guard.service.ts` |
| `CreateNoteUseCase`, `ListNotesUseCase` (page `OffsetPage<NoteView>`, la plus récemment modifiée d'abord), `GetNoteUseCase`, `RenameNoteUseCase`, `ShareNoteUseCase`, `MakeNotePrivateUseCase`, `DeleteNoteUseCase`, `MoveNoteUseCase` | Use cases des notes, `execute(context)` ou `execute(context, command)` | `application/use-cases/` |
| `ListNoteSpacesUseCase`, `GetNoteSpaceContentsUseCase`, `CreateFolderUseCase`, `RenameFolderUseCase`, `MoveFolderUseCase`, `DeleteFolderUseCase`, `ProposeFolderTemplateUseCase`, `EditFolderTemplateUseCase` | Use cases des espaces et des dossiers ; `DeleteFolderUseCase` sauve le dossier et fait remonter son contenu dans une `UnitOfWork` | `application/use-cases/` |
| `NotePrismaRepository`, `FolderPrismaRepository`, `PairedCouplePrismaProvider` | Adaptateurs : note ou dossier et outbox `note_event` dans une transaction, comptes par `groupBy`, chemin par requête récursive, verrou optimiste, visibilité dans le `where` ; lecture seule du couple formé dans les tables de `pairing` (couple supprimé exclu) | `apps/couple/api/src/modules/notes/secondary/` |
| `toNoteView` | Vue rendue pour le partenaire qui lit : identifiant, propriétaire, `isOwner` (la lectrice est la propriétaire, pour les actions de R5 et R7), titre, visibilité, dossier, dernière modification | `application/mappers/note-view.mapper.ts` |
| `toFolderView`, `toNoteSpaceContentsView`, `toNoteSpacesView` | Vues d'un dossier ; du contenu d'une racine ou d'un dossier (chemin, dossiers par nom avec leurs nombres de dossiers et de notes, notes) ; des deux espaces | `application/mappers/` |
| Liste et page d'une note | Accueil de la PWA (route `/`) : les notes visibles, la création par le titre, et pour la propriétaire partager, rendre privée, supprimer après une confirmation ; page `/notes/:noteId` pour renommer et écrire à deux (voir [le front de la PWA](../frontend/index.md)) | `apps/couple/web/src/modules/notes/` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/notes/`.

## Endpoints

Toutes les routes demandent une session (cookie `cocooning_session`, [décision 0034](../../decisions/0034-session-revocable.md)), puis un couple formé : le garde `NoteCoupleGuard` (`apps/couple/api/src/modules/notes/primary/couple/`) pose l'`ExecutionContext` que `@CurrentCouple()` donne au contrôleur. Sans session `401`, sans couple formé `404` `NOTE_COUPLE_NOT_PAIRED`. Le corps d'une réponse de note suit `NoteResponseSchema`, celui d'un dossier `FolderResponseSchema`.

| Route | Clé de `ApiRouterEnum` | Use case | Succès | Refus |
|---|---|---|---|---|
| `POST /notes`, corps `CreateNoteRequestSchema` | `NOTE_CREATE` | `CreateNoteUseCase` | `201` | `422` titre invalide |
| `GET /notes?page&pageSize` | `NOTE_LIST` | `ListNotesUseCase` | `200`, `NotePageResponseSchema` | `422` pagination invalide |
| `GET /notes/:noteId` | `NOTE_GET` | `GetNoteUseCase` | `200`, `NoteDetailResponseSchema` (la note et sa fiche ou `null`) | `404` `NOTE_NOT_FOUND` (R4) ; `422` identifiant invalide |
| `PATCH /notes/:noteId`, corps `RenameNoteRequestSchema` | `NOTE_RENAME` | `RenameNoteUseCase` | `200` | `404` `NOTE_NOT_FOUND` ; `409` `NOTE_VERSION_CONFLICT` ; `422` |
| `POST /notes/:noteId/share` | `NOTE_SHARE` | `ShareNoteUseCase` | `200` | `403` `NOTE_RESERVED_TO_OWNER` ; `404` |
| `POST /notes/:noteId/make-private` | `NOTE_MAKE_PRIVATE` | `MakeNotePrivateUseCase` | `200` | `403` ; `404` |
| `DELETE /notes/:noteId` | `NOTE_DELETE` | `DeleteNoteUseCase` | `204` | `403` ; `404` |
| `POST /notes/:noteId/move`, corps `MoveNoteRequestSchema` | `NOTE_MOVE` | `MoveNoteUseCase` | `200` | `403` changement d'espace par l'autre ; `404` note ou dossier ; `422` `FOLDER_SPACE_MISMATCH` |
| `GET /note-spaces` | `NOTE_SPACE_LIST` | `ListNoteSpacesUseCase` | `200`, `NoteSpacesResponseSchema` | |
| `GET /note-spaces/:space/contents?folderId` | `NOTE_SPACE_CONTENTS_GET` | `GetNoteSpaceContentsUseCase` | `200`, `NoteSpaceContentsResponseSchema` | `404` `FOLDER_NOT_FOUND` ; `422` espace inconnu ou `FOLDER_SPACE_MISMATCH` |
| `POST /note-folders`, corps `CreateFolderRequestSchema` | `FOLDER_CREATE` | `CreateFolderUseCase` | `201` | `404` parent ; `422` nom, espace, genre, sujet ou fiche type |
| `POST /note-folders/template-proposals`, corps `ProposeFolderTemplateRequestSchema` | `FOLDER_TEMPLATE_PROPOSE` | `ProposeFolderTemplateUseCase` | `200`, `FolderTemplateProposalResponseSchema` | `404` parent ; `422` `FOLDER_TEMPLATE_INHERITED` ; `503` `NOTE_CARD_WRITER_UNAVAILABLE` |
| `PUT /note-folders/:folderId/template`, corps `EditFolderTemplateRequestSchema` | `FOLDER_TEMPLATE_EDIT` | `EditFolderTemplateUseCase` | `200`, le dossier qui porte la fiche type | `404` ; `409` ; `422` `FOLDER_NOT_SMART`, sujet ou fiche type |
| `PATCH /note-folders/:folderId`, corps `RenameFolderRequestSchema` | `FOLDER_RENAME` | `RenameFolderUseCase` | `200` | `404` ; `409` `FOLDER_VERSION_CONFLICT` ; `422` |
| `POST /note-folders/:folderId/move`, corps `MoveFolderRequestSchema` | `FOLDER_MOVE` | `MoveFolderUseCase` | `200` | `404` ; `409` ; `422` `FOLDER_MOVE_INVALID` |
| `POST /note-folders/:folderId/cards`, corps `AddNoteCardRequestSchema` | `NOTE_CARD_ADD` | `AddNoteCardUseCase` | `201`, `NoteDetailResponseSchema` | `404` dossier ; `422` `FOLDER_NOT_SMART` ou nom invalide |
| `POST /notes/:noteId/card/choose`, corps `ChooseNoteCardCandidateRequestSchema` | `NOTE_CARD_CANDIDATE_CHOOSE` | `ChooseNoteCardCandidateUseCase` | `200`, `NoteCardResponseSchema` | `404` ; `409` `NOTE_CARD_STATUS_INVALID` ; `422` `NOTE_CARD_CANDIDATE_INVALID` |
| `POST /notes/:noteId/card/refine`, corps `RefineNoteCardRequestSchema` | `NOTE_CARD_REFINE` | `RefineNoteCardUseCase` | `200`, `NoteCardResponseSchema` | `404` ; `409` ; `422` |
| `POST /notes/:noteId/card/refresh` | `NOTE_CARD_REFRESH` | `RefreshNoteCardUseCase` | `200`, `NoteCardResponseSchema` | `404` ; `409` ; `422` `FOLDER_NOT_SMART` |
| `PUT /notes/:noteId/card/fields`, corps `CorrectNoteCardFieldRequestSchema` | `NOTE_CARD_FIELD_CORRECT` | `CorrectNoteCardFieldUseCase` | `200`, `NoteCardResponseSchema` | `404` ; `409` ; `422` `NOTE_CARD_FIELD_INVALID` |
| `DELETE /note-folders/:folderId` | `FOLDER_DELETE` | `DeleteFolderUseCase` | `204` | `404` ; `409` |

## Points d'attention

- **Couple de la requête.** Les use cases reçoivent un `ExecutionContext` complet. L'API le construit par `NoteCoupleGuardService` avant d'appeler un use case ; sans couple formé, `404` `NOTE_COUPLE_NOT_PAIRED`.
- **Visibilité dans la requête.** `findVisibleById` et `findVisible` ne rendent que les notes vivantes du couple, partagées ou à ce partenaire (`core-backend.md` règle 12) : la note privée de l'autre répond `NOTE_NOT_FOUND`, comme une note inexistante (R4).
- **Le titre est un contenu du couple.** Aucun événement ne le porte, ni le nom d'un dossier (`core.md` règle 33).
- **Sans N+1.** Le chemin d'un dossier se lit en une requête récursive, les nombres par dossier et par espace en un `groupBy` chacun, la remontée de R16 en une requête pour les dossiers et une pour les notes.
- **Contenu d'un dossier sans pagination.** Les dossiers et les notes d'une racine ou d'un dossier se lisent en entier : le couple en a peu (décision P1).

## Décisions liées

- [Décision 0039](../../decisions/notes/0039-regles-des-notes.md) : règles des notes
- [Décision 0041](../../decisions/0041-couple-de-la-requete.md) : le couple de la requête vient de `pairing`
- [Décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md) : portée par couple et propriétaire
- [Décision 0052](../../decisions/notes/0052-dossiers-et-dossiers-ia.md) : dossiers de notes
- [Décision 0054](../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md) : recherche des fiches par SearXNG et Gemini
