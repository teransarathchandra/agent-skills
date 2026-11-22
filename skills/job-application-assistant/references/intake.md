# Intake: questions with recommended answers

Collect what the next step needs before doing it, and nothing the candidate's files already show. Each question offers concrete options, marks one **(Recommended)** with a one-line reason, and always ends with a typed answer, so the candidate can answer in a few keystrokes and still say something unlisted. Never leave the candidate with an open question when the choices can be named, and never guess silently.

## Contents

- How to ask (the answer format)
- Choosing what to ask (read first, role family, branches, urgent first)
- Group 1: targets
- Group 2: sources (paths and links)
- Group 3: tool access and evidence of current work
- Group 4: work rights and logistics
- Group 5: preferences
- Group 6: privacy and storage
- Group 7: job sites, accounts and applying (asked once the CV and letter are ready)
- Group 8: layoffs (asked first when the candidate was laid off)
- Example: the first message

## How to ask

Make answering effortless:

- **Recommended first, typed answer last.** Every question lists its options with the recommended one first, marked **(Recommended: reason)**, and a last option **Other: type your own**. A path, a link or an answer you did not list goes there.
- **One word accepts the defaults.** Tell the candidate they can reply `ok` to take every recommended answer, or change only what they want: `ok, 2c, 5: ~/Documents/CV.docx`.
- **Pick-many where several apply.** Say "(pick any)" and accept `3a,c`. Mark each recommended option.
- **Few questions at a time.** Four to six per message, never more, chosen and ordered by [Choosing what to ask](#choosing-what-to-ask). Skip anything the candidate's message or files already answer.
- **Use the agent's question tool when it has one** (for example Claude Code's AskUserQuestion). It shows clickable options and adds its own free-text "Other", so the typed answer is built in. Keep to its limits: up to four questions per call and two to four options each, recommended first with "(Recommended)" in the label, and `multiSelect` for pick-many questions. Split a group across calls in order of importance.
- **Without such a tool**, send a numbered list with `a)`, `b)`, `c)` options and the reply hint at the top.
- **Facts have no recommendation.** For work rights, dates and degree titles, list the options and say "answer as it is". The honest answer is always the right one.
- **Ask for decisions, never sensitive values.** Ask whether the candidate needs sponsorship, never for a visa or passport number. Ask how to answer salary questions, never for current pay.
- **Play back, then go.** After the answers, restate the choices in one or two lines ("Targeting QA engineer roles in Sri Lanka plus remote; using your TestRail export and defect reports as evidence; A4, generic client names, files in `~/JobSearch/`") and start. Ask again mid-flow the same way when a source turns out to be missing.

## Choosing what to ask

The groups below, and the "Intake questions" of the candidate's role profile, are the question bank: every question and option comes from them. These rules choose which to ask, in what order, and which option to recommend. They only ever remove questions.

1. **Read before asking.** If the candidate gave a CV, a profile export or a portfolio link, read it before the first message; if not, the first message asks for it (question 5). Turn each fact it shows into one check line instead of a question: "From your CV: BA (Hons) Interaction Design, University of Northgate, 2018; based in Leeds; portfolio at example.com. Does that match your certificate?" Questions 6, 8, 9 and 11 are then asked only when the CV hints at something it does not settle (a degree with no title or date, a certification with no issuer) or the role profile's credential question needs it. When the message names the target country and question 2 is skipped, put the inference in the check line ("applying in Sri Lanka, where you live, not on a work visa") so a wrong guess can be corrected. The check line counts as one question.
2. **Role family first.** Infer the family from the CV's titles and work, and put it in question 1's recommended option ("**UX/UI designer, same level as now (Recommended: what your CV shows)**"); when the message already names the role ("product designer roles"), confirm it in the check line instead. The answer sets `role_family`; load `roles/<role_family>.md`, or [roles/any-role.md](roles/any-role.md) when no family fits (never force a near one). The profile's questions replace the engineering ones: its direction question is question 1, asked once; its evidence question is question 12; its public-sample question replaces question 10. Its main-strength and credential questions go into the check line when the CV shows the answer, and otherwise wait for the CV step.
3. **Branch on what is known.**

   | When | Ask | Skip |
   |---|---|---|
   | Laid off, made redundant, let go, or the role ended in a restructure | Group 8 in the first message | Questions 14 and 17: question 29 answers both |
   | Their right to stay depends on the job that ended | Question 30, before anything else | Preferences, until the plan is agreed |
   | A target country is home: they live there and are not on a temporary visa | Salary in that country's currency, when a form needs it | Questions 13 and 15 for it; no sponsorship or work-rights warnings |
   | A target country is abroad, or they live there on a work visa | Questions 13, 15 and 16 for that country | |
   | No CV | Question 5's "build from the professional profile" option, or the role profile's questions | Waiting for a CV |

