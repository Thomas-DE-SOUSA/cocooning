# Controller Rules

How a primary HTTP adapter of `apps/couple/api` receives a request: routing, authentication, validation, response. A controller is a thin routing adapter (`core-backend.md` rules 4 and 5). Reference: `apps/couple/api/src/modules/pairing/primary/controllers/join-couple.controller.ts` (body, 200), `create-couple.controller.ts` (201), `apps/couple/api/src/health/health.controller.ts` (public technical route).

## Routing

1. **One endpoint per controller, one public method `handle()`.** File `<action>-<entity>.controller.ts` under `src/modules/<context>/primary/controllers/` (`adapters.md`); technical routes live in their own folder (`src/health/`).
2. **The path comes from `ApiRouterEnum`** (`@cocooning/couple-shared-kernel/routers`): `@Get(ApiRouterEnum.HEALTH_CHECK)`, never a string literal. No global prefix, no versioning.

## Authentication

3. **Private by default.** The global `SessionGuard` (`APP_GUARD` in `AppModule`) answers 401 on every route that is not marked `@Public()` (`@cocooning/server-infrastructure/nest`, decision 0030). `@Public()` is for the health route and, later, sign-in only.
4. **The session is a cookie holding an HS256 JWT.** Its name is `SESSION_COOKIE_NAME`, its secret `AUTH_JWT_SECRET`, read through `ConfigService`. The guard requires a UUID `sub` and an `exp` (`SessionTokenPayloadSchema`), and checks expiry at the `DateTimeProvider` time (`clockTimestamp`). Missing cookie: `AUTHENTICATION_SESSION_MISSING`; anything else wrong: `AUTHENTICATION_SESSION_INVALID`; both 401.
5. **Identity comes from `@CurrentPartner()`**, a `PartnerContext { userId }`, never from the body, the query or a header. The `pairing` use cases take it as is (decision 0029); the other contexts get an `ExecutionContext` built from it by the API.
6. **Never log the cookie, the token or a request body** (core.md rules 30 and 33). The exception filter already logs every refusal with its code.

## Input and output

7. **Validate input with `ZodValidationPipe`** and a request schema of `@cocooning/couple-contract` (`contracts.md`); an invalid input answers 422 (D5).
8. **Describe output with `@UseInterceptors(ZodResponse(Schema))`**: the returned value is the one Zod parses. `handle()` returns `toXxxResponse(await this.useCase.execute(context, command))`: the response mapper of `primary/mappers/` turns the view's `Date` into ISO strings (`contracts.md` rule 4). A `POST` that creates nothing (join, renew) sets `@HttpCode(HttpStatus.OK)`. Exception: the health route returns a fixed `{ status: 'UP' }`, outside the contract.
9. **Errors are typed exceptions**, translated by the global `HttpExceptionFilter` through `EXCEPTION_STATUSES` (decision 0020, `wiring.md` rule 7). A controller never builds an `HttpException`.
10. **When in doubt, ASK.** Never guess.
