# Notes

Cette page décrit comment le contexte `notes` est construit : ses couches, ses use cases et la façon dont il trouve le couple de la requête. À lire avant de modifier `packages/couple/server-business-logic/src/notes/`.

## Rôle et limites

`notes` porte les notes du couple : leur titre, leur propriétaire, leur visibilité et leur cycle de vie. Le contenu riche, document Yjs édité à deux, arrive avec le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)). Le contexte ne connaît ni les sessions (`authentication`) ni le code d'invitation (`pairing`) : il reçoit le `coupleId` par un port étroit ([décision 0041](../../decisions/0041-couple-de-la-requete.md)).

Construit aujourd'hui : domaine et application, tables `note` et `note_event` (voir [les tables](tables.md)), adaptateur Prisma de `NoteRepository` et de `PairedCoupleProvider`. À venir dans l'étape « notes » : contrat HTTP et routes de l'API, canal temps réel, écrans de la PWA.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Note` | Agrégat : titre, propriétaire, visibilité (voir [l'agrégat](aggregate.md)) | `domain/models/note.aggregate.ts` |
| `NoteId`, `NoteTitle` | Value objects : identité UUID v7, titre de 1 à `NOTE_TITLE_MAX_LENGTH` signes (R8) | `domain/value-objects/` |
| `NoteVisibilityEnum` | `PRIVATE`, `SHARED`, partagé avec la PWA | `packages/couple/shared-kernel/src/enums/note-visibility.enum.ts` |
| `NoteException` | Exception du contexte, codes de `NoteExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/notes/exceptions/exception-codes.ts` |
| `NoteRepository` | Port : `save`, `findVisibleById`, `findVisible` ; la visibilité est filtrée par la requête (R4) | `domain/ports/note.repository.ts` |
| `PairedCoupleProvider` | Port : le couple formé d'un partenaire, seule recherche sans `coupleId` du contexte (décision 0041) | `domain/ports/paired-couple.provider.ts` |
| `NotePreconditionService` | Domain service : la note visible pour le partenaire, sinon `NOTE_NOT_FOUND` | `domain/services/note-precondition.service.ts` |
| `NoteAccessValidator` | Contrôle statique : action réservée à la propriétaire (R5, R7) | `domain/services/note-access.validator.ts` |
| `NoteCoupleGuardService` | Guard service : construit l'`ExecutionContext` depuis le `PartnerContext`, sinon `NOTE_COUPLE_NOT_PAIRED` (R3, décision 0006) | `application/services/note-couple-guard.service.ts` |
| `CreateNoteUseCase`, `ListNotesUseCase`, `RenameNoteUseCase`, `ShareNoteUseCase`, `MakeNotePrivateUseCase`, `DeleteNoteUseCase` | Use cases, `execute(context)` ou `execute(context, command)` | `application/use-cases/` |
| `NotePrismaRepository`, `PairedCouplePrismaProvider` | Adaptateurs : note et outbox dans une transaction, verrou optimiste, visibilité dans le `where` ; lecture seule du couple formé dans les tables de `pairing` (couple supprimé exclu) | `apps/couple/api/src/modules/notes/secondary/` |
| `toNoteView` | Vue rendue : identifiant, propriétaire, titre, visibilité, dernière modification | `application/mappers/note-view.mapper.ts` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/notes/`.

## Points d'attention

- **Couple de la requête.** Les use cases reçoivent un `ExecutionContext` complet. L'API le construit par `NoteCoupleGuardService` avant d'appeler un use case ; sans couple formé, `404` `NOTE_COUPLE_NOT_PAIRED`.
- **Visibilité dans la requête.** `findVisibleById` et `findVisible` ne rendent que les notes vivantes du couple, partagées ou à ce partenaire (`core-backend.md` règle 12) : la note privée de l'autre répond `NOTE_NOT_FOUND`, comme une note inexistante (R4).
- **Le titre est un contenu du couple.** Aucun événement ne le porte (`core.md` règle 33).

## Décisions liées

- [Décision 0039](../../decisions/notes/0039-regles-des-notes.md) : règles des notes
- [Décision 0041](../../decisions/0041-couple-de-la-requete.md) : le couple de la requête vient de `pairing`
- [Décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md) : portée par couple et propriétaire
