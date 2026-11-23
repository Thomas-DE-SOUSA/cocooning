# Comptes et connexion

Cette page décrit comment le contexte `authentication` est construit : ses couches, ses ports et ses use cases. À lire avant de modifier le code de `packages/couple/server-business-logic/src/authentication/` ou de `apps/couple/api/src/modules/authentication/`.

## Rôle et limites

`authentication` garde les deux comptes du couple : adresse e-mail, mot de passe haché, version de session. Il crée un compte, ouvre une session, retrouve le partenaire d'un jeton et ferme les sessions d'un partenaire. Il ne connaît pas le couple : un compte existe avant lui ([décision 0033](../../decisions/authentication/0033-authentication-hors-du-couple.md)), et les autres contextes ne reçoivent que le `userId`.

L'API expose la connexion et la déconnexion, et son garde de session passe par `ResolveSessionUseCase` à chaque requête ([décision 0034](../../decisions/0034-session-revocable.md)). Aucun endpoint ne crée de compte (R6) : `CreateAccountUseCase` a pour seul adaptateur primaire la commande `create-account`, lancée par le propriétaire sur la VM ([décision plateforme 0016](../../../platform/decisions/0016-commandes-d-exploitation-dans-l-api.md), [runbook des comptes](../../infrastructure/runbooks/authentication/accounts.md)).

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Account` | Agrégat : adresse, hachage, version de session (voir [l'agrégat](aggregate.md)) | `domain/models/account.aggregate.ts` |
| `AccountId`, `EmailAddress` | Value objects : identité UUID v7 (le `userId` du partenaire), adresse normalisée | `domain/value-objects/` |
| `SessionClaims` | Contenu d'un jeton : `userId`, `sessionVersion`, `expiresAt` | `domain/models/account.aggregate.type.ts` |
| `AuthenticationException` | Exception du contexte, codes de `AuthenticationExceptionCodeEnum` ; levée aussi par le garde de session de l'API | `domain/exceptions/`, `packages/couple/contract/src/authentication/exceptions/exception-codes.ts` |
| `AccountRepository` | Port : `save`, `findById`, `findByEmailAddress` | `domain/ports/account.repository.ts` |
| `PasswordHasher` | Port : `hash`, `matches` (Argon2id côté API) | `domain/ports/password-hasher.ts` |
| `SessionTokenSigner` | Port : `sign`, `verify` (JWT HS256 côté API) | `domain/ports/session-token-signer.ts` |
| `AuthenticationPreconditionService` | Domain service : adresse libre (R1), compte des identifiants (R3), compte d'une session (R5), compte d'un partenaire | `domain/services/authentication-precondition.service.ts` |
| `PasswordPolicyValidator` | Contrôle statique de la longueur du mot de passe (R2) | `domain/services/password-policy.validator.ts` |
| `CreateAccountUseCase`, `SignInUseCase`, `ResolveSessionUseCase` | Use cases `execute(command)`, sans contexte | `application/use-cases/` |
| `SignOutUseCase` | Use case `execute(context)`, avec le `PartnerContext` du partenaire connecté | `application/use-cases/sign-out.use-case.ts` |
| `SignInRequestSchema`, `SignInResponseSchema`, `SESSION_COOKIE_NAME` | Contrat HTTP de la connexion, partagé par l'API et la PWA : identifiants aux bornes brutes, jeton et échéance rendus au serveur Next, nom du cookie | `packages/couple/contract/src/authentication/` |
| Table `account` | Persistance de l'agrégat, sans `couple_id` ni outbox (voir [les tables](tables.md)) | `packages/couple/prisma/prisma/models/authentication-account.prisma` |
| `toAccountView`, `toSessionView` | Vues rendues : compte créé (`userId`, adresse) ; session ouverte (`userId`, jeton, échéance) | `application/mappers/` |

| `SignInController`, `SignOutController` | `POST ApiRouterEnum.ACCOUNT_SESSION_OPEN` (public, `200`, `SignInResponseSchema`) et `DELETE ApiRouterEnum.ACCOUNT_SESSION_CLOSE` (`204`) | `apps/couple/api/src/modules/authentication/primary/controllers/` |
| `SessionGuard` | Garde global de l'API : lit le cookie `cocooning_session`, appelle `ResolveSessionUseCase`, attache le `PartnerContext` | `apps/couple/api/src/modules/authentication/session.guard.ts` |
| `AccountPrismaRepository` | Adaptateur de `AccountRepository` : verrou optimiste sur `version`, index `account_email_address_key` traduit en `AUTHENTICATION_ACCOUNT_ALREADY_EXISTS` | `apps/couple/api/src/modules/authentication/secondary/repositories/` |
| `Argon2PasswordHasher`, `JwtSessionTokenSigner` | Adaptateurs : Argon2id (faux hachage au même coût pour une adresse inconnue) ; JWT HS256 aux claims `sub`, `ver`, `exp`, vérifié à l'heure de `DateTimeProvider` | `apps/couple/api/src/modules/authentication/secondary/providers/` |
| `CreateAccountCommandModule`, `runCreateAccountCommand` | Commande `create-account` : contexte Nest sans HTTP sur `AuthenticationSecondaryModule`, seul fournisseur de `CreateAccountUseCase` ; adresse en argument, mot de passe lu deux fois sans écho, codes de sortie `0`, `64`, `65`, `1` | `apps/couple/api/src/commands/create-account/` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/authentication/`. La durée d'une session vient de `AUTH_SESSION_TTL_DAYS` (`90`), lue au démarrage par la fabrique des use cases.

