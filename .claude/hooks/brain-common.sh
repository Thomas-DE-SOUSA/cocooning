#!/usr/bin/env bash

brain_root() {
    printf '%s' "${CLAUDE_PROJECT_DIR:-$(pwd)}"
}

brain_first_change_after() {
    local root="$1" reference="$2"
    find "$root" \
        \( -name node_modules -o -name .git -o -name .turbo -o -name dist -o -name .next \
           -o -name coverage -o -name worktrees -o -path "$root/_brain" \) -prune \
        -o -type f ! -name .DS_Store -newer "$reference" -print -quit 2>/dev/null
}
