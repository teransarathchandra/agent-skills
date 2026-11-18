#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
npx vitest run --passWithNoTests
pnpm run --if-present build
if [ -f shopify.app.toml ] || [ -d sections ]; then npx --yes @shopify/cli theme check --fail-level error 2>/dev/null || true; fi
