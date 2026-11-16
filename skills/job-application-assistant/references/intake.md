# Intake: questions with recommended answers

Collect every input before building anything. Each question offers concrete options and marks one **(Recommended)** with a one-line reason, so the candidate can answer fast and still see the trade-off. Never leave the candidate with an open question when the choices can be named, and never guess silently.

## How to ask

- **Skip what is already answered.** Read the candidate's message and any files they named first. Ask only what is still open.
- **Batch.** Send one group per message, most important group first (targets, then sources, then access, then logistics and preferences). Do not drip single questions.
- **Use the agent's structured question tool when it has one** (for example a multiple-choice prompt). Put the recommended option first and add "(Recommended)" to its label. These tools often cap a call at about four questions with two to four options each; split a group across calls in order of importance. The tool's free-text "Other" covers paths and anything unlisted.
- **Without such a tool**, send a numbered list: each question, its options as `a)`, `b)`, `c)`, the recommended one first, and invite short replies like `1a 2b 5: ~/Documents/CV.docx`.
- **Facts have no recommendation.** For work rights, dates and degree titles, list the options and say "answer as it is". The honest answer is always the right one.
- **Ask for decisions, never sensitive values.** Ask whether the candidate needs sponsorship, never for a visa or passport number. Ask how to answer salary questions, never for current pay.
- **Ask again mid-flow the same way.** When a source turns out to be missing later (a link is dead, a file will not open), stop and ask with options and a recommendation; do not paper over the gap.

## Group 1: targets

| # | Question | Options (recommended first) | Why it matters |
|---|---|---|---|
| 1 | Which roles? | **Same role and level as now (Recommended: the strongest evidence)**; one level up; a change to another role (name it) | Sets the CV summary and which bullets lead |
| 2 | Which countries or regions? | **Current country plus fully remote roles (Recommended: no visa needed, widest pool)**; current country only; named countries abroad (list them) | Sets paper size, spelling, and how hard the work-rights filter bites |
| 3 | Which work arrangements? | **Any, flagging on-site roles that need relocation (Recommended)**; remote only; hybrid or on-site only | Filters the search |
| 4 | How many applications? | **5 to 10 well-matched applications a week (Recommended: tailored beats volume)**; a few dream roles only; as many as possible | Sets how much tailoring each job gets |

## Group 2: sources (paths and links)

| # | Question | Options (recommended first) | What happens |
|---|---|---|---|
| 5 | Where is your most recent CV? | **Path to the .docx (Recommended: the cleanest text to read)**; path to a PDF; no CV, build from the professional profile | A scanned PDF cannot be read; ask for the .docx or the text |
| 6 | Where is your degree certificate? | **Path to the scan or PDF (Recommended: the title and date must match it exactly)**; type the exact title, institution and award date; no degree | Only title, institution and date are copied; never registration or certificate numbers |
| 7 | Do you want grades on the CV? | **Only if they are strong: give the transcript path (Recommended)**; no grades; always include | Weak yearly GPAs stay off; a strong final result or honours goes on |
| 8 | Where are your certifications? | **Profile link with verification URLs (Recommended)**; file paths; none | Each certification needs a name, issuer and date |
| 9 | Any publications? | **Official page URL or DOI (Recommended: metadata comes from the publisher)**; citation text; none | Title, authors, venue, year and DOI only |
| 10 | Which code can be shown? | **Public repo URLs, three to five (Recommended)**; a username to pick from; none | The README of each listed repo is read before it is described |
| 11 | Which professional profile should match the CV? | **Public profile URL (Recommended)**; an exported PDF of it; none | Used in step 1 to find missing skills and in step 6 for profile sync |

## Group 3: tool access

Check which tools are connected before asking; offer only the options that apply.

**Work tracker (Jira or similar).** Tickets are the best evidence for current work.

