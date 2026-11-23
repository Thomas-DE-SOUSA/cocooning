# Authentication

La connexion et la deconnexion d'un partenaire depuis la PWA : le formulaire, le port de la gateway et les use cases appeles par les server actions.

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
- `SignOutUseCase` : l'API ferme les sessions de tous les appareils (decision 0034) ; un refus `UNAUTHORIZED` compte comme une session deja fermee (`ok(null)`), tout autre echec remonte.
- `SignInUseCase` rend la `SignInResponse` du contrat, jeton compris : seule la server action la lit, pour poser le cookie (decision 0034). Jamais de jeton dans un view model, un log ou un composant client.

## Tests

- `FakeAuthenticationGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`, aussi pour les specs de la PWA) : journal `calls`, `givenRefusal(error)` (connexion), `givenSignOutRefusal(error)`, `givenSession(session)`, session `A_SESSION` par defaut.
