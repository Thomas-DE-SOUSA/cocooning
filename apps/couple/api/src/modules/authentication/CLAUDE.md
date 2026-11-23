# Module authentication de l'API

Adaptateurs du contexte `authentication` : deux controleurs (`primary/controllers/`, `POST` et `DELETE ApiRouterEnum.ACCOUNT_SESSION_*`), le mapper `toSignInResponse` (`primary/mappers/`), `AccountPrismaRepository` (`secondary/repositories/`, verrou optimiste, index `account_email_address_key` traduit en `AUTHENTICATION_ACCOUNT_ALREADY_EXISTS`), `Argon2PasswordHasher` et `JwtSessionTokenSigner` (`secondary/providers/`), le fragment `env.ts` (`AUTH_JWT_SECRET`, `AUTH_SESSION_TTL_DAYS`). Les use cases sont construits par `authenticationUseCase()` (`authentication-use-case.factory.ts`). `SessionGuard` (global, `APP_GUARD` de `AppModule`) lit le cookie et appelle `ResolveSessionUseCase` (decision 0034) ; `@CurrentPartner()` donne le `PartnerContext` au controleur.

Contexte metier :
@../../../../../../packages/couple/server-business-logic/src/authentication/CLAUDE.md

Pieges propres au module :

- `jsonwebtoken` lit `Date.now()` : `JwtSessionTokenSigner` signe avec `noTimestamp` et verifie avec `clockTimestamp` tire de `DateTimeProvider`. Il accepte un jeton sans `exp` comme eternel : `SessionTokenPayloadSchema` exige `sub`, `ver` et `exp`.
- `Argon2PasswordHasher.matches(password, null)` verifie contre un faux hachage au meme cout (R3) : ne jamais court-circuiter ce cas.
- `argon2` s'installe sans script de build (binaires precompiles, `allowBuilds: false`).
- `AuthenticationModule` exporte `AuthenticationServiceModule` : sans lui, `AppModule` ne peut pas construire `SessionGuard`.

Modeles a copier : `test/authentication/` (E2E : `AuthenticationTestApp`, garde, adaptateur par `app.get(AccountRepository)` sur des lignes posees par `createTestAccount`).
