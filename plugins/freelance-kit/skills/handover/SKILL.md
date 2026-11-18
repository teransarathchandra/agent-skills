---
name: handover
description: Produce the client handover pack - docs, runbook, env var names, license report, demo script.
disable-model-invocation: true
argument-hint: <repo path>
---
Repo: $ARGUMENTS

1. First run the `freelance-kit:security-reviewer` and `freelance-kit:license-scan` agents; stop if they report blocking issues.
2. Create or update: `README.md` (setup, run, test), `docs/ARCHITECTURE.md` (components, data flow, key decisions), `docs/RUNBOOK.md` (deploy, rollback, common failures), `docs/ENV.md` (variable names and purpose only, never values), `docs/LICENSES.md` (from the license-scan result) and `docs/DEMO.md` (a 5-minute demo script).
3. List anything the client must still do (rotate credentials, transfer accounts, DNS).
