# Core Rules: Non-Negotiable (all agents)

These rules are loaded by EVERY agent before any specialized knowledge. They apply from the first file: Cocooning has no legacy code and no debt clause.

Rule numbers are an API: findings, `CLAUDE.md` files and decisions cite `core.md rule N`. Add new rules at the end, never renumber. A decision cited by number alone (`decision 0008`) is in the couple register, `docs/couple/decisions/index.md`; a decision of `docs/platform/decisions/index.md` is cited `platform decision NNNN`; a `Dn` or `Pn` id is an owner decision tracked in `_brain/DECISIONS.md`.

---

## Code Quality

1. **One file = one responsibility.** If a file mixes concerns, split it. Signals: more than 2 main exports, mixes logic + types, UI + state, or config + runtime.

2. **Functions: ~40 lines max.** If it needs scrolling, it's too long. Extract named sub-functions with clear names: the function name replaces the comment you would have written.

3. **Files: ~80 lines (frontend), ~125 lines for a React component (decision 0008), ~100 lines (backend).** Beyond that, split: even if the extracted piece is used only once. A small file with a clear name is always better than a long file with sections.

4. **No dead code.** No unused functions, variables, imports, or commented-out code. Git history is the backup: never keep code "just in case".

5. **No unnecessary comments.** The code documents itself through small functions with expressive names, ubiquitous language, and clear types. The only acceptable comment explains a non-obvious "why": never what the code does. No JSDoc/TSDoc unless explicitly requested.

6. **No `any`.** Always type explicitly. Define local types when the shape isn't covered by an existing type.

7. **`null` over `undefined`.** For optional values, always `T | null`, never `T | undefined`, and never `?? undefined`.

8. **No hardcoded values.** URLs, ports, durations, secrets, domain names, magic numbers: all via environment variables or configuration constants. If a value could differ between environments, it's configuration.

9. **No external calls in loops.** Database, network, API, filesystem: always batch.
    ```ts
    // WRONG: N+1 queries
    for (const id of noteIds) {
        const note = await noteRepository.findById(coupleId, id);
    }

    // CORRECT
    const notes = await noteRepository.findByIds(coupleId, noteIds);
    ```

10. **Await all Promises in try/catch.** A non-awaited Promise means the catch never fires: the error escapes silently as an unhandled rejection.

11. **No silent failures.** No empty `catch` blocks. No `?? defaultValue` that masks data corruption. If something is wrong, fail loudly.
    ```ts
    // WRONG: masks a data integrity issue
    const visibility = raw.visibility ?? 'PRIVATE';

    // CORRECT: if visibility is missing, something is broken
    if (!raw.visibility) {
        throw new NoteException({ code: NoteExceptionCode.NOTE_DATA_CORRUPTED, message: 'Missing visibility' });
    }
    ```

12. **Immutability by default.** `const` everywhere. `readonly` on class properties. Never mutate function parameters: return new instances. Value Objects use `Object.freeze(this)`.

13. **Early return pattern.** Guard clauses at the top of functions. Max 2-3 levels of nesting. Deep nesting = extract a function.
    ```ts
    // WRONG
    if (input) {
        if (input.isValid) {
            if (input.items.length > 0) {
                // logic buried 3 levels deep
            }
        }
    }

    // CORRECT
    if (!input) return;
    if (!input.isValid) throw new ValidationException('Invalid');
    if (input.items.length === 0) return;
    // logic at top level
    ```

14. **KISS: No over-engineering.** Solve the current problem, not hypothetical future ones. Three similar lines of code are better than a premature abstraction. Don't add configurability, feature flags, or extension points that aren't needed right now. Cocooning serves two users (decision P1): size every choice for them.

15. **YAGNI: Don't build what isn't asked.** A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra error handling for scenarios that can't happen. Do what's requested, nothing more.

16. **Search before creating.** Before creating a utility, hook, component, enum, or type: search the codebase for existing implementations. Check barrel files (`index.ts`), shared packages, and existing modules. Duplication is the most expensive form of technical debt.

---

## Architecture

17. **Dependencies always point inward.** Infrastructure → Application → Domain. Never the reverse. Domain is pure TypeScript: zero framework imports.

18. **Ports = abstract classes, not interfaces.** TypeScript interfaces are erased at runtime: they can't serve as injection tokens. Abstract classes persist at runtime and work as DI tokens.

19. **Dependency injection over static calls.** Never call `Date.now()`, `Math.random()`, `crypto.randomBytes()`, `new Date()` directly in business code. Everything goes through an injectable port: testable, deterministic, swappable. This includes the random time of a photo prompt.
    Identifiers are the only exception (decision 0024, owner decision D13): an identity VO's `generate()` calls `Uuid.generateValue()`, made deterministic in tests by `Uuid.configure(...)` and `Uuid.resetForTests()`. Never generate an identifier any other way.
    ```ts
    // WRONG: untestable, non-deterministic
    const now = new Date();
    const token = crypto.randomBytes(16).toString('hex');

    // CORRECT
    const now = this.dateTimeProvider.now();
    const token = this.secureRandomGenerator.generateHex(16);
    ```

