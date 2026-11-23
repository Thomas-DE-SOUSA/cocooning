# @cocooning/couple-e2e-shared

Harnais des tests d'integration et E2E du couple, source unique pour l'API et les packages. Lu depuis `src`, jamais compile. Sous-chemins :

- `containers` : `startMigratedPostgres()` demarre un Postgres 17 (Testcontainers) et y applique `prisma migrate deploy` de `@cocooning/couple-prisma`.
- `setup/global-setup`, `setup/global-teardown` : `globalSetup` / `globalTeardown` Jest. Le setup pose `DATABASE_POSTGRES_URL` dans l'environnement, herite par les workers Jest ; le teardown arrete le conteneur.
- `fixtures` : `truncateAllTables(prisma)` (toutes les tables sauf `_prisma_migrations`, `RESTART IDENTITY CASCADE`), `whileAdvisoryLockHeld(databaseUrl, key, work)` (une autre connexion tient le verrou pendant `work`). `pairing` : `createTestCouple(prisma, couple)` ecrit un couple et ses partenaires tels quels, sans le domaine (donnees corrompues comprises), `readPairingEvents(prisma, coupleId)` relit l'outbox dans l'ordre des versions.

## A lire avant de commencer

Transactions et verrous consultatifs :
@../../../_knowledge/backend/concurrency.md

Conventions Prisma :
`../../../_knowledge/backend/prisma.md`

## Consignes de code

- Brancher une suite : `globalSetup` et `globalTeardown` de son `jest.integration.config.mjs` (ou de la config E2E de l'API) pointent vers `setup/global-setup.ts` et `setup/global-teardown.ts`, et `moduleNameMapper` mappe tous les packages `@cocooning/*` vers leurs `src`.
- Une spec lit l'URL avec `couplePrismaEnvSchema.parse(process.env)`, jamais une valeur en dur.
- Le nettoyage passe par `truncateAllTables` en `beforeEach` ou `afterEach` : jamais de `DELETE FROM` table par table, qui depend de l'ordre des suites.
- Les fixtures `createTestX` d'un contexte arrivent ici avec ce contexte, jamais copiees dans `apps/couple/api/test`. Elles ecrivent par `prisma.includingDeleted` et n'importent pas le domaine (le package ne depend que de `@cocooning/couple-prisma`). Modele : `src/fixtures/create-test-couple.ts`.
- Modeles a copier : `src/fixtures/while-advisory-lock-held.ts` (fixture), `src/fixtures/create-test-couple.ts` (fixture de contexte), `src/containers/postgres.container.ts` (conteneur).

## Tests

- `pnpm --filter @cocooning/couple-e2e-shared test:integration` : demande Docker. Le package n'a pas de tests unitaires, `pnpm test` a la racine ne le lance pas.
- Les specs `*.integration-spec.ts` du harnais creent puis suppriment leur propre table sonde (`fixture_probe`) : elles ne dependent d'aucun modele de contexte. Les fixtures d'un contexte sont exercees par les E2E de l'API (`apps/couple/api/test/<contexte>/`).

## Pieges

- Le scope de transaction de `PrismaService` est global au process : un `work` lance dans la transaction d'une autre instance la rejoint et reprend le verrou qu'elle tient. `whileAdvisoryLockHeld` lance donc `work` hors de la transaction du detenteur.
- `tsconfig.json` etend `nest.json` : ts-jest compile ici les `src` de `couple-prisma`, qui ont des decorateurs.
- `pnpm` 12 refuse une installation quand un script de build est ignore sans etre liste : `cpu-features`, `protobufjs` et `ssh2` (dependances de Testcontainers) sont a `false` dans `allowBuilds`.
- Testcontainers lance `ryuk`, qui supprime le conteneur si Jest meurt avant le teardown.

## Commandes

- `pnpm --filter @cocooning/couple-e2e-shared test:integration`
- `pnpm --filter @cocooning/couple-e2e-shared check-types`
- `pnpm --filter @cocooning/couple-e2e-shared lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la fonction modifies, trouvee avec `rg -l '<nomDeFonction>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Fixture de verrou : `_knowledge/backend/concurrency.md`.
- Image Postgres (`postgres:17-alpine`) : la meme version majeure que `infrastructure/compose/docker-compose.prod.yml` (decision plateforme 0015).
