#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
npx vitest run --passWithNoTests   # parsers are tested against saved HTML fixtures, not live sites
