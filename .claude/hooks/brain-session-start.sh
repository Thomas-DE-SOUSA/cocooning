#!/usr/bin/env bash
# SessionStart: prints a short memory health report, injected into Claude's context.
set -uo pipefail

INPUT=$(cat)
. "$(dirname "$0")/brain-common.sh"

ROOT=$(brain_root)
STATE="$ROOT/_brain/STATE.md"
LOG="$ROOT/_brain/journal/sessions.log"
SOURCE=$(printf '%s' "$INPUT" | jq -r '.source // "startup"' 2>/dev/null || echo "startup")
SESSION=$(printf '%s' "$INPUT" | jq -r '.session_id // ""' 2>/dev/null || echo "")
NOW=$(date +%s)

echo "[Mémoire Cocooning] session $SOURCE, $(date '+%Y-%m-%d %H:%M')"

if [ -f "$STATE" ]; then
    state_epoch=$(date -r "$STATE" +%s)
    echo "- STATE.md mis à jour le $(date -r "$STATE" '+%Y-%m-%d %H:%M') (il y a $(( (NOW - state_epoch) / 3600 )) h), déjà chargé via CLAUDE.md."
    changed=$(brain_first_change_after "$ROOT" "$STATE")
    if [ -n "$changed" ]; then
        echo "- ATTENTION : des fichiers ont changé après STATE.md (par exemple ${changed#"$ROOT"/}). Lance scripts/brain-last-session.sh, puis mets STATE.md à jour avant toute autre tâche."
    fi
else
    echo "- STATE.md introuvable : le reconstruire à partir de _brain/journal/ avant toute autre tâche."
fi

if [ -f "$LOG" ]; then
    previous=$(awk -F'\t' -v current="$SESSION" '$3 != current' "$LOG" | tail -n 1)
    if [ -n "$previous" ]; then
        echo "- Session précédente : $(printf '%s' "$previous" | cut -f2) ($(printf '%s' "$previous" | cut -f4)), transcript $(printf '%s' "$previous" | cut -f5)"
    fi
fi

if health=$("$ROOT/scripts/check-brain.sh" 2>&1); then
    echo "- Budgets : OK"
else
    echo "- Budgets à corriger (skill brain-consolidate) : $(printf '%s' "$health" | paste -sd ';' -)"
fi
