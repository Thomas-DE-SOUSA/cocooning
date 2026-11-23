# Authentication

Les deux comptes du couple : un partenaire se connecte avec son adresse e-mail et son mot de passe, recoit une session de 90 jours et peut fermer toutes ses sessions.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/authentication/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/authentication/rules.md

Architecture :
@../../../../../docs/couple/architecture/authentication/aggregate.md

## Consignes de code

- Les use cases d'avant toute identite (`CreateAccountUseCase`, `SignInUseCase`, `ResolveSessionUseCase`) ont la signature `execute(command)` ; `SignOutUseCase` recoit `PartnerContext` (decision 0033).
- Mot de passe, hachage et jeton sont des secrets : jamais dans une exception, un log ou une vue autre que `SessionView`.
- Un refus de connexion repond toujours `AUTHENTICATION_CREDENTIALS_INVALID`, apres une verification de mot de passe, meme pour une adresse inconnue (R3).
- Tout refus d'une session repond `AUTHENTICATION_SESSION_INVALID`, quelle que soit la cause.

## Tests

- `givenAccount(emailAddress)` (`__tests__/fixtures/authentication-test.context.ts`) pose un compte dont le mot de passe est `PASSWORD` ; `givenSessionOf(emailAddress)` ouvre une session par `SignInUseCase` et rend son jeton.
- `FakePasswordHasher.checkedHashes` prouve qu'une adresse inconnue fait verifier un hachage `null` (R3).
- `FakeSessionTokenSigner` nomme ses jetons `session-token-1`, `session-token-2`... et refuse un jeton qu'il n'a pas signe ou dont l'echeance est passee.
