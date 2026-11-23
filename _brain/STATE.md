# État du projet

> Mis à jour : 2026-11-23 (02:10). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase** : **phase 2 terminée et mergée dans `dev`** (nuit du 2026-11-23, en autonomie, PR #3 à #10). Contexte `pairing` de bout en bout : domaine (`packages/couple/server-business-logic`), tables + migration `init`, contrat, API `apps/couple/api` (garde de session HS256, 4 routes), 50 tests E2E. Garde-fous des décisions 0001, 0004, 0024 dans `pnpm lint` (PR #10). Détail : `journal/2026-11-23.md`, sections « Phase 2 ».
- **Fait (phase 1)** : shared kernels, `server-infrastructure`, `couple/prisma`, `couple/contract`, `couple/e2e-shared`. Détail : `journal/2026-11-22.md`.
- **Fait (avant)** : phase 0 (PR #1) ; analyse de Malta dans `_malta-blueprint/` ; mémoire du projet.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Prochaine étape

**Au retour du propriétaire** : lui présenter le bilan de la nuit, puis faire valider :
1. Les ADR `proposée` 0028 (code d'invitation), 0029 (`pairing` sans `coupleId`), 0030 (JWT HS256).
2. Les points « À confirmer » des étapes 1 à 4 du journal (codes et statuts HTTP ajoutés, schéma de réponse partagé, `InProcessEventPublisher`, port 3100, suffixes nouveaux).
3. Les décisions 0001, 0004, 0024 dont le libellé ne colle plus au contrôle livré (phase, CI, portée) : nouvelle décision ou écart, à lui demander.
4. Créer `apps/couple/api/.env` depuis `.env.example` ? (`AUTH_JWT_SECRET` par `openssl rand -base64 48`).
Ensuite : phase 3 (PWA), qui attend D19 (Storybook) et D25 (messages Zod traduits). Merger `dev` dans `main` seulement à sa demande.

**Recette d'un nouveau package** (éprouvée six fois ; un package de test comme `e2e-shared` est lu depuis `src`, sans build) : copier la forme de `packages/server-infrastructure/` (`package.json` à exports par sous-chemin `types → src`, `default → dist` ; `tsconfig.json` + `tsconfig.build.json` + `tsconfig.spec.json` en CommonJS pour Jest ; `jest.config.mjs` avec `moduleNameMapper` vers les `src` voisins ; `eslint.config.mjs` = `nestConfig` + `boundariesConfig`, ou `config` de base pour un package isomorphe comme le shared-kernel). Écrire son `CLAUDE.md` (français sans accents, sections figées) dans le même commit. Vérifier l'entrée CommonJS de toute dépendance (D31). Ajouter les versions aux catalogues de `pnpm-workspace.yaml`. Commit sans scope (`feat: …`). Vérifier `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine avant de commiter.

- Reporté en phase 3 : `client-infrastructure` et `design-system`.

## Décisions qui bloquent

- Phase 3 : D19 (Storybook), D25 (messages Zod traduits). D26 (tailles de fichiers) : `couple.aggregate.ts` 142 lignes, trois specs E2E à 115.
- Sans réponse : le propriétaire veut-il que Claude crée `packages/couple/prisma/.env` (`DATABASE_POSTGRES_URL`, valeur de `.env.example`) ?

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
