# @cocooning/client-infrastructure

Adaptateurs front sans domaine. Sous-chemin `shared/http` : le seul `fetch` des gateways (`httpRequest`), la verification d'une reponse par son schema de contrat (`parseResponse`), la construction d'une URL d'API (`resolveRoute`), `HttpMethodEnum` et les types `HttpRequest` et `HttpRequestConfig<TError>`.

## A lire avant de commencer

Regles front communes :
@../../_knowledge/core-frontend.md

## Consignes de code

- Aucun domaine : ni `@cocooning/couple-*`, ni code d'erreur metier. Le domaine passe sa traduction des erreurs par `HttpRequestConfig` (modele : `packages/couple/client-infrastructure/src/shared/couple-http-config.ts`).
- `src/shared/` n'importe ni Next, ni React, ni Expo (boundaries) : il tourne dans les server actions et dans les tests Node.
- `httpRequest` ne leve jamais : il renvoie un `Result` (`@cocooning/shared-kernel/utils`). Reseau coupe ou delai depasse : `createNetworkError`. Corps de succes qui n'est pas du JSON : `createInvalidResponseError`, jamais une erreur reseau.
- Le delai (`timeoutMs`) vient de la configuration de l'app, jamais d'une valeur en dur.
- Exports par sous-chemin uniquement, `types` vers `src`, `default` vers `dist`.

## Tests

- Une spec a cote du fichier, style BDD, sans `should`.
- `fetch` se remplace par `src/shared/http/__tests__/fake-fetch.ts` (journal `calls`, `givenResponse`, `givenNetworkFailure`), jamais par `jest.fn` (decision 0001). `install()` dans `beforeEach`, `restore()` dans `afterEach`.

## Pieges

- Une reponse 204 ou un corps vide donne `ok(null)`.
- Jest resout `@cocooning/shared-kernel` vers ses `src` ; le build lit son `dist`, construit avant par turbo.

## Commandes

- `pnpm --filter @cocooning/client-infrastructure test`
- `pnpm --filter @cocooning/client-infrastructure check-types`
- `pnpm --filter @cocooning/client-infrastructure lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la fonction modifies, trouvee avec `rg -l '<nomDeFonction>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Chaine de donnees front et role des packages : `docs/couple/architecture/frontend/index.md`.
