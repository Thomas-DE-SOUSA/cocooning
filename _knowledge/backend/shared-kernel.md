# Shared Kernels: `@cocooning/shared-kernel` and `@cocooning/couple-shared-kernel`

Two shared kernels. `@cocooning/shared-kernel` (`packages/shared-kernel`) holds the domain-agnostic primitives, ports and exceptions, isomorphic (API and PWA). `@cocooning/couple-shared-kernel` (`packages/couple/shared-kernel`) holds what the couple server and PWA share: business enums and routes. Before creating any primitive, port, enum or base class: **check both first** (core.md rule 16).

No root export: import from a subpath. `@cocooning/shared-kernel/<domain|ports|exceptions|application|utils>`, test fakes from `@cocooning/shared-kernel/testing`. `@cocooning/couple-shared-kernel/<enums|routers|exceptions>`.

---

## Domain primitives (`@cocooning/shared-kernel/domain`)

| Class | Purpose |
|---|---|
| `AggregateRoot` | Event buffer: protected `addDomainEvent()`, `getDomainEvents()` (frozen copy), `clearDomainEvents()`, `hasUncommittedEvents()`. No id, no props, no `apply()`: there is no event sourcing |
| `Entity` | Empty marker for child entities of an aggregate |
| `ValueObject<T>` | Frozen `props`, deep `equals()` (null-safe). Subclass recipe: `private` constructor, `super(props); Object.freeze(this);`, a validating factory (`create()`), a trusted rehydration factory (`from()` / `fromSnapshot()`), getters return defensive copies of `Date` |
| `Uuid` | Abstract base of identity VOs, UUID v7 (decision 0024). `Uuid.configure(generator)` once per process, `Uuid.isConfigured()`, `Uuid.resetForTests()`. Subclasses expose `generate()` (calls `Uuid.generateValue()`) and `from(value)` |
| `EventId` | Identity of a domain event, also the row id of its outbox entry |
| `DomainEventBase<TData>` | Base of every domain event: `eventId`, `eventName` (literal on the class, decision 0004), `aggregateId`, `context`, `data`, `occurredAt`. `occurredAt` is a constructor parameter, never `new Date()` (decision 0024) |
| `EntityMetadata` | Used by aggregates and child entities alike: `createdAt`, `updatedAt`, `deletedAt`; `recordUpdate(now)`, `recordDeletion(now)` return a new instance, the aggregate replaces its metadata (soft delete, `core-backend.md` rule 13) |
| `ExecutionContext` | `{ coupleId, userId }`, the first argument of every `execute()` (decision 0023) |
| `PartnerContext` | `{ userId }`, the first argument of the `pairing` use cases only, which run before a couple exists (decision 0029). Their events still carry a full `ExecutionContext` |
| `OffsetPaginationParams`, `CursorPaginationParams` | Offset page (`page` from `DEFAULT_PAGE` = 1, `pageSize` `DEFAULT_PAGE_SIZE` = 25, at most `MAX_PAGE_SIZE` = 100) and cursor (`cursor` or `null`, `limit`) (decision 0025) |
| `OffsetPage<T>`, `CursorPage<T>` | A page of results: `items` and `total`, or `items` and `nextCursor` |

`parseEnum(raw, Enum, label)` (`@cocooning/shared-kernel/utils`) turns a raw string read from the database into an `as const` enum value, or throws.

---

## Ports (`@cocooning/shared-kernel/ports`)

One abstract class per folder under `src/ports/` (core.md rule 18).

| Port | Folder | Purpose |
|---|---|---|
| `DateTimeProvider` | `date-time` | Current instant. The only clock of business code |
| `UuidGenerator` | `uuid` | `generate()` and `isValid()`, behind `Uuid` |
| `SecureRandomGenerator` | `random` | Tokens, invitation codes, random photo prompt time (core.md rule 19) |
| `Logger` | `logging` | Structured logging, `setContext(name)` (core.md rules 32, 33) |
| `EventPublisher` | `messaging` | In-process publication of domain events after commit |
| `UnitOfWork` | `unit-of-work` | `run(work)`: one transaction around several writes |
| `FileStorage` | `storage` | Store, read, delete a file by key; keys start with the `coupleId` (decision 0027) |

