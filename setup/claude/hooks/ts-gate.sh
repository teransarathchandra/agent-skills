#!/usr/bin/env bash
# Stop hook for TS/Node repos: block "done" until typecheck + related tests pass.
# Wire it per repo in .claude/settings.json (/kickoff does this). Exit 2 = Claude keeps working.
in=$(cat)
dir=$(printf '%s' "$in" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("cwd",""))' 2>/dev/null)
cd "${dir:-$CLAUDE_PROJECT_DIR}" 2>/dev/null || exit 0
[ -f tsconfig.json ] || exit 0
changed=$( { git diff --name-only HEAD 2>/dev/null; git ls-files -o --exclude-standard 2>/dev/null; } | grep -E '\.(ts|tsx|mts|cts)$' )
[ -z "$changed" ] && exit 0
if ! out=$(npx --no-install tsc --noEmit 2>&1); then printf 'Typecheck failed:\n%s\n' "$(printf '%s' "$out" | head -40)" >&2; exit 2; fi
if grep -q '"vitest"' package.json 2>/dev/null; then cmd="npx --no-install vitest related --run $changed"
elif grep -q '"jest"' package.json 2>/dev/null; then cmd="npx --no-install jest --findRelatedTests --passWithNoTests $changed"
else exit 0; fi
if ! out=$($cmd 2>&1); then printf 'Related tests failed:\n%s\n' "$(printf '%s' "$out" | tail -60)" >&2; exit 2; fi
exit 0