4. **Personalised recommendations.** Recommend from what is known, not a fixed default: the inferred role in question 1, the person's own country in question 2, the profile's main evidence source in question 12, the paper size of the target regions in question 18. With a visa deadline, question 4 recommends applying widely this week.
5. **Urgent first.** A visa deadline (question 30) or a notice period ending soon (question 29, then reference requests while work email still works) comes before targets and preferences.
6. **Start early; ask the rest when it is needed.** After the first message's answers, play back the choices and start on the evidence; if an answer opens an urgent branch (question 30, a visa tied to the lost job), ask that first, before the play-back. Ask questions 3 and 4, and question 13 for each target country abroad or where they live on a work visa, at triage before the first search; questions 14 to 17 before the first letter or form; and Groups 5 and 6 only where the recommended default does not fit. Until then the recommended answers apply, and the play-back line names them. Two questions never default: ask question 25 (memory) before the first memory write and question 25a (privacy-notice boxes) before the first form; until the candidate answers, nothing is remembered and no box is ticked.

## Group 1: targets

| # | Question | Options (recommended first; Other always last) | Why it matters |
|---|---|---|---|
| 1 | Which roles? | **Same role and level as now, named from the CV (Recommended: the strongest evidence)**; one level up; the role profile's adjacent moves; a change to another role (name it) | Sets `role_family`, the role profile, the CV summary and which bullets lead |
| 2 | Which countries or regions? | When the candidate is not on a temporary visa where they live: **[their country], where you live, plus fully remote roles (Recommended: no visa needed, widest pool; abroad only if you want it)**; [their country] only; [their country] plus named countries abroad; I live here on a work visa. Otherwise: **the current country plus remote (Recommended)**; named countries abroad (list them) | Sets paper size, spelling, job sites and the work-rights filter. A home country adds no work-rights questions: record `needs_sponsorship: false`, `has_work_rights: true`, `lives_there: true` for it, and ask its salary in the local currency. A work visa where they live is not home: Group 4 applies, and question 30 if the job has ended |
| 3 | Which work arrangements? | **Any, flagging on-site roles that need relocation (Recommended)**; remote only; hybrid or on-site only. For a home country, on-site and hybrid roles are judged by distance from the candidate's city | Filters the search |
| 4 | How many applications? | **5 to 10 well-matched applications a week (Recommended: tailored beats volume)**; with a visa deadline, **apply widely this week (Recommended: time decides; keep each CV and letter tailored)** instead; a few dream roles only; as many as possible | Sets how much tailoring each job gets, and the weekly target in [layoff.md](layoff.md#pace-and-wellbeing) |

## Group 2: sources (paths and links)

| # | Question | Options (recommended first; Other always last) | What happens |
|---|---|---|---|
| 5 | Where is your most recent CV? | **Path to the .docx (Recommended: the cleanest text to read)**; path to a PDF; no CV, build from the professional profile | A scanned PDF cannot be read; ask for the .docx or the text |
| 6 | Where is your degree certificate? | **Path to the scan or PDF (Recommended: the title and date must match it exactly)**; type the exact title, institution and award date; no degree | Only title, institution and date are copied; never registration or certificate numbers |
| 7 | Do you want grades on the CV? | **Only if they are strong: give the transcript path (Recommended)**; no grades; always include | Weak yearly GPAs stay off; a strong final result or honours goes on |
| 8 | Where are your certifications? | **Profile link with verification URLs (Recommended)**; file paths; none | Each certification needs a name, issuer and date |
| 9 | Any publications? | **Official page URL or DOI (Recommended: metadata comes from the publisher)**; citation text; none | Title, authors, venue, year and DOI only |
| 10 | Which work can be shown publicly? | The role profile's public-sample question, for example **a portfolio link (Recommended)** for a designer or **three to five public repo URLs (Recommended)** for an engineer; none | Each listed sample (a README, a case study) is read before it is described |
| 11 | Which professional profile should match the CV? | **Public profile URL (Recommended)**; an exported PDF of it; none | Used in step 1 to find missing skills and in step 6 for profile sync |

## Group 3: tool access and evidence of current work

Evidence comes first from the evidence sources in your role profile (its "Evidence sources" section): a designer's portfolio and case studies, a QA engineer's test-management exports and defect reports, a recruiter's hiring metrics and ATS, an engineer's GitHub or GitLab account. Check what is connected before asking (a work-tracker MCP, and any tool the profile names) and offer only options that apply. Never ask for code repos or pull requests unless the role profile lists them as evidence.

**Work tracker connected (Jira or similar).** Confirm the project or board, the date range (recommended: the whole time in the current role) and that only tickets the candidate worked on are used. Then still offer the role profile's sources as extra evidence.

**No tracker, or no access to it.** Ask one pick-many question, built from the role profile's evidence question:

> No work tracker is connected. Where can I find what you worked on? Pick any, for example `12a,d`.
> a) **The profile's main source, for example "your test-management tool or an export" (Recommended: real, dated evidence)**
> b) The profile's next source, for example "an automation repo" or "your portfolio case studies"
> c) Another tracker or an export: Azure DevOps, Linear, Trello, Asana, or a Jira CSV or PDF (give the path)
> d) **Documents: performance reviews, promotion cases, release notes, praise messages (Recommended if you have them: they show results)**
> e) Connect the Jira tool first, then tell me
> f) Other: type it (for example "paste ticket titles", or "skip, I'll describe my work")

