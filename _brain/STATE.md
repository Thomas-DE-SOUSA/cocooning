# État du projet

> Mis à jour : 2026-11-23 (R8 : #52 mergée, #53 ouverte). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase 3, étape 3 terminée et en production** (2026-11-23) : module `pairing` de la PWA et déconnexion, plan D37 en 6 PR (#43 à #49), release #50.
- **Étape 2 terminée et en production** (2026-11-23) : contexte `authentication`, écran de connexion, deux comptes créés sur la VM, garde-fous ESLint du web (#25 à #42). Détail : `journal/2026-11-23.md`, sections « Phase 3, étape 2 » à « Garde-fous ESLint ».
- **Fait avant** : phase 0 à 2 (PR #1 à #13), phase 3 étape 1 (socle web PWA, #17 à #21), étape 2 (#25 à #42). Détail : `journal/2026-11-22.md`, `journal/2026-11-23.md`.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Production

- Depuis le 2026-11-23 : https://cocooning.<tailnet>.ts.net, VM Oracle `cadence` (`ssh cadence`), clone de `main` dans `~/cocooning`, secrets dans `~/cocooning/infrastructure/compose/.env`, `pg_dump` nocturne dans `~/backups`. Procédure : `docs/platform/runbooks/deployment/production.md`. PWA installée sur le téléphone du propriétaire.

## Prochaine étape

**Revue des étapes 2 et 3 rendue** (`journal/2026-11-23.md`, « Revue des étapes 2 et 3 ») : aucun CRITICAL, 4 IMPORTANT (cache du service worker, impasse de la mise en couple si les deux créent, trous du lint, server actions non testées). Choix du propriétaire (D38) : PR 1 `fix/pairing-pending-deadlock` d'abord (règle R8 : le seul membre d'un couple en attente peut l'annuler, décision proposée puis use case et bouton), puis PR 2 (cache du service worker), puis 3 à 7 ; adresses e-mail retirées du journal dans la PR 7, sans réécriture d'historique. #52 (R8 serveur) mergée ; PR 1b web #53 ouverte, en attente du « go », puis release `dev` → `main` pour livrer le bouton. Ensuite PR 2 (cache du service worker), puis 3 à 7. Ensuite, prochaine étape de la phase 3 à choisir (notes, agenda, messages).

Mode de travail : pas d'autonomie. Une PR à la fois, résumée au propriétaire ; merger seulement après son « go ».

**Recette d'un nouveau package** (éprouvée six fois) : copier la forme de `packages/server-infrastructure/` (exports par sous-chemin `types → src`, `default → dist` ; `tsconfig.json` + `tsconfig.build.json` + `tsconfig.spec.json` en CommonJS ; `jest.config.mjs` avec `moduleNameMapper` vers les `src` ; `eslint.config.mjs`). `CLAUDE.md` dans le même commit. Vérifier l'entrée CommonJS de toute dépendance (D31). Versions dans les catalogues de `pnpm-workspace.yaml`. Avant chaque commit : `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine, puis `pnpm --filter couple-api test:e2e`.

## Décisions qui bloquent

- D26 (tailles de fichiers) : `couple.aggregate.ts` 142 lignes ; specs E2E au-delà de 100 lignes (trois de `pairing` à 115, `test/authentication/` à 107, 117 et 123).

## Fichiers chauds

- `apps/couple/api/src/commands/`, `apps/couple/api/src/modules/authentication/`, `apps/couple/api/test/{authentication,commands}/`, `packages/couple/server-business-logic/src/authentication/`
- `packages/couple/e2e-shared/src/fixtures/`, `packages/couple/contract/src/authentication/`, `docs/couple/architecture/authentication/`, `docs/couple/gaps/authentication.md`, `docs/couple/infrastructure/runbooks/authentication/accounts.md`
- `packages/couple/client-business-logic/src/authentication/`, `packages/couple/client-infrastructure/src/shared/authentication/`, `packages/design-system/src/ui/`
- `apps/couple/web/` (PR 8), `infrastructure/compose/docker-compose.prod.yml`, `docs/platform/runbooks/deployment/production.md`

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` stable, `dev` intégration et branche par défaut, une branche par changement depuis `dev` (D23). Pas de protection de branche (D29 ouverte).
- `_malta-blueprint/` reste en local, hors git (B1).

## Points d'attention

- Mise en couple en prod : une seule personne appuie sur « Créer notre couple », l'autre saisit le code ; sinon blocage sans issue dans l'app (correctness-1).

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les `.env` sont protégés en lecture par une règle de permission : on peut y ajouter une ligne, pas les relire.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
