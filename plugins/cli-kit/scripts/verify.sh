#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
npx vitest run --passWithNoTests
npx tsdown
npm pack --dry-run >/dev/null
BIN=$(node -e 'const p=require("./package.json");const b=p.bin;console.log(typeof b==="string"?b:(b?Object.values(b)[0]:""))')
if [ -n "$BIN" ]; then node "$BIN" --help >/dev/null; fi