- Connected: confirm the project or board, the date range, and that only tickets the candidate worked on are used. Recommended range: the whole time in the current role.
- Not connected: ask

  > Your work tracker is not connected. How should I get evidence of your current work?
  > a) **Connect the tracker tool now, then tell me (Recommended: real ticket titles and dates, least effort for you)**
  > b) Export your tickets (assigned to you, current role) to CSV or PDF and give me the path
  > c) Paste ticket titles and one-line summaries
  > d) Use git history only (I will need the repo paths)
  > e) Skip it; describe your work and I will mark every claim "to verify" in the tracker table

  For b) read only summary, status, type and dates; ignore comments and attachments. For e) no bullet goes in the CV until the candidate confirms it.

**Git history.** **Local repo paths (Recommended)**; a remote URL the agent can read; none. Read commit messages and changed areas; never send code from a client's private repo to an outside service.

**Browser tool for step 7.** If one is connected: **use it, the candidate logs in (Recommended)**; or the candidate fills the forms from a prepared answer sheet. If none is connected: **prepare an answer sheet per job and the candidate fills the forms (Recommended: works everywhere)**; or install a browser tool first (for example the Playwright MCP).

**.docx tool.** If there is no docx skill and no Node.js: **install Node.js 18+ and run `npm install` in `scripts/` (Recommended)**; use a docx skill; or deliver Markdown for the candidate to paste into Word (warn that layout checks are then the candidate's job).

## Group 4: work rights and logistics

| # | Question | Options | Notes |
|---|---|---|---|
| 12 | For each target country, what is your right to work? | Citizen or permanent resident; a visa that allows work (type only); need sponsorship | A fact: "answer as it is". Never ask for document numbers |
| 13 | Notice period? | **The period in your contract (Recommended)**; immediate; two weeks; one month; three months | Goes in letters and screening answers |
| 14 | Relocation? | **Yes, for the right role, with sponsorship where needed (Recommended if targets are abroad)**; within my country only; no, remote only | |
| 15 | How should salary questions be answered? | **Market rate for the role and city, inside the ad's range when it gives one (Recommended)**; a figure you give me now; leave optional salary fields blank | Never current pay; never written to a file |
| 16 | Earliest start date? | **Notice period from the offer date (Recommended)**; a fixed date | |

## Group 5: preferences

| # | Question | Options (recommended first) |
|---|---|---|
| 17 | Paper sizes? | **Both A4 and US Letter (Recommended when targets span regions)**; A4 only; Letter only |
| 18 | How should clients be named? | **Generic descriptions such as "a global real estate platform" (Recommended: safe under most contracts)**; real names (only if the contract allows) |
| 19 | Cover letters? | **One tailored letter per job (Recommended)**; only when the ad asks; none |
| 20 | Training, workshops, commit or ticket counts on the CV? | **Leave them out (Recommended: they read as padding)**; include named items |
| 21 | Voluntary diversity (equal-opportunity) questions? | **"Prefer not to say" unless you choose otherwise (Recommended default; it is entirely your choice)**; ask me each time; use standing answers you give me |
| 22 | Forms that ask whether AI helped with the application? | **Answer truthfully: AI helped draft and you reviewed and confirmed every line (Recommended)**; ask me each time |

## Group 6: privacy and storage

| # | Question | Options (recommended first) |
|---|---|---|
| 23 | Where should working files go? | **A private folder outside any git repository, such as `~/JobSearch/` (Recommended)**; a folder you name |
| 24 | What may I remember between sessions? | **Job-search preferences only, no personal data (Recommended)**; nothing |

## Example: the first message

> Before I start, a few choices. Reply with numbers and letters, for example `1a 2a 5: ~/Documents/CV.docx`.
>
> 1. Which roles? a) **Same role and level as now (Recommended: strongest evidence)** b) One level up c) A different role (name it)
> 2. Where? a) **Current country plus fully remote (Recommended: no visa needed)** b) Current country only c) Named countries abroad
> 5. Most recent CV? a) **Path to the .docx (Recommended)** b) Path to a PDF c) No CV, build from your profile
> 6. Degree certificate? a) **Path to the scan or PDF (Recommended: the title must match it exactly)** b) Type the exact title, institution and date c) No degree
>
> Next I will ask about your work tracker and work rights.
