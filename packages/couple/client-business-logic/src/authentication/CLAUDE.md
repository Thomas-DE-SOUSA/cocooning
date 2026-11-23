# Authentication

La connexion d'un partenaire depuis la PWA : le formulaire, le port de la gateway et le use case appele par la server action de connexion.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/authentication/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/authentication/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- `createSignInFormSchema(t)` reprend les bornes brutes de `SignInRequestSchema` (`@cocooning/couple-shared-kernel/limits`) : ni forme d'adresse, ni longueur minimale du mot de passe (R2, R3). Cles `form.<champ>.errors.<type>` (decision 0031).
- `AuthenticationGateway.signIn(request, client)` : `SignInClientContext` porte l'adresse IP et le User-Agent du navigateur (`core-frontend.md` regle 13), `null` quand Next ne les connait pas.
- `SignInUseCase` rend la `SignInResponse` du contrat, jeton compris : seule la server action la lit, pour poser le cookie (decision 0034). Jamais de jeton dans un view model, un log ou un composant client.

## Tests

- `FakeAuthenticationGateway` (`__tests__/secondary/`) : journal `calls`, `givenRefusal(error)`, session `A_SESSION` par defaut.
