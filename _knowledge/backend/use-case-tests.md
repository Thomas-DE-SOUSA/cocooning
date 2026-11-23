# Use Case Test Rules

How the use cases of `@cocooning/couple-server-business-logic` are tested: exhaustive, deterministic, with hand-written fakes (`core-backend.md` rule 19, decision 0001). `pnpm lint` rejects `jest.fn`, `jest.spyOn` and `jest.mock` in every `*.spec.ts(x)` and `*.integration-spec.ts`, and `Math.random`, `randomUUID` and `uuid` in the whole package, specs and `__tests__/` included (`config/eslint-config/CLAUDE.md`). Reference: `packages/couple/server-business-logic/src/pairing/application/use-cases/*.use-case.spec.ts`.

## Layout

```
src/<context>/__tests__/
├── builders/<input>.builder.ts                       # a<Input>(overrides)
├── fixtures/<context>-test.context.ts                # <Context>TestContext, shared constants
└── secondary/adapters/<aggregate>-in-memory.repository.ts
```

`__tests__/` is excluded from the build (`tsconfig.build.json`) and from the boundaries lint. A shared port's fake comes from `@cocooning/shared-kernel/testing`; a fake of a context port lives here.

## Structure

1. **One spec per use case, next to it** (`join-couple.use-case.spec.ts`), BDD: `describe('Feature: ...')`, `describe('Scenario: ...')`, `it('<behaviour in business words>')`, never "should". A scenario that applies a rule names it (`Scenario: R4, ...`).
2. **One `<Context>TestContext` per test, built in `beforeEach`.** Its constructor configures the UUID generator (`CoupleId.configure(new FakeUuidV7GeneratorProvider())`); `afterEach` calls `CoupleId.resetForTests()`, because `Uuid.configure` is process-wide (decision 0024). It exposes the fakes and one factory per use case, wired as the API wires them (`application.md` rule 11).
3. **Given steps seed state without events.** `givenPendingCoupleOf(userId)` builds the aggregate, clears its events and calls `repository.seed()`: the assertions then see only what the use case did.
4. **Fixed clock and randomness.** `DeterministicDateTimeProvider` starts at a constant `NOW` and moves with `advanceHours()` or `setNow()`; `FakeSecureRandomGenerator` makes codes predictable (`AAAAAAAB`, then `AAAAAAAC`). A test that needs other random bytes writes a local fake that `extends` the port (`invitation-code.vo.spec.ts`).

## In-memory repository

5. **It `extends` the port and mimics the adapter**, not a map: it stores cloned snapshots, rebuilds aggregates with `fromSnapshot()`, refuses a stale version (`<AGGREGATE>_VERSION_CONFLICT`), reproduces every unique index (one couple per partner, one couple per code) and keeps the events written with the state (`persistedEvents`). Reference: `pairing/__tests__/secondary/adapters/couple-in-memory.repository.ts`.
6. **Races are simulated, not slept.** `simulateConcurrentSave(aggregate)` stores another write just before the next `save()`, so the version check or the unique index answers.

## What every mutation spec asserts

7. **The exact returned view**, with literal identifiers and dates, never `expect.any`.
8. **The exact stored snapshot** after success, including `version` and `metadata`.
9. **The exact events**, persisted and published, equal: `eventId`, `eventName` through `XxxEvent.EVENT_NAME`, `aggregateId`, `context`, `data`, `occurredAt`.
10. **No secret in an event**: `JSON.stringify(published)` does not contain the invitation code.
11. **Every throw, by its code** (`rejects.toMatchObject({ code })`), and after a refusal: nothing stored changed, nothing persisted, nothing published.
12. **Boundaries on both sides**: one millisecond before a deadline and exactly at it.
13. **A failing in-process publication** leaves the state and its events saved, logs one warning and does not throw.
14. **Couple isolation** (core.md rule 27): another couple's partner gets the not-found answer, once per context.

## Domain specs

15. **Only for what a use case cannot reach**: an aggregate guard already covered upstream by a precondition (`couple.aggregate.spec.ts`), a VO's mapping or normalisation (`invitation-code.vo.spec.ts`), a snapshot round trip. Coverage of `src/<context>` stays at 100% branches.

## Command

`pnpm --filter @cocooning/couple-server-business-logic test`, and `pnpm --filter @cocooning/couple-server-business-logic exec jest --coverage` to check the branches.
