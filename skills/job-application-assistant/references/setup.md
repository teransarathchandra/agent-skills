# Setup: tools for each agent

## Contents

- What each tool is for
- Check before installing
- Ask, then install (macOS, Windows, Linux)
- Connect a browser tool (Claude Code, Codex CLI, other agents)
- The bundled apply engine
- Signing in
- PDF copies of the CV
- Rolling the skill out to a team

## What each tool is for

| Tool | Needed for | Without it |
|---|---|---|
| Python 3.9+ | `scripts/ats_check.py`, `scripts/apply/triage.py` | Check the CV by reading it; triage by hand |
| Node.js 18+ | `scripts/build_letter.js`, `scripts/apply/jaa.mjs` | Write letters with a docx skill; no assisted LinkedIn mode |
| A browser tool (Playwright MCP) | Filling forms on employers' own sites | Answer sheets only |
| Playwright for Node (`scripts/apply`) | The apply engine for assisted LinkedIn mode | Answer sheets for LinkedIn |
| LibreOffice or Microsoft Word | PDF copies of the CV, page counts | Ask the candidate to export the PDF |

Install only what the candidate's choices need. Someone who wants answer sheets needs Python and Node at most.

## Check before installing

Run the checks first and report one line per tool: installed (with version) or missing.

```bash
node --version; python3 --version; soffice --version   # macOS and Linux
```

```powershell
node --version; py --version; Get-Command soffice -ErrorAction SilentlyContinue   # Windows
```

A browser tool counts as installed when the agent lists a `browser_*` or `playwright` tool. The engine counts as installed when `scripts/apply/node_modules/playwright` exists.

## Ask, then install

Never install before the candidate says yes. Ask with numbered options, the recommended one first, and say `ok` accepts it:

> I checked your machine: Node.js missing, Python 3.12 found, no browser tool, no PDF converter. Reply `ok` for the recommended option, or a number.
>
> 1. What should I install?
>    a) **Node.js LTS, the Playwright browser tool and LibreOffice (Recommended: letters, form filling and PDF copies)**
>    b) Node.js only (letters and answer sheets; you fill every form yourself)
>    c) Nothing; I'll install them myself from your list
>    d) Other: type it

| OS | Node.js LTS | Python | LibreOffice |
|---|---|---|---|
| macOS (Homebrew) | `brew install node` | `brew install python` | `brew install --cask libreoffice` |
| Windows (winget) | `winget install OpenJS.NodeJS.LTS` | `winget install Python.Python.3.12` | `winget install TheDocumentFoundation.LibreOffice` |
| Debian or Ubuntu | `sudo apt install nodejs npm` (check it is 18+) | `sudo apt install python3` | `sudo apt install libreoffice-writer` |

On Windows, open a new terminal after installing so `node` and `py` are on the PATH. `sudo` and the Windows UAC prompt need the candidate; never ask for their password.

## Connect a browser tool

The browser tool fills employer forms (Greenhouse, Lever, Workable, SmartRecruiters, Workday) in a window the candidate can watch.

**Claude Code.** Install the official Playwright plugin (`/plugin install playwright@claude-plugins-official`), or add the server: `claude mcp add playwright -- npx @playwright/mcp@latest`. Restart Claude Code.

**Codex CLI.** Run `codex mcp add playwright -- npx @playwright/mcp@latest`, or add this to `~/.codex/config.toml` (on Windows `%USERPROFILE%\.codex\config.toml`):

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

If the server does not start on Windows, use `command = "cmd"` and `args = ["/c", "npx", "@playwright/mcp@latest"]`. Restart Codex, then run `/mcp` to confirm the server is listed.

**Other agents (Gemini CLI, Cursor, GitHub Copilot, any Agent Skills client).** Add an MCP server with the same command (`npx @playwright/mcp@latest`) in that agent's MCP settings. An agent with a shell but no MCP support can still use the bundled engine below.

## The bundled apply engine

`scripts/apply/jaa.mjs` runs assisted LinkedIn mode: the opt-in gate, the daily cap, human-pace waits, the answer bank and the approval list. Install it once:

```bash
cd scripts/apply
npm install
npx playwright install chromium
```

Every command prints JSON, so any agent can read the result. `node scripts/apply/jaa.mjs --help` lists the commands. State (the opt-in, today's count, the submission log) lives in `~/.jaa`, or in `JAA_HOME` if set, never in a repository.

## Signing in

1. Start the browser in the background: `node scripts/apply/jaa.mjs serve` (add `--channel chrome` to use the installed Chrome). With the Playwright MCP, open the site's sign-in page instead.
2. Tell the candidate to sign in to each site in that window, including email or phone codes, and to reply when done.
3. The browser keeps the session in its own profile (`~/.jaa/browser`), so sign-in is needed once per site.

The agent never types, reads or stores a password, and never solves a CAPTCHA.

## PDF copies of the CV

- LibreOffice: `soffice --headless --convert-to pdf --outdir <folder> <CV.docx>`, then check the page count matches the .docx.
- Microsoft Word: ask the candidate to use File > Save As > PDF. Scripted export from Word on macOS often fails.
- Name the files the same as the .docx so the candidate can tell them apart on job sites (`Name_CV.pdf`, `Name_Resume_US_Letter.pdf`).

## Rolling the skill out to a team

For a group of colleagues (for example after a layoff), each person installs the skill in their own agent and runs it with their own accounts:

1. Install the skill: in Claude Code, `/plugin marketplace add teransarathchandra/agent-skills` then `/plugin install teran-skills@teransarathchandra`; in any Agent Skills client, `npx skills@latest add teransarathchandra/agent-skills`.
2. Start with a plain request: "Help me apply for jobs. Set up what you need first."
3. Each person keeps their own private folder, answer bank and signed-in browser. Never share an answer bank or a browser profile between people.
4. Each person chooses their own mode. One person opting in to assisted LinkedIn mode does not opt anyone else in.
