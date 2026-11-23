# Règles des comptes et de la connexion

Ce que l'app impose pour les deux comptes du couple et leurs sessions. À lire avant de toucher au contexte `authentication`, à l'écran de connexion ou à la commande qui crée les comptes.

## À la création d'un compte

### R1. Une adresse e-mail, un compte

Mon compte porte mon adresse e-mail, enregistrée sans espaces autour et en minuscules. Une adresse mal formée ou de plus de 254 caractères est refusée, et une adresse ne sert qu'à un compte actif. Aucun e-mail n'est jamais envoyé.

- Dans le code : `EmailAddress.create` ; `AuthenticationPreconditionService.ensureEmailAddressAvailable` (`AccountRepository.findByEmailAddress`) et l'index unique de `AccountRepository.save` ; borne `EMAIL_ADDRESS_MAX_LENGTH` de `@cocooning/couple-shared-kernel/limits`.
- Source : [décision 0032](../../decisions/authentication/0032-regles-du-compte-et-de-la-session.md). Validée par : Thomas De Sousa, 2026-11-23.

### R2. Un mot de passe de 12 à 128 caractères

Mon mot de passe fait au moins 12 et au plus 128 caractères. Seul son hachage Argon2id est gardé.

- Dans le code : `PasswordPolicyValidator.ensureAcceptable`, appelé par `CreateAccountUseCase` ; `PasswordHasher.hash`. Bornes `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH`.
- Source : décision 0032, [décision 0019](../../decisions/0019-authentification-locale.md). Validée par : Thomas De Sousa, 2026-11-23.

### R6. Pas d'inscription dans l'application

Les deux comptes sont créés par le propriétaire, sur la VM, par une commande qui demande le mot de passe sans l'afficher. L'application n'a pas d'écran d'inscription.

- Dans le code : `CreateAccountUseCase`, qu'aucun endpoint n'expose ; la commande `create-account` de l'API (`apps/couple/api/src/commands/create-account/`, [runbook des comptes](../../infrastructure/runbooks/authentication/accounts.md)).
- Source : décision 0032. Validée par : Thomas De Sousa, 2026-11-23.

## À la connexion

### R3. Une connexion refusée ne dit pas pourquoi

Une adresse inconnue et un mauvais mot de passe reçoivent la même réponse. Dans les deux cas, un mot de passe est vérifié, pour que la réponse prenne le même temps.

- Dans le code : `AuthenticationPreconditionService.loadAccountByCredentials`, `PasswordHasher.matches` (avec un hachage `null` pour une adresse inconnue), `AUTHENTICATION_CREDENTIALS_INVALID`. L'adresse saisie passe par `EmailAddress.normalize`, sans validation.
- Source : décision 0032. Validée par : Thomas De Sousa, 2026-11-23.

### R4. Une session dure 90 jours

Une fois connecté, je le reste 90 jours, puis je me reconnecte. La session n'est pas prolongée par l'usage.

- Dans le code : `Account.openSession` (échéance = connexion + durée), `SessionTokenSigner.verify` (refus après l'échéance) ; la durée arrive par `sessionLifetimeInDays` dans `SignInUseCase`, lue par l'API dans la configuration.
- Source : décision 0032. Validée par : Thomas De Sousa, 2026-11-23.

## À la déconnexion

### R5. Se déconnecter ferme toutes mes sessions

Je me déconnecte : toutes mes sessions se ferment, sur tous mes appareils. Celles de l'autre partenaire ne changent pas.

- Dans le code : `SignOutUseCase`, `Account.revokeSessions` (version de session + 1), `Account.acceptsSession`, vérifié par `ResolveSessionUseCase` à chaque requête.
- Source : décision 0032, [décision 0034](../../decisions/0034-session-revocable.md). Validée par : Thomas De Sousa, 2026-11-23.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Adresse inconnue ou mauvais mot de passe | Refusée, `401` `AUTHENTICATION_CREDENTIALS_INVALID` (R3) |
| Jeton absent | Refusée, `401` `AUTHENTICATION_SESSION_MISSING` |
| Jeton faux, expiré, antérieur à la dernière déconnexion, ou compte disparu | Refusée, `401` `AUTHENTICATION_SESSION_INVALID` (R4, R5) |
| Créer un compte avec une adresse mal formée | Refusée, `AUTHENTICATION_EMAIL_ADDRESS_INVALID` (R1) |
| Créer un compte avec un mot de passe trop court ou trop long | Refusée, `AUTHENTICATION_PASSWORD_TOO_WEAK` (R2) |
| Créer un compte avec une adresse déjà prise | Refusée, `AUTHENTICATION_ACCOUNT_ALREADY_EXISTS` (R1) |
| Changer ou réinitialiser son mot de passe | Pas encore possible, au plus tard en phase 7 (décision 0019) ; le propriétaire recrée le compte en attendant |
| Trop d'essais de connexion | Pas de limite pour l'instant (décision 0032) |

## Voir aussi

- [Glossaire d'authentication](glossary.md)
- [Décision 0033](../../decisions/authentication/0033-authentication-hors-du-couple.md) : pourquoi ces use cases tournent sans `coupleId`
