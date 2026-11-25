# Cocooning

🔶 = MANDATORY, non-negotiable. 🔷 = context.

## 🔶 Project memory (MANDATORY)

This repository carries its own memory, so nothing is lost on `/clear`, compaction or a new session. `_brain/README.md` explains the design. Current state and the knowledge index:

@_brain/STATE.md
@_brain/INDEX.md

- **Resume.** STATE.md above says where we are. The SessionStart hook adds a health line. When it says STATE.md is older than the previous session, run `scripts/brain-last-session.sh` and update STATE.md before anything else.
- **Retrieve.** Go through INDEX.md to the exact file and section and read only that section: `grep -n '^## '`, then Read with an offset. Never load a whole synthesis or the raw reports into the main context. Delegate wide reads to a sub-agent.
- **Write.** Each kind of knowledge has one home: follow the routing table in `_brain/README.md`, section "Où va chaque savoir", before writing anything you learned. Update in place; only the journal is append-only. Dates are absolute.
- **Save.** Follow the `brain-save` skill after each completed step, after each decision by the owner, and whenever the owner is about to clear. The Stop hook reminds you when STATE.md lags behind the work.
- **Stay fast.** `scripts/check-brain.sh` enforces budgets: this file ≤ 150 lines, STATE.md ≤ 60, INDEX.md ≤ 120, DECISIONS.md ≤ 150, LESSONS.md ≤ 120. Over budget, follow the `brain-consolidate` skill.

## 🔶 Out of Scope (MANDATORY)

Ignore by default: `_malta-blueprint/raw/`. Never read it whole or include it in searches, refactors or reviews unless I ask for that scope explicitly; reach it through `_brain/INDEX.md`. Never build what Cocooning decided against (decision P1, D7, D10, D11) unless a new decision in `_brain/DECISIONS.md` says otherwise: multi-tenancy, a native or Expo app, AWS, SQS or any message queue, a separate worker app, Kubernetes or Helm, a central identity provider, and Malta's BI, print agent and HFSQL tooling. This applies to sub-agents too (exclude these paths and topics in their prompts).

## 🔶 Before working in a folder (MANDATORY)

Load the CLAUDE.md of the deepest folder you work in with the Read tool (never `cat`). If it has none, go up until you find one, stopping at the repository root.

## 🔶 Mirror Malta (MANDATORY)

Cocooning is a PWA for a couple: two users, iPhone and Android, self-hosted and reached over Tailscale like the owner's app Cadence. Malta (local path in `CLAUDE.local.md`) is the model for **how to build it**: its structure, layering, DDD/hexagonal method, per-layer `CLAUDE.md`, conventions and agent tooling. It is not the model for **sizing** (decision P1). When Malta's choice is oversized for Cocooning, record the simpler choice as a decision instead of copying it.

Before creating a file or folder, find its Malta counterpart through the blueprint (`_malta-blueprint/00-BLUEPRINT.md` §4 target tree, §5 rename map) and mirror its place and shape. Never improvise another layout; drop what the product does not need rather than inventing a substitute.

Malta and its sibling folders (local paths in `CLAUDE.local.md`, never versioned) are read-only. Never write there, and never run installs, builds, tests or mutating git commands in them. `_malta-blueprint/` contains proprietary code excerpts: never publish it, and never paste its code into Cocooning files; rewrite rules and structure for Cocooning.

Code knowledge lives next to the code, layer by layer, as in Malta. Every new package, app, bounded context and frontend module gets its `CLAUDE.md` in the same change, built from the template of its level (`docs/CLAUDE.md`, "CLAUDE.md dans le code"): what it contains, its aggregates or modules, its rules, the reference files to copy, and the `docs/` pages to update. Any change to the code updates that `CLAUDE.md` and those pages in the same change. Read the deepest `CLAUDE.md` before opening code; open only the files it points to.

The only deliberate addition to the Malta layout is the memory layer: `_brain/`, `.claude/hooks/brain-*`, `.claude/skills/brain-*`, `scripts/check-brain.sh` and `scripts/brain-last-session.sh`.

