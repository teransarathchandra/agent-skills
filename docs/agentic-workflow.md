# The agentic workflow

Chat answers once. An agent loops until a check passes. This setup gives Claude Code the three things it cannot see on its own, for every project:

| Give Claude | File | Enforced by |
|---|---|---|
| A **spec**: what "done" means | `SPEC.md`, acceptance criteria as `- [ ] AC-1: ... - check: <command>` | `/kickoff` writes it with you |
| A **check**: a command that proves it | `scripts/verify.sh` | A Stop hook: Claude cannot finish while it fails |
| **Rules**: what must always or never happen | `CLAUDE.md` and hooks | Routing rules in `~/.claude/CLAUDE.md`, the kit's hooks |

## Which command when

| Situation | Use |
|---|---|
| Fuzzy idea, unsure it is worth building | A grilling skill such as `/grill-me`, to stress-test the idea |
| Clear idea, new project | `/kickoff <one-line idea>` (it reuses answers from an earlier grilling in the same conversation) |
| Big or unclear feature inside a project | Plan mode (Shift+Tab) or `superpowers:brainstorming` |
| Small clear change | A plain prompt |
| A ticket or client request | It already is the spec: build it, then `ac-reviewer` and the verify command |

## The loop

1. `cd ~/Development/Projects && claude`, then `/kickoff <idea>`. Answer about eight short questions and approve the suggested kit and stack.
2. `/kickoff` scaffolds the project, writes `SPEC.md`, `CLAUDE.md` and `scripts/verify.sh`, wires the Stop hook, installs the kit in that project only, runs the check once and commits.
3. Exit and start Claude again inside the project folder, so the kit's plugins load with a clean context.
4. Paste the kit's `/goal` line (run `/kit` to see it again). Claude builds, runs the check, fixes and repeats until it passes. The flowbar band shows `SPEC 2/6 · verify passed 1m ago`.
5. Ask for a fresh review: "use ac-reviewer to check the diff against SPEC.md", then `/code-review`. Fix only real issues.
6. `/commit-push-pr` commits, pushes and opens a draft PR.
7. `/clear`, then the next unticked acceptance criterion.

Keep context small: when the workbench band shows context above 60%, finish the current item and `/clear`.

## Walkthroughs

**Portfolio.** `/kickoff my developer portfolio, use my CV at <path> and my GitHub repos`. Name two or three portfolio sites you like when asked, so the design does not look generic. It picks `web-kit` with Astro. Build with the `/goal` line, preview with `pnpm dev`, check layouts with `/web-kit:visual-qa http://localhost:4321`, run `/web-kit:launch-checklist`, then deploy with the Vercel plugin.

**Mobile app.** `/kickoff a habit tracker app with daily check-ins and streaks`. It picks `mobile-kit` with Expo and installs the official Expo plugin in that project. Run `npx expo start` and scan the QR code with the Expo Go app to see changes live on your phone. Later, install Xcode and Maestro and use `/mobile-kit:maestro-flow <journey>` to turn each user journey into a repeatable simulator test. `/mobile-kit:store-release` explains store builds and submission.

**Website or web app.** `/kickoff a booking site for a salon with services and an appointment form`. A content site gets Astro; an app with accounts and data gets Next.js and may add the Supabase plugin. Build the database and sign-in first, then one feature per round. `/chrome` lets Claude check the deployed preview in your real browser.

## Kits

`/kickoff` reads every kit's `kit.json` and installs the matching one with `--scope project`, so a kit's skills and tools never load in unrelated sessions.

| Kit | For | Commands |
|---|---|---|
| `web-kit` | Portfolios, sites, web apps (Astro, Next.js, shadcn, Vercel) | `visual-qa`, `launch-checklist` |
| `mobile-kit` | Expo or native iOS apps, Maestro simulator tests, EAS | `maestro-flow`, `store-release` |
| `api-kit` | Hono, Zod/OpenAPI, Drizzle, Postgres (Neon), Vitest | `api-spec`, `db-migrate` |
| `ai-app-kit` | LLM features, RAG, agents with evals (promptfoo) | `eval-first`, `rag-decision`, `cost-guard` |
| `cli-kit` | CLI tools and npm packages (tsdown, Changesets, trusted publishing) | `release-package` |
| `desktop-kit` | Tauri 2 or Electron apps, signing and notarization | `desktop-release` |
| `extension-kit` | Browser extensions (WXT) and VS Code extensions | `store-submit` |
| `bot-kit` | Slack, Discord, Telegram and WhatsApp bots | `bot-smoke-test` |
| `automation-kit` | Automation and scraping (Playwright, Crawlee) | `scrape-safely` |
| `data-kit` | Analytics and ML in Python (uv, marimo, DuckDB, Polars) | `analysis-report` |
| `game-kit` | 2D/3D web games (Phaser, Three.js), Godot, 3D assets | `playtest` |
| `media-kit` | Video (Remotion), slides (Slidev), docs sites (Starlight) | `render-check` |
| `infra-kit` | Docker, Terraform, GitHub Actions, read-only cloud CLIs | `safe-plan` |
| `commerce-kit` | Shopify apps and themes, Stripe payments in test mode | `payments-safety` |
| `freelance-kit` | Client onboarding, briefs, weekly status, handover | `client-onboard`, `client-brief`, `status-report`, `handover` |
| `builder-kit` | Scaffold your own plugins and MCP servers, CI templates | `new-plugin`, `new-mcp` |

Kit commands are namespaced: `/web-kit:visual-qa`. Scaffold commands come from each tool's docs; check one the first time you use a kit.

## Mods

Mods change Claude Code's own interface. Both are small and never edit files. `flowbar` makes no network requests; `workbench` runs your `gh` CLI to read the open pull request's status from GitHub.

- **flowbar**: a band above the prompt with ticked acceptance criteria in `SPEC.md`, the last verify result and running subagents; a toast when verify fails; `/kit` shows the project's kit, plugins and `/goal` line without calling the model.
- **workbench**: a band with context-window use and the cost of the last turn and the session (a warning above 80%); `/workbench` opens a pane with the git branch, uncommitted changes, PR review and checks, and the files touched this session.

Mods run unsandboxed, as you. Read any third-party mod's code and run `claude plugin validate` before installing it.

## Token habits that matter most

- One writer per task; extra agents only for read-only work (search, review, browser checks).
- `/clear` between unrelated tasks; it is free, `/compact` is not.
- Prefer CLIs (`gh`, `vercel`, `wrangler`) to MCP servers when both exist.
- Install kits per project, not globally. The installer keeps agent teams off and runs subagents on Sonnet (Explore on Haiku).
