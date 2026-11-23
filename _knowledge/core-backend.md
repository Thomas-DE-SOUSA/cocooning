# Backend Core Rules (all backend agents)

Loaded alongside core.md for any backend work. The detailed canons (`_knowledge/backend/*.md`) are written at the start of the phase that produces the matching code (phase 1 for the shared kernel and infrastructure, phase 2 for the first bounded context): until a canon exists, this file and core.md are the law. Written so far: `backend/shared-kernel.md`, `backend/prisma.md`, `backend/concurrency.md`, `backend/adapters.md`, `backend/contracts.md`, `backend/domain.md`, `backend/application.md`, `backend/use-case-tests.md`, `backend/controllers.md`, `backend/wiring.md`, `backend/e2e.md`.

---

## Layered Architecture

1. **Domain is pure TypeScript.** Zero NestJS, zero Prisma, zero external library imports in `domain/`. Only standard TypeScript and shared-kernel primitives.

2. **Use cases are pure orchestrators.** They call domain logic and ports. They contain ZERO business logic: no conditionals that compute a status, no transformations, no private methods. If a use case has a private method, the logic belongs elsewhere (aggregate, domain service, application service, mapper). The flow reads as a recipe: validate, load, domain, persist, publish, return.

3. **Invariants live in the aggregate.** The aggregate protects its own consistency. Guard services query cross-context state and pass values to the aggregate: they do NOT enforce invariants.

4. **Controllers are thin routing adapters.** Extract input, validate with Zod pipe, call use case, return result. No business logic, no mapping methods, no private helpers.

5. **Authentication at controller level.** Via NestJS guards/decorators: every endpoint requires an authenticated partner unless it is explicitly public (sign-in, health). The use case receives `coupleId` and `userId` from the authenticated context, never from the request body. Never in use cases, never in domain. Visibility between partners is data scoping (core.md rule 27), not a permission.

---

## Logging

6. **Error logging in adapters.** Repositories and providers catch infrastructure errors (Prisma, network), log with structured context (`aggregateId`, error type), and re-throw as domain exceptions. Use cases do NOT catch and log: they let exceptions propagate.

7. **Debug logging in use cases is allowed, error logging is not.** A use case may log the business flow at debug level (which operation, which entity, which decision), as structured objects. Catching and logging errors stays in adapters (rule 6).

8. **Event handlers log failures but don't propagate.** Handlers catch errors, log them with context, and do not rethrow. The upstream operation must not be blocked by a downstream handler failure. A handler never swallows without a log.

---

## Configuration

9. **`configService.getOrThrow()`: never `.get()` with fallback.** The app must crash at startup if a required config value is missing. Silent defaults mask deployment errors.

10. **Zod-validated environment.** All env vars validated by a Zod schema in `env.ts` at startup. If validation fails, the app does not start.

---

## Data & Persistence

11. **`Prisma.JsonNull` for nullable JSON fields.** Prisma distinguishes SQL NULL from JSON null. Use `Prisma.JsonNull` explicitly.

12. **Couple isolation in every query (D7).** Every repository method includes `coupleId` in the WHERE clause, and `ownerId` for a record private to one partner. Isolation is never checked in memory after loading. A missing filter is a data leak, and every repository has a test proving the other couple, or the other partner for a private record, gets nothing.

13. **Soft delete by default.** Aggregate tables have `deletedAt`. Exceptions: append-only tables (outbox) and child tables without their own lifecycle, which have no `deletedAt`. The soft-delete extension is opt-in: it filters only the models listed in `SOFT_DELETABLE_MODELS`, which a spec checks against the schema (`backend/prisma.md` rule 8).

14. **Transactions for multi-aggregate operations.** Multiple sequential `repository.save()` = transaction risk. Use one transaction for atomicity.

---

## NestJS Conventions

15. **Module wiring via factories.** Use cases instantiated via `useFactory` in the Service Module. Domain services instantiated inline in the use case factory: they're pure, no DI needed (decision 0005). Guard services are application services that call ports: declared as providers via `useFactory` and injected (decision 0006). `provide:` is always the port, never the adapter.

16. **Event handlers delegate to use cases.** Handlers are infrastructure. They call a use case and handle the error boundary. They never contain business logic inline.

17. **DELETE endpoints return 204 No Content.** `@HttpCode(HttpStatus.NO_CONTENT)`.

18. **New custom HTTP headers: no `X-` prefix.** Deprecated per RFC 6648. Standard or third-party headers keep their names (`x-forwarded-for`).

---

## Testing

19. **Every use case must be tested exhaustively.** 100% branch coverage: every `if`, every `throw`, every edge case, every invariant. Mutation testing mindset: if one line changes, at least one test breaks. No automatic mocks: hand-written fakes that extend the port (decision 0001). Details in `_knowledge/backend/use-case-tests.md`.

20. **Every API endpoint must have E2E tests.** Happy paths + critical edge cases, including the couple isolation of rule 12. Not exhaustive: business logic is covered by use case tests. Focus on integration, isolation, and resilience.

---

## Events

21. **Transactional outbox in PostgreSQL (D6).** An aggregate's state and its domain events are written in the same transaction. A relay running inside the API process (no queue, no separate worker) publishes them after commit and marks an event published only once its delivery succeeded. Web Push notifications are driven by this relay. Handlers are idempotent.
