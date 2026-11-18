#!/usr/bin/env bash
set -euo pipefail
if [ -d infra ]; then (cd infra && terraform fmt -check -recursive && terraform validate); fi
if [ -f Dockerfile ]; then docker build -q -t verify-check . >/dev/null; fi
if ls .github/workflows/*.yml >/dev/null 2>&1 && command -v actionlint >/dev/null; then actionlint; fi
