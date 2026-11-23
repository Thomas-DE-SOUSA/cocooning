# Agrégat Account

Cette page décrit l'agrégat `Account` du contexte `authentication` : son état, ses transitions et les invariants qu'il garantit. À lire avant de toucher à `account.aggregate.ts` ou à ses contrôles.

## Rôle et limites

`Account` porte les identifiants de connexion d'un partenaire : son adresse e-mail, le hachage de son mot de passe et sa version de session. Son identifiant est le `userId` que voient tous les autres contextes. Il ne sait pas si une adresse est déjà prise par un autre compte : ce contrôle demande une lecture, fait par `AuthenticationPreconditionService`, et `AccountRepository.save` doit le garantir par un index unique. Il ne hache ni ne signe rien : les ports `PasswordHasher` et `SessionTokenSigner` le font.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Account.create(input, now)` | Nouveau compte à la version de session 1, adresse et hachage reçus en entrée | `domain/models/account.aggregate.ts` |
| `Account.openSession(now, sessionLifetimeInDays)` | Contenu d'un jeton : `userId`, version de session, échéance ; ne change rien | idem |
| `Account.revokeSessions(now)` | Version de session + 1 : tout jeton déjà émis ne vaut plus rien | idem |
| `Account.acceptsSession(claims)` | Vrai si le jeton est de ce compte et de sa version de session courante | idem |
| `Account.fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO | idem |
| `EmailAddress` | `create` (valide, R1), `from`, `normalize` (saisie de connexion, R3) | `domain/value-objects/email-address.vo.ts` |
| `PasswordPolicyValidator` | `ensureAcceptable` (R2) | `domain/services/password-policy.validator.ts` |

Les chemins partent de `packages/couple/server-business-logic/src/authentication/`.

L'échéance vaut `connexion + durée × 86 400 000 ms` ; le jeton est valable jusqu'à cet instant exclu.

## Événements

Aucun : rien ne consomme encore un événement de compte (écart 001 du [registre](../../gaps/authentication.md)).

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Une adresse est bien formée, en minuscules, sans espaces autour, de 254 caractères au plus (R1) | `EmailAddress.create` |
| INV-002 | Une adresse n'appartient qu'à un compte actif (`AUTHENTICATION_ACCOUNT_ALREADY_EXISTS`, R1) | `AuthenticationPreconditionService`, index unique de `AccountRepository.save` |
| INV-003 | Un mot de passe fait de 12 à 128 caractères à la création (R2) | `PasswordPolicyValidator` |
| INV-004 | Seul un jeton de la version de session courante est accepté ; une déconnexion l'augmente (R5) | agrégat (`revokeSessions`, `acceptsSession`) |
| INV-005 | L'agrégat ne modifie jamais `version` ; il part de 1 et la base l'incrémente | agrégat, repository |

## Points d'attention

- `fromSnapshot` ne revérifie rien : une adresse enregistrée sous une règle plus ancienne se relit telle quelle.
- `passwordHash` ne sort de l'agrégat que vers `PasswordHasher.matches` et le repository.

## Décisions liées

- [Décision 0032](../../decisions/authentication/0032-regles-du-compte-et-de-la-session.md) : règles du compte et de la session
- [Décision 0034](../../decisions/0034-session-revocable.md) : session révocable
