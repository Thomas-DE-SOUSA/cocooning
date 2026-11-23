# @cocooning/ts-config

Configurations TypeScript partagees. Un package etend une variante, il ne recopie jamais d'options.

- `base.json` : strict complet (`noImplicitAny`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`...), `module: Node16` par defaut.
- `node.json` : lib Node, `types: ["node"]`, incremental.
- `nest.json` : `node16`, decorateurs, `types: ["node", "jest"]`.
- `next.json` : `Bundler`, `noEmit`, `jsx react-jsx`, plugin `next`.
- `react-library.json` : jsx et libs DOM, pour `design-system` et les libs React.

## Consignes de code

- Un `tsconfig.json` de package fait `"extends": "@cocooning/ts-config/<variante>.json"` et ne declare que `rootDir`, `outDir`, `include`. Modele : `config/eslint-config/tsconfig.json`.
- Une option ajoutee ici vaut pour tout le monorepo : la valider avec `pnpm check-types` a la racine.
- TypeScript 6 : pas de `baseUrl`, pas de `moduleResolution: node` (node10), pas de `esModuleInterop: false` (options depreciees).
- Pas de variante `expo.json` : pas d'app mobile.

## Pieges

- `next.json` n'est pas verifie par `check-types` tant que `next` n'est pas installe (il reference `types: ["next"]`) : l'ajouter a `test/` avec la phase web.

## Commandes

- `pnpm --filter @cocooning/ts-config check-types` : compile un echantillon par variante (`test/<variante>/`).

## Documentation a tenir a jour

- `rg -l 'ts-config' docs/ _knowledge/`
