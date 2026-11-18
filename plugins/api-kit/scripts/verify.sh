#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
pnpm run --if-present lint
npx vitest run
if [ -f openapi.yaml ] || [ -f openapi.json ]; then npx --yes @redocly/cli@latest lint openapi.* ; fi
