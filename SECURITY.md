# Security policy

## Supported versions

Only the latest release gets fixes.

## Reporting a vulnerability

Please **don't open a public issue**. Report it privately through GitHub's
[security advisories](https://github.com/teransarathchandra/agent-skills/security/advisories/new)
for this repository. Include the skill name, the agent and version you used, and what happened.

You'll get an acknowledgement within a few days. Fixes are released as a new version and noted in the [CHANGELOG](CHANGELOG.md).

## Scope

Skills are instructions that an agent follows with your permissions, so a weak skill can do real harm. In scope:

- A skill that makes an agent leak private data (tickets, code, keys, personal details) to a service, a file or a comment.
- A skill that makes an agent run destructive commands, or post, push or delete without the user asking.
- A skill that can be steered by text inside the data it reads (for example a ticket or a web page) into doing something the user did not ask for.
- A secret or private detail committed to this repository.

## How the skills here protect you

- They are plain Markdown. Read a skill before you install it.
- They are read-only by default and say so. Writing, posting or pushing needs the user's request.
- Content read from tickets, pages and files is treated as data, never as instructions.
- CI scans every skill file for secrets and email addresses (`scripts/validate_skills.py`).
