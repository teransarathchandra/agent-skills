# Authoring skills

How skills in this repository are written. It follows the [Agent Skills specification](https://agentskills.io/specification) and adds a few rules of our own.

## What a skill is

A folder with a `SKILL.md`. The agent reads only the `name` and `description` at start-up (about 100 tokens per skill). It loads the full file when a task matches the description. Files in `references/` load only when the skill links to them.

## Frontmatter

| Field | Required | Rule |
|---|---|---|
| `name` | Yes | Lowercase letters, digits and single hyphens, max 64 characters, equal to the folder name |
| `description` | Yes | Max 1024 characters, one line, **starts with "Use when"** (repository rule) |
| `license` | No | `MIT` here |
| `compatibility` | No | Max 500 characters. Say what the skill needs (tools, network) |
| `metadata` | No | String key/value map, for example `author` and `version` |

Write the description for the agent, not for people. Say the trigger, then what the skill does. A description that only says what the skill is ("Helps with PRs") does not get loaded at the right time.

## Structure that works

1. **Rules first** for anything that must hold on every run (privacy, read-only, scope).
2. **Numbered steps**, each one a thing the agent can do and check.
3. **Output format** with the exact shape of the answer, and a worked example in `references/`.
4. **Mistakes to avoid**, taken from real runs.

## Before you publish

Skills written for real work often start from real incidents. Before a skill goes in this repository:

- [ ] Remove names, emails, record keys, dates and quotes from real people or tickets.
- [ ] Remove company, team, product and project names, internal URLs and ticket keys. Use `ABC-123` and fictional apps.
- [ ] Rewrite examples so they are fictional from the first line, not just renamed.
- [ ] Do not describe a specific outage or customer. Describe the pattern ("an item goes missing after save").
- [ ] Run `python scripts/validate_skills.py`. It catches email addresses and common key formats, not names. Read the diff yourself.
- [ ] Search your own notes for terms from the original incident and make sure none appear.

## Testing a skill

Run it on a real task in a fresh session and check:

- Did the agent load it when it should have, and stay out of the way when it should not?
- Did it follow the rules, especially the "never" ones?
- Is the output in the format you defined? Are the facts it cites true?

Fix the skill, not the answer. Add the failure to "Mistakes to avoid".
