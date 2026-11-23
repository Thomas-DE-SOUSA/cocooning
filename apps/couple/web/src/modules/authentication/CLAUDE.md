# Authentication

Le partenaire se connecte avec son adresse e-mail et son mot de passe ; la PWA garde sa session dans un cookie que le navigateur ne lit pas.

## A lire avant de commencer

Glossaire :
@../../../../../../docs/couple/business-rules/authentication/glossary.md

Regles metier :
@../../../../../../docs/couple/business-rules/authentication/rules.md

Architecture front (chemin d'un appel, session, erreurs) :
@../../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Module de reference de la PWA pour un formulaire (decision 0035) : `hooks/use-sign-in-form.ts` (react-hook-form, schema memoise sur `t`), `hooks/use-sign-in.ts` (gateway et callbacks injectes), trio `gateways/{ports,server-action,fake}/`, vue pure `ui/views/sign-in-form.view.tsx`.
- L'action `actions/authentication-sign-in.action.ts` ne fait que lire `headers()`, `cookies()` et la traduction du serveur : la logique va dans `services/sign-in-session.service.ts`, testable sans mock. Jamais de `redirect()` dans l'action (decision 0035).
- Le jeton de session ne quitte pas le serveur : l'action rend `Result<null, ApiError>`. `server-only` en tete de la fabrique et du service.
- Champs du formulaire : `autoComplete="username"` et `"current-password"`, `inputMode="email"`, `autoCapitalize="none"`, sinon le trousseau du telephone ne remplit ni n'enregistre le mot de passe. `method="post"` sur le `<form>`.
- Un code d'erreur que la connexion peut recevoir a sa cle `apiErrors.<code>` dans `src/i18n/locales/fr/authentication/sign-in.json`.

## Tests

- `FakeAuthenticationCommandGateway` (`gateways/fake/`) pour les hooks ; `FakeAuthenticationGateway` de `@cocooning/couple-client-business-logic/testing` pour le service de session.
- La vue se teste par un harnais qui appelle `useSignInForm()` sous `WithI18n` (`src/testing/with-i18n.tsx`), avec `@testing-library/user-event`.
