---
name: status-report
description: Draft a weekly client status update from git history and the time log.
disable-model-invocation: true
argument-hint: <client-name> [since YYYY-MM-DD]
---
Client and period: $ARGUMENTS (default period: last 7 days)

1. Collect `git log --since` (subject lines) from every repo in the client folder (default `~/Development/Clients/<client>/`) and the matching rows of the client time log (default `~/Business/clients/<client>/time.csv`).
2. Draft a short update: Done, In progress, Blockers / decisions needed from the client, Next week, Hours this period.
3. Plain language for a non-technical reader, under 200 words. Draft only; I send it.
