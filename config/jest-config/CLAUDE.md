# @cocooning/jest-config

Preset Jest partage (`jest.config.mjs`) : `ts-jest`, environnement `node`, fichiers `*.spec.ts` et `*.test.ts`.

## Consignes de code

- Un package l'etale dans son propre `jest.config.mjs` : `{ displayName: '<nom du package>', ...jestConfig }`. Modele : `config/eslint-config/jest.config.mjs`.
- Le `tsconfig` de ts-jest se passe dans `transform` (`['ts-jest', { tsconfig: 'tsconfig.spec.json' }]`), jamais a la racine de la config Jest ou il n'a aucun effet.
- Ajouter un `moduleNameMapper` vers les `src` voisins pour **tous** les packages internes testes sans build.
- Pas d'environnement `jsdom` ici : un package React pose `testEnvironment: 'jsdom'`, un `testMatch` qui ajoute `*.spec.tsx` et un `transform` `^.+\\.tsx?$` dans son propre `jest.config.mjs` (modele : `packages/design-system/jest.config.mjs`). `jest-environment-jsdom` suit la version de Jest (catalogue `test`).

## Commandes

- `pnpm test` a la racine, ou `pnpm --filter <package> test`.

## Documentation a tenir a jour

- `rg -l 'jest-config' docs/ _knowledge/`
