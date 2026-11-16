# agent-skills

[![ci](https://github.com/teransarathchandra/agent-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/teransarathchandra/agent-skills/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Agent skills for real engineering work. Each skill is a plain Markdown file that teaches an AI coding agent one job and the checks that stop it getting that job wrong. They follow the open [Agent Skills](https://agentskills.io) format, so they work in Claude Code and in other agents that read `SKILL.md`.

## Skills

| Skill | Use it when | Needs |
|---|---|---|
| [`pr-review-with-ticket-context`](skills/pr-review-with-ticket-context/SKILL.md) | You want a PR reviewed against its Jira ticket. It finds the real root cause, then gives two grids: comments on the files the PR changed, and gaps outside the PR | `git`, `gh`; best with the [Jira delivery MCP](https://github.com/teransarathchandra/jira-mcp-server) |
| [`sanitize-skill-for-public`](skills/sanitize-skill-for-public/SKILL.md) | You are about to publish a skill, prompt or notes written for private or work use. It finds private names, keys and links, rewrites them as fictional stand-ins and proves the copy is clean with a scan. It never publishes | Python 3.9+ for the bundled scanner |

More will be added here as they are tested on real work.

## Install

**Claude Code** (a plugin that updates itself):

```text
/plugin marketplace add teransarathchandra/agent-skills
/plugin install teran-skills@teransarathchandra
```

**Other agents** (copies editable files into your project):

```bash
npx skills@latest add teransarathchandra/agent-skills
```

**By hand:** copy a folder from `skills/` into your agent's skills directory (`~/.claude/skills/` for Claude Code).

## Use it

Ask in plain words. For example:

```text
Review PR 123 for ABC-456.
```

The agent loads the skill from its description, so you do not need a command. In Claude Code you can also run it by name: `/teran-skills:pr-review-with-ticket-context`.

## What these skills promise

- **Private by default.** Skills that read tickets or code tell the agent not to copy names, emails, keys or quotes anywhere. `sanitize-skill-for-public` is how skills here get cleaned before release.
- **Read-only by default.** Posting, pushing or editing needs a request from you.
- **Evidence first.** Findings are checked against the real file and line before they are reported.
- **Short and plain.** Output reads like a teammate wrote it.

## Contributing

Ideas and fixes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/authoring-skills.md](docs/authoring-skills.md). Report security problems privately: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
