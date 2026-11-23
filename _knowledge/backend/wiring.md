# Wiring Rules

How `apps/couple/api` is assembled: bootstrap, environment, global modules, enhancers. The API is the composition root: it reads the configuration and hands it to the packages, which never read the environment themselves. Reference: `apps/couple/api/src/main.ts`, `src/env.ts`, `src/app.module.ts`, and `src/modules/pairing/` for the three modules of a context.

## Bootstrap

1. **`main.ts` does four things**: `Uuid.configure(new UuidV7GeneratorProvider())` once per process (decision 0024), `NestFactory.create(AppModule)`, `enableShutdownHooks()`, `listen(PORT)`. Nothing else: no `useGlobalGuards/Filters/Pipes/Interceptors`, no `setGlobalPrefix`, no Swagger.
2. **Guards, filter and middleware are declared in `AppModule`** (`APP_GUARD`, `APP_FILTER`, `configure()`), never in `main.ts`: the E2E app imports `AppModule` and runs the production chain (`e2e.md` rule 1). Middleware order: `cookie-parser`, then `RequestIdMiddleware`, on `{*path}` (Express 5).

## Environment

3. **One Zod fragment per package or API module that needs configuration**, named `<name>EnvSchema` in its `env.ts` (`couplePrismaEnvSchema`, `authenticationEnvSchema`). `src/env.ts` composes them with `.extend(fragment.shape)` (Zod 4 deprecates `.merge()`) and exports `Environment = z.infer<...>`.
4. **One validation point**: `ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment })`. The API does not start on an invalid environment (`core-backend.md` rule 10). Numbers through `z.coerce.number()`, booleans through `z.stringbool()`, no `.default()`: a missing value fails.
5. **Read through `ConfigService<Environment, true>`**: `config.getOrThrow('NAME', { infer: true })`, never `.get()` and never `process.env` (`core-backend.md` rule 9).
6. **`src/env.spec.ts` parses `.env.example`** against the schema and checks that each variable is required: the example never drifts from the code.

## Global modules

7. **The exception filter receives its table from the API**: `EXCEPTION_STATUS_TABLE` provided with `EXCEPTION_STATUSES` (`src/exception-statuses.ts`), `HttpExceptionFilter` built by `useFactory`. `exception-statuses.spec.ts` fails on a code of any enum that is neither mapped nor listed in `INTERNAL_CODES` (answered 500 without its message), and on a stale entry (decision 0020).
8. **A package module that needs configuration exposes `forRootAsync({ inject, useFactory })`** (`LoggerModule`, `PrismaModule`); the API's factory lives in `src/config/<module>-options.factory.ts` and reads `ConfigService`.
9. **Each port is provided once, by a global module**: `ClockModule` (`DateTimeProvider`), `IdentifierModule` (`UuidGenerator`), `CryptoModule` (`SecureRandomGenerator`), `MessagingModule` (`EventPublisher`), `LoggerModule` (`Logger`, transient), `PrismaModule` (`PrismaService`, `UnitOfWork`). A context module never redeclares them.
10. **Not wired, by decision**: throttler, tracing and telemetry (D21 open), CQRS bus, message queue (D6), roles or permissions (decision 0026), audit module.
11. **When in doubt, ASK.** Never guess.

## Context modules

12. **Three modules per context, imported in one direction**: `<context>.module.ts` (controllers) imports `-service.module.ts` (use cases), which imports `-secondary.module.ts` (`{ provide: Port, useClass: Adapter }`, exports the ports). `AppModule` imports the first only.
13. **Use cases are plain classes built by `useFactory`**, with `inject` listing the ports, `Logger` and `ConfigService`. Domain services (`new PairingPreconditionService(repository)`) and `EventPublishingService` are created inside the factory (decision 0005); a configuration value is read there with `getOrThrow` and passed to the constructor (`invitationCodeLifetimeInHours`). A typed helper (`pairingUseCase(Token, build)`, `pairing-use-case.factory.ts`) keeps one token paired with its own factory.
