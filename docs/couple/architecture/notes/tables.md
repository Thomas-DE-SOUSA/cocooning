# Tables des notes

Cette page décrit les tables PostgreSQL du contexte `notes` : leurs colonnes, leurs index et leurs contraintes. À lire avant de modifier `packages/couple/prisma/prisma/models/notes-*.prisma` ou l'adaptateur Prisma de `NoteRepository`.

Les tables naissent avec la migration `20261123194115_notes_note` ; `content_state` arrive avec `notes_content_state`, la table `folder` et la colonne `note.folder_id` avec `20261125100000_notes_folders`, ses colonnes `kind`, `subject` et `card_template` avec `20261125200000_notes_smart_folders`, l'index `note_couple_id_folder_id_idx` avec `20261125100100_notes_note_folder_index`, construit en `CONCURRENTLY` sur la table remplie, les colonnes `list_kind`, `emoji` et `open_item_count` des listes avec `20261126100000_notes_note_lists` et leur index `note_couple_id_list_kind_updated_at_idx` avec `20261126100100_notes_note_list_index`, en `CONCURRENTLY` lui aussi (`packages/couple/prisma/prisma/migrations/`). Les dates sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma.

## `note`

L'agrégat `Note` (modèle `Note`, fichier `notes-note.prisma`). Le contenu riche est un document Yjs, écrit par le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant de la note, généré par le domaine (`NoteId.generate()`, UUID v7) |
| `couple_id` | `UUID` | Couple de la note (`core.md` règle 27). Aucune clé étrangère vers `couple` : chaque contexte garde ses tables |
| `owner_id` | `UUID` | Propriétaire, partenaire qui a créé la note (R1) |
| `title` | `VARCHAR(120)` | Titre, `NOTE_TITLE_MAX_LENGTH` (R8) |
| `visibility` | `VARCHAR(20)` | `SHARED` ou `PRIVATE` (`NoteVisibilityEnum`), relu par `parseEnum()` ; une valeur inconnue répond `NOTE_DATA_CORRUPTED`. Dit aussi l'espace de la note (R11) |
| `folder_id` | `UUID`, nullable, clé étrangère vers `folder` (`ON DELETE SET NULL`) | Dossier de la note, `null` à la racine de son espace ; les notes d'avant les dossiers restent `null` (R12) |
| `content_state` | `BYTEA`, nullable | État Yjs complet du contenu, `null` avant la première frappe ; lu et écrit à part de l'agrégat (`NoteContentPrismaRepository`), jamais lu par la liste |
| `list_kind` | `VARCHAR(20)`, nullable | `GROCERIES` ou `TASKS` (`NoteListKindEnum`) pour une liste de l'onglet Listes (R26), fixé à la création, relu par `parseEnum()` ; une valeur inconnue répond `NOTE_DATA_CORRUPTED`. `null` pour une note ordinaire, dont toutes les notes d'avant les listes ; les lectures de l'accueil des notes filtrent `list_kind IS NULL` (R27) |
| `emoji` | `VARCHAR(16)`, nullable | Emoji facultatif d'une liste (`NoteListEmoji`, `NOTE_LIST_EMOJI_MAX_LENGTH` points de code), `null` sans emoji et pour une note ordinaire |
| `open_item_count` | `INTEGER`, `DEFAULT 0` | Lignes pas encore cochées du contenu (R28), comptées à chaque enregistrement du document et écrites avec `content_state` par `NoteContentPrismaRepository`, jamais par la sauvegarde de l'agrégat ; comptées aussi pour une note ordinaire, mais montrées pour une liste seulement. Les notes d'avant les listes valent 0 |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine, fournies par `DateTimeProvider` |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression douce (R7) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `note_pkey` | `id` | Clé primaire |
| `note_couple_id_updated_at_idx` | `couple_id`, `updated_at DESC` | La liste d'un couple, la plus récente d'abord (`findVisible`) ; `couple_id` en tête (`core.md` règle 27) |
| `note_couple_id_folder_id_idx` | `couple_id`, `folder_id` | Les notes d'un dossier (`findVisibleIn`, `countVisibleByFolder`) et celles qui remontent à sa suppression (R16) |
| `note_couple_id_list_kind_updated_at_idx` | `couple_id`, `list_kind`, `updated_at DESC` | Les listes d'une section, la plus récente d'abord (`findVisibleLists`, R28) |
| `note_folder_id_fkey` | `folder_id` vers `folder.id` | Le dossier existe ; jamais supprimé en vrai, la suppression est douce |

