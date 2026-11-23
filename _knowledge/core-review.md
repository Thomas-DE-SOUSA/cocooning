# Review Core Rules (all review agents)

Loaded alongside core.md for any review work. Never imported by a `CLAUDE.md`: review agents and commands load it explicitly. This file is the single report schema of the repository.

---

## General Review Protocol

1. **Every finding MUST cite:** file path, line number (or range), rule violated (file and rule number, e.g. `core.md rule 7`), severity, suggested fix. A finding without a fix is incomplete.

2. **Severity levels, one three-level scale for every review** (decision 0007):
   - **CRITICAL** (Critique): blocks merge, must fix before proceeding
   - **IMPORTANT** (Important): to address, risk of bugs or architectural drift
   - **MINOR** (Mineur): optional improvement, style or minor optimization

3. **Verdict logic:** 0 critical findings = PASS. 1+ critical = FAIL. No exceptions. IMPORTANT findings don't block but must be acknowledged.

4. **Max 2 review cycles per phase.** If issues persist after 2 fix attempts: STOP, present all remaining findings to user, let them decide.

5. **Code identifiers in English, findings and reports in French.** Match the project's communication language.

---

## Report Schema

Output to `_cocooning-output/{slug}/reviews/{phase}-review.yaml`, where `{phase}` is one of `domain`, `application`, `infrastructure`, `frontend`, `cross-layer`, `full`.

```yaml
review:
  phase: "{phase}"
  context: "{bounded-context-name}"
  date: "{ISO date}"
  reviewer: "{agent-name}"
  verdict: "PASS" | "FAIL"

  summary:
    critical: 0
    important: 0
    minor: 0
    total: 0

  findings:
    - id: "F-001"
      severity: "CRITICAL"
      file: "path/to/file.ts"
      line: 42
      rule: "core.md rule 27, couple isolation"
      description: "Repository query filters by noteId without coupleId"
      fix: "Add coupleId to the port method and to the WHERE clause"

    - id: "F-002"
      severity: "IMPORTANT"
      # ...

  smoke_tests:
    tsc: "PASS" | "FAIL"
    jest: "PASS" | "FAIL" | "SKIPPED"
    eslint: "PASS" | "FAIL" | "SKIPPED"
```

Severity examples: CRITICAL, a query without `coupleId`, business logic in a controller, a private record of one partner readable by the other; IMPORTANT, a missing null check, a test not covering an edge case; MINOR, naming or verbosity.

---

## Anti-Pattern Enrichment Protocol

After completing a review:

1. Evaluate if 0-2 findings represent **recurring** anti-patterns (not one-off bugs)
2. For each candidate: propose a new file in `_knowledge/review/anti-patterns/`
3. Standard format: `# Anti-Pattern: {Name}`, a 1 to 2 sentence description under the title, `## Symptoms` (WRONG/CORRECT code pairs), then `## The Rule` written as a prescriptive MUST or NEVER statement. In English, like the rest of `_knowledge/`.
4. Max 80 lines per anti-pattern file
5. Present to user for approval before creating: never auto-create

---

## Smoke Tests (mandatory before verdict)

Before issuing a verdict, run applicable checks from the affected package or app:

| Check | Command | When |
|-------|---------|------|
| TypeScript compilation | `pnpm exec tsc --noEmit` | Always |
| Use case tests | `pnpm exec jest "{context}" --runInBand` | After application phase |
| E2E tests | the app's `test:e2e` script, filtered on `{context}` | After infrastructure phase |
| Lint | `pnpm exec eslint "{affected-files}"` | Always |

A failing smoke test is an automatic CRITICAL finding.
