#!/usr/bin/env bash
# Stop: asks Claude to save its memory when work happened since STATE.md was last updated.
set -uo pipefail

INPUT=$(cat)
if [ "$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ]; then
    exit 0
fi

. "$(dirname "$0")/brain-common.sh"

ROOT=$(brain_root)
STATE="$ROOT/_brain/STATE.md"
THROTTLE_MIN="${BRAIN_STATE_THROTTLE_MIN:-20}"

[ -f "$STATE" ] || exit 0
[ -n "$(find "$STATE" -mmin "-$THROTTLE_MIN" 2>/dev/null)" ] && exit 0
[ -z "$(brain_first_change_after "$ROOT" "$STATE")" ] && exit 0

jq -n --arg minutes "$THROTTLE_MIN" '{
    decision: "block",
    reason: ("Mémoire : des fichiers ont changé depuis la dernière mise à jour de _brain/STATE.md (plus de " + $minutes + " min). Suis le skill brain-save : réécris STATE.md, ajoute une entrée au journal du jour si une étape est terminée, note toute décision dans DECISIONS.md. Termine ensuite en une ligne, sans résumé.")
}'