La visibilité se filtre dans le `where` de chaque lecture : `couple_id` du partenaire, puis `visibility = 'SHARED'` ou `owner_id` égal au partenaire (R4).

## `folder`

L'agrégat `Folder` (modèle `Folder`, fichier `notes-folder.prisma`, [décision 0052](../../decisions/notes/0052-dossiers-et-dossiers-ia.md)).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant du dossier, généré par le domaine (`FolderId.generate()`, UUID v7) |
| `couple_id` | `UUID` | Couple du dossier (`core.md` règle 27) |
| `owner_id` | `UUID` | Partenaire qui a créé le dossier ; un dossier de « Privé » n'existe que pour lui (R14) |
| `space` | `VARCHAR(20)` | `SHARED` ou `PRIVATE` (`NoteSpaceEnum`), fixé à la création (R15), relu par `parseEnum()` ; une valeur inconnue répond `FOLDER_DATA_CORRUPTED` |
| `kind` | `VARCHAR(20)` | `CLASSIC` ou `SMART` (`FolderKindEnum`, R17), fixé à la création, relu par `parseEnum()` ; une valeur inconnue répond `FOLDER_DATA_CORRUPTED`. Les dossiers d'avant le lot 2 sont `CLASSIC` (migration `20261125200000_notes_smart_folders`) |
| `parent_folder_id` | `UUID`, nullable, clé étrangère vers `folder` (`ON DELETE SET NULL`) | Dossier parent, du même espace ; `null` à la racine de l'espace |
| `name` | `VARCHAR(60)` | Nom, `FOLDER_NAME_MAX_LENGTH` (R13) |
| `subject` | `VARCHAR(280)`, nullable | Sujet d'un dossier IA en haut de son arbre (R17), `null` ailleurs (R18) |
| `card_template` | `JSONB`, nullable | Fiche type : tableau de noms de cases, posé avec le sujet ; un autre contenu répond `FOLDER_DATA_CORRUPTED` |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository et par la remontée de R16 |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression douce (R16) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `folder_pkey` | `id` | Clé primaire ; une sauvegarde périmée d'un dossier supprimé entre-temps la heurte, traduite en `FOLDER_VERSION_CONFLICT` |
| `folder_couple_id_parent_folder_id_idx` | `couple_id`, `parent_folder_id` | Les dossiers d'un dossier ou d'une racine (`findVisibleChildren`, `countVisibleChildren`), ceux qui remontent à la suppression du parent (R16), la clé étrangère |
| `folder_parent_folder_id_fkey` | `parent_folder_id` vers `folder.id` | Le parent existe |

La visibilité se filtre dans le `where` de chaque lecture : `couple_id` du partenaire, puis `space = 'SHARED'` ou `owner_id` égal au partenaire (R14). Le chemin d'un dossier (`findPath`) se lit en une requête récursive (`WITH RECURSIVE ... CYCLE`), filtrée par `couple_id` et `deleted_at` à chaque niveau ; sa lignée (`findLineage`, R18), par ce chemin puis une lecture des dossiers par leurs identifiants.

## `note_card`