## 🔶 Working with the owner (MANDATORY)

- Reply in French. Code identifiers stay in English. Languages of artefacts (D15): code, this file, `_knowledge/` and commits in English; `docs/` in French; code-level `CLAUDE.md` files in French without accents.
- Before reporting progress on background work, check real activity (transcript modification times, `journal.jsonl`). Never assume it is running.
- Announce the estimated cost before launching a workflow of more than 10 agents.
- Git (decision D23): `main` is stable, `dev` is integration and the default branch, and every change goes on its own branch from `dev` (`feat/…`, `fix/…`, `chore/…`, `docs/…`), merged into `dev`, then `dev` into `main`. Never commit directly on `main` or `dev`. Commits are atomic and conventional (`feat:`, `fix:`, `chore:`…). Remote: public `git@github.com:Thomas-DE-SOUSA/cocooning.git` (platform decision 0018: never commit a personal datum, a local path or the tailnet; they go in `CLAUDE.local.md`). Commit and push only when the owner asks.

## 🔷 Project map

Cocooning is a pnpm + Turborepo monorepo for a couple's shared life (notes edited together in real time, shared calendar, photo and flash messages), built with DDD bounded contexts and hexagonal architecture (ports and adapters): NestJS backend, Next.js PWA frontend. Phase 3 in progress (state in `_brain/STATE.md`). Phases and target tree: `_malta-blueprint/00-BLUEPRINT.md` §4 and §6.

### Turborepo commands (root `package.json`)

| Command | Description |
|---------|-------------|
| `pnpm build`, `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm check-types` | Build, start, test, lint, type-check every app and package; `lint` first runs `scripts/check-event-names.mjs` (decision 0004), `test` first runs its `node --test` self-test |
| `pnpm format` | Prettier over the repository |
| `pnpm dev:couple`, `build:couple`, `test:couple` | Same, limited to the couple apps and packages |

### Workspace structure

`*` marks a folder with its own CLAUDE.md. `(phase N)` marks a folder that does not exist yet.

```
cocooning/
├── apps/couple/
│   ├── api/                        # * NestJS API, composition root (env, health, session guard, E2E harness), context modules (authentication, pairing, notes, agenda, messaging with the outbox relay and Web Push), operating commands (create-account, record-together-periods)
│   └── web/                        # * Next.js 16 PWA on port 3200: root layout, French i18n, Serwist, proxy.ts, sign-in screen and sign-out (module authentication), pairing screen (module pairing), then Web Push
├── packages/
│   ├── couple/                     # contexts: pairing, then authentication, notes, agenda, messaging
│   │   ├── server-business-logic/  # * Domain + Application layers (DDD)
│   │   ├── client-business-logic/  # * Frontend business logic, framework-free (ApiError, Translator, authentication: sign-in form, gateway port, use case; pairing: gateway port, four use cases, join form; notes, agenda; messaging: five gateway ports, eleven use cases, flash message form; testing fakes)
│   │   ├── client-infrastructure/  # * Frontend adapters: HTTP config of the couple, session forwarding, authentication, pairing, notes, agenda and messaging gateways and modules
│   │   ├── prisma/                 # * Prisma 7 schema, PrismaService, unit of work, soft delete, locks
│   │   ├── shared-kernel/          # * Business enums, limits, api and web routers, MissingExecutionContextException
│   │   ├── contract/               # * Zod contracts: error response, pagination, one subpath per context
│   │   ├── e2e-shared/             # * Test harness: Postgres 17 container, Jest global setup, fixtures
│   ├── shared-kernel/              # * DDD primitives, ports, exceptions, test fakes
│   ├── server-infrastructure/      # * NestJS plumbing (filter, Zod pipes), pino, clock, ids, disk storage, in-process events
│   ├── client-infrastructure/      # * Domain-agnostic frontend adapters: the single HTTP client (JSON or FormData body, JSON or bytes response), FakeFetch (testing)
│   ├── design-system/              # * Tailwind 4 tokens, Button, Calendar, Drawer, Field, Input, Label, Skeleton, Spinner, Switch, Textarea, Toaster, cn (read from src, no build)
├── config/                         # ts, eslint, prettier, jest configs (@cocooning/*), one CLAUDE.md each
├── infrastructure/                 # * Dockerfiles (nest, next) and the production docker compose (Oracle VM, Tailscale)
├── docs/                           # * Documentation (French): architecture, guides, platform, couple
├── _knowledge/                     # Coding rules imported by the CLAUDE.md files
├── _brain/                         # Project memory (state, decisions, lessons, journal)
└── _malta-blueprint/               # Local Malta analysis, never versioned or published
```

