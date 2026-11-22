# Adapters Rules

Secondary adapters (repositories, providers, storage) implement domain ports; primary adapters (controllers, event handlers) call use cases. They live in `apps/couple/api/src/modules/<context>/`, or in a shared package when domain-agnostic (`@cocooning/server-infrastructure`).

## Rules

1. **`@Injectable()`** on every adapter class.
2. **`extends` the abstract port**, never `implements` an interface (core.md rule 18).
3. **Inject the `Logger` port** of `@cocooning/shared-kernel/ports` and call `this.logger.setContext(ClassName.name)` in the constructor. Never `new Logger()` from `@nestjs/common`.
4. **Explicit types for every query result.** Prisma payload types (`Prisma.XGetPayload<{ include: typeof INCLUDE }>`, `include` declared `as const`) or a local `XxxRow` type for raw SQL. Never `any`.
5. **Enumerated strings go through `parseEnum()`** when rebuilding a domain object.
6. **`coupleId` in every `where`**, and `ownerId` for a private record (core.md rule 27). Isolation is never checked in memory after loading.
7. **`findFirst` over `findUnique`** when the key (`coupleId` + id) is not a Prisma unique constraint.
8. **Raw SQL**: tagged `$queryRaw` with `Prisma.sql` fragments, `deleted_at IS NULL` written at every level (the soft-delete extension does not reach raw SQL), batches through one array parameter (`= ANY(${ids}::uuid[])`). `$queryRawUnsafe` and `$executeRawUnsafe` are forbidden.
9. **Errors: rethrow the domain exception, translate the rest.** `try { ... } catch (error) { if (error instanceof XxxException) throw error; ... this.logger.error('...', { aggregateId, error }); throw ... }`. A provider never returns `null` on error.
10. **Mapping lives in a mapper**, one per aggregate (`toSnapshot(raw)`, then `Aggregate.fromSnapshot`). A mapping failure throws the context's `*_DATA_CORRUPTED` exception, never `new Error()`.
11. **Event data** is serialized with `JSON.parse(JSON.stringify(...)) as Prisma.InputJsonValue`; `Prisma.JsonNull` for a nullable JSON field.
12. **Import Prisma from `@cocooning/couple-prisma`**, never `@prisma/client`. Import domain types from `@cocooning/couple-server-business-logic/<context>`, never by relative path.
13. **Child rows of an aggregate**: `deleteMany` then `createMany` inside the transaction, unless the children have their own lifecycle.
14. **Cross-context reads are read-only**: a narrow port (a boolean, a value) implemented by a `{Concept}PrismaProvider`. A cross-context write goes through a domain event.
15. **Event handlers** call one use case (decision 0023), catch, log with context, and never rethrow (`core-backend.md` rules 8 and 16). Event names are referenced as `XxxEvent.EVENT_NAME` (decision 0004).
16. **When in doubt, ASK.** Never guess.

## Output structure

```
apps/couple/api/src/modules/<context>/
├── <context>.module.ts  <context>-service.module.ts  <context>-secondary.module.ts
├── primary/
│   ├── controllers/<action>-<entity>.controller.ts
│   ├── dto/responses/
│   ├── mappers/
│   └── handlers/on-<event-name>.handler.ts
└── secondary/
    ├── repositories/<aggregate>-prisma.repository.ts
    ├── repositories/<context>-event-prisma.repository.ts
    └── providers/<concept>-prisma.provider.ts
```

A handler reacting to one event is `on-<event-name>.handler.ts`; a handler fed by several events is named by its effect (`<effect>.handler.ts`). Each folder has an `index.ts` barrel exporting only its own files (core.md rule 22).