## Flux principal

Se connecter (`SignInUseCase`) :

1. `loadAccountByCredentials` normalise l'adresse, cherche le compte, puis vérifie toujours un mot de passe, contre le hachage du compte ou contre `null` ; un échec répond `AUTHENTICATION_CREDENTIALS_INVALID` (R3).
2. `Account.openSession(now, sessionLifetimeInDays)` donne le contenu du jeton, échéance comprise (R4).
3. `SessionTokenSigner.sign` signe le jeton ; `toSessionView` le rend avec son échéance.

Résoudre une session (`ResolveSessionUseCase`) : `SessionTokenSigner.verify` refuse un jeton faux ou expiré, puis `Account.acceptsSession` refuse un jeton d'un autre compte ou d'une version de session dépassée (R5) ; tout refus répond `AUTHENTICATION_SESSION_INVALID`.

Se déconnecter (`SignOutUseCase`) : `Account.revokeSessions` augmente la version de session, puis `AccountRepository.save` l'écrit.

## Points d'attention

- **Recherches sans `coupleId`.** `findById` et `findByEmailAddress` sont, avec les deux de `pairing`, les seules exceptions du dépôt à la règle 27 de `_knowledge/core.md` (décision 0033). Chacune répond au plus un compte : la clé primaire, et l'index unique sur l'adresse des comptes actifs.
- **Pas d'événement de domaine.** Aucun contexte ne réagit encore à un compte ou à une session : ni événement ni outbox (écart 001 du [registre](../../gaps/authentication.md)).
- **Secrets.** Ni le mot de passe, ni son hachage, ni le jeton ne vont dans un log ou une exception (`core.md` règles 30 et 33).
- Les tests de use case s'appuient sur `AccountInMemoryRepository` (version, adresse unique), `FakePasswordHasher` (qui garde la liste des hachages vérifiés) et `FakeSessionTokenSigner` (qui refuse un jeton qu'il n'a pas signé ou dont l'échéance est passée).

## Décisions liées

- [Décision 0019](../../decisions/0019-authentification-locale.md) : authentification locale, deux comptes
- [Décision 0032](../../decisions/authentication/0032-regles-du-compte-et-de-la-session.md) : règles du compte et de la session
- [Décision 0033](../../decisions/authentication/0033-authentication-hors-du-couple.md) : le contexte travaille hors du couple
- [Décision 0034](../../decisions/0034-session-revocable.md) : session révocable, cookie posé par la PWA