### Dependency flow

```
apps/couple/api (Interface) → couple/server-business-logic (Domain/Application) → shared-kernel, couple/shared-kernel, couple/contract
                            → couple/prisma, server-infrastructure (Adapters)
apps/couple/web (Interface) → couple/client-business-logic → couple/contract, shared-kernel, couple/shared-kernel
                            → couple/client-infrastructure, client-infrastructure, design-system (Adapters)
```

## 🔶 Core rules (MANDATORY)

Code rules shared by the whole repository (code quality, architecture, errors, security, environment, logging, naming, git). Backend and frontend rules come on top, through the folder CLAUDE.md files.

@_knowledge/core.md

## 🔶 Ubiquitous language: French domain, English code (MANDATORY)

The couple speaks French; the code is in English. No regulation fixes the vocabulary (D30 open), so the glossary is the list of allowed business terms: `docs/architecture/glossary.md`, then each module's `glossary.md`.

- A business term has one English name, taken from the glossary (note → `Note`, événement d'agenda → `CalendarEvent`, message flash → `FlashMessage`, photo instantanée → `InstantPhoto`, couple → `Couple`, partenaire → `Partner`). A grocery list is a `Note` titled "Courses", never its own concept.
- Everything else (action verbs, statuses, plumbing) is English: `Note.share()`, `NoteVisibility` `PRIVATE` / `SHARED`.
- Forbidden: a term missing from the glossary (add it there first) and a French/English mix inside one identifier (`NoteCourses`, `envoyerFlash()`).
- French user-facing labels ("Message flash") live in the i18n files, never in identifiers.

## 🔶 Environment variable lifecycle (MANDATORY)

A new environment variable ships in the same commit as these three steps, never "later":

1. Read in code through the app's config, `configService.getOrThrow()` in the NestJS apps (never `.get()` with a fallback).
2. Added to the app's `.env.example` (api, web), with a comment and a dev default when one applies.
3. Validated in the app's Zod schema: `src/env.ts` or the module or package `env.ts` it composes (NestJS apps), `src/env/server.ts` or `src/env/client.ts` (web).

At the end of every response that adds one (not at the end of the session), show this block:

```
⚠️ NEW ENVIRONMENT VARIABLES
The following variables were added and must be set in your local .env:

  VARIABLE_NAME=<value, or the command that generates it>

Do you want me to add them to your .env?
```

The rule binds sub-agents too: a sub-agent that adds a variable updates `.env.example` and `env.ts` in the same change, and its prompt states this obligation explicitly.

## 🔶 Sub-agent prompting (MANDATORY)

A sub-agent knows only its prompt. Every Agent tool prompt contains:

1. The business context: why the change is needed, which problem it solves.
2. The applicable rules, copied verbatim from the CLAUDE.md and knowledge files, not merely named. The prompt quotes verbatim the few rules that decide the task (a short excerpt with file and rule number). For the rest, it gives the exact knowledge and CLAUDE.md paths and orders the sub-agent to Read them before acting. Never write such a copy into a repository file: repository files reference the canon.
3. An existing file of the repository (or of Malta) that follows the pattern to reproduce.
4. The exact paths to read, create and modify.
5. The pitfalls: what not to do.
6. The dependencies between files (module wiring, barrel exports, tests).
7. The tests to update and the command that runs them.

## 🔷 Documentation

`docs/CLAUDE.md` sets where each page goes and how decisions and gaps are recorded. Each folder CLAUDE.md lists the pages to update in the same commit when its code changes.
