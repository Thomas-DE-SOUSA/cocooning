---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0036: Les données se lisent dans la page serveur, avec le cookie de session

## Contexte

L'écran de mise en couple est le premier qui lit l'API au nom d'un partenaire connecté. Le navigateur ne parle jamais à l'API (règle 12 de `_knowledge/core-frontend.md`) : le serveur Next doit transmettre la session, gardée dans le cookie `HttpOnly` posé à la connexion ([décision 0034](../0034-session-revocable.md)). La règle 19 préfère la lecture côté serveur à l'état client, et TanStack Query n'est dans le dépôt pour aucun écran. Une session fermée sur un autre appareil laisse son cookie dans le navigateur ([écart authentication 004](../../gaps/authentication.md)). Le propriétaire a choisi la route, l'actualisation et la déconnexion de l'étape 3 (D37).

## Décision

- Une page (Server Component) lit ses données par le use case du module, construit par la fabrique du contexte. La fabrique reçoit le fournisseur de session sans l'appeler : `createPairingModule(API_URL, API_TIMEOUT_MS, getSessionToken)`. `getSessionToken()` (`apps/couple/web/src/shared/application/`, `server-only`) lit le cookie au moment de la requête.
- La gateway renvoie le jeton à l'API dans l'en-tête `Cookie`, sous `SESSION_COOKIE_NAME`, que lit le garde de session de l'API.
- Une mutation passe par une server action, puis le container appelle `router.refresh()` : la page relit ses données sur le serveur. Pas de cache client tant qu'aucun écran n'en a besoin.
- Une lecture refusée en `UNAUTHORIZED` renvoie la page vers `WebRouterEnum.ACCOUNT_SIGN_IN`. La connexion suivante remplace le cookie.
- Un écran dont l'état change par l'action de l'autre partenaire se relit quand la PWA revient au premier plan (`visibilitychange`) et sur un bouton « Actualiser ». Pas d'interrogation en boucle ; le Web Push viendra avec les messages.

## Alternatives écartées

- **TanStack Query dans un container client** : un cache, des clés et un `QueryClientProvider` pour des écrans qui se lisent une fois à l'ouverture. Il viendra avec le premier écran qui garde des données côté client (notes en temps réel).
- **Un route handler qui relaie l'API au navigateur** : un deuxième chemin vers l'API, à protéger et à tester, sans gain sur une lecture de page.
- **Interroger l'API toutes les quelques secondes** : des appels pendant les 48 heures que peut durer une attente, pour un événement qui arrive une fois.

## Conséquences

- Les fabriques des contextes authentifiés de `@cocooning/couple-client-infrastructure` prennent un fournisseur de session ; celle d'`authentication` n'en prend pas (la connexion précède la session).
- Le chemin d'une lecture est décrit dans [le front de la PWA](../../architecture/frontend/index.md).
- L'écart authentication 004 se réduit au cookie resté dans le navigateur ; la déconnexion le retire (étape 3).

## Risques

- Une page relit l'API à chaque `router.refresh()`. Négligeable pour deux utilisateurs sur le tailnet.
- Un oubli du fournisseur de session dans une fabrique fait refuser chaque appel en `401` : le test de la gateway vérifie l'en-tête `Cookie`.