20. **Single source of truth.** One concept = one place. If a type exists in the domain, do not redefine it in infrastructure. If an enum exists in shared-kernel, do not recreate it locally. Duplication = drift.

21. **Enums: `as const` objects, not TypeScript `enum`** (decision 0002). A fixed set of values is always such an enum, never raw string literals. Exception: a domain event name is a literal on its event class, referenced as `XxxEvent.EVENT_NAME` (decision 0004). Use the `as const` pattern with a derived type. It produces real JS objects, supports `Object.values()`, and avoids TS enum quirks (reverse mapping, opaque types).
    ```ts
    // CORRECT: as const pattern
    export const NoteVisibilityEnum = {
        PRIVATE: 'PRIVATE',
        SHARED: 'SHARED',
    } as const;

    export type NoteVisibility = (typeof NoteVisibilityEnum)[keyof typeof NoteVisibilityEnum];

    // WRONG: TypeScript native enum
    export enum NoteVisibility {
        PRIVATE = 'PRIVATE',
        SHARED = 'SHARED',
    }
    ```

22. **No cross-package re-exports in barrels.** A barrel (`index.ts`) only exports what is defined in its own package. Consumers import from the source package directly.

23. **Static imports only.** No dynamic `import()` in application code.

---

## Error Handling

24. **Typed exceptions with enum codes.** Every exception carries a code from an enum: never a raw string message. Codes are prefixed by their aggregate or context (`NOTE_NOT_FOUND`, not `NOT_FOUND`). This enables reliable mapping across layers and i18n. The domain knows nothing about HTTP: the status of each code comes from the table in the HTTP exception filter (D5).
    ```ts
    // WRONG
    throw new Error('Note not found');

    // CORRECT
    throw new NoteException({
        code: NoteExceptionCode.NOTE_NOT_FOUND,
        message: 'Note not found',
    });
    ```

25. **Never swallow errors silently.** If you catch, you either handle meaningfully, re-throw, or log with context. Empty catch blocks are forbidden.

26. **Errors don't leak implementation details.** A database error must never reach the client. Each layer translates errors into its own vocabulary: infrastructure errors become domain exceptions, domain exceptions become user-facing responses.

---

## Security

27. **Couple isolation (D7).** Every record belongs to a couple and has an `ownerId`. Every data query MUST be scoped to a `coupleId`: first parameter of every port method, leading column of every index. A record private to one partner is also filtered by `ownerId`, and the other partner gets a 404, never a 403. A missing filter = data leak. The only exceptions are the two contexts that precede the couple: `pairing` (decision 0029) and `authentication` (decision 0033).

28. **Never trust client input.** Validate at system boundaries with Zod schemas: API endpoints, server actions, form submissions. Invalid input is answered with 422 (D5). Frontend validation is UX; server validation is security.

29. **No secrets in code.** API keys, JWT secrets, VAPID keys, database URLs: always environment variables. Never in source code, never in git history, never in client bundles.

30. **No sensitive data in logs or error messages.** No passwords, tokens, personal data, or full request bodies.

---

## Environment Variables

31. **Lifecycle (MANDATORY, same commit).** When adding an env var, all steps in the same commit:
    - Used in code via the app's config/validation mechanism
    - Added to `.env.example` with comment + dev default value
    - Added to env validation schema (Zod)
    - Alert block shown to user listing new vars to configure

---

## Logging

32. **Structured logging.** Always objects, never string interpolation. Enables querying in the log backend.
    ```ts
    // WRONG
    logger.debug(`Sharing note ${noteId} for couple ${coupleId}`);

    // CORRECT
    logger.debug('Sharing note', { noteId, coupleId, action: 'share' });
    ```

33. **The couple's content is sensitive data.** Rule 30 covers note bodies, event titles, message texts, photos and push payloads: log identifiers, never content.

---

## Naming

34. **Ubiquitous language.** Names reflect business concepts, not technical implementation. `FlashMessage` not `MessageData`. `shareNote` not `processInput`. `NoteException` not `AppError`. Business terms come from the glossary (`docs/architecture/glossary.md`).

35. **Files: kebab-case** with role suffixes: `create-note.use-case.ts`, `sign-in-form.view.tsx`, `note-title.vo.ts`. One suffix per role (`docs/architecture/conventions.md`).

36. **Classes/Types: PascalCase.** `NoteGuardService`, `SignInFormViewModel`, `NoteTitle`.

37. **Functions/variables: camelCase.** `resolveSignInDecision`, `handleSubmit`, `noteId`.

38. **Enums/Constants: SCREAMING_SNAKE_CASE.** `NOTE_NOT_FOUND`, `CALENDAR_EVENT_DATE_RANGE_INVALID`, `SHARED`.

---

## Git

39. **Conventional commits, in English (D15).** `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, plus `perf:`, `build:`, `ci:`, `style:`, `revert:` when they fit better; `commitlint.config.ts` enforces this list and the scopes. One commit = one coherent change. Never mix feature + refactor + fix in the same commit. Every change goes on its own branch from `dev` (D23).
