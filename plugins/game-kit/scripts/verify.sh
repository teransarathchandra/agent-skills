#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
npx vitest run --passWithNoTests   # game logic (rules, scoring, state) lives in pure modules with tests
pnpm run build
