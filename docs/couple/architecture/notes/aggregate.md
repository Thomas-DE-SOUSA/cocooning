# Agrégats Note et Folder

Cette page décrit les agrégats `Note` et `Folder` du contexte `notes` : leur état, leurs transitions et les invariants qu'ils garantissent. À lire avant de toucher à `note.aggregate.ts` ou `folder.aggregate.ts`.

## Rôle et limites

`Note` porte les métadonnées d'une note : son couple, sa propriétaire, son titre, sa visibilité et son dossier (`null` à la racine de son espace). `Folder` porte un dossier ([décision 0052](../../decisions/notes/0052-dossiers-et-dossiers-ia.md)) : son couple, sa créatrice, son espace, son genre (`FolderKindEnum`, classique ou IA), son dossier parent, son nom et, en haut d'un arbre IA seulement, son sujet et sa fiche type (`SmartFolderSettings`, R17, R18). Un espace n'est pas un agrégat : « Partagé » et « Privé » sont les valeurs de `NoteSpaceEnum`, et l'espace d'une note se lit dans sa visibilité (`visibilityOfSpace`, `spaceOfVisibility`, `domain/models/note-space.ts`). Le contenu riche est un document Yjs à part, synchronisé par le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)). L'agrégat ne sait pas qui le regarde : la visibilité se filtre dans la requête du repository.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Note.create(input, now)` | La créatrice devient propriétaire ; la note prend la visibilité de l'espace demandé et se range dans le dossier donné, de cet espace ; enregistre `NoteCreatedEvent` (R1, R2, R11, R13) | `domain/models/note.aggregate.ts` |
| `Note.rename(userId, title, now)` | Change le titre ; enregistre `NoteRenamedEvent` (R6) | idem |
| `Note.share(userId, now)`, `Note.makePrivate(userId, now)` | Change la visibilité, propriétaire seule ; une note qui change d'espace revient à la racine du nouvel espace ; enregistre `NoteSharedEvent` ou `NoteMadePrivateEvent` (R5, R11) | idem |
| `Note.moveTo(userId, space, folder, now)` | Range la note dans un dossier ou à la racine d'un espace ; vers l'autre espace, change d'abord la visibilité (propriétaire seule) ; enregistre `NoteMovedEvent` (R11) | idem |
| `Note.delete(userId, now)` | Suppression douce, propriétaire seule ; enregistre `NoteDeletedEvent` (R7) | idem |
| `Note.fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO | idem |
| `NoteAccessValidator.ensureOwner` | Refuse `NOTE_RESERVED_TO_OWNER` | `domain/services/note-access.validator.ts` |
| `Folder.create(input, now)` | Un dossier à la racine d'un espace ou sous un dossier du même espace, classique ou IA, IA dans un dossier IA (`SmartFolderValidator.kindOf`) ; enregistre `FolderCreatedEvent` (R13, R17, R18) | `domain/models/folder.aggregate.ts` |
| `Folder.editTemplate(userId, settings, now)` | Remplace le sujet et la fiche type du dossier qui les porte, sinon `FOLDER_NOT_SMART` ; enregistre `FolderTemplateEditedEvent` (R17) | idem |
| `cardContextOf(lineage)` | Dans la lignée d'un dossier (racine d'abord), remonte les dossiers IA jusqu'au plus proche qui porte les réglages : le contexte des fiches, ou `null` (R18) | `domain/models/card-context.ts` |
| `Folder.rename(userId, name, now)` | Change le nom ; enregistre `FolderRenamedEvent` (R13, R14) | idem |
| `Folder.moveTo(userId, parent, parentPath, now)` | Change le dossier parent, dans le même espace, jamais en lui-même ni sous l'un de ses sous-dossiers ; enregistre `FolderMovedEvent` (R15) | idem |
| `Folder.delete(userId, now)` | Suppression douce ; le contenu remonte par `FolderRepository.moveContentUp` ; enregistre `FolderDeletedEvent` (R16) | idem |
| `FolderPlacementValidator.ensureInSpace`, `ensureMovable` | Refusent `FOLDER_SPACE_MISMATCH` et `FOLDER_MOVE_INVALID` | `domain/services/folder-placement.validator.ts` |

