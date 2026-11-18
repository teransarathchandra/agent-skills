---
name: kickoff
description: Start any new project the agentic way - interview, spec, scaffold, verification loop and the right kit installed only in that project.
disable-model-invocation: true
argument-hint: <one-line idea>
---
Idea: $ARGUMENTS

**Find the kits.** Read `~/.claude/plugins/known_marketplaces.json` (or `$CLAUDE_CONFIG_DIR/plugins/...`), take the `installLocation` of the `teransarathchandra` marketplace and list `<installLocation>/plugins/*/kit.json`. Each kit has `types`, `stack`, `scaffold`, `plugins`, optional `requires`/`mcp`/`optional`, a `goal` line, and `scripts/verify.sh` beside it. If the marketplace is missing, tell me to run the agent-skills installer first.

0. **Reuse earlier thinking**: if this conversation already contains a grill-me, grilling or brainstorming session about this idea, or I point to a notes/spec file, take the answers from there and only ask what is still missing. Never re-ask a settled question.
1. **Interview** (one question at a time, multiple choice where possible, max ~8): what it is and who it's for; the one-sentence success test; must-have features; deadline; deploy target; secrets/accounts needed; personal or client work and where to create it (default `~/Development/Projects/<name>`, client work `~/Development/Clients/<client>/<name>`); repo name. Stop as soon as you could write the spec.
2. **Classify**: match the project to the kit whose `types` fit (web, mobile, api, ai-app, cli/npm package, desktop, browser/VS Code extension, bot, automation/scraper, data/ML, game/3D, video/slides/docs, infra, Shopify/Stripe). Combine kits when needed (e.g. ai-app-kit + web-kit). If nothing fits, say so and use the closest kit plus a plain verify script. Tell me the choice and the kit's `stack` in one short paragraph; wait for OK.
3. **Scaffold** in the new folder with the kit's `scaffold` command, then `git init` (if the scaffolder didn't).
4. **Write files**:
   - `SPEC.md`: goal, users, non-goals, then acceptance criteria as a checklist, one per line: `- [ ] AC-1: <behaviour> - check: <runnable command>`; then edge cases and open questions.
   - `CLAUDE.md` (under 60 lines): stack, the single verify command `bash scripts/verify.sh`, definition of done (includes: tick `- [x]` on an AC in SPEC.md only after its check passes), forbidden actions, conventions. No file-layout descriptions.
   - `AGENTS.md` containing `See CLAUDE.md.` for other agents.
   - Copy the kit's `scripts/verify.sh`, and the `verify.yml` CI template from the `builder-kit` plugin's `templates/ci/` to `.github/workflows/verify.yml`.
5. **Wire verification**: write `.claude/settings.json` with a Stop hook - TypeScript projects use `~/.claude/hooks/ts-gate.sh`, others `bash scripts/verify.sh`:
   `{"hooks":{"Stop":[{"hooks":[{"type":"command","command":"<cmd>","timeout":300}]}]}}`
6. **Install the kit only here**: from the project folder run `claude plugin install <kit>@teransarathchandra --scope project`, then each plugin in the kit's `plugins` list with `--scope project`. Add any `mcp` entries with `--scope project`. If something in `requires` is missing (Xcode, Maestro, accounts), list the exact install steps instead of guessing.
7. **Finish**: run `bash scripts/verify.sh` once on the empty scaffold and fix it until green; commit ("Scaffold <name> with kickoff"). Then tell me to restart Claude in the project folder (new plugins load on a new session) and paste the kit's `/goal` line, building one acceptance criterion at a time. Mention `ac-reviewer` + `/code-review` before each merge.
