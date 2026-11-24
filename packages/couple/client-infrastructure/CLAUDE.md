# @cocooning/couple-client-infrastructure

Adaptateurs front des contextes du couple. Sous-chemin `shared` : `createCoupleHttpConfig(timeoutMs)`, la configuration HTTP commune a toutes les gateways du couple, qui traduit un refus de l'API (corps `HttpErrorResponse` du contrat) en `ApiError`. Les gateways d'un contexte arrivent avec son premier ecran, dans `src/shared/<contexte>/` : `endpoints/` (`resolve<Contexte>Endpoints(apiBaseUrl)`), `gateways/api-<nom>.gateway.ts`, et la fabrique `create<Contexte>Module(apiBaseUrl, timeoutMs[, getSessionToken])` qui rend les use cases et garde la gateway. Aujourd'hui : `authentication/` (`ApiAuthenticationGateway`, `createAuthenticationModule(apiBaseUrl, timeoutMs, getSessionToken)` -> `{ signIn, signOut }`, la connexion sans session, la deconnexion avec), `pairing/` (`ApiPairingGateway`, `createPairingModule(apiBaseUrl, timeoutMs, getSessionToken)` -> `{ getMyCouple, createCouple, joinCouple, renewInvitationCode, cancelCouple }`) `notes/` (`ApiNotesGateway`, `createNotesModule(apiBaseUrl, timeoutMs, getSessionToken)` -> `{ listNotes, getNote, createNote, renameNote, shareNote, makeNotePrivate, deleteNote }`, routes a parametre par `resolveRoute(apiBaseUrl, route, { noteId })`) et `session/` (`SessionTokenProvider`, `sessionHeaders`, `sessionRequest`).

## A lire avant de commencer

Regles front communes :
@../../../_knowledge/core-frontend.md

## Consignes de code

- Statut -> code : 400 et 422 `VALIDATION_ERROR`, 401 `UNAUTHORIZED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`, 409 `CONFLICT`, tout autre `UNKNOWN`. Le `code` du corps devient `backendCode` ; l'ecran choisit son message par ce code (decision 0010).
- Une gateway etend le port de `couple-client-business-logic`, appelle `httpRequest` puis `parseResponse` avec le schema de reponse du contrat, et ne leve jamais.
- Aucune URL en dur : `resolveRoute(apiBaseUrl, ApiRouterEnum.X)`, `apiBaseUrl` lu dans la configuration de l'app.
- Une gateway valide sa requete par le schema de requete du contrat avant l'appel : hors contrat, `VALIDATION_ERROR` sans appel.
- Aucune gateway ne transmet l'adresse IP ni le User-Agent du navigateur (decision 0043, `core-frontend.md` regle 13).
- Contexte qui agit pour le partenaire connecte : la fabrique recoit `getSessionToken` sans l'appeler, la gateway passe par `sessionRequest(getSessionToken, requete, config)`, qui appelle `sessionHeaders` a chaque requete et envoie `Cookie: <SESSION_COOKIE_NAME>=<jeton>`, lu par le garde de session de l'API (decision 0036). La fabrique recoit `getSessionToken` des qu'un seul de ses use cases agit pour le partenaire connecte ; un appel public de la meme fabrique part sans cookie (decision 0042). Sans jeton, `UNAUTHORIZED` (`AUTHENTICATION_SESSION_MISSING`) sans appel.
- Modeles a copier : `src/shared/authentication/` (connexion publique, deconnexion avec la session), `src/shared/pairing/` (tous les appels au nom du partenaire).

## Tests

- Une spec a cote du fichier, style BDD, sans `should`. `fetch` se remplace par `FakeFetch` de `@cocooning/client-infrastructure/testing` (decision 0001), une instance neuve par test : son journal `calls` se lit, ne se vide pas. `givenNoAnswer()` simule une API qui ne repond pas : la requete rejette quand son signal s'interrompt (timeout). Les reponses de couple viennent de `A_PENDING_COUPLE` et `A_PAIRED_COUPLE` (`@cocooning/couple-client-business-logic/testing`).

## Pieges

- Jest resout les packages voisins vers leurs `src` (`moduleNameMapper`) ; le build lit leurs `dist`, construits avant par turbo.

## Commandes

- `pnpm --filter @cocooning/couple-client-infrastructure test`
- `pnpm --filter @cocooning/couple-client-infrastructure check-types`
- `pnpm --filter @cocooning/couple-client-infrastructure lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la fonction modifies, trouvee avec `rg -l '<nomDeFonction>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Correspondance statut -> code : `docs/couple/architecture/frontend/index.md` et `docs/couple/decisions/0020-statut-http-des-exceptions.md` cote serveur.
