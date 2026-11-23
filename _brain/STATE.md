# État du projet

> Mis à jour : 2026-11-23 (#74 mergée ; prochaine : éditeur Tiptap). Dernière consolidation : aucune.
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

**Étape « notes » de la phase 3** (D40, `journal/2026-11-23.md`, « Étape notes : plan »). Plan : 1 décisions et règles (#66) ; 2 domaine (#67) ; 3 tables et adaptateurs (#68) ; 4 contrat et routes (#69) ; 5 temps réel dans l'API (#70) ; 6 client (#71) ; 7 liste dans la PWA (#74) ; 8 éditeur Tiptap, prochaine (adaptateur Hocuspocus dans le module web, `NOTES_COLLABORATION_URL`) ; 9 route `/collab` en production et release. Écarts (D41) : #72 (décision 0042) et #73 (décision 0043) mergées. Reste ouvert : écarts frontend 003 et 005 (100 notes, laissé ouvert par le propriétaire), D26.

Mode de travail : pas d'autonomie. Une PR à la fois, résumée au propriétaire ; merger seulement après son « go ».

**Recette d'un nouveau package** (éprouvée six fois) : copier la forme de `packages/server-infrastructure/` (exports par sous-chemin `types → src`, `default → dist` ; `tsconfig.json` + `tsconfig.build.json` + `tsconfig.spec.json` en CommonJS ; `jest.config.mjs` avec `moduleNameMapper` vers les `src` ; `eslint.config.mjs`). `CLAUDE.md` dans le même commit. Vérifier l'entrée CommonJS de toute dépendance (D31). Versions dans les catalogues de `pnpm-workspace.yaml`. Avant chaque commit : `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine, puis `pnpm --filter couple-api test:e2e`.

## Décisions qui bloquent

- D26 (tailles de fichiers) : `couple.aggregate.ts` 158 lignes ; specs E2E au-delà de 100 lignes : `join-couple` 115, `renew-invitation-code` 114, `cancel-couple` 110, `session-guard` 117, `account-prisma-repository` 123 ; harnais `authentication-test-app.ts` 107, `pairing-test-app.ts` 105 (mesuré le 2026-11-23).

## Fichiers chauds

- `apps/couple/api/src/commands/`, `apps/couple/api/src/modules/authentication/`, `apps/couple/api/test/{authentication,commands}/`, `packages/couple/server-business-logic/src/authentication/`
- `packages/couple/e2e-shared/src/fixtures/`, `packages/couple/contract/src/authentication/`, `docs/couple/architecture/authentication/`, `docs/couple/gaps/authentication.md`, `docs/couple/infrastructure/runbooks/authentication/accounts.md`
- `packages/couple/client-business-logic/src/authentication/`, `packages/couple/client-infrastructure/src/shared/authentication/`, `packages/design-system/src/ui/`
- `apps/couple/web/` (PR 8), `infrastructure/compose/docker-compose.prod.yml`, `docs/platform/runbooks/deployment/production.md`

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` stable, `dev` intégration et branche par défaut, une branche par changement depuis `dev` (D23). Pas de protection de branche (D29 ouverte).
- `_malta-blueprint/` reste en local, hors git (B1).

## Points d'attention

- Le couple du propriétaire et de Pauline est formé en production (2026-11-23).

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les `.env` sont protégés en lecture par une règle de permission : on peut y ajouter une ligne, pas les relire.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