L'agrégat `NoteCard` (modèle `NoteCard`, fichier `notes-note-card.prisma`, migration `20261125210000_notes_note_card`, [décision 0054](../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md)). Pas de `deleted_at` : la fiche suit sa note, et toute lecture passe par la note visible (R4).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant de la fiche (`NoteCardId.generate()`, UUID v7) |
| `couple_id` | `UUID` | Couple de la fiche (`core.md` règle 27) |
| `note_id` | `UUID`, clé étrangère vers `note` (`ON DELETE CASCADE`) | La note de la fiche |
| `status` | `VARCHAR(20)` | `NoteCardStatusEnum`, relu par `parseEnum()` ; une valeur inconnue répond `NOTE_CARD_DATA_CORRUPTED` |
| `query` | `VARCHAR(200)` | Ce que le couple a tapé, `NOTE_CARD_QUERY_MAX_LENGTH` (R19) |
| `fields` | `JSONB` | Les cases, dans l'ordre de la fiche type : `name`, `value` (`null` : « non trouvé »), `isManual` (R21, R22) |
| `candidates` | `JSONB` | Au plus trois candidats (`label`, `detail`), vide hors de `CHOOSING` (R19) |
| `sources` | `JSONB` | Au plus dix liens (R21) |
| `searched_at` | `TIMESTAMP(3)`, nullable | Date de la dernière recherche aboutie (R21) |
| `requested_by` | `UUID` | Partenaire qui a demandé la dernière recherche ; la tâche de fond agit en son nom |
| `claimed_at` | `TIMESTAMP(3)`, nullable | Réservation par la tâche de fond (migration `20261125220000_notes_note_card_search`) ; remise à `null` par chaque sauvegarde, reprise après `NOTE_CARD_CLAIM_LEASE_MS` (cinq minutes) |
| `version` | `INTEGER` | Verrou optimiste |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `note_card_pkey` | `id` | Clé primaire ; traduite en `NOTE_CARD_VERSION_CONFLICT` sur une sauvegarde périmée |
| `note_card_couple_id_note_id_key` | `couple_id`, `note_id`, unique | Une fiche par note ; sert aussi la clé étrangère (une note n'est jamais supprimée pour de vrai) |
| `note_card_note_id_fkey` | `note_id` vers `note.id` | La note existe |
| `note_card_status_claimed_at_idx` | `status`, `claimed_at` | La réservation de la tâche de fond, entre couples comme le relais de l'outbox (décision 0051) : un `UPDATE ... WHERE id IN (SELECT ... FOR UPDATE SKIP LOCKED)` dans une transaction courte, jamais pendant les recherches |

Une écriture de plusieurs fiches (`saveAll`, R22) se fait en un `createMany` et une seule requête `UPDATE ... FROM unnest(...)` filtrée par couple et version ; les fiches d'un arbre (`findInTree`) se lisent par une requête récursive sur `folder` jointe à `note`, `deleted_at` écrit à chaque niveau.

## `note_card_search`

Une ligne par recherche d'une fiche (modèle `NoteCardSearch`, fichier `notes-note-card-search.prisma`), sans suppression : le plafond de R23 compte les lignes d'un couple depuis minuit à Paris, calculé en UTC dans la requête (`NoteCardSearchPrismaCounter`).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant technique (`uuid(7)` de Prisma) |
| `couple_id` | `UUID` | Couple de la recherche |
| `note_card_id` | `UUID` | Fiche cherchée, sans clé étrangère : le compte survit à la fiche |
| `searched_at` | `TIMESTAMP(3)` | Instant de la recherche, en UTC |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `note_card_search_couple_id_searched_at_idx` | `couple_id`, `searched_at` | Le compte du jour d'un couple |

## `note_event`

L'outbox du contexte (modèle `NoteEvent`, fichier `notes-event.prisma`, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)), de même forme que `pairing_event` : écrite dans la transaction qui sauvegarde la note ou le dossier (`aggregate_id`), sans clé étrangère vers eux, l'événement leur survit. Aucun événement ne porte le titre ni le nom d'un dossier.

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `note_event_pkey` | `id` | `eventId` généré par le domaine |
| `note_event_aggregate_id_version_key` | `aggregate_id`, `version`, unique | Deux sauvegardes concurrentes de la même note ou du même dossier : la seconde échoue, traduite en `NOTE_VERSION_CONFLICT` ou `FOLDER_VERSION_CONFLICT` |
| `note_event_published_occurred_at_idx` | `published`, `occurred_at` | Lecture du relais : les événements non publiés, dans l'ordre |
