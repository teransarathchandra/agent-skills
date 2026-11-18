---
name: new-mcp
description: Scaffold a TypeScript MCP server repo ready for review, npm and the MCP Registry.
disable-model-invocation: true
argument-hint: <server-name>
---
Server: $ARGUMENTS -> `mcp-$ARGUMENTS/` in my projects folder (default `~/Development/Projects/`)

1. pnpm + TypeScript + Vitest project using the current official `@modelcontextprotocol/sdk` (check the latest version with `npm view`; pin exact versions).
2. Split read and write tools; annotate every tool with `readOnlyHint` or `destructiveHint`; put search keywords early in each tool description; cap large outputs.
3. Add `pnpm check`, a README with install snippets, `server.json` and an `mcpName` field in package.json for the MCP Registry, and copy CI from this plugin's `templates/ci/` folder (two levels above this skill's base directory).
4. Run it once with the MCP Inspector (`npx @modelcontextprotocol/inspector`) and list its tools before declaring done.
5. Remote HTTP with OAuth for anything multi-user; local stdio only for personal tools. Never ship unpinned `npx`/`uvx` launchers.
