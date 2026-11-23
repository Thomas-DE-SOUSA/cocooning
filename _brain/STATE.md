# État du projet

> Mis à jour : 2026-11-23 (après-midi). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase** : **phase 2 terminée et mergée dans `dev`** (nuit du 2026-11-23, en autonomie, PR #3 à #10). Contexte `pairing` de bout en bout : domaine (`packages/couple/server-business-logic`), tables + migration `init`, contrat, API `apps/couple/api` (garde de session HS256, 4 routes), 50 tests E2E. Garde-fous des décisions 0001, 0004, 0024 dans `pnpm lint` (PR #10). Détail : `journal/2026-11-23.md`, sections « Phase 2 ».
- **Fait (phase 1)** : shared kernels, `server-infrastructure`, `couple/prisma`, `couple/contract`, `couple/e2e-shared`. Détail : `journal/2026-11-22.md`.
- **Fait (avant)** : phase 0 (PR #1) ; analyse de Malta dans `_malta-blueprint/` ; mémoire du projet.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Prochaine étape

**Fait au réveil du propriétaire (2026-11-23)** : décisions 0028, 0029, 0030 acceptées (PR #12) ; écarts des décisions 0001 et 0004 dans `docs/platform/gaps/decision-checks.md` (PR #13 ; 0024 relue : la règle vise bien le code métier, pas d'écart) ; `.env` de l'API et de `couple/prisma` créés en local (secret par `openssl`).

D19 et D25 tranchées le 2026-11-23 : pas de Storybook (plateforme 0012), schémas `create<X>Schema(t)` en `*.zod.ts` (0031).

D18 tranchée : 100 % de couverture imposée sur le code métier, sans Stryker (plateforme 0013).

**Prochaine étape** : phase 3 (PWA), une PR à la fois, accord du propriétaire entre deux PR (il a arrêté l'autonomie). Étape 1 (socle) en 4 PR : PR 1 paquets front sans React (#17, mergée), PR 2 design system (#18, mergée), PR 3 app Next.js `apps/couple/web` port 3200, français seul (#19, **ouverte, à merger sur son accord**), PR 4 PWA installable (Serwist : `@serwist/next` webpack ou `@serwist/turbopack`, à trancher par un essai, puis décision plateforme 0014 : paquets front en CJS, design system lu en source, variante Serwist ; manifeste, icônes provisoires, page hors ligne). Puis étape 2 : `authentication` + écran de connexion (première variable web `API_URL` dans `src/env/server.ts`), étape 3 : module `pairing`.

**Recette d'un nouveau package** (éprouvée six fois ; un package de test comme `e2e-shared` est lu depuis `src`, sans build) : copier la forme de `packages/server-infrastructure/` (`package.json` à exports par sous-chemin `types → src`, `default → dist` ; `tsconfig.json` + `tsconfig.build.json` + `tsconfig.spec.json` en CommonJS pour Jest ; `jest.config.mjs` avec `moduleNameMapper` vers les `src` voisins ; `eslint.config.mjs` = `nestConfig` + `boundariesConfig`, ou `config` de base pour un package isomorphe comme le shared-kernel). Écrire son `CLAUDE.md` (français sans accents, sections figées) dans le même commit. Vérifier l'entrée CommonJS de toute dépendance (D31). Ajouter les versions aux catalogues de `pnpm-workspace.yaml`. Commit sans scope (`feat: …`). Vérifier `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine avant de commiter.

- Reporté en phase 3 : `client-infrastructure` et `design-system`.

## Décisions qui bloquent

- D26 (tailles de fichiers) : `couple.aggregate.ts` 142 lignes, trois specs E2E à 115.

## Fichiers chauds

- `apps/couple/api/src/modules/pairing/`, `apps/couple/api/test/pairing/`, `_knowledge/backend/*.md`, `packages/shared-kernel/`, `packages/server-infrastructure/`, `packages/couple/prisma/`, `packages/couple/shared-kernel/`, `packages/couple/contract/`, `packages/couple/e2e-shared/`, `config/eslint-config/{base,business-logic}.js`, `scripts/check-event-names.mjs`
- `_malta-blueprint/00-BLUEPRINT.md` §6 (phase 3), `20-frontend-web-mobile.md` §6 et §7

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` stable, `dev` intégration et branche par défaut, une branche par changement depuis `dev` (D23).
- `_malta-blueprint/` reste en local, hors git (B1).
- Plan GitHub gratuit en privé : pas de protection de branche (D29 ouverte).

## Points d'attention

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
