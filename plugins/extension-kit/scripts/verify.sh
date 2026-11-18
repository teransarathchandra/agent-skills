#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
if [ -f wxt.config.ts ]; then npx vitest run --passWithNoTests && npx wxt build && npx wxt zip; fi
if grep -q '"vscode"' package.json 2>/dev/null; then pnpm run --if-present compile && npx vscode-test && npx @vscode/vsce package --no-dependencies; fi
