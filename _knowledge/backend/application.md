# Application Rules

How a bounded context of `@cocooning/couple-server-business-logic` orchestrates its domain: use cases, mappers and their wiring. The layer imports the domain, the shared kernels and ports, never a framework (`core-backend.md` rules 1 and 2). Reference: `packages/couple/server-business-logic/src/pairing/application/`.

## Use cases

1. **One operation per file, `<action>-<entity>.use-case.ts`, flat in `application/use-cases/`.** One public method, `execute(context, command)` (decision 0023). `context` is an `ExecutionContext`, or a `PartnerContext` in `pairing` (decision 0029). A use case without user input takes `context` alone (`CreateCoupleUseCase`, `GetMyCoupleUseCase`).
2. **The command type is declared at the top of the file** (`JoinCoupleCommand`), with primitives only; the use case builds the VOs (`InvitationCode.normalize(command.invitationCode)`).
3. **The flow is a recipe, in this order**: preconditions, input, load, now, domain, save, publish, return. No `if`, no loop, no private method, no computation (`core-backend.md` rule 2). A check that throws belongs to a precondition service or the aggregate (`domain.md` rules 4 and 19).
4. **Read the clock once** through `DateTimeProvider.now()` and pass the instant everywhere (core.md rule 19).
5. **Save, then publish.** `await repository.save(aggregate)` writes the state and its events in one transaction; then `await eventPublishingService.publishAndClear([aggregate])` publishes in process after commit. The use case never writes events itself and never marks them published (decision 0021). A publication failure is logged and swallowed by the service: the outbox relay delivers.
6. **Return a view, never the aggregate.** The mapper of `application/mappers/` builds it (`toCoupleView(couple)`); every use case of a context returns the same view when the client needs the same screen.
7. **Constructor order**: repository, domain services, providers, `DateTimeProvider`, `EventPublishingService`, then configuration values. At most five business dependencies.
8. **Configuration arrives as a constructor value** read by the API (`invitationCodeLifetimeInHours`). This package never reads the environment.
9. **Errors propagate.** No `try/catch`, no error log; debug logs only (`core-backend.md` rules 6 and 7).

## Mappers

10. **A mapper is a pure function** next to the view type it returns, one file per view (`couple-view.mapper.ts`). It may branch on nullability; it never decides a business outcome.

## Wiring (API, later stages)

11. **Each use case is built by `useFactory`** in the context's service module; its domain services are created inline in the factory (`new PairingPreconditionService(coupleRepository)`, decision 0005); a guard service reading another context is an injected provider (decision 0006). `PairingTestContext` wires the use cases exactly this way.

## Use case skeleton

```ts
async execute(context: PartnerContext, command: JoinCoupleCommand): Promise<CoupleView> {
    await this.pairingPreconditionService.ensurePartnerHasNoCouple(context.userId);
    const code = InvitationCode.normalize(command.invitationCode);
    const couple = await this.pairingPreconditionService.loadCoupleByInvitationCode(code);
    couple.join(context.userId, code, this.dateTimeProvider.now());
    await this.coupleRepository.save(couple);
    await this.eventPublishingService.publishAndClear([couple]);
    return toCoupleView(couple);
}
```

Source: `pairing/application/use-cases/join-couple.use-case.ts`.
