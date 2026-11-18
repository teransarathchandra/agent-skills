---
name: new-plugin
description: Scaffold a new Claude Code plugin in the personal marketplace with eval cases and validation.
disable-model-invocation: true
argument-hint: <plugin-name>
---
Plugin: $ARGUMENTS (in your marketplace repo, e.g. a fork of teransarathchandra/agent-skills; ask me which repo if unclear)

1. Create `plugins/$ARGUMENTS/.claude-plugin/plugin.json` (name, description, author, license MIT; omit version). Add skills under `skills/<skill>/SKILL.md`, agents under `agents/`, hooks under `hooks/hooks.json`, MCP under `.mcp.json` only as needed. A plugin-root CLAUDE.md is not loaded, so put instructions in skills.
2. Keep descriptions specific and short (they cost context every session). Use `disable-model-invocation: true` for workflow skills that should run only on command.
3. Add an `evals/` folder with at least: one case that should trigger the skill, one that should not (use a `tool_used: Skill` grader).
4. Register it in `.claude-plugin/marketplace.json`, then run `claude plugin validate . --strict` and fix every error.
5. Never rename a published plugin; never use "Claude" in names.