## Événements

| Événement | `EVENT_NAME` | Données |
|---|---|---|
| `NoteCreatedEvent` | `notes.note.created` | `ownerId`, `visibility` |
| `NoteRenamedEvent` | `notes.note.renamed` | aucune (`null`) |
| `NoteSharedEvent` | `notes.note.shared` | aucune (`null`) |
| `NoteMadePrivateEvent` | `notes.note.made-private` | aucune (`null`) |
| `NoteDeletedEvent` | `notes.note.deleted` | aucune (`null`) |
| `NoteMovedEvent` | `notes.note.moved` | `folderId` (`null` à la racine) |
| `FolderCreatedEvent` | `notes.folder.created` | `ownerId`, `space`, `kind`, `parentFolderId` |
| `FolderTemplateEditedEvent` | `notes.folder.template-edited` | aucune (`null`) |
| `FolderRenamedEvent` | `notes.folder.renamed` | aucune (`null`) |
| `FolderMovedEvent` | `notes.folder.moved` | `parentFolderId` |
| `FolderDeletedEvent` | `notes.folder.deleted` | aucune (`null`) |

Chaque événement porte l'`ExecutionContext` complet ; aucun ne porte le titre, le nom d'un dossier, son sujet, sa fiche type ni le contenu. Les événements des dossiers vont dans la même outbox `note_event` ; le relais de `messaging` ne les notifie pas. Un déplacement vers l'autre espace enregistre `NoteSharedEvent` ou `NoteMadePrivateEvent`, puis `NoteMovedEvent` : une note rangée dans « Partagé » notifie l'autre comme un partage (R9). Les notes et sous-dossiers qui remontent à la suppression d'un dossier changent par une requête groupée, sans événement.

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Une note a un titre de 1 à `NOTE_TITLE_MAX_LENGTH` signes, sans espaces autour (`NOTE_TITLE_INVALID`, R8) | `NoteTitle.create` |
| INV-002 | Une note naît partagée, à la créatrice (R1, R2) | agrégat (`create`) |
| INV-003 | Seule la propriétaire change la visibilité ou supprime (`NOTE_RESERVED_TO_OWNER`, R5, R7) | agrégat (`ensureOwner`) |
| INV-004 | La propriétaire et le couple d'une note ne changent jamais | agrégat (propriétés `readonly`) |
| INV-005 | L'agrégat ne modifie jamais `version` ; il part de 1 et la base l'incrémente | agrégat, repository |
| INV-006 | Une note rangée dans un dossier a la visibilité de l'espace du dossier (`FOLDER_SPACE_MISMATCH`, R11) | `Note` (`create`, `moveTo`, changement de visibilité) |
| INV-007 | Un dossier a un nom de 1 à `FOLDER_NAME_MAX_LENGTH` signes, sans espaces autour (`FOLDER_NAME_INVALID`, R13) | `FolderName.create` |
| INV-008 | Un dossier ne change jamais d'espace ; son parent est du même espace et n'est ni lui-même ni l'un de ses descendants (`FOLDER_MOVE_INVALID`, R15) | `Folder` (`create`, `moveTo`) |
| INV-010 | Un dossier IA en haut d'un arbre porte un sujet de 1 à `FOLDER_SUBJECT_MAX_LENGTH` signes et une fiche type de 1 à `CARD_TEMPLATE_MAX_FIELDS` cases uniques ; un dossier classique n'en porte pas ; un dossier créé dans un dossier IA est IA et n'en porte pas (R17, R18) | `SmartFolderValidator`, `FolderSubject`, `CardTemplate` |
| INV-009 | Un dossier supprimé ne contient plus rien : ses notes et sous-dossiers remontent dans la même transaction (R16) | `DeleteFolderUseCase`, `FolderRepository.moveContentUp` |

## Décisions liées

- [Décision 0039](../../decisions/notes/0039-regles-des-notes.md) : règles des notes
- [Décision 0052](../../decisions/notes/0052-dossiers-et-dossiers-ia.md) : dossiers de notes
- [Décision 0054](../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md) : recherche des fiches
