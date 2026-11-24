# Domain Rules

How a bounded context of `@cocooning/couple-server-business-logic` models its domain: aggregates, child entities, value objects, events, exceptions, ports and domain services. The domain is pure TypeScript (`core-backend.md` rule 1); it imports only the two shared kernels and the exception codes of its contract. Reference context: `packages/couple/server-business-logic/src/pairing/`.

## Layout

```
src/<context>/
├── CLAUDE.md  index.ts           # index: export * from './application'; export * from './domain';
├── domain/
│   ├── models/                   # <aggregate>.aggregate.ts, <aggregate>.aggregate.type.ts, <child>.entity.ts
│   ├── value-objects/            # <name>-id.vo.ts, <concept>.vo.ts
│   ├── enums/                    # only for an enum used by this context alone (shared-kernel.md rule 2)
│   ├── events/                   # <object>-<fact>.event.ts, one class per file
│   ├── exceptions/               # <context>.exception.ts
│   ├── ports/                    # <aggregate>.repository.ts, <concept>.provider.ts
│   └── services/                 # <concern>.validator.ts (static), <concern>.service.ts (with ports)
├── application/                  # application.md
└── __tests__/                    # use-case-tests.md
```

Every folder has an `index.ts` exporting only its own files (core.md rule 22). Inside a context, imports are relative; across packages, by subpath (`@cocooning/shared-kernel/domain`). A file that only serves its folder stays out of the barrel (`events/pairing-event-params.ts`).

## Aggregates

1. **Private constructor, `props` private.** The aggregate extends `AggregateRoot`; its props type, creation input and snapshot live in `<aggregate>.aggregate.type.ts`. Reference: `pairing/domain/models/couple.aggregate.ts`.
2. **A factory per business verb**, taking the instant: `Couple.create(input, now)`. It builds the identity with `<Name>Id.generate()`, the metadata with `EntityMetadata.create(now)`, and records the creation event.
3. **Intent methods change state, then record one event.** Each starts with its guards, ends with `metadata.recordUpdate(now)` and `addDomainEvent(...)`: `Couple.join`, `Couple.renewInvitationCode`. The instant is always a parameter, never read (core.md rule 19).
4. **Invariants live in the aggregate** (`core-backend.md` rule 3). When the guards outgrow the file (core.md rule 3), they move to a static validator that the aggregate calls (`pairing/domain/services/couple-pairing.validator.ts`); the aggregate still decides when to call it.
5. **`fromSnapshot()` never validates**: stored data keeps loading if a rule tightens. `toSnapshot()` returns primitives, enums and ISO dates only.
6. **The version is read, never incremented** (`concurrency.md` rule 4). A new aggregate starts at 1; the repository owns the increment.
7. **Rule numbers in comments.** A `// R5:` comment above the code that applies a rule of `docs/couple/business-rules/<context>/rules.md`, with the same number.

## Child entities and value objects

8. **A child entity** extends `Entity`, is frozen, and has `fromSnapshot()` / `toSnapshot()` (`pairing/domain/models/couple-partner.entity.ts`).
9. **An identity VO** extends `Uuid` with `generate()` and `from()`, nothing else (`pairing/domain/value-objects/couple-id.vo.ts`).
10. **A domain VO** extends `ValueObject`, calls `Object.freeze(this)`, validates external input in its factory and rehydrates with `from()` without validating. Getters return copies of `Date`. Reference: `pairing/domain/value-objects/invitation-code.vo.ts`, whose `normalize()` reads what a partner typed.
11. **Randomness comes from a port passed as an argument** (`InvitationCode.generate(secureRandomGenerator, issuedAt, lifetimeInHours)`), never `Math.random`, `randomUUID` or the `uuid` package (core.md rule 19, decision 0024); `pnpm lint` rejects them (`config/eslint-config/business-logic.js`).

## Events

12. **One class per file, extending `DomainEventBase`**, with `static readonly EVENT_NAME = '<context>.<object>.<fact>' as const` (decision 0004), the fact in the past tense: `pairing.couple.paired`. Every other file references `XxxEvent.EVENT_NAME`; `pnpm lint` runs `scripts/check-event-names.mjs` first, which fails on an event class without its literal or on a name retyped as a string.
13. **Data holds identifiers, statuses and primitives**, never a VO, never a secret or the couple's content (core.md rules 30, 33). `InvitationCodeRenewedEvent` has `null` data: the code stays out of every event.
14. **The context is the full `ExecutionContext`**, even in a context whose use cases receive `PartnerContext` (decision 0029).

## Exceptions

15. **One exception class per context**, `<Context>Exception extends BaseException<<Context>ExceptionCode>`, thrown with a code of the contract's `<Context>ExceptionCodeEnum` (`contracts.md`, "Exception codes"). No HTTP status in the domain (decision 0020).
16. **A refusal that must not reveal why uses one code.** An unknown, expired or used invitation code all throw `PAIRING_INVITATION_CODE_INVALID`; a stranger to a couple gets `PAIRING_COUPLE_NOT_FOUND`.

## Ports and domain services

17. **Ports are abstract classes** in `domain/ports/`, one per file, returning `T | null`. Every method takes `coupleId` first (core.md rule 27); the only exceptions are the two lookups of `CoupleRepository` (`findByPartner`, `findByInvitationCode`, decision 0029), the two of `AccountRepository` (`findById`, `findByEmailAddress`, decision 0033), `PairedCoupleProvider.findPairedCoupleIdOf` of `notes`, `agenda` and `messaging` (one port per context), which finds the `coupleId` itself (decision 0041), `PairedCoupleProvider.findPairedCoupleIds` of `messaging`, a read across couples by the scheduled task of the photo prompt (R7 of messaging), and `OutboxEventRepository.claimPending` of `messaging`, the other read across couples, by the outbox relay (R10 of messaging, decision 0051). A port method that receives aggregates reads their `coupleId` from each one (`save`, `PushSubscriptionRepository.forget`). A batch port method takes the list of couples first instead (`PhotoPromptRepository.findOfDay(coupleIds, day)`).
18. **`save(aggregate)` persists the state and its events in one transaction** (`core-backend.md` rule 21) and throws the context's exceptions for a stale version (`<AGGREGATE>_VERSION_CONFLICT`) or a unique constraint.
19. **A precondition service** holds the ports a check needs and throws: `PairingPreconditionService.ensurePartnerHasNoCouple`, `loadCoupleOfPartner`, `loadCoupleByInvitationCode`. It is a domain service, instantiated inline in the use case factory (decision 0005). A rule that spans several aggregates (R1, one couple per partner) lives here and in a unique index, never in a use case.
20. **A validator is static and pure**: one `ensure*` per constraint, no port.
