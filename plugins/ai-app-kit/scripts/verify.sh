#!/usr/bin/env bash
set -euo pipefail
npx tsc --noEmit
npx vitest run --passWithNoTests
# Cheap eval subset locally; the full set runs in CI. Needs ANTHROPIC_API_KEY in the environment (never committed).
if [ -f evals/promptfooconfig.yaml ] && [ -n "${ANTHROPIC_API_KEY:-}" ]; then npx promptfoo@latest eval -c evals/promptfooconfig.yaml --filter-first-n 10; fi
