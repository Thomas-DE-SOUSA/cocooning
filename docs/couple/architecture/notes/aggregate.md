# Agrégat Note

Cette page décrit l'agrégat `Note` du contexte `notes` : son état, ses transitions et les invariants qu'il garantit. À lire avant de toucher à `note.aggregate.ts`.

## Rôle et limites

`Note` porte les métadonnées d'une note : son couple, sa propriétaire, son titre et sa visibilité. Le contenu riche est un document Yjs à part, synchronisé par le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)). L'agrégat ne sait pas qui le regarde : la visibilité se filtre dans la requête du repository.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Note.create(input, now)` | La créatrice devient propriétaire, note `SHARED` ; enregistre `NoteCreatedEvent` (R1, R2) | `domain/models/note.aggregate.ts` |
| `Note.rename(userId, title, now)` | Change le titre ; enregistre `NoteRenamedEvent` (R6) | idem |
| `Note.share(userId, now)`, `Note.makePrivate(userId, now)` | Change la visibilité, propriétaire seule ; enregistre `NoteSharedEvent` ou `NoteMadePrivateEvent` (R5) | idem |
| `Note.delete(userId, now)` | Suppression douce, propriétaire seule ; enregistre `NoteDeletedEvent` (R7) | idem |
| `Note.fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO | idem |
| `NoteAccessValidator.ensureOwner` | Refuse `NOTE_RESERVED_TO_OWNER` | `domain/services/note-access.validator.ts` |

## Événements

| Événement | `EVENT_NAME` | Données |
|---|---|---|
| `NoteCreatedEvent` | `notes.note.created` | `ownerId`, `visibility` |
| `NoteRenamedEvent` | `notes.note.renamed` | aucune (`null`) |
| `NoteSharedEvent` | `notes.note.shared` | aucune (`null`) |
| `NoteMadePrivateEvent` | `notes.note.made-private` | aucune (`null`) |
| `NoteDeletedEvent` | `notes.note.deleted` | aucune (`null`) |

Chaque événement porte l'`ExecutionContext` complet ; aucun ne porte le titre ni le contenu.

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Une note a un titre de 1 à `NOTE_TITLE_MAX_LENGTH` signes, sans espaces autour (`NOTE_TITLE_INVALID`, R8) | `NoteTitle.create` |
| INV-002 | Une note naît partagée, à la créatrice (R1, R2) | agrégat (`create`) |
| INV-003 | Seule la propriétaire change la visibilité ou supprime (`NOTE_RESERVED_TO_OWNER`, R5, R7) | agrégat (`ensureOwner`) |
| INV-004 | La propriétaire et le couple d'une note ne changent jamais | agrégat (propriétés `readonly`) |
| INV-005 | L'agrégat ne modifie jamais `version` ; il part de 1 et la base l'incrémente | agrégat, repository |

## Décisions liées

- [Décision 0039](../../decisions/notes/0039-regles-des-notes.md) : règles des notes
