# Tables de l'agenda

Cette page décrit les deux tables PostgreSQL du contexte `agenda` : leurs colonnes, leurs index et leurs contraintes. À lire avant de modifier `packages/couple/prisma/prisma/models/agenda-*.prisma` ou l'adaptateur Prisma de `CalendarEventRepository`.

Les tables naissent avec la migration `20261124133221_agenda_calendar_event` (`packages/couple/prisma/prisma/migrations/`). Les dates techniques sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma ; les jours et les heures d'un événement sont ceux de Paris, sans fuseau ni conversion ([décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md)).

## `calendar_event`

L'agrégat `CalendarEvent` (modèle `CalendarEvent`, fichier `agenda-calendar-event.prisma`).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant de l'événement, généré par le domaine (`CalendarEventId.generate()`, UUID v7) |
| `couple_id` | `UUID` | Couple de l'événement (`core.md` règle 27). Aucune clé étrangère vers `couple` : chaque contexte garde ses tables |
| `owner_id` | `UUID` | Auteur, partenaire qui a créé l'événement (R1) |
| `title` | `VARCHAR(120)` | Titre, `CALENDAR_EVENT_TITLE_MAX_LENGTH` (R2) |
| `description` | `VARCHAR(2000)`, nullable | Description en texte simple, `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH` (R6) ; `null` sans description |
| `starts_on` | `DATE` | Premier jour (R5) |
| `ends_on` | `DATE`, nullable | Dernier jour d'un événement de plusieurs jours, `null` pour un seul jour (R5) |
| `starts_at`, `ends_at` | `VARCHAR(5)`, nullables | Heures `HH:MM` de Paris ; `starts_at` à `null` : toute la journée (R5) |
| `visibility` | `VARCHAR(20)` | `SHARED` ou `PRIVATE` (`CalendarEventVisibilityEnum`), relu par `parseEnum()` ; une valeur inconnue répond `CALENDAR_EVENT_DATA_CORRUPTED` |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine, fournies par `DateTimeProvider` |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression douce (R9) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `calendar_event_pkey` | `id` | Clé primaire |
| `calendar_event_couple_id_starts_on_idx` | `couple_id`, `starts_on` | Les événements d'une plage de jours (`findVisibleOverlapping`) ; `couple_id` en tête (`core.md` règle 27) |

La visibilité se filtre dans le `where` de chaque lecture : `couple_id` du partenaire, puis `visibility = 'SHARED'` ou `owner_id` égal au partenaire (R7). Une plage de `from` à `to` lit `starts_on <= to` et, au choix, `ends_on >= from` ou `ends_on` nul avec `starts_on >= from`.

## `agenda_event`

L'outbox du contexte (modèle `AgendaEvent`, fichier `agenda-event.prisma`, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)), de même forme que `note_event` : écrite dans la transaction qui sauvegarde l'événement d'agenda, sans clé étrangère vers lui, l'événement de domaine survit à l'événement d'agenda. Aucun événement de domaine ne porte le titre, la description ni les jours.

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `agenda_event_pkey` | `id` | `eventId` généré par le domaine |
| `agenda_event_aggregate_id_version_key` | `aggregate_id`, `version`, unique | Deux sauvegardes concurrentes du même événement d'agenda : la seconde échoue, traduite en `CALENDAR_EVENT_VERSION_CONFLICT` |
| `agenda_event_published_occurred_at_idx` | `published`, `occurred_at` | Lecture du relais : les événements non publiés, dans l'ordre |
