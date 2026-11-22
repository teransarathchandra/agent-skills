# Intake: questions with recommended answers

Collect every input before building anything. Each question offers concrete options, marks one **(Recommended)** with a one-line reason, and always ends with a typed answer, so the candidate can answer in a few keystrokes and still say something unlisted. Never leave the candidate with an open question when the choices can be named, and never guess silently.

## Contents

- How to ask (the answer format)
- Group 1: targets
- Group 2: sources (paths and links)
- Group 3: tool access and evidence of current work
- Group 4: work rights and logistics
- Group 5: preferences
- Group 6: privacy and storage
- Group 7: job sites, accounts and applying (asked once the CV and letter are ready)
- Example: the first message

## How to ask

Make answering effortless:

- **Recommended first, typed answer last.** Every question lists its options with the recommended one first, marked **(Recommended: reason)**, and a last option **Other: type your own**. A path, a link or an answer you did not list goes there.
- **One word accepts the defaults.** Tell the candidate they can reply `ok` to take every recommended answer, or change only what they want: `ok, 2c, 5: ~/Documents/CV.docx`.
- **Pick-many where several apply.** Say "(pick any)" and accept `3a,c`. Mark each recommended option.
- **Few questions at a time.** Four to six per message, most important group first (targets, then sources, then access, then logistics and preferences). Skip anything the candidate's message or files already answer.
- **Use the agent's question tool when it has one** (for example Claude Code's AskUserQuestion). It shows clickable options and adds its own free-text "Other", so the typed answer is built in. Keep to its limits: up to four questions per call and two to four options each, recommended first with "(Recommended)" in the label, and `multiSelect` for pick-many questions. Split a group across calls in order of importance.
- **Without such a tool**, send a numbered list with `a)`, `b)`, `c)` options and the reply hint at the top.
- **Facts have no recommendation.** For work rights, dates and degree titles, list the options and say "answer as it is". The honest answer is always the right one.
- **Ask for decisions, never sensitive values.** Ask whether the candidate needs sponsorship, never for a visa or passport number. Ask how to answer salary questions, never for current pay.
- **Play back, then go.** After the answers, restate the choices in one or two lines ("Targeting senior .NET roles in Australia plus remote; using your GitHub PRs and reviews as evidence") and start. Ask again mid-flow the same way when a source turns out to be missing.

## Group 1: targets

| # | Question | Options (recommended first; Other always last) | Why it matters |
|---|---|---|---|
| 1 | Which roles? | **Same role and level as now (Recommended: the strongest evidence)**; one level up; a change to another role (name it) | Sets the CV summary and which bullets lead |
| 2 | Which countries or regions? | **Current country plus fully remote roles (Recommended: no visa needed, widest pool)**; current country only; named countries abroad (list them) | Sets paper size, spelling, job sites and how hard the work-rights filter bites |
| 3 | Which work arrangements? | **Any, flagging on-site roles that need relocation (Recommended)**; remote only; hybrid or on-site only | Filters the search |
| 4 | How many applications? | **5 to 10 well-matched applications a week (Recommended: tailored beats volume)**; a few dream roles only; as many as possible | Sets how much tailoring each job gets |

## Group 2: sources (paths and links)

| # | Question | Options (recommended first; Other always last) | What happens |
|---|---|---|---|
| 5 | Where is your most recent CV? | **Path to the .docx (Recommended: the cleanest text to read)**; path to a PDF; no CV, build from the professional profile | A scanned PDF cannot be read; ask for the .docx or the text |
| 6 | Where is your degree certificate? | **Path to the scan or PDF (Recommended: the title and date must match it exactly)**; type the exact title, institution and award date; no degree | Only title, institution and date are copied; never registration or certificate numbers |
| 7 | Do you want grades on the CV? | **Only if they are strong: give the transcript path (Recommended)**; no grades; always include | Weak yearly GPAs stay off; a strong final result or honours goes on |
| 8 | Where are your certifications? | **Profile link with verification URLs (Recommended)**; file paths; none | Each certification needs a name, issuer and date |
| 9 | Any publications? | **Official page URL or DOI (Recommended: metadata comes from the publisher)**; citation text; none | Title, authors, venue, year and DOI only |
| 10 | Which code can be shown publicly? | **Public repo URLs, three to five (Recommended)**; a username to pick from; none | The README of each listed repo is read before it is described |
| 11 | Which professional profile should match the CV? | **Public profile URL (Recommended)**; an exported PDF of it; none | Used in step 1 to find missing skills and in step 6 for profile sync |

