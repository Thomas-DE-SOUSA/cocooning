#!/usr/bin/env bash
# Prints the last text exchanges of a session transcript, to recover what a forgotten save missed.
# Usage: scripts/brain-last-session.sh [transcript.jsonl] [message-count]
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
LOG="$ROOT/_brain/journal/sessions.log"
TRANSCRIPT="${1:-}"
MESSAGE_COUNT="${2:-${BRAIN_LAST_SESSION_MESSAGES:-30}}"
MAX_CHARS_PER_MESSAGE="${BRAIN_LAST_SESSION_MAX_CHARS:-2000}"

if [ -z "$TRANSCRIPT" ]; then
    if [ ! -s "$LOG" ]; then
        echo "Aucune session enregistrée dans $LOG" >&2
        exit 1
    fi
    TRANSCRIPT=$(tail -n 1 "$LOG" | cut -f5)
fi

if [ ! -f "$TRANSCRIPT" ]; then
    echo "Transcript introuvable (supprimé après cleanupPeriodDays ?) : $TRANSCRIPT" >&2
    exit 1
fi

jq -rs --argjson count "$MESSAGE_COUNT" --argjson max "$MAX_CHARS_PER_MESSAGE" '
    [ .[]
      | select(.type == "user" or .type == "assistant")
      | { type, ts: (.timestamp // ""),
          text: (if (.message.content | type) == "string" then .message.content
                 else [.message.content[]? | select(.type == "text") | .text] | join("\n") end) }
      | select(.text != "") ]
    | .[-$count:][]
    | "### \(.type) \(.ts)\n\(.text[0:$max])\n"
' "$TRANSCRIPT"