How to use each one:

- **a) and b) The role profile's sources.** Follow the profile: what to read, what is public and what stays private under an NDA. Code hosting and local repos have their commands in [roles/software-engineering.md](roles/software-engineering.md#code-hosting-commands). Describe the client generically, and never send a client's private files or code to an outside service.
- **c) Other trackers and exports.** Read only summary, status, type and dates; ignore comments and attachments.
- **d) Documents.** Take only what the candidate did and its result. Leave out colleagues' names and ratings.
- **Typed "skip" or "I'll describe it".** No bullet goes in the CV until the candidate confirms it; mark each claim "to verify" in the tracker table.

**Browser tool for step 7.** If one is connected: **use it on employer sites that allow it, the candidate logs in (Recommended)**; answer sheets only. If none is connected: **prepare an answer sheet per job and the candidate fills the forms (Recommended: works everywhere)**; install a browser tool first (for example the Playwright MCP).

**.docx tool.** If there is no docx skill and no Node.js: **install Node.js 18+ and run `npm install` in `scripts/` (Recommended)**; use a docx skill; deliver Markdown for the candidate to paste into Word (layout checks are then the candidate's job).

## Group 4: work rights and logistics

| # | Question | Options | Notes |
|---|---|---|---|
| 13 | For each target country abroad, or where you live on a visa, what is your right to work? | Citizen or permanent resident; a visa that allows work (type only); need sponsorship | A fact: "answer as it is". Never ask for document numbers. Not asked for a home country (question 2) |
| 14 | Notice period? | **The period in your contract (Recommended)**; immediate; two weeks; one month; three months | Goes in letters and screening answers. After a layoff, question 29 answers it |
| 15 | Relocation? | **Yes, for the right role, with sponsorship where needed (Recommended if targets are abroad)**; within my country only; no, remote only | Not asked when every target is home |
| 16 | Expected salary for each target country, in its currency? | **A market figure I research for the role and city, shown to you per country (Recommended: many forms require a number)**; figures you give me now; leave optional salary fields blank | One figure per country, in the answer bank; a home country's in its local currency. Never convert one country's figure into another's |
| 16a | Forms that require your current salary? | **Skip those forms, or ask me each time (Recommended)**; give it, typed per run and never stored | A decision, not a value: never write current pay to a file, memory or a subagent prompt |
| 17 | Earliest start date? | **Notice period from the offer date (Recommended)**; a fixed date | After a layoff, question 29 answers it |

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

Question 1 and the CV fill `role_family` and `experience` (keys from the role profile's "Answer-bank experience keys"); questions 2 and 29 and Groups 4 to 6 fill the rest of the answer bank (`answers.json` in the private folder) that forms are answered from: [assisted-apply.md](assisted-apply.md#the-answer-bank).

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

## Group 8: layoffs

Ask this group in the first message when the candidate says they were laid off, made redundant or let go, or that their role ended in a restructure. It asks only decisions and dates. Never ask why they were laid off or what severance they received; if they say, use it only for wording they approve and write it nowhere. Wording, references, timing and visa rules: [layoff.md](layoff.md).

| # | Question | Options | Notes |
|---|---|---|---|
| 29 | Where are you in your notice? | Still working it, until a date; on garden leave until a date; employment has ended, or notice was paid in lieu | A fact: "answer as it is". It answers the "notice period" and "available from" questions ([layoff.md](layoff.md#timing-notice-garden-leave-and-severance)), so questions 14 and 17 are skipped |
| 30 | Does your right to stay in [country] depend on the job that ended? | Yes (type the visa type only); no | Ask only when the candidate lives outside their home country on a work visa, and then first. When yes, give the official rule for that country with its source and month checked, say to confirm with a registered migration adviser or lawyer, and ask for the date on their official letter and their last day of employment: some visas have no letter and the clock starts when the job ends (for example the US H-1B grace period). Those dates live only in the private tracker ([layoff.md](layoff.md#visa-tied-to-the-lost-job)) |
| 31 | References before your work access ends? | **I draft requests to a former manager and a peer now (Recommended: people remember the details, and work email still works)**; later; no references | Do not hold work for it: when question 29 shows access is still open, put the recommended answer in the play-back line ("I'll draft reference requests first; say no to skip") |
| 32 | How should the CV and letters mention the layoff? | **The dates only, and one neutral line once the gap reaches about three months (Recommended)**; one neutral line now | Ask at the CV step, showing the wording from [layoff.md](layoff.md#explaining-the-layoff). No apology, no blame, nothing about the old employer |

## Example: the first message

A laid-off QA engineer who lives in Sri Lanka and gave a CV. The CV answers the sources questions, so the message has five questions where a fixed list would have had more, and none about code, sponsorship or work rights:

> I've read your CV. Reply `ok` to take every recommended answer, or change only what you want, for example `ok, 2c, 29: garden leave until 15 Dec`.
>
> Check: your CV says BSc (Hons) Computer Science, University of Northgate, 2017; based in Colombo; ISTQB Foundation. a) **Matches my certificates (Recommended)** b) Other: type the correction
> 1. Which roles? a) **QA engineer, same level as now (Recommended: what your CV shows)** b) Senior or lead QA c) Test automation or SDET d) Other: type it
> 2. Where? a) **Sri Lanka, where you live, plus fully remote (Recommended: no visa needed, widest pool)** b) Sri Lanka only c) Sri Lanka plus named countries abroad d) I live here on a work visa e) Other: type it
> 29. Where are you in your notice? (answer as it is) a) Still working it, until a date b) Garden leave until a date c) Employment has ended d) Other: type it
> 12. Where is the proof of your testing? (pick any) a) **Test-management tool or an export (Recommended: shows scale)** b) Defect reports and release notes c) **Performance reviews or praise messages (Recommended if you have them)** d) Other: type it
>
> Salary (in LKR) and the rest come later, when a step needs them.