Adapters live in `@cocooning/server-infrastructure`: `SystemDateTimeProvider` (`ClockModule`), `UuidV7GeneratorProvider` (`IdentifierModule`), `NodeSecureRandomGenerator` (`CryptoModule`), `PinoLoggerAdapter` (`LoggerModule`), `LocalDiskFileStorage`. `EventPublisher` and `UnitOfWork` adapters come with the first event and with `@cocooning/couple-prisma`.

**If a port exists here, use it.** Never recreate `DateTimeProvider` or `Logger` in a bounded context.

Not here, decided against (decisions 0021, 0026): `MessageQueue`, `AuditDispatcher`, an `IdGenerator` port, a permission model, `ActiveTenantGuard`.

---

## Application services (`@cocooning/shared-kernel/application`)

`EventPublishingService.publishAndClear(aggregates)` publishes the events of the given aggregates in process, after the transaction commits, then clears them. It **never marks an event published**: only the outbox relay does, after delivery (decision 0021, `core-backend.md` rule 21). A publication failure is logged, never thrown back to the caller.

---

## Exceptions (`@cocooning/shared-kernel/exceptions`)

`BaseException<TCode>` carries `code`, `message` and an optional `context` (bounds such as `min`, `max`), the same shape as the contract's error response. It carries **no HTTP status**: the status comes from the code → status table of the HTTP exception filter (decision 0020). Each bounded context extends it with its own exception and its own code enum (core.md rule 24). `isBaseException(error)` narrows an unknown error (prefer it to `instanceof`, which types the code as `any`). The kernel's own errors are `SharedKernelException` with `SharedKernelExceptionCodeEnum`.

---

## Test fakes (`@cocooning/shared-kernel/testing`)

Excluded from the build. Each one `extends` its port (decision 0001): `DeterministicDateTimeProvider`, `FakeUuidV7GeneratorProvider` (`00000000-0000-7000-8000-<12-digit counter>`), `FakeSecureRandomGenerator` (`willReturnIntegers()`), `FakeLoggerAdapter`, `FakeEventPublisherAdapter`, `InMemoryUnitOfWork`, `InMemoryFileStorage`.

---

## Couple shared kernel (`@cocooning/couple-shared-kernel`)

| Subpath | Contains |
|---|---|
| `enums` | Business enums shared by server and PWA, one file per enum, `as const` (decision 0002): `CouplePairingStatusEnum` (`PENDING`, `PAIRED`) |
| `routers` | `ApiRouterEnum` and `WebRouterEnum`, one route file per context (plus `HealthRouteEnum`, the public API health route; `PairingRouteEnum` for `pairing`) spread into the enum and listed in `API_ROUTE_GROUPS` / `WEB_ROUTE_GROUPS`; a spec fails on a key declared by two groups or a group missing from the list. Never hardcode a route string |
| `exceptions` | `MissingExecutionContextException(missing)`, code `EXECUTION_CONTEXT_MISSING`: thrown by a guard service's `ensureRequiredContextPresent` when a field of `ExecutionContext` is missing |

---

## Rules

1. **Search before creating.** A VO, enum, port or service that belongs to a shared kernel is already there.
2. **Only truly shared concepts go here.** An enum used by one bounded context stays in its `domain/enums/`; it moves here when two contexts, or server and PWA, need it.
3. **No business logic.** Primitives and ports only. Rules, domain services and use cases stay in their bounded context.
4. **No runtime dependency.** `@cocooning/shared-kernel` depends on no package and no framework (core.md rule 17). The real UUID v7 generator (`UuidV7GeneratorProvider`) lives in `@cocooning/server-infrastructure/identifier`, the only package that depends on `uuid`.
5. **Add, don't modify.** A shared type is used everywhere: a breaking change updates every consumer in the same change.
