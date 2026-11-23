# @cocooning/eslint-config

Configurations ESLint 10 (flat config) partagees et frontieres entre domaines.

- `base.js` (`.`) : `@eslint/js`, `typescript-eslint` recommended, `eslint-config-prettier`, turbo, `no-restricted-syntax` sur `TSEnumDeclaration` (decision 0002) partout, et en plus sur `jest.fn`, `jest.spyOn`, `jest.mock` dans `*.spec.ts(x)` et `*.integration-spec.ts` (decision 0001 ; `*.e2e-spec.ts` garde son exception). **Sans `only-warn`.**
- `business-logic.js` (`./business-logic`) : determinisme du code metier (decision 0024), `no-restricted-properties` (`Math.random`, toute propriete `randomUUID`) et `no-restricted-imports` (`uuid`, `uuid/*`, `randomUUID` de `crypto` / `node:crypto`). Etale en dernier par `packages/couple/server-business-logic/eslint.config.mjs`, et par `client-business-logic` en phase 3.
- `boundaries.js` (`./boundaries`) : `eslint-plugin-boundaries` v7. Exporte `boundariesConfig` (le depot reel) et `createBoundaries({ rootPath, domains })`.
- `nest.js` (`./nest`) : base + `recommendedTypeChecked`, `projectService: true`. Dans les specs, `no-unsafe-argument`, `no-unsafe-assignment` et `unbound-method` sont coupees (matchers Jest types `any`). Le bloc `disableTypeChecked` des fichiers JS reste le dernier : place avant, une regle typee activee ensuite casse le lint de `eslint.config.mjs`.
- `react.js` (`./react`), `next.js` (`./next`) : base + React / Next.js.

## Consignes de code

- Chaque `eslint.config.mjs` local etale la base et les frontieres :
  `export default [...config, ...boundariesConfig];` (modele : `config/eslint-config/eslint.config.mjs`). ESLint prend la config la plus proche de chaque fichier : une frontiere absente d'une config locale n'est pas controlee.
- Chaque script `lint` est `eslint . --max-warnings=0`, sans `--fix` (le `--fix` est reserve a lint-staged).
- Nouveau domaine : l'ajouter a `DOMAINS` dans `boundaries.js`. Nouveau package transverse ou nouvelle couche a proteger : un element et une politique dans `createBoundaries`, plus une fixture et un cas dans `test/boundaries.spec.ts`.
- Un bloc qui reprend `no-restricted-syntax` remplace les options du bloc precedent (flat config) : il recopie `ENUM_DECLARATION`, comme le bloc des specs de `base.js`. Une regle d'une autre famille prend une autre regle (`no-restricted-properties`, `no-restricted-imports`), comme `business-logic.js`.
- `uuid` n'est interdit par le lint que dans le code metier. Ailleurs, pnpm le rend introuvable a tout package qui ne le declare pas : seul `@cocooning/server-infrastructure` le declare, pour `src/identifier/uuid-v7-generator.provider.ts`.
- Regles en place : imports inter-domaines interdits ; `shared` (`shared-kernel`, `server-infrastructure`) -> domaine interdit ; `server-business-logic` -> `@nestjs/*`, `@prisma/*`, `prisma`, `*-prisma` interdits ; `contract` -> `server-business-logic`, `*-prisma` interdits ; `design-system` -> `next`, domaine, infrastructures interdits ; `client-infrastructure` -> domaine interdit, et `src/shared` -> Next/React/Expo interdits.

## Tests

- `test/boundaries.spec.ts` lance le vrai ESLint sur `__fixtures__/forbidden-import/`, un faux depot ou chaque fichier `forbidden-*` viole une regle : le test passe parce que le lint echoue. `__fixtures__/` est exclu du lint normal.
- `test/restricted-code.spec.ts` fait de meme sur `__fixtures__/restricted-code/` (mocks automatiques, enum dans une spec, determinisme) ; chaque `allowed-*` doit passer. Les deux specs partagent `test/lint-fixture.ts`.
- Nouvelle regle : une fixture `forbidden-*` qui la viole, une `allowed-*` qui la respecte, un cas dans la spec.

## Pieges

- `react.js` et `next.js` importent `eslint-plugin-react`, `eslint-plugin-react-hooks` et `@next/eslint-plugin-next`, pas encore installes : les ajouter aux `dependencies` (catalogue `lint`) avec la phase web. `eslint-plugin-react` 7.37 ne declare pas ESLint 10 en peer : verifier avant.
- Pas de dependance de `@cocooning/ts-config` ou `@cocooning/jest-config` vers ce package : ce serait un cycle (ce package depend d'eux).

## Commandes

- `pnpm --filter @cocooning/eslint-config test`
- A la main : `pnpm --filter @cocooning/eslint-config exec eslint -c __fixtures__/forbidden-import/fixture.eslint.config.mjs __fixtures__/forbidden-import` (doit sortir en erreur), idem avec `restricted-code`.

## Documentation a tenir a jour

- `rg -l 'eslint-config|boundaries' docs/ _knowledge/`
