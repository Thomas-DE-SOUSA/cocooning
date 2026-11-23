# @cocooning/couple-client-infrastructure

Adaptateurs front des contextes du couple. Sous-chemin `shared` : `createCoupleHttpConfig(timeoutMs)`, la configuration HTTP commune a toutes les gateways du couple, qui traduit un refus de l'API (corps `HttpErrorResponse` du contrat) en `ApiError`. Les gateways d'un contexte arrivent avec son premier ecran, dans `src/shared/<contexte>/`.

## A lire avant de commencer

Regles front communes :
@../../../_knowledge/core-frontend.md

## Consignes de code

- Statut -> code : 400 et 422 `VALIDATION_ERROR`, 401 `UNAUTHORIZED`, 404 `NOT_FOUND`, 409 `CONFLICT`, tout autre `UNKNOWN`. Le `code` du corps devient `backendCode` ; l'ecran choisit son message par ce code (decision 0010).
- Une gateway etend le port de `couple-client-business-logic`, appelle `httpRequest` puis `parseResponse` avec le schema de reponse du contrat, et ne leve jamais.
- Aucune URL en dur : `resolveRoute(apiBaseUrl, ApiRouterEnum.X)`, `apiBaseUrl` lu dans la configuration de l'app.

## Tests

- Une spec a cote du fichier, style BDD, sans `should`. `fetch` se remplace par un faux ecrit a la main (decision 0001) : a la premiere gateway, exposer le `FakeFetch` de `client-infrastructure` par un sous-chemin `testing` plutot que de le recopier.

## Pieges

- Jest resout les packages voisins vers leurs `src` (`moduleNameMapper`) ; le build lit leurs `dist`, construits avant par turbo.

## Commandes

- `pnpm --filter @cocooning/couple-client-infrastructure test`
- `pnpm --filter @cocooning/couple-client-infrastructure check-types`
- `pnpm --filter @cocooning/couple-client-infrastructure lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la fonction modifies, trouvee avec `rg -l '<nomDeFonction>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Correspondance statut -> code : `docs/couple/architecture/frontend/index.md` et `docs/couple/decisions/0020-statut-http-des-exceptions.md` cote serveur.
