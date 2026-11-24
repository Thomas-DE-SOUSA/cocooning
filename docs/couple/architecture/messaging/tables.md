# Tables des messages

Cette page décrit les quatre tables PostgreSQL du contexte `messaging` : leurs colonnes, leurs index et leurs contraintes. À lire avant de modifier `packages/couple/prisma/prisma/models/messaging-*.prisma` ou les adaptateurs Prisma de `FlashMessageRepository`, `InstantPhotoRepository` et `PhotoPromptRepository`.

Les tables naissent avec la migration `20261124200000_messaging_feed`, puis `photo_prompt` avec `20261124230000_messaging_photo_prompt` (`packages/couple/prisma/prisma/migrations/`). Les dates sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma. Les octets des photos ne sont pas en base : ils sont dans le volume `files` de la VM ([décision 0027](../../decisions/0027-stockage-des-photos.md)).

## `flash_message`

L'agrégat `FlashMessage` (modèle `FlashMessage`, fichier `messaging-flash-message.prisma`).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant du mot, généré par le domaine (`FlashMessageId.generate()`, UUID v7) ; trie le fil |
| `couple_id` | `UUID` | Couple du mot (`core.md` règle 27). Aucune clé étrangère vers `couple` : chaque contexte garde ses tables |
| `owner_id` | `UUID` | Auteur, seul à pouvoir retirer le mot (R1, R6) |
| `text` | `VARCHAR(140)` | Texte, `FLASH_MESSAGE_TEXT_MAX_LENGTH` (R2) |
| `version` | `INTEGER` | Verrou optimiste : 1 à l'envoi, incrémenté par le repository |
| `created_at` | `TIMESTAMP(3)` | Heure d'envoi, montrée dans le fil (R5), fournie par `DateTimeProvider` |
| `updated_at` | `TIMESTAMP(3)` | Dernière écriture |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Retrait par l'auteur (R6) : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `flash_message_pkey` | `id` | Clé primaire ; une sauvegarde périmée d'un mot retiré entre-temps la heurte, traduite en `FLASH_MESSAGE_VERSION_CONFLICT` |
| `flash_message_couple_id_id_idx` | `couple_id`, `id` | Une page du fil : `couple_id` en tête (`core.md` règle 27), `id < curseur` trié décroissant |

## `instant_photo`

L'agrégat `InstantPhoto` (modèle `InstantPhoto`, fichier `messaging-instant-photo.prisma`).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant de la photo (`InstantPhotoId.generate()`, UUID v7) ; trie le fil et nomme le fichier |
| `couple_id` | `UUID` | Couple de la photo ; début de la clé du fichier |
| `owner_id` | `UUID` | Auteur (R1, R6) |
| `content_type` | `VARCHAR(20)` | Format détecté par les octets : `image/jpeg`, `image/png`, `image/webp` ou `image/heic` (`InstantPhotoContentTypeEnum`), relu par `parseEnum()` ; une valeur inconnue répond `INSTANT_PHOTO_DATA_CORRUPTED` |
| `photo_prompt_id` | `UUID`, nullable | L'invitation à laquelle répond une photo du jour ; `NULL` pour une photo spontanée (R8). Pas de clé étrangère : l'invitation n'est jamais supprimée |
| `is_late` | `BOOLEAN`, `false` par défaut | Photo du jour envoyée plus de 10 minutes après l'invitation (R8) ; toujours écrite par le domaine, le défaut ne sert qu'aux lignes d'avant la migration |
| `version`, `created_at`, `updated_at`, `deleted_at` | comme `flash_message` | Le retrait supprime aussi le fichier (R6) |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `instant_photo_pkey` | `id` | Clé primaire ; même traduction en `INSTANT_PHOTO_VERSION_CONFLICT` |
| `instant_photo_couple_id_id_idx` | `couple_id`, `id` | Une page du fil |
| `instant_photo_couple_id_photo_prompt_id_owner_id_key` | `couple_id`, `photo_prompt_id`, `owner_id`, unique partiel `WHERE deleted_at IS NULL`, écrit à la main dans la migration | Une photo du jour vivante par partenaire et par invitation (R8) : deux envois simultanés, le second traduit en `PHOTO_PROMPT_ALREADY_ANSWERED` ; sert aussi `findOfPhotoPrompts`. Une photo retirée ne compte plus |

## `photo_prompt`

L'agrégat `PhotoPrompt` (modèle `PhotoPrompt`, fichier `messaging-photo-prompt.prisma`), créé par la migration `20261124230000_messaging_photo_prompt`, qui ajoute aussi `photo_prompt_id` et `is_late` à `instant_photo`. Pas de `deleted_at` : une invitation n'est jamais retirée, et l'index unique sur le jour reste plein.

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | `PhotoPromptId.generate()`, UUID v7 |
| `couple_id` | `UUID` | Couple de l'invitation (`core.md` règle 27) |
| `day` | `DATE` | Jour de Paris `YYYY-MM-DD`, écrit à minuit UTC comme les jours de l'agenda ([décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md)) |
| `scheduled_at` | `TIMESTAMP(3)` | Instant tiré entre 9 h et 21 h, heure de Paris ; jamais rendu par l'API (R7) |
| `issued_at` | `TIMESTAMP(3)`, nullable | Envoi par la tâche planifiée ; `NULL` tant que l'invitation est secrète (R7, R8) |
| `version`, `created_at`, `updated_at` | comme `flash_message` | Le passage qui envoie l'invitation incrémente la version |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `photo_prompt_pkey` | `id` | Clé primaire |
| `photo_prompt_couple_id_day_key` | `couple_id`, `day`, unique | Une invitation par couple et par jour (R7) ; deux passages concurrents de la tâche, le second traduit en `PHOTO_PROMPT_VERSION_CONFLICT`. Sert aussi `findOfDay` |

## `messaging_event`

L'outbox du contexte (modèle `MessagingEvent`, fichier `messaging-event.prisma`, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)), de même forme que `agenda_event` : écrite dans la transaction qui sauvegarde le mot, la photo ou les invitations d'un passage de la tâche, sans clé étrangère vers eux. Aucun événement ne porte le texte d'un mot ni la photo, ni l'heure tirée d'une invitation ; les événements d'envoi portent `ownerId`, ceux d'une invitation ont l'UUID nul pour `user_id`.

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `messaging_event_pkey` | `id` | `eventId` généré par le domaine |
| `messaging_event_aggregate_id_version_key` | `aggregate_id`, `version`, unique | Deux sauvegardes concurrentes du même élément : la seconde échoue, traduite en `*_VERSION_CONFLICT` |
| `messaging_event_published_occurred_at_idx` | `published`, `occurred_at` | Lecture du relais : les événements non publiés, dans l'ordre |
