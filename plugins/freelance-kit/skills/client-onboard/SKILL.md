---
name: client-onboard
description: Scaffold a freelance client workspace - folders, CLAUDE.md, time log, notes and starter templates.
disable-model-invocation: true
argument-hint: <client-name>
---
Client: $ARGUMENTS
Defaults (ask once if I keep work elsewhere): code in `~/Development/Clients/<client>/`, business records in `~/Business/`.

1. Create `~/Development/Clients/$ARGUMENTS/` and `~/Business/clients/$ARGUMENTS/` with `time.csv` (header `date,hours,task`) and `notes.md` (contacts, scope, rate, agreed AI-use tier, contract status).
2. If `~/Business/templates/` has no `proposal.md`, `contract-checklist.md` or `ai-use-policy.md`, copy them from this plugin's `templates/` folder (two levels above this skill's base directory).
3. Write `~/Development/Clients/$ARGUMENTS/CLAUDE.md` (under 30 lines): client, stack, repos, conventions, commit identity, AI-use tier, delivery checks. Ask me for anything unknown; never invent client facts.
4. For each repo cloned under the client folder: if it is TypeScript, add `.claude/settings.json` with a Stop hook running `~/.claude/hooks/ts-gate.sh`; set `git config user.email` only if the client requires its own identity.
5. Finish with the human steps still open: contract signed, AI-use tier agreed, client API key (tier 1), access granted.
