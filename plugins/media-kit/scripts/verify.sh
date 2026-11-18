#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit 2>/dev/null || true
if [ -f remotion.config.ts ]; then npx remotion still src/index.ts "$(npx remotion compositions src/index.ts --quiet | head -1 | awk '{print $1}')" out/check.png; fi
pnpm run --if-present build
