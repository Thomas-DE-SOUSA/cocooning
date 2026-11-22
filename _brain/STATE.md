# État du projet

> Mis à jour : 2026-11-23 (00:00). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase** : socle backend de la phase 1 terminé, branche `chore/phase-1-shared-kernels` poussée, [PR #2](https://github.com/Thomas-DE-SOUSA/cocooning/pull/2) ouverte vers `dev` (2026-11-23), **pas encore mergée**.
- **Fait (phase 1)** : ADR couple 0023 à 0027 (D12, D13, D14, S1, S2) ; canons `_knowledge/backend/{shared-kernel,prisma,concurrency,adapters}.md` ; `packages/shared-kernel` (30 tests) `packages/server-infrastructure` (36 tests) `packages/couple/prisma` (26 tests + 6 d'intégration Postgres) `packages/couple/shared-kernel` (7 tests) et `packages/couple/contract` (17 tests, canon `_knowledge/backend/contracts.md`) et `packages/couple/e2e-shared` (3 specs d'intégration, Docker), verts. La pagination offset se valide au contrat, plus dans server-infrastructure. D31 : backend CommonJS sur NestJS 11 (ADR plateforme 0011). Détail : `journal/2026-11-22.md`, sections « Phase 1 ».
- **Fait (avant)** : phase 0 mergée dans `dev` (PR #1) ; analyse de Malta dans `_malta-blueprint/` ; mémoire du projet en place.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Prochaine étape

**Au prochain démarrage** : le propriétaire a demandé (2026-11-23) de pousser et d'ouvrir la PR #2, puis a clear. Lui demander s'il a mergé la PR #2 dans `dev` (`gh pr view 2`) ; ensuite, au choix : valider les 12 ADR `proposée`, ou lancer la phase 2 (premier contexte, nom `pairing` à confirmer, P6) sur une nouvelle branche depuis `dev`.

**Recette d'un nouveau package** (éprouvée six fois ; un package de test comme `e2e-shared` est lu depuis `src`, sans build) : copier la forme de `packages/server-infrastructure/` (`package.json` à exports par sous-chemin `types → src`, `default → dist` ; `tsconfig.json` + `tsconfig.build.json` + `tsconfig.spec.json` en CommonJS pour Jest ; `jest.config.mjs` avec `moduleNameMapper` vers les `src` voisins ; `eslint.config.mjs` = `nestConfig` + `boundariesConfig`, ou `config` de base pour un package isomorphe comme le shared-kernel). Écrire son `CLAUDE.md` (français sans accents, sections figées) dans le même commit. Vérifier l'entrée CommonJS de toute dépendance (D31). Ajouter les versions aux catalogues de `pnpm-workspace.yaml`. Commit sans scope (`feat: …`). Vérifier `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine avant de commiter.


1. Reste de la phase 1, reporté en phase 3 : `client-infrastructure` et `design-system`. Pas de migration `init` : la première vient avec le premier contexte (phase 2).
2. Faire valider les 12 ADR fondatrices (`proposée`) ; confirmer le nom du contexte `pairing` (P6).
3. Merger la PR #2 dans `dev` (le propriétaire), puis `dev` dans `main` quand il le demande.

## Décisions qui bloquent

- Aucune pour la suite de la phase 1. Zod 4 retenu (D8 appliquée).
- Sans réponse : le propriétaire veut-il que Claude crée `packages/couple/prisma/.env` (`DATABASE_POSTGRES_URL`, valeur de `.env.example`) ?

## Fichiers chauds

- `_knowledge/backend/*.md`, `packages/shared-kernel/`, `packages/server-infrastructure/`, `packages/couple/prisma/`, `packages/couple/shared-kernel/`, `packages/couple/contract/`, `packages/couple/e2e-shared/`, `config/eslint-config/{boundaries,nest}.js`
- `_malta-blueprint/00-BLUEPRINT.md` §6 (phase 1), `11-backend-infrastructure-apps.md` §10 à §12

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` stable, `dev` intégration et branche par défaut, une branche par changement depuis `dev` (D23).
- `_malta-blueprint/` reste en local, hors git (B1).
- Plan GitHub gratuit en privé : pas de protection de branche (D29 ouverte).

## Points d'attention

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
