# Tables de l'agenda

Cette page décrit les trois tables PostgreSQL du contexte `agenda` : leurs colonnes, leurs index et leurs contraintes. À lire avant de modifier `packages/couple/prisma/prisma/models/agenda-*.prisma` ou les adaptateurs Prisma de `CalendarEventRepository` et `CalendarLabelRepository`.

Les tables naissent avec la migration `20261124133221_agenda_calendar_event` (`packages/couple/prisma/prisma/migrations/`) ; la colonne `audience` vient de `20261125230000_agenda_calendar_event_audience`, la table `calendar_label` de `20261125230100_agenda_calendar_label`. Les dates techniques sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma ; les jours et les heures d'un événement sont ceux de Paris, sans fuseau ni conversion ([décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md)).

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
| `audience` | `VARCHAR(20)` | Pour qui : `OWNER`, `PARTNER` ou `BOTH` (`CalendarEventAudienceEnum`, R11), relu par `parseEnum()` ; une valeur inconnue répond `CALENDAR_EVENT_DATA_CORRUPTED`. La migration l'a rempli depuis `visibility` (`SHARED` donne `BOTH`, `PRIVATE` donne `OWNER`) avant de le rendre obligatoire |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine, fournies par `DateTimeProvider` |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression douce (R9) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `calendar_event_pkey` | `id` | Clé primaire |
| `calendar_event_couple_id_starts_on_idx` | `couple_id`, `starts_on` | Les événements d'une plage de jours (`findVisibleOverlapping`) ; `couple_id` en tête (`core.md` règle 27) |

La visibilité se filtre dans le `where` de chaque lecture : `couple_id` du partenaire, puis `visibility = 'SHARED'` ou `owner_id` égal au partenaire (R7). Une plage de `from` à `to` lit `starts_on <= to` et, au choix, `ends_on >= from` ou `ends_on` nul avec `starts_on >= from`.

## `calendar_label`

L'agrégat `CalendarLabel` (modèle `CalendarLabel`, fichier `agenda-calendar-label.prisma`, [décision 0056](../../decisions/agenda/0056-pour-qui-et-etiquettes.md)).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant de l'étiquette, généré par le domaine (`CalendarLabelId.generate()`, UUID v7) |
| `couple_id` | `UUID` | Couple de l'étiquette (`core.md` règle 27) |
| `owner_id` | `UUID` | Partenaire qui l'a créée ; les deux la modifient et la suppriment (R12) |
| `name` | `VARCHAR(30)` | Nom, `CALENDAR_LABEL_NAME_MAX_LENGTH` (R12) |
| `color` | `VARCHAR(20)` | Une des huit couleurs de `CalendarLabelColorEnum`, relue par `parseEnum()` ; une valeur inconnue répond `CALENDAR_LABEL_DATA_CORRUPTED` |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine ; `created_at` ordonne la liste |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression douce (R14) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `calendar_label_pkey` | `id` | Clé primaire ; une sauvegarde périmée d'une étiquette supprimée entre-temps la heurte, traduite en `CALENDAR_LABEL_VERSION_CONFLICT` |
| `calendar_label_couple_id_created_at_idx` | `couple_id`, `created_at` | La liste du couple dans l'ordre de création, et son compte (R12) ; `couple_id` en tête |

## `agenda_event`

L'outbox du contexte (modèle `AgendaEvent`, fichier `agenda-event.prisma`, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)), de même forme que `note_event` : écrite dans la transaction qui sauvegarde l'événement d'agenda ou l'étiquette, sans clé étrangère vers lui, l'événement de domaine survit à l'événement d'agenda. Aucun événement de domaine ne porte le titre, la description ni les jours.

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `agenda_event_pkey` | `id` | `eventId` généré par le domaine |
| `agenda_event_aggregate_id_version_key` | `aggregate_id`, `version`, unique | Deux sauvegardes concurrentes du même événement d'agenda ou de la même étiquette : la seconde échoue, traduite en `CALENDAR_EVENT_VERSION_CONFLICT` ou `CALENDAR_LABEL_VERSION_CONFLICT` |
| `agenda_event_published_occurred_at_idx` | `published`, `occurred_at` | Lecture du relais : les événements non publiés, dans l'ordre |
