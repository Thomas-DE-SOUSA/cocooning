# couple-web

PWA Next.js 16 (App Router, Turbopack) du couple, servie en dev sur le port 3200. Aujourd'hui : le socle (`src/app/` : layout racine, `Provider`, accueil provisoire, `not-found`, `global-error`) et la traduction en francais (`src/i18n/`). Les ecrans arrivent par modules dans `src/modules/<module>/` (Feature Module Pattern, decision 0011).

## A lire avant de commencer

Regles front communes :
@../../../_knowledge/core-frontend.md

## Consignes de code

- Langue : francais seul (choix du proprietaire, 2026-11-23). `I18N_CONFIG.supportedLocales` et la spec de parite des cles restent en place : ajouter une langue = un dossier `src/i18n/locales/<langue>/` et une entree dans `RESOURCES`.
- Traductions chargees par imports statiques dans `src/i18n/resources.ts` (`core.md rule 23`, pas d'`import()` dynamique). Un namespace = un fichier JSON, ajoute a `RESOURCES`.
- Composant serveur : `const t = await getServerTranslation('<namespace>')` (une instance i18next par appel). Composant client : `useTranslation('<namespace>')` de `react-i18next`, sous le `Provider` de `src/app/provider.tsx`.
- Aucune URL en dur : `WebRouterEnum` de `@cocooning/couple-shared-kernel/routers` (modele : `src/app/not-found.tsx`).
- `process.env` est interdit hors de `src/env/` (lint `next.js`). La premiere variable arrive avec son schema Zod dans `src/env/server.ts` (`@t3-oss/env-nextjs`), son `.env.example` et la liste `env` de `turbo.json`, dans le meme commit.
- Composants d'interface : `@cocooning/design-system`, jamais une copie locale. Couleurs par les tokens (`bg-primary`, `text-muted-foreground`), jamais en dur.
- `*.tsx` : 125 lignes visees, 200 au plus (decision 0008).

## Tests

- Specs a cote du fichier, `*.spec.tsx` en jsdom avec Testing Library, style BDD, sans `should`.
- Composant serveur async : `render(await Page())` (modele : `src/app/page.spec.tsx`).
- `src/i18n/__tests__/locale-files.spec.ts` refuse un `{placeholder}` a accolade simple et des cles qui different entre langues.

## Pieges

- `next-env.d.ts` est regenere par `next build` et n'est pas versionne ; `check-types` passe sans lui.
- Le design system est lu depuis ses `src` (`transpilePackages` dans `next.config.ts`) ; les autres packages internes depuis leur `dist`, construit avant par turbo (`^build`).
- Jest ne passe pas par Next : `@/`, les packages internes et les `.css` sont mappes dans `jest.config.mjs`. Un nouveau package interne importe par l'app y recoit sa ligne.
- `global-error.tsx` remplace le layout racine : il pose lui-meme `<html>`, `<body>` et l'`I18nProvider`.
- `next lint` n'existe plus : `pnpm lint` lance `eslint .`.

## Commandes

- `pnpm --filter couple-web dev` (http://localhost:3200)
- `pnpm --filter couple-web test`
- `pnpm --filter couple-web check-types`
- `pnpm --filter couple-web lint`
- `pnpm --filter couple-web build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou le composant modifies, trouvee avec `rg -l '<NomDeComposant>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Chemin d'un appel, packages front : `docs/couple/architecture/frontend/index.md`.
- Port, commandes, variables : `docs/guides/local-setup.md`.
- Module ajoute : son `CLAUDE.md` au format `docs/templates/claude-web-submodule.md` s'il a un pendant backend.
