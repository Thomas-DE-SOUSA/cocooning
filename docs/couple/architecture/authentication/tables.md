# Tables des comptes

Cette page décrit la table PostgreSQL du contexte `authentication` : ses colonnes, ses index et ses contraintes. À lire avant de modifier `packages/couple/prisma/prisma/models/authentication-account.prisma` ou d'écrire l'adaptateur Prisma d'`AccountRepository`.

La table naît avec la migration `20261123131843_authentication_account` (`packages/couple/prisma/prisma/migrations/`). Les dates sont des `TIMESTAMP(3)` sans fuseau, écrites en UTC par Prisma.

## `account`

L'agrégat `Account` (modèle `Account`, fichier `authentication-account.prisma`). Pas de `couple_id` : un compte existe avant le couple ([décision 0033](../../decisions/authentication/0033-authentication-hors-du-couple.md)). Pas d'outbox : l'agrégat n'enregistre aucun événement (écart 001 du [registre](../../gaps/authentication.md)).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | `UUID`, clé primaire | Identifiant du compte et `userId` du partenaire, le `sub` du jeton ; généré par le domaine (`AccountId.generate()`, UUID v7, décision 0024) |
| `email_address` | `VARCHAR(254)` | Adresse e-mail normalisée, en minuscules (R1, `EMAIL_ADDRESS_MAX_LENGTH`) |
| `password_hash` | `VARCHAR(255)` | Hachage Argon2id encodé du mot de passe (R2) ; jamais le mot de passe |
| `session_version` | `INTEGER` | Version de session : 1 à la création, + 1 à chaque déconnexion ; un jeton d'une version plus ancienne est refusé (R5) |
| `version` | `INTEGER` | Verrou optimiste : 1 à la création, incrémenté par le repository (INV-005) |
| `created_at`, `updated_at` | `TIMESTAMP(3)` | `EntityMetadata` du domaine, fournies par `DateTimeProvider` (aucun défaut en base) |
| `deleted_at` | `TIMESTAMP(3)`, nullable | Suppression logique : le modèle figure dans `SOFT_DELETABLE_MODELS` |

| Index ou contrainte | Colonnes | Pourquoi |
|---|---|---|
| `account_pkey` | `id` | Clé primaire ; sert `findById` |
| `account_email_address_key` | `email_address`, unique partiel `WHERE deleted_at IS NULL` | Une adresse n'appartient qu'à un compte actif (R1, INV-002) ; sert `findByEmailAddress`. Écrit à la main dans la migration (règle 9 de `_knowledge/backend/prisma.md`) |

Aucune clé étrangère ne relie `couple_partner.user_id` à `account.id` : chaque contexte garde ses tables (décision 0033).
