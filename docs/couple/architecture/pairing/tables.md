# Tables de la mise en couple

Cette page décrit les trois tables PostgreSQL du contexte `pairing` : leurs colonnes, leurs index et leurs contraintes. À lire avant de modifier un fichier de `packages/couple/prisma/prisma/models/pairing-*.prisma` ou d'écrire l'adaptateur Prisma de `CoupleRepository`.

Les tables naissent avec la migration `20261122233413_init` (`packages/couple/prisma/prisma/migrations/`). Les dates sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma.

## `couple`

L'agrégat `Couple` (modèle `Couple`, fichier `pairing-couple.prisma`). Pour cette table seule, `id` **est** le `coupleId` : la colonne `coupleId` que portent toutes les autres tables du couple n'a pas lieu d'être ici.

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant du couple, généré par le domaine (`CoupleId.generate()`, UUID v7, décision 0024) |
| `pairing_status` | `VARCHAR(20)` | `PENDING` ou `PAIRED` (`CouplePairingStatusEnum`), relu par `parseEnum()` |
| `invitation_code` | `VARCHAR(8)`, nullable | Code d'invitation en vigueur, `NULL` une fois le couple formé (INV-004) |
| `invitation_code_expires_at` | `TIMESTAMP(3)`, nullable | Échéance du code (R4), `NULL` avec lui |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository (INV-006) |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine, fournies par `DateTimeProvider` (aucun défaut en base) |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression logique : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `couple_pkey` | `id` | Clé primaire |
| `couple_invitation_code_key` | `invitation_code`, unique partiel `WHERE deleted_at IS NULL AND invitation_code IS NOT NULL` | Un code n'existe que dans un couple vivant (INV-008) ; sert `findByInvitationCode`. Écrit à la main dans la migration (règle 9 de `_knowledge/backend/prisma.md`) : Prisma ne modélise pas les index partiels |

## `couple_partner`

L'entité enfant `CouplePartner` (modèle `CouplePartner`, fichier `pairing-couple-partner.prisma`). Pas de `deleted_at` : la ligne n'a pas de cycle de vie propre et suit son couple. Quand le couple est annulé (`deleted_at` posé, R8), ses lignes sont effacées dans la même transaction, pour que `couple_partner_user_id_key` laisse le partenaire former un autre couple.

| Colonne | Type | Rôle |
|---|---|---|
| `couple_id` | `UUID` | Couple du partenaire, clé étrangère vers `couple.id`, `ON DELETE CASCADE` |
| `user_id` | `UUID` | Identifiant du partenaire, le `sub` du JWT et l'`id` de son compte (décision 0034). Aucune clé étrangère vers `account.id` : chaque contexte garde ses tables ([décision 0033](../../decisions/authentication/0033-authentication-hors-du-couple.md)) |
| `joined_at` | `TIMESTAMP(3)` | Arrivée du partenaire dans le couple |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `couple_partner_pkey` | `couple_id`, `user_id` | Clé primaire ; indexe aussi la clé étrangère |
| `couple_partner_user_id_key` | `user_id`, unique | Un partenaire n'appartient qu'à un couple (R1, INV-007) ; sert `findByPartner` |
| `couple_partner_couple_id_fkey` | `couple_id` vers `couple.id` | Cascade de l'enfant vers son parent |

## `pairing_event`

L'outbox du contexte (modèle `PairingEvent`, fichier `pairing-event.prisma`, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)) : chaque événement est écrit dans la transaction qui sauvegarde le couple, puis lu par le relais de l'API. Table en ajout seul, sans `deleted_at` ni clé étrangère vers `couple` : l'événement survit au couple.

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | `eventId` généré par le domaine |
| `couple_id` | `UUID` | Couple de l'événement (`ExecutionContext.coupleId`) |
| `aggregate_id` | `UUID` | Identifiant de l'agrégat ; pour `pairing`, égal à `couple_id` |
| `event_name` | `VARCHAR(120)` | `XxxEvent.EVENT_NAME`, par exemple `pairing.couple.created` |
| `event_data` | `JSONB` | Données de l'événement ; jamais le code d'invitation |
| `user_id` | `UUID` | Partenaire auteur (`ExecutionContext.userId`) |
| `occurred_at` | `TIMESTAMP(3)` | Instant de l'événement |
| `version` | `INTEGER` | Version de l'agrégat, lue dans la même transaction que l'état |
| `published` | `BOOLEAN`, défaut `false` | Réclamé par le relais |
| `published_at` | `TIMESTAMP(3)`, nullable | Instant de la réclamation |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `pairing_event_pkey` | `id` | Clé primaire |
| `pairing_event_aggregate_id_version_key` | `aggregate_id`, `version`, unique | Une seule écriture par version de l'agrégat |
| `pairing_event_published_occurred_at_idx` | `published`, `occurred_at` | Le relais lit les événements non publiés dans l'ordre |

## Unicités sans `coupleId`

La règle 7 de `_knowledge/backend/prisma.md` met `couple_id` en tête de chaque index. Deux index de `pairing` y dérogent, et ce sont les seuls du dépôt ([décision 0029](../../decisions/pairing/0029-pairing-avant-le-couple.md)) :

- `couple_partner_user_id_key` : un partenaire sans couple n'a pas encore de `coupleId`, et R1 interdit justement qu'il en ait deux. L'unicité porte donc sur `user_id` seul.
- `couple_invitation_code_key` : le partenaire qui saisit un code ne connaît pas encore le couple ; le code seul le désigne.

Les index de l'outbox (`aggregate_id, version` et `published, occurred_at`) suivent la règle 11, propre aux tables d'événements.

## Points d'attention

- `couple_partner_user_id_key` ne tient pas compte de `couple.deleted_at` : un index ne lit pas une autre table. Une future suppression de couple devra supprimer ses lignes `couple_partner`, sinon ses partenaires ne pourraient plus former un autre couple.
- Le nom des deux index uniques est celui que l'adaptateur lira avec `violatedUniqueConstraint` pour lever `PAIRING_PARTNER_ALREADY_IN_COUPLE` ou `PAIRING_INVITATION_CODE_CONFLICT`. Renommer un index change ce contrat.
- Une migration générée plus tard est relue : elle ne doit jamais supprimer `couple_invitation_code_key`.
