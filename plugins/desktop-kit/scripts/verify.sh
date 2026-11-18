#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
npx vitest run --passWithNoTests
pnpm run build
if [ -d src-tauri ]; then (cd src-tauri && cargo test --quiet); fi
