#!/usr/bin/env bash
# SessionEnd: logs the session so the next one can find its transcript.
set -uo pipefail

INPUT=$(cat)
. "$(dirname "$0")/brain-common.sh"

LOG="$(brain_root)/_brain/journal/sessions.log"
mkdir -p "$(dirname "$LOG")"

field() {
    printf '%s' "$INPUT" | jq -r --arg key "$1" '.[$key] // "?"' 2>/dev/null || echo "?"
}

printf '%s\t%s\t%s\t%s\t%s\n' \
    "$(date +%s)" "$(date '+%Y-%m-%d %H:%M')" \
    "$(field session_id)" "$(field reason)" "$(field transcript_path)" >> "$LOG"
