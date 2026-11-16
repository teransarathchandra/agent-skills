# Contributing

Thanks for helping improve these skills. By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

No dependencies. You need Python 3.9 or newer.

```bash
python scripts/validate_skills.py            # skills and manifests (what CI runs)
python -W error -m unittest discover -s tests
```

To try your copy in Claude Code:

```bash
claude plugin validate .
/plugin marketplace add /path/to/agent-skills
/plugin install teran-skills@teransarathchandra
```

## Project layout

| Path | What's there |
|---|---|
| `skills/<name>/SKILL.md` | One skill per folder. The folder name equals the `name` in the frontmatter |
| `skills/<name>/references/` | Longer material the skill links to, such as worked examples |
| `template/SKILL.md` | Copy this to start a new skill |
| `scripts/validate_skills.py` | The checks CI runs |
| `.claude-plugin/` | Plugin and marketplace manifests |
| `docs/` | Guides for writing and publishing skills |

## Adding or changing a skill

1. Copy `template/SKILL.md` to `skills/<your-skill>/SKILL.md`.
2. Keep to the [Agent Skills specification](https://agentskills.io/specification): `name` and `description` are required; the folder name must match `name`.
3. Start the description with **"Use when"** and say the situation that should trigger the skill. It is what the agent reads to decide whether to load it.
4. Keep `SKILL.md` under 500 lines. Move long material to `references/`.
5. Test it on a real task with a real agent before you open the PR. Write down the mistakes you saw and add them to "Mistakes to avoid".
6. Keep private data out: no real names, emails, keys, internal ticket text or company details, in the skill, in examples or in the PR. Examples must be fictional. See [docs/authoring-skills.md](docs/authoring-skills.md).
7. Add a line under `## [Unreleased]` in the [CHANGELOG](CHANGELOG.md).

## Commits and releases

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`).
- Versions follow semver. A new skill is a minor version; a change that alters a skill's output format is a major version once we pass 1.0.
- To release: move the Unreleased notes under a new `## [x.y.z] - date` heading, set the same version in `.claude-plugin/plugin.json`, and tag `vx.y.z`. CI fails if the two disagree.