## Group 3: tool access and evidence of current work

Check what is connected before asking (a work-tracker MCP, `gh auth status`, a GitLab or Bitbucket tool) and offer only options that apply.

**Work tracker connected (Jira or similar).** Confirm the project or board, the date range (recommended: the whole time in the current role) and that only tickets the candidate worked on are used. Then still offer the code-hosting sources below as extra evidence.

**No tracker, or no access to it.** Ask one pick-many question:

> No work tracker is connected. Where can I find what you worked on? Pick any, for example `12a,d`.
> a) **Your GitHub, GitLab or Bitbucket account: pull requests you wrote, reviews you gave, issues and commits (Recommended: real, dated evidence)**
> b) Local copies of your work repos: commit history only (give the paths)
> c) Another tracker or an export: Azure DevOps, Linear, Trello, Asana, or a Jira CSV or PDF (give the path)
> d) **Documents: performance reviews, promotion cases, release notes, praise messages (Recommended if you have them: they show results)**
> e) Connect the Jira tool first, then tell me
> f) Other: type it (for example "paste ticket titles", or "skip, I'll describe my work")

How to use each one:

- **a) Code hosting.** Check which account `gh auth status` shows; for a work account that is not the default, pass `GH_TOKEN=$(gh auth token --user <name>)` on each command instead of switching accounts. Pull the candidate's own work for the date range:
  ```bash
  gh search prs --author @me --merged --created ">=2024-01-01" --json title,repository,createdAt,url --limit 200
  gh search prs --reviewed-by @me --created ">=2024-01-01" --json title,repository,createdAt --limit 200
  gh search issues --author @me --created ">=2024-01-01" --json title,repository,createdAt --limit 100
  gh search commits --author <login> --committer-date ">=2024-01-01" --json repository,commit --limit 200
  ```
  Private organisation repos appear only when the account can see them. Group the results by product area and read the PR descriptions for scope and results. Drop ticket keys and counts from anything that goes on the CV, and describe the client generically.
- **b) Local repos.** `git log --author="<email>" --since="2 years ago" --date=short --pretty=format:'%ad %s'` in each path. Read messages and changed areas; never send code from a client's private repo to an outside service.
- **c) Other trackers and exports.** Read only summary, status, type and dates; ignore comments and attachments.
- **d) Documents.** Take only what the candidate did and its result. Leave out colleagues' names and ratings.
- **Typed "skip" or "I'll describe it".** No bullet goes in the CV until the candidate confirms it; mark each claim "to verify" in the tracker table.

**Browser tool for step 7.** If one is connected: **use it on employer sites that allow it, the candidate logs in (Recommended)**; answer sheets only. If none is connected: **prepare an answer sheet per job and the candidate fills the forms (Recommended: works everywhere)**; install a browser tool first (for example the Playwright MCP).

