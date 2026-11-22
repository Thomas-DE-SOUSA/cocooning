#!/usr/bin/env bash
# Checks that the always-loaded memory stays within budget and that the index has no dead links.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRAIN="$ROOT/_brain"

BUDGETS=(
    "CLAUDE.md:150"
    "_brain/STATE.md:60"
    "_brain/INDEX.md:120"
    "_brain/DECISIONS.md:150"
    "_brain/LESSONS.md:120"
)
AUTO_MEMORY_INDEX_BUDGET=60

problems=()

line_count() {
    wc -l < "$1" | tr -d ' '
}

check_budget() {
    local file="$1" max="$2"
    if [ ! -f "$ROOT/$file" ]; then
        problems+=("$file manquant")
        return
    fi
    local lines
    lines=$(line_count "$ROOT/$file")
    [ "$lines" -le "$max" ] || problems+=("$file : $lines/$max lignes")
}

check_index_links() {
    local index="$BRAIN/INDEX.md" target
    [ -f "$index" ] || return
    while IFS= read -r target; do
        case "$target" in http*) continue ;; esac
        [ -e "$BRAIN/$target" ] || problems+=("lien mort dans INDEX.md : $target")
    done < <(grep -oE '\]\([^)#]+' "$index" | sed 's/^](//' | sort -u)
}

check_claude_md_imports() {
    local target
    [ -f "$ROOT/CLAUDE.md" ] || return
    while IFS= read -r target; do
        [ -e "$ROOT/$target" ] || problems+=("import manquant dans CLAUDE.md : @$target")
    done < <(grep -E '^@' "$ROOT/CLAUDE.md" | sed 's/^@//')
}

check_auto_memory_index() {
    local key memory_index lines
    key=$(printf '%s' "$ROOT" | sed 's#[/.]#-#g')
    memory_index="$HOME/.claude/projects/$key/memory/MEMORY.md"
    [ -f "$memory_index" ] || return
    lines=$(line_count "$memory_index")
    [ "$lines" -le "$AUTO_MEMORY_INDEX_BUDGET" ] || problems+=("mémoire auto MEMORY.md : $lines/$AUTO_MEMORY_INDEX_BUDGET lignes")
}

for budget in "${BUDGETS[@]}"; do
    check_budget "${budget%%:*}" "${budget##*:}"
done
check_index_links
check_claude_md_imports
check_auto_memory_index

if [ "${#problems[@]}" -eq 0 ]; then
    echo "OK"
    exit 0
fi
printf '%s\n' "${problems[@]}"
exit 1
