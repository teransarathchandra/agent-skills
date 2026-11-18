# Setting up the agentic workflow (instructions for AI agents)

A person pasted this repository and asked you to set it up. Follow these steps in order. Do not skip the dry run or the confirmation.

## 1. Get the repository

If you are not already inside a clone, clone it to a stable place the person can keep:

```bash
git clone https://github.com/teransarathchandra/agent-skills ~/agent-skills
cd ~/agent-skills
```

If a clone already exists there, `git pull` it instead.

## 2. Check prerequisites

Run these and report anything missing, with the install command for their OS:

| Needs | Check | Why |
|---|---|---|
| Claude Code | `claude --version` | Plugins, skills and agents are installed through it |
| git | `git --version` | Clone and the global gitignore |
| python3 | `python3 --version` | The installer edits JSON safely with it |
| Node.js 20+ | `node --version` | Kits scaffold JavaScript projects; mods need nothing extra |

Homebrew (`brew`) is only needed for the optional tools on macOS.

## 3. Ask which profile to install

Ask one question, with these choices (recommend the second):

1. **minimal**: the core workflow only. `/kickoff`, `/commit-push-pr`, the `Explore`, `ac-reviewer` and `browser-qa` agents, the TypeScript check hook, token-saving routing rules and safe settings, plus the `flowbar` and `workbench` mods.
2. **recommended**: minimal plus `freelance-kit` and `builder-kit`, plus the official `superpowers`, `frontend-design`, `playwright` and `typescript-lsp` plugins.
3. **full**: recommended plus `plugin-dev`, `mcp-server-dev`, `agent-sdk-dev`, the `cc-safety-net` command guard, and CLI tools (Ghostty, pnpm, gh, chezmoi, the ccstatusline status line).

Then ask whether to add the CLI tools (`--with-tools`) if they chose minimal or recommended.

Project kits (web, mobile, API, AI app, CLI, desktop, extension, bot, automation, data, game, media, infra, commerce) are never installed globally. `/kickoff` installs the right one inside each new project.

## 4. Show the plan, then install

```bash
bash setup/install.sh --profile <profile> [--with-tools] --dry-run
```

Show the person the output in plain words: which files it adds or updates (it backs up anything it replaces), which settings it sets (only when unset), and which plugins it installs. Wait for an explicit yes. Then run the same command with `--yes` instead of `--dry-run`:

```bash
bash setup/install.sh --profile <profile> [--with-tools] --yes
```

## 5. Verify and hand over

```bash
bash setup/install.sh --check
```

Then tell the person:

- Restart Claude Code so the new plugins, mods, agents and skills load.
- Start a project with `cd <projects folder> && claude`, then `/kickoff <one-line idea>`.
- The full guide is [docs/agentic-workflow.md](docs/agentic-workflow.md).
- To undo everything: `bash setup/uninstall.sh` (files they edited after installing are kept).

## Rules while doing this

- Never overwrite a file without the installer's backup; never edit the person's settings by hand.
- If the installer warns that agent teams are on, explain the token cost and let the person decide.
- If any step fails, stop and report the exact error. Do not improvise a manual install.
