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

# 0014: Socle technique de la PWA

## Contexte

L'étape 1 de la phase 3 a posé la PWA `apps/couple/web` (Next.js 16, Turbopack) et ses packages front, en quatre PR (#17 à #19, puis celle-ci). Quatre choix y ont été faits en cours de route, chacun imposé par une contrainte constatée à l'essai. Ils engagent les étapes suivantes et doivent être écrits avant le premier module.

## Décision

1. **Paquets front en CommonJS.** `client-infrastructure`, `couple/client-business-logic` et `couple/client-infrastructure` se compilent comme le backend : `tsc` avec `module: Node16`, sans `"type": "module"`, dans `dist/`. Next les lit depuis `dist/`, construit avant par turbo (`^build`) ; Jest les lit depuis `src/` (`moduleNameMapper`).
2. **Design system lu en source.** `@cocooning/design-system` n'a pas de build : ses exports pointent vers `src/`, et Next le compile par `transpilePackages` dans `apps/couple/web/next.config.ts`.
3. **`@eslint-react/eslint-plugin` à la place d'`eslint-plugin-react`.** `config/eslint-config/react.js` l'utilise, avec `eslint-plugin-react-hooks`.
4. **Service worker par `@serwist/next`, build en webpack.** `next build --webpack` produit `public/sw.js` depuis `src/app/sw.ts`. Le plugin n'enveloppe la configuration qu'à la phase `PHASE_PRODUCTION_BUILD` : `next dev` reste en Turbopack, sans service worker.

Réponse du propriétaire, le 2026-11-23, à la question « Je merge d'abord la PR #21 (PWA installable) ? » : « Merger #21 (Recommandé) ».

## Alternatives écartées

- **Paquets front en ESM** : le dépôt teste en CommonJS avec Jest 30 et ts-jest ([décision plateforme 0011](0011-backend-commonjs-nest-11.md)) ; deux formats de module doubleraient la configuration de test.
- **Design system construit dans `dist/`** : un build de plus pour des composants que seule la PWA importe ; Tailwind 4 doit de toute façon lire les classes dans les sources.
- **`eslint-plugin-react` 7.37** : il plante sous ESLint 10 (`context.getFilename` retiré).
- **`@serwist/turbopack`** : il faut `esbuild` ou `esbuild-wasm` (le script d'installation d'`esbuild` est bloqué par `allowBuilds`), `@swc/core`, un route handler qui sert le service worker et un fournisseur React dans le layout. Son support de Turbopack est expérimental.
- **Mode « configurator » de `@serwist/next` (`serwist build` après `next build`)** : une étape et une dépendance (`@serwist/cli`) de plus dans le build.
- **Toute l'app en webpack, dev compris** : le dev perd la vitesse de Turbopack pour un service worker inutile en local.

## Conséquences

- Avant d'ajouter une dépendance à un paquet front construit, vérifier qu'elle publie une entrée CommonJS (`npm view <paquet> type exports`), comme pour le backend.
- Un composant ajouté au design system est visible par l'app sans rebuild.
- Le build de production de la PWA tourne en webpack, le dev en Turbopack : un écart de comportement entre les deux se vérifie avec `pnpm --filter couple-web build && pnpm --filter couple-web start`.
- `public/sw.js` et `public/swe-worker-*` sont générés : ignorés par git, par ESLint et déclarés en sortie du build dans `apps/couple/web/turbo.json`.
- Les pièges du service worker sont dans `apps/couple/web/CLAUDE.md`.

## Risques

- Next.js peut retirer le build webpack. La sortie serait alors `@serwist/turbopack` ou le mode « configurator », par une nouvelle décision.
- Le service worker n'existe pas en dev : un défaut de cache ou de repli hors ligne ne se voit qu'après un build de production.
