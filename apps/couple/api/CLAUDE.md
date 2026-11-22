# couple-api

API NestJS 11 (CommonJS, decision plateforme 0011) du domaine couple : racine de composition hexagonale. Elle assemble les packages et n'a aucune logique metier.

- `src/main.ts` : `Uuid.configure(new UuidV7GeneratorProvider())` une seule fois (decision 0024), `enableShutdownHooks`, ecoute sur `PORT`. Rien d'autre : pas de `useGlobal*`, pas de prefixe global, pas de Swagger.
- `src/env.ts` : schema Zod de l'API compose avec `couplePrismaEnvSchema` (`.extend(fragment.shape)`, Zod 4), valide par `ConfigModule.forRoot({ validate })`. `src/env.spec.ts` parse `.env.example`.
- `src/app.module.ts` : configuration, `LoggerModule` et `PrismaModule` en `forRootAsync` (fabriques dans `src/config/`), `ClockModule`, `IdentifierModule`, `CryptoModule`, `APP_FILTER` (`HttpExceptionFilter` + `EXCEPTION_STATUSES`), `RequestIdMiddleware` sur toutes les routes.
- `src/exception-statuses.ts` : la table code -> statut (decision 0020). Un code absent repond 500 sans son message.
- `src/health/` : `GET ApiRouterEnum.HEALTH_CHECK`, public, `SELECT 1` par `PrismaService`.

## A lire avant de commencer

Regles backend communes :
@../../../_knowledge/core-backend.md

Adaptateurs primaires et secondaires, structure d'un module de contexte :
@../../../_knowledge/backend/adapters.md

Contrats Zod et codes d'exception :
@../../../_knowledge/backend/contracts.md

Transactions et verrous : `../../../_knowledge/backend/concurrency.md`.

## Consignes de code

- Toute valeur de configuration se lit par `configService.getOrThrow('NOM', { infer: true })` sur un `ConfigService<Environment, true>`, jamais `.get()` ni `process.env`. Un module de package recoit ses options par `forRootAsync({ inject: [ConfigService], useFactory })`, la fabrique va dans `src/config/`.
- Nouvelle variable : le schema (`src/env.ts` ou le `env.ts` d'un module qu'il compose), `.env.example` commente avec une valeur dev, et la lecture par `getOrThrow`, dans le meme commit.
- Guards, filtre et middleware se declarent dans `AppModule` (`APP_GUARD`, `APP_FILTER`, `configure()`), jamais dans `main.ts` : l'app E2E importe `AppModule` et doit tourner sur la meme chaine qu'en production.
- Un code d'exception nouveau entre dans `EXCEPTION_STATUSES`, ou dans la liste `INTERNAL_CODES` de `exception-statuses.spec.ts` s'il doit repondre 500 ; son enum entre dans `EVERY_CODE_ENUM` de la spec.
- Une route vient de `ApiRouterEnum` (`@cocooning/couple-shared-kernel/routers`), jamais une chaine en dur.
- Modeles a copier : `src/health/health.controller.ts` (controleur), `src/config/prisma-options.factory.ts` (options lues par `ConfigService`).

## Tests

- Specs unitaires `src/**/*.spec.ts` : `pnpm --filter couple-api test`. Jest lit tous les packages `@cocooning/*` dans leurs `src` (`moduleNameMapper` de `jest.config.mjs`).

## Pieges

- A l'execution, l'API lit le `dist/` des packages : `turbo` les construit avant (`^build`). Lancer `pnpm --filter couple-api... build` apres un changement dans un package hors `turbo dev`.
- Express 5 : une route joker s'ecrit `{*path}` (path-to-regexp 8).
- `@nestjs/config` 12 et `@nestjs/jwt` 12 sont en ESM pur : rester en 4 et 11.
- `ConfigModule` lit aussi `.env` du dossier courant ; `process.env` l'emporte sur le fichier.

## Commandes

- `pnpm --filter couple-api dev` (reconstruit et relance a chaque changement, lit `.env`)
- `pnpm --filter couple-api test`
- `pnpm --filter couple-api check-types`
- `pnpm --filter couple-api lint`
- `pnpm --filter couple-api build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/`.
- Demarrage local, variables d'environnement : `docs/guides/local-setup.md`.
- Table code -> statut : `docs/couple/decisions/0020-statut-http-des-exceptions.md` et le tableau des refus de `docs/couple/business-rules/<contexte>/rules.md`.
- Module de contexte ajoute (`src/modules/<contexte>/`, avec son stub `CLAUDE.md`) : `_knowledge/backend/adapters.md` (structure) et la carte de l'arborescence du `CLAUDE.md` racine.