**.docx tool.** If there is no docx skill and no Node.js: **install Node.js 18+ and run `npm install` in `scripts/` (Recommended)**; use a docx skill; deliver Markdown for the candidate to paste into Word (layout checks are then the candidate's job).

## Group 4: work rights and logistics

| # | Question | Options | Notes |
|---|---|---|---|
| 13 | For each target country, what is your right to work? | Citizen or permanent resident; a visa that allows work (type only); need sponsorship | A fact: "answer as it is". Never ask for document numbers |
| 14 | Notice period? | **The period in your contract (Recommended)**; immediate; two weeks; one month; three months | Goes in letters and screening answers |
| 15 | Relocation? | **Yes, for the right role, with sponsorship where needed (Recommended if targets are abroad)**; within my country only; no, remote only | |
| 16 | Expected salary for each target country, in its currency? | **A market figure I research for the role and city, shown to you per country (Recommended: many forms require a number)**; figures you give me now; leave optional salary fields blank | One figure per country, in the answer bank. Never convert one country's figure into another's |
| 16a | Forms that require your current salary? | **Skip those forms, or ask me each time (Recommended)**; give it, typed per run and never stored | A decision, not a value: never write current pay to a file, memory or a subagent prompt |
| 17 | Earliest start date? | **Notice period from the offer date (Recommended)**; a fixed date | |

## Group 5: preferences

| # | Question | Options (recommended first; Other always last) |
|---|---|---|
| 18 | Paper sizes? | **Both A4 and US Letter (Recommended when targets span regions)**; A4 only; Letter only |
| 19 | How should clients be named? | **Generic descriptions such as "a global real estate platform" (Recommended: safe under most contracts)**; real names (only if the contract allows) |
| 20 | Cover letters? | **One tailored letter per job (Recommended)**; only when the ad asks; none |
| 21 | Training, workshops, commit or ticket counts on the CV? | **Leave them out (Recommended: they read as padding)**; include named items |
| 22 | Voluntary diversity (equal-opportunity) questions? | **"Prefer not to say" unless you choose otherwise (Recommended default; it is entirely your choice)**; ask me each time; use standing answers you give me |
| 23 | Forms that ask whether AI helped with the application? | **Answer truthfully: AI helped draft and you reviewed and confirmed every line (Recommended)**; ask me each time |

## Group 6: privacy and storage

| # | Question | Options (recommended first; Other always last) |
|---|---|---|
| 24 | Where should working files go? | **A private folder outside any git repository, such as `~/JobSearch/` (Recommended)**; a folder you name |
| 25 | What may I remember between sessions? | **Job-search preferences only, no personal data (Recommended)**; nothing |
| 25a | Required privacy-notice checkboxes on application forms? | **Tick them for you once you have read one example notice (Recommended: forms cannot be sent without them)**; leave them for you | Marketing, texts, WhatsApp, talent pools and "follow company" stay off unless you say otherwise |

Groups 4 to 6 fill the answer bank (`answers.json` in the private folder) that forms are answered from: [assisted-apply.md](assisted-apply.md#the-answer-bank).

## Group 7: job sites, accounts and applying

Ask this once the first CV and letter pass their checks, before step 6. Offer the sites for the candidate's regions from [job-search-and-applications.md](job-search-and-applications.md#job-sites-by-region).

> Your CV and letter are ready. Three quick choices, or reply `ok` for the recommended ones.
>
> 26. Where should we apply? (pick any)
>     a) **Employers' own careers pages (Recommended: no middleman, fewest scams)**
>     b) **Seek (Recommended for Australia and New Zealand)**
>     c) **LinkedIn (Recommended everywhere)**
>     d) Indeed
>     e) Other: type a site
>
> 27. Accounts on those sites?
>     a) **You create any you don't have, with my setup sheet: what to put in each profile field, which CV to upload, which visibility settings to pick (Recommended: takes about ten minutes per site)**
>     b) You already have them all
>     c) Other: type it
>
> 28. How should we apply?
>     a) **I fill each form on employers' own sites in your signed-in browser and stop at the review page; LinkedIn, Seek and Indeed get answer sheets you click through yourself; you approve each batch before I submit anything (Recommended: no account risk)**
>     b) As (a), and on LinkedIn I also fill Easy Apply forms for you at a human pace, at most 15 a day, after you read the account-risk warning and opt in
>     c) Answer sheets only; you do all the clicking and submitting
>     d) Other: type it

Say plainly why (a) is recommended: LinkedIn, Seek and Indeed forbid bots and automated tools in their terms, and accounts that use them can be restricted (sources in [job-search-and-applications.md](job-search-and-applications.md#site-rules-on-automation)). If the candidate picks (b), show the full opt-in warning from [assisted-apply.md](assisted-apply.md#the-linkedin-opt-in) and record the opt-in only after they confirm it. Passwords, email or phone verification and identity checks always stay with the candidate. On an employer's own site whose terms allow it, the agent may fill a sign-up form except the password, then the candidate verifies and continues.

Before installing anything these choices need, check what is there and ask: [setup.md](setup.md).

## Example: the first message

> Before I start, a few choices. Reply `ok` to take every recommended answer, or change only what you want, for example `ok, 2c, 5: ~/Documents/CV.docx`.
>
> 1. Which roles? a) **Same role and level as now (Recommended: strongest evidence)** b) One level up c) Other: type it
> 2. Where? a) **Current country plus fully remote (Recommended: no visa needed)** b) Current country only c) Other: type the countries
> 5. Most recent CV? a) **Path to the .docx (Recommended)** b) Path to a PDF c) Other: type a path or "none"
> 6. Degree certificate? a) **Path to the scan or PDF (Recommended: the title must match it exactly)** b) Type the exact title, institution and date c) Other: type it
> 12. Your work tracker is not connected. Where can I find what you worked on? (pick any) a) **Your GitHub or GitLab pull requests, reviews and commits (Recommended)** b) Local repo paths c) A tracker export d) **Performance reviews or release notes (Recommended if you have them)** e) Other: type it
>
> Next I will ask about work rights and preferences.
