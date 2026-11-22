# Contract Rules: `@cocooning/couple-contract`

HTTP contracts are Zod 4 schemas shared by the API and the PWA (`packages/couple/contract`). The package runs in the browser. The controller validates its input with `ZodValidationPipe` (422) and its output with `ZodResponse(schema)`; the front parses the same schemas and matches error codes to fields and i18n keys.

## Rules

1. **The schema is the source of truth.** Types are always `z.infer<typeof Schema>`, never written by hand. Only exception: a recursive `z.lazy()` schema declares its shape type.
2. **Export the schema and its type** from each file. Helper schemas stay private.
3. **Requests validate, responses describe.** Bounds, `z.uuid()`, `.min()`, `.max()` on requests; structure only on responses.
4. **Dates cross the wire as ISO strings.** Requests use `z.iso.datetime()` (instant) or `z.iso.date()` (calendar day); responses declare `z.string()`. Never `z.coerce.date()`.
5. **Every identifier is `z.uuid()`** in a request.
6. **`z.discriminatedUnion()` for object variants**, never `z.union()` of objects.
7. **Enums are `as const`** (decision 0002). A business enum shared with the domain comes from `@cocooning/couple-shared-kernel/enums`, then `z.enum(Object.values(XxxEnum))`.
8. **One request and one response per action**, in paired files. A 204 has no response file.
9. **No business logic.** Cross-field checks through `.refine()`; `.transform()` and `z.coerce` only parse the wire format (query string to number or boolean).
10. **No framework, no Node API.** Only `zod`, `@cocooning/shared-kernel` and `@cocooning/couple-shared-kernel`. Never the domain (`server-business-logic`), Prisma or NestJS: ESLint `boundaries` blocks them.
11. **Bounds come from one place.** A bound that is also a domain invariant is a constant of the domain or of a shared kernel (`MAX_PAGE_SIZE`), imported here, never retyped.
12. **When in doubt, ASK.** Never guess.

## Layout

```
packages/couple/contract/src/
├── http-error/      # HttpErrorResponseSchema, ValidationIssueSchema
├── shared/          # pagination: query schemas and page response factories
└── <context>/       # same name as the bounded context (phase 2)
    ├── schemas/     # <action>.request.ts, <action>.response.ts, sub-folders by sub-domain
    ├── exceptions/  # exception-codes.ts
    └── index.ts     # export * from './schemas'; export * from './exceptions';
```

- Each folder of `src/` is a subpath export in `package.json` (`types → src`, `default → dist`). No root export. Consumers import by subpath (`@cocooning/couple-contract/notes`), never a sub-file.
- Every folder has an `index.ts` barrel exporting only its own files (core.md rule 22).

## File naming

| Content | File |
|---|---|
| Request body | `<action>.request.ts` |
| Route params | `<entity>-params.request.ts` |
| Query or filter | `<entity>-query.request.ts` |
| Response | `<action>.response.ts` |
| Shared schema or response factory | `<name>.zod.ts` |
| Exception codes | `exception-codes.ts`, or `<sub-domain>-exception-codes.ts` |

## Exception codes

- A context's codes are created here: `NoteExceptionCodeEnum` (`as const`, codes prefixed by the aggregate) and the type `NoteExceptionCode`. The domain exception class imports the type from the contract; the front matches on the same values. There is never a second copy in the domain (core.md rule 20).
- Every code needs a status in the API's code → status table (decision 0020); the API spec fails on a code without one.

## Shared schemas (reuse, never recreate)

| Schema | Subpath | Purpose |
|---|---|---|
| `HttpErrorResponseSchema` | `http-error` | Body of every error: `status`, `message`, and when present `code`, `context`, `errors[]` (422) |
| `ValidationIssueSchema` | `http-error` | One item of `errors[]`: `path`, `code`, `message` |
| `OffsetPaginationQuerySchema` | `shared` | `page` (from 1), `pageSize` (default 25, at most `MAX_PAGE_SIZE`), coerced from the query string (decision 0025) |
| `CursorPaginationQuerySchema` | `shared` | `cursor` (UUID v7 of the last item received, or `null`), `limit` |
| `createOffsetPageResponseSchema(item)` | `shared` | `items`, `total`, `page`, `pageSize` |
| `createCursorPageResponseSchema(item)` | `shared` | `items`, `nextCursor` (`null` on the last page) |

## Tests

- A spec next to each request schema with a bound, a default or a `.refine()`, BDD style: one scenario accepts a valid input, one per rejected case.
- Response schemas and factories are tested once, in `shared/`.
