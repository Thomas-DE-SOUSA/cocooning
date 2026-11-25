# E2E Rules

How the API is tested end to end: a real `AppModule` on a free port, a real Postgres 17 with the real migrations, HTTP requests. Business logic is covered by the use case tests; E2E covers integration, isolation and resilience (`core-backend.md` rule 20). Reference: `apps/couple/api/test/`, and `test/pairing/` for a context.

## Harness

1. **`createTestApp({ controllers, overrides })`** (`test/shared/app/create-test-app.ts`) imports the real `AppModule`, so the guard, the filter and the middleware are those of production, then `listen(0)`. `closeTestApp(app)` closes the app, which stops the server and disconnects Prisma. One app per spec file, in `beforeAll` / `afterAll`.
2. **One environment module**: `test/shared/env/test-environment.ts`, loaded by `setupFiles`, sets every variable and calls `Uuid.configure` once per spec file. `DATABASE_POSTGRES_URL` comes from the global setup of `@cocooning/couple-e2e-shared`, which starts the container and deploys the migrations. Never set an environment variable in a spec.
3. **`TestClient.for(app)`** sends requests with `fetch`. `asPartner(userId, now)` signs a session cookie with the test secret, valid one hour from `now`, at session version 1: the guard loads the account, so the spec seeds it with `createTestAccount` (`PairingTestApp.reset()` seeds the partners'); `withSessionToken(token)` sends a hand-made token; `unauthenticated()` sends none.
4. **Every `@cocooning/*` package is read from its `src`** (`moduleNameMapper` of `test/e2e/jest-e2e.config.mjs`): a `dist` mixed with `src` loads two copies of a class.
5. **Run through `pnpm --filter couple-api test:e2e`** (`--runInBand`, Docker required), never a bare `jest`.

## Specs

6. **Routes come from `ApiRouterEnum`**, never a string, except the route of a test-only controller, a fixture of the spec (`test/authentication/partner-probe.controller.ts`).
7. **Exact statuses and bodies**: `expect(response).toEqual({ status: 401, body: {...} })`, never `>= 400`. 201 for a creation, 200 for a read or an update, 204 for a delete, 401 without a valid session, 404 for another couple's data, 409 for a conflict, 422 for an invalid input (D5).
8. **Couple isolation on every endpoint**: at least one request from the other couple, or the other partner for a private record, answered 404 (core.md rule 27).
9. **Fresh data per test**: `truncateAllTables` (`@cocooning/couple-e2e-shared/fixtures`) in `beforeEach` for every spec that writes. Never `DELETE FROM` table by table.
10. **No `jest.fn`, no `jest.spyOn`** (decision 0001): a provider is replaced through `overrides` by a hand-written fake (`DeterministicDateTimeProvider` for the clock).
11. **Every mutation checks its outbox row**, and a publication failure still answers the success status with an unpublished event (decision 0021): `readPairingEvents` (`@cocooning/couple-e2e-shared/fixtures`), and `EventPublisher` overridden by `FakeEventPublisherAdapter.failWith()` (`test/pairing/pairing-publication-failure.e2e-spec.ts`).
12. **When in doubt, ASK.** Never guess.
13. **A context has its test app**: `PairingTestApp` (`test/pairing/pairing-test-app.ts`) starts the real app with a `DeterministicDateTimeProvider` override, signs each session at that clock and exposes one method per endpoint; its constants and response readers live in `pairing-test-data.ts`. An expired deadline is reached by moving the clock, never by sleeping. A scheduled task is off in the E2E environment (`PHOTO_PROMPT_SCHEDULER_ENABLED=false`) and driven by calling its `tick()` after moving the clock (`MessagingTestApp.tick()`); the outbox relay likewise (`OUTBOX_RELAY_ENABLED=false`, `MessagingTestApp.relay()`), with `PushNotificationSender` overridden by a `FakePushNotificationSender` that records each push and answers a chosen outcome per endpoint: no spec calls a real push service.
14. **A repository is tested through the app**: `app.get(CoupleRepository)` on rows seeded by `createTestCouple` (`AccountRepository` and `createTestAccount` for `authentication`, `NoteRepository`, `FolderRepository`, `createTestNotes` and `createTestFolders` for `notes`, `CalendarEventRepository` and `createTestCalendarEvents` for `agenda`, `FlashMessageRepository`, `InstantPhotoRepository`, `PhotoPromptRepository`, `createTestFlashMessages` and `createTestInstantPhotos` for `messaging`, `PushSubscriptionRepository` and `readPushSubscriptions`), for isolation (the other couple gets nothing), the version conflict, each unique constraint mapped by name, and corrupted rows (`*_DATA_CORRUPTED`).
