# Concurrency Rules

How the API protects an aggregate against concurrent writes: one unit of work per request, optimistic locking on `version`, transactional advisory locks for check-then-act sequences, unique constraints as the last barrier. Two partners can edit the same shared data at the same time; real-time note bodies are merged by Yjs (decision 0016) and are outside these rules.

## Unit of work

1. **One transaction, carried by `AsyncLocalStorage`.** `PrismaService.transaction(work, options)` opens a transaction, or joins the one already open. Repositories and providers always read and write through `prismaService.current`, never through `client` inside a transaction.
2. **A use case that writes several aggregates wraps them in `unitOfWork.run(...)`** (`core-backend.md` rule 14). A repository alone opens `prismaService.transaction()` for its state + events pair; inside a unit of work, it joins it.
3. **Transaction timeouts come from configuration** (`DB_TX_TIMEOUT_MS`, `DB_TX_MAX_WAIT_MS`), never hardcoded.

## Optimistic locking

4. **The database owns the increment.** Domain mutations never touch `version`; the repository writes `version: 1` on create and `version: { increment: 1 }` on update.
5. **Create or update is decided inside the transaction**: `findFirst` on `coupleId` + id, then `create` or `updateMany`.
6. **Update filters on the version read by the client**: `updateMany({ where: { coupleId, id, version: snapshot.version }, ... })`. `count === 0` throws the context's `<AGGREGATE>_VERSION_CONFLICT` exception, mapped to 409 by the filter table (decision 0020).
7. **The event version is read inside the same transaction** as the state write.
8. **The catch rethrows the domain exception first**, then maps a unique violation (`P2002`) by constraint name through `violatedUniqueConstraint` (`@cocooning/couple-prisma/errors`, `P2002` and `P2010` alike), then logs and rethrows anything else.

## Advisory locks

9. **Only transactional locks**: `pg_advisory_xact_lock(hashtextextended(key, 0))` under a `lock_timeout`, run on `prismaService.current`, so lock, state and events share one transaction. Never session locks (`pg_advisory_lock`, `pg_advisory_unlock`): with a connection pool, lock and unlock can land on two connections and the lock stays held.
10. **Key: `<scope>:<coupleId>:<aggregateId>`.** `acquireTransactionalAdvisoryLock(prismaService, key, acquireTimeoutMs)` (`@cocooning/couple-prisma/locks`) waits through Postgres `lock_timeout`, not a retry loop, then restores the previous timeout. Outside a transaction it throws `PERSISTENCE_LOCK_OUTSIDE_TRANSACTION`; a busy lock throws `PERSISTENCE_LOCK_BUSY`, which the adapter rethrows as the context's `<AGGREGATE>_LOCK_TIMEOUT` exception (409). A busy lock aborts the transaction: never catch it to continue.
11. **The domain sees a port** (`DistributedLockProvider` in the context's `domain/ports/`), implemented by an adapter over the shared lock.
12. **Read-only preconditions outside the lock, writes inside.**

## Outbox relay

13. **The relay claims rows atomically**: `updateMany({ where: { id: { in }, published: false } })`, with `publishedAt` from `DateTimeProvider`. A single API instance is planned (decision 0021); the claim keeps a second one harmless.

## Tests

- E2E: two requests sent with `Promise.all` on the same versioned aggregate; exactly one succeeds, the other gets 409. One `<context>-concurrency.e2e-spec.ts` per versioned aggregate.
- Lock: `whileAdvisoryLockHeld(databaseUrl, key, work)` (`@cocooning/couple-e2e-shared/fixtures`) holds the lock from another connection while `work` sends the request; the request gets 409.
- Unit: the reentrant `transaction()` joins an open transaction and opens one otherwise.
