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

Write the description for the agent, not for people, in the third person. Say the trigger, then what the skill does, with the words a user would actually type ("resume", "cover letter", "visa sponsorship"). A description that only says what the skill is ("Helps with PRs") does not get loaded at the right time. Keep the skill's rules and workflow out of the description: an agent that reads a summary of the steps may follow the summary instead of loading the skill.

## Structure that works

1. **Rules first** for anything that must hold on every run (privacy, read-only, scope).
2. **Numbered steps**, each one a thing the agent can do and check.
3. **Output format** with the exact shape of the answer, and a worked example in `references/`.
4. **Mistakes to avoid**, taken from real runs.

More rules, from [Anthropic's skill-authoring guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and our own runs:

- **Ask with a recommendation.** When the skill needs an input the user has not given (a file path, a tool that is not connected), it asks with concrete options and marks one "(Recommended)" with a reason, and it says what to do when a tool is missing. See `job-application-assistant/references/intake.md`.
- **References one level deep.** Link every reference file straight from `SKILL.md`. A reference over 100 lines opens with a `## Contents` list (the validator checks this).
- **A checklist for long workflows** that the agent copies into its reply and ticks off.
- **Scripts are run, not read.** Write the command with its interpreter (`python scripts/check.py`, `node scripts/build.js`), never the bare path: some installs strip the executable bit. Scripts handle their own errors with a clear message, and every constant says why it has its value.
- **A check-fix-repeat loop** for anything with a validator: run it, fix, run again until it passes.
- **Cite sources** for facts that can change (laws, site terms, vendor behaviour), with the month they were checked.

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

### Evaluations

Write them down so every change can be re-checked. Both files are optional; the validator checks their shape when present.

- `evals/evals.json`: at least three scenarios, each `{"skills": ["<name>"], "query": "...", "files": [], "expected_behavior": ["...", "..."]}`. Each expected behaviour is something a reader can check as true or false. Cover the rules the skill exists for, especially the "never" ones.
- `evals/triggers.json`: `{"should_trigger": [...], "should_not_trigger": [...]}`, with near misses in the second list (for a job-search skill, "write a job description for our opening").

Run each scenario in a fresh session with the skill installed, and once without it: if the agent passes without the skill, that part of the skill is not earning its tokens. Try the models you expect people to use (Haiku, Sonnet, Opus); what is clear to Opus may be too thin for Haiku.
