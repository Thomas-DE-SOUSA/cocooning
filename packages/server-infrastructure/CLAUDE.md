# @cocooning/server-infrastructure

Plomberie NestJS et adaptateurs des ports du shared-kernel, sans aucun domaine. Sous-chemins :

- `nest` : `HttpExceptionFilter` (table code -> statut, decision 0020), `ZodValidationPipe`, `ZodException` (422), `ZodResponse(schema)` / `ZodResponseInterceptor`, `RequestIdMiddleware` et `getRequestId()`, `@Public()` / `IS_PUBLIC_KEY`.
- `logging` : `LoggerModule.forRoot({ level, pretty })`, `PinoLoggerAdapter` (port `Logger`, `requestId` ajoute a chaque ligne).
- `date-time` : `ClockModule` (port `DateTimeProvider`). `identifier` : `IdentifierModule`, `UuidV7GeneratorProvider` (port `UuidGenerator`). `crypto` : `CryptoModule`, `NodeSecureRandomGenerator` (port `SecureRandomGenerator`).
- `storage` : `LocalDiskFileStorage` (port `FileStorage`, decision 0027), `FileStorageException`.

## A lire avant de commencer

Regles des adaptateurs :
@../../_knowledge/backend/adapters.md

Ports et primitives implementes ici :
@../../_knowledge/backend/shared-kernel.md

## Consignes de code

- Aucun import d'un domaine (`@cocooning/couple-*`) ni de Prisma : ESLint `boundaries` le bloque. Ce qui depend du schema va dans `@cocooning/couple-prisma`.
- Un adaptateur `extends` son port ; un module global (`@Global()`) fournit le port, jamais l'adaptateur (`provide: Port`).
- Le filtre ne connait aucun code : l'API lui passe sa table (`ExceptionStatusTable`) par `useFactory`. Un code absent de la table repond 500 et se logge en erreur avec son code.
- La reponse d'un controleur passe par `@UseInterceptors(ZodResponse(Schema))` : la valeur renvoyee est celle parsee par Zod, les champs non declares sont retires. Pas de `class-transformer` ni de `MapperHttpInterceptor` comme chez Malta : le schema Zod du contrat est la seule liste blanche.
- Pas de decorateur de pagination : un controleur valide sa query avec `@Query(new ZodValidationPipe(OffsetPaginationQuerySchema))`, le schema venant de `@cocooning/couple-contract/shared` (decision 0025).
- Aucune configuration lue ici : l'API passe les valeurs (niveau de log, dossier de stockage) depuis son `env.ts`.
- Modeles a copier : `src/storage/local-disk-file-storage.ts` (adaptateur), `src/date-time/clock.module.ts` (module global).

## Tests

- Une spec `*.spec.ts` a cote du fichier, style BDD. Les fakes viennent de `@cocooning/shared-kernel/testing` (mappe vers `src` dans `jest.config.mjs`).
- Le stockage disque se teste dans un dossier temporaire (`mkdtemp`), supprime apres chaque test.

## Pieges

- NestJS reste en 11 et `uuid` en 11 : les versions suivantes sont en ESM pur (decision plateforme 0011).
- Sous Jest, une erreur systeme Node (`ENOENT`) vient d'un autre realm : `instanceof Error` est faux, tester `code` sur l'objet.
- `instanceof BaseException` donne un `BaseException<any>` refuse par le lint type : utiliser `isBaseException()`.
- `Logger` est fourni en `Scope.TRANSIENT` : chaque classe a son adaptateur et son `setContext`. Ne pas le passer en singleton.
- Reportes : `tracing/` et `telemetry/` (D21, phase 6), adaptateur `EventPublisher` (premier evenement, phase 2), `health/` (avec l'app API).

## Commandes

- `pnpm --filter @cocooning/server-infrastructure test`
- `pnpm --filter @cocooning/server-infrastructure check-types`
- `pnpm --filter @cocooning/server-infrastructure lint`
- `pnpm --filter @cocooning/server-infrastructure build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Filtre et table de statuts : `docs/couple/decisions/0020-statut-http-des-exceptions.md`, `docs/architecture/conventions.md` (section « Erreurs et HTTP »).
- Pagination : `docs/couple/decisions/0025-pagination.md`.
- Stockage : `docs/couple/decisions/0027-stockage-des-photos.md`.
- Adaptateur ajoute ou renomme : `_knowledge/backend/shared-kernel.md` (tables des ports) et ce fichier.
