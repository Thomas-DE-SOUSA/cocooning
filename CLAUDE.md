# Cocooning

## 🔶 Project memory (MANDATORY)

This repository carries its own memory, so nothing is lost on `/clear`, compaction or a new session. `_brain/README.md` explains the design. Current state and the knowledge index:

@_brain/STATE.md
@_brain/INDEX.md

- **Resume.** STATE.md above says where we are. The SessionStart hook adds a health line. When it says STATE.md is older than the previous session, run `scripts/brain-last-session.sh` and update STATE.md before anything else.
- **Retrieve.** Go through INDEX.md to the exact file and section and read only that section: `grep -n '^## '`, then Read with an offset. Never load a whole synthesis or the raw reports into the main context. Delegate wide reads to a sub-agent.
- **Write.** Each kind of knowledge has one home (table below). Update in place; only the journal is append-only. Dates are absolute.
- **Save.** Follow the `brain-save` skill after each completed step, after each decision by the owner, and whenever the owner is about to clear. The Stop hook reminds you when STATE.md lags behind the work.
- **Stay fast.** `scripts/check-brain.sh` enforces budgets: this file ≤ 150 lines, STATE.md ≤ 60, INDEX.md ≤ 120, DECISIONS.md ≤ 150, LESSONS.md ≤ 120. Over budget, follow the `brain-consolidate` skill.

| What you learned | Where it goes |
|---|---|
| Current state, next step, blockers | `_brain/STATE.md` (rewrite) |
| A decision by the owner | `_brain/DECISIONS.md`, then an ADR in `docs/` once `docs/` exists |
| An idea or option raised but not decided | `_brain/DECISIONS.md`, status `ouverte`, with who raised it and when |
| A non-obvious lesson, an incident, a trap | `_brain/LESSONS.md` |
| What happened in a session | `_brain/journal/YYYY-MM-DD.md` (append) |
| A code rule | `_knowledge/` once ported; until then `_brain/LESSONS.md`, "Règles provisoires" |
| Knowledge about one folder or module | that folder's `CLAUDE.md` |
| A procedure done twice | a skill in `.claude/skills/<name>/SKILL.md` |
| A personal preference of the owner | Claude auto memory, not the repository |

## 🔶 Mirror Malta (MANDATORY)

Cocooning reproduces the structure, stack and agent tooling of Malta (`<malta-local>`), with a different business domain. Before creating a file or folder, find its Malta counterpart through the blueprint (`_malta-blueprint/00-BLUEPRINT.md` §4 target tree, §5 rename map) and mirror it. Never improvise another layout. Until `_knowledge/` is ported, the law is the golden rules (00 §9) and the thematic syntheses.

Malta and its sibling folders under `<work-local>/` are read-only. Never write there, and never run installs, builds, tests or mutating git commands in them. `_malta-blueprint/` contains proprietary propriétaire code excerpts: never publish it.

Code knowledge lives next to the code, layer by layer, as in Malta. Every new package, app, bounded context and frontend module gets its `CLAUDE.md` in the same change, built from the Malta template of its level (30 §2): what it contains, its aggregates or modules, its rules, the reference files to copy, and the `docs/` pages to update. Any change to the code updates that `CLAUDE.md` and those pages in the same change. Read the deepest `CLAUDE.md` before opening code; open only the files it points to.

The only deliberate addition to the Malta layout is the memory layer: `_brain/`, `.claude/hooks/brain-*`, `.claude/skills/brain-*`, `scripts/check-brain.sh` and `scripts/brain-last-session.sh`.

## 🔶 Working with the owner (MANDATORY)

- Reply in French. Code identifiers stay in English.
- Before reporting progress on background work, check real activity (transcript modification times, `journal.jsonl`). Never assume it is running.
- Announce the estimated cost before launching a workflow of more than 10 agents.
- Git (decision D23): `main` is stable, `dev` is integration and the default branch, and every change goes on its own branch from `dev` (`feat/…`, `fix/…`, `chore/…`, `docs/…`), merged into `dev`, then `dev` into `main`. Never commit directly on `main` or `dev`. Commits are atomic and conventional (`feat:`, `fix:`, `chore:`…). Remote: private `git@github.com:Thomas-DE-SOUSA/cocooning.git`. Commit and push only when the owner asks.

## 🔶 Sub-agent prompting (MANDATORY)

A sub-agent knows only its prompt. Every Agent tool prompt contains:

1. The business context: why the change is needed, which problem it solves.
2. The applicable rules, copied verbatim from the CLAUDE.md and knowledge files, not merely named.
3. An existing file of the repository (or of Malta) that follows the pattern to reproduce.
4. The exact paths to read, create and modify.
5. The pitfalls: what not to do.
6. The dependencies between files (module wiring, barrel exports, tests).
7. The tests to update and the command that runs them.

## 🔷 Project map

Current state, before phase 0. The target tree is in `00-BLUEPRINT.md` §4. Update this map as phases land.

```
cocooning/
├── CLAUDE.md
├── _brain/            # project memory: state, index, decisions, lessons, journal
├── _malta-blueprint/  # Malta analysis: 00 blueprint, 10–70 syntheses, 99 checks, raw/ (48 reports)
├── .claude/           # settings.json (hooks), hooks/, skills/brain-*, workflows/malta-*
└── scripts/           # check-brain.sh, brain-last-session.sh
```
