# Tables des notes

Cette page décrit les deux tables PostgreSQL du contexte `notes` : leurs colonnes, leurs index et leurs contraintes. À lire avant de modifier `packages/couple/prisma/prisma/models/notes-*.prisma` ou l'adaptateur Prisma de `NoteRepository`.

Les tables naissent avec la migration `20261123194115_notes_note` (`packages/couple/prisma/prisma/migrations/`). Les dates sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma.

## `note`

L'agrégat `Note` (modèle `Note`, fichier `notes-note.prisma`). Le contenu riche, document Yjs, arrive avec le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant de la note, généré par le domaine (`NoteId.generate()`, UUID v7) |
| `couple_id` | `UUID` | Couple de la note (`core.md` règle 27). Aucune clé étrangère vers `couple` : chaque contexte garde ses tables |
| `owner_id` | `UUID` | Propriétaire, partenaire qui a créé la note (R1) |
| `title` | `VARCHAR(120)` | Titre, `NOTE_TITLE_MAX_LENGTH` (R8) |
| `visibility` | `VARCHAR(20)` | `SHARED` ou `PRIVATE` (`NoteVisibilityEnum`), relu par `parseEnum()` ; une valeur inconnue répond `NOTE_DATA_CORRUPTED` |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine, fournies par `DateTimeProvider` |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression douce (R7) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `note_pkey` | `id` | Clé primaire |
| `note_couple_id_updated_at_idx` | `couple_id`, `updated_at DESC` | La liste d'un couple, la plus récente d'abord (`findVisible`) ; `couple_id` en tête (`core.md` règle 27) |

La visibilité se filtre dans le `where` de chaque lecture : `couple_id` du partenaire, puis `visibility = 'SHARED'` ou `owner_id` égal au partenaire (R4).

## `note_event`

L'outbox du contexte (modèle `NoteEvent`, fichier `notes-event.prisma`, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)), de même forme que `pairing_event` : écrite dans la transaction qui sauvegarde la note, sans clé étrangère vers elle, l'événement survit à la note. Aucun événement ne porte le titre.

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `note_event_pkey` | `id` | `eventId` généré par le domaine |
| `note_event_aggregate_id_version_key` | `aggregate_id`, `version`, unique | Deux sauvegardes concurrentes de la même note : la seconde échoue, traduite en `NOTE_VERSION_CONFLICT` |
| `note_event_published_occurred_at_idx` | `published`, `occurred_at` | Lecture du relais : les événements non publiés, dans l'ordre |
