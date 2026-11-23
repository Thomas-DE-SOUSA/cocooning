# État du projet

> Mis à jour : 2026-11-23 (étape 2 de la phase 3, PR 8 en cours, plan validé D36). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase 3, étape 2 en cours** : contexte `authentication` et écran de connexion (décisions 0032, 0033, 0034). Plan en 8 PR validé le 2026-11-23 (« go », D34 ; détail `journal/2026-11-23.md`, « Phase 3, étape 2 : plan `authentication` »).
- **Mergées dans `dev`** : PR 1 décisions (#25), PR 2 domaine (#26), PR 3 table `account` (#27), PR 4 contrat (#28), PR 5 module API (#30), PR 6 commande `create-account` (#33), PR 7 client (#35). Rien de l'étape 2 n'est déployé : une seule mise en production après la PR 8.
- **PR 7 en bref** : formulaire `createSignInFormSchema(t)`, port `AuthenticationGateway`, `SignInUseCase`, `ApiAuthenticationGateway` et `createAuthenticationModule`, `Input`/`Label`, `FakeFetch` en sous-chemin `testing`. Détail : `journal/2026-11-23.md`, « PR 7 ».
- **PR 6 en bref** : commande `create-account` dans l'API (`src/commands/`, D35, décision plateforme 0016) et runbook des comptes. Détail : `journal/2026-11-23.md`, « PR 6 ».
- **PR 5 en bref** : `POST`/`DELETE /authentication/session` (`ApiRouterEnum.ACCOUNT_SESSION_*`), `AccountPrismaRepository`, `Argon2PasswordHasher`, `JwtSessionTokenSigner` (`sub`, `ver`, `exp`), `SessionGuard` par `ResolveSessionUseCase`, `AUTH_SESSION_TTL_DAYS=90` (aussi dans le `.env` local de l'API), fixture `createTestAccount`. E2E de l'API 71/71. Détail : `journal/2026-11-23.md`, « PR 5 ».
- **Fait avant** : phase 0 à 2 (PR #1 à #13), phase 3 étape 1 (socle web PWA, #17 à #21). Détail : `journal/2026-11-22.md`, `journal/2026-11-23.md`.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Production

- Depuis le 2026-11-23 : https://cocooning.<tailnet>.ts.net, VM Oracle `cadence` (`ssh cadence`), clone de `main` dans `~/cocooning`, secrets dans `~/cocooning/infrastructure/compose/.env`, `pg_dump` nocturne dans `~/backups`. Procédure : `docs/platform/runbooks/deployment/production.md`. PWA installée sur le téléphone du propriétaire.

## Prochaine étape

**PR 8 `feat/authentication-web` en cours** (branche créée depuis `dev` après #36) : plan validé (D36, `journal/2026-11-23.md`, « PR 8 : plan de l'écran web »). Ensuite une mise en production `dev` → `main` et les deux comptes sur la VM, sur accord. Puis PR `chore/` des garde-fous ESLint 0009/0010/0011.

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

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les `.env` sont protégés en lecture par une règle de permission : on peut y ajouter une ligne, pas les relire.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
