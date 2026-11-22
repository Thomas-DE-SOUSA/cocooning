# @cocooning/prettier-config

La configuration Prettier unique du monorepo (`index.js`) : 4 espaces partout, apostrophes simples, `printWidth` 80, fins de ligne LF. `.prettierrc` a la racine ne contient que `"@cocooning/prettier-config"`.

## Consignes de code

- Aucun package ne surcharge cette configuration (Malta avait des apps a 2 espaces : ne pas reproduire).
- Ce qui ne doit pas etre reformate va dans `.prettierignore` a la racine (`_brain/`, `_malta-blueprint/`, `.claude/`, YAML, lockfile).

## Commandes

- `pnpm format --check` a la racine (CI), `pnpm format --write` pour corriger.

## Documentation a tenir a jour

- `rg -l 'prettier' docs/ _knowledge/`
