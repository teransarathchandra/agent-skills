# Job application assistant 0.5.0: every role, layoff situations, adaptive intake

Status: draft for approval. Piece 1 of 5 in the next phase (then: job sources and sponsor registers; referrals and networking; a tracker that scales; interviews and offers).

## Intent

The maintainer's company had a large layoff. The skill should help each laid-off colleague, and job seekers in general, land a good job, whatever their role. Version 0.4.0 quietly assumes a software engineer seeking visa sponsorship abroad: intake asks for public repos and pull requests, the CV summary asks for "the core stack", the answer bank stores years per technology, and triage scores stack matches. A QA engineer, business analyst, designer, recruiter or accountant gets a worse experience or wrong advice.

This version makes the person's role family and situation the first things the skill learns, and shapes every later step from them.

## Goals

1. **Any role, any market.** People apply at home, abroad, or both at once; the skill handles each target country on its own terms.
2. **Any role.** Role profiles for 16 families, plus a fallback that builds a profile for any other role on the fly.
3. **Layoff situations.** A new intake group and guidance: explaining the layoff, references and the old employer, notice/garden leave/severance timing, and visa grace periods for people whose visa depended on the lost job.
4. **Adaptive intake.** The agent reads what it has before asking, branches on answers, personalises the recommended option from what it knows, and puts urgent items first. It runs on whatever subscription the person's agent already uses (Claude Code, Codex, others); no API key or extra model calls.
5. **Role-neutral data and scripts.** The answer bank, form filler and triage work for any role with no per-role code.

## Non-goals

- Country-specific unemployment benefits or welfare claims (too varied to keep accurate).
- Legal or immigration advice. Visa content gives the official rule with its source and says to confirm with an adviser.
- The other four pieces of the next phase (job sources, referrals, tracker, interviews and offers). They get their own designs.
- New automation sites or changes to the LinkedIn opt-in and batch-approval rules from 0.4.0.

## Anti-goals (a failure even if it technically works)

- A non-engineer is still asked for GitHub repos or years of TypeScript.
- Someone applying in their own country is asked about sponsorship, warned about work-rights clauses, or steered to apply abroad.
- Intake feels longer than 0.4.0. Adaptive branching must remove questions, not add them; `ok` still accepts every recommended answer.
- A role profile invents norms ("designers always need a 12-page portfolio") with no source or reasoning.
- The layoff is framed with apology or blame, or the agent writes negative things about the old employer.
- A visa deadline is stated as certain without its official source, or the agent advises on staying after a grace period ends.
- Private data from intake ends up where it should not: severance amounts and the person's own account of why they were laid off are never written anywhere; a visa or grace-period deadline date may sit only in the private working folder (outside any git repository), never in memory, subagent prompts, the skill's files or outside services.

## Constraints

- Agent Skills format and repository rules: `SKILL.md` body under 500 lines, references one level deep and linked from `SKILL.md`, a `## Contents` list for any reference over 100 lines, description starting "Use when" and at most 1024 characters, scripts run through their interpreter.
- The validator, Python tests and Node tests must pass (`python scripts/validate_skills.py`, `python -W error -m unittest discover -s tests`, `node --test tests/*.test.js`).
- All examples fictional (`AGENTS.md`).
- Facts that change (visa rules, certification bodies) cite official sources with the month checked.
- Backward compatible: a 0.4.0 answer bank (`years.skills`) keeps working.

## Approaches considered

| Approach | Trade-offs | Decision |
|---|---|---|
| **A. One reference file per role family** (`references/roles/<family>.md`), adaptive rules in `intake.md`, a layoff reference, role-neutral answer bank | The agent loads only the profile it needs; 17 files to keep accurate | **Chosen** by the maintainer, widened to cover as many roles as possible |
| B. One `roles.md` with a section per family | Fewer files, easy to compare; about 1,500 lines loaded to use one section, against the repo's lean-context rules | Rejected |
| C. A separate skill per role family | Duplicates the shared workflow many times; near-identical skills compete to trigger | Rejected early |

## Design

### Role families and profiles

Files in `skills/job-application-assistant/references/roles/`:

| File | Covers |
|---|---|
| `software-engineering.md` | Web, mobile, back end, full stack, embedded |
| `qa-testing.md` | Manual and automation testing, SDET, performance testing |
| `devops-cloud.md` | DevOps, cloud, SRE, platform, infrastructure |
| `data-analytics.md` | Data analysis, BI, data engineering, data science, ML |
| `cybersecurity.md` | Security engineering, SOC, GRC, penetration testing |
| `technical-writing.md` | Documentation, API docs, content design |
| `product-management.md` | Product manager, product owner |
| `project-delivery.md` | Project and delivery management, Scrum Master, programme management |
| `business-analysis.md` | Business and systems analysis |
| `ux-ui-design.md` | UX, UI, product and interaction design, research |
| `it-customer-support.md` | Help desk, IT support, customer and technical support, customer success |
| `hr-recruiting.md` | HR generalist, talent acquisition, people operations |
| `sales-account-management.md` | Sales, business development, account management, pre-sales |
| `marketing.md` | Digital, content, product and growth marketing |
| `finance-accounting.md` | Accounting, finance, payroll, FP&A |
| `operations-admin.md` | Operations, office and executive administration, procurement |
| `any-role.md` | Fallback: how to build a profile for any other role |

Every profile has the same sections, so the agent and reviewers know where to look:

1. **Titles and adjacent roles**: common titles, and realistic moves for someone laid off (for example QA to SDET, support to customer success, BA to product owner).
2. **Evidence sources**: where proof of the work lives (QA: test management tools, defect reports, automation repos; design: portfolio, Figma files, case studies; BA: requirement documents, process maps; recruiting: hiring metrics; sales: quota attainment and CRM reports; finance: close timelines, audit results). Include what can be shown publicly and what stays private under an NDA.
3. **Intake questions for this family**: three to six, each with options and a recommended answer, in the 0.4.0 format.
4. **CV shape**: section order, what the summary leads with, what a strong bullet looks like, with two or three fictional examples.
5. **Keywords and credentials**: where ad keywords come from, and the certifications employers recognise (for example ISTQB, CBAP, PMP, PSM, CISSP, CPA, ACCA, CIPD), naming the issuing body. No claims that a credential is required unless ads show it.
6. **Portfolio or work samples**: whether one is expected, and what makes a good one.
7. **Screening questions**: the ones ads in this family often ask, and how to answer them truthfully from the answer bank.
8. **Answer-bank `experience` keys**: the tools, methods and credentials to collect (QA: Selenium, Playwright, JMeter, ISTQB; HR: Workday, Greenhouse, CIPD).
9. **Mistakes to avoid** for this family.

Target 60 to 100 lines per profile; one over 100 lines needs a `## Contents` list. `any-role.md` tells the agent to collect the person's title, five recent real ads for that title in the target countries, and their evidence, then fill the same nine sections for that session (in the private folder, not the skill).

### Layoff situations

New file `references/layoff.md`, plus a new intake group:

- **Explaining the layoff**: one honest, neutral line for the CV (none is needed for a recent end date), a letter sentence, and a 20-second interview answer. No apology, no blame, nothing negative about the old employer.
- **References and the old employer**: who to ask (a manager, a peer, a client contact if the contract allows), asking for references or recommendations before access ends, saving one's own work evidence before accounts close (only what the person is entitled to keep), and what an NDA allows to be said about client work.
- **Timing**: notice period, garden leave, severance and the earliest start date, and how each answers the "notice period" and "available from" form questions. Severance amounts are never stored.
- **Visa tied to the lost job**: for each target or current country, the official rule for how long the person may stay after the job ends and what they may do in that time, with the source and month checked, and "confirm with a registered migration adviser or lawyer". When a deadline applies, the search plan changes: apply widely now, prioritise employers known to sponsor, and keep a dated countdown in the private tracker. Countries to cover first: the US, UK, Canada, Australia, New Zealand, Germany, the Netherlands, Ireland, the UAE and Singapore; the builder verifies each figure from official sources.
- **Pace and wellbeing**: a weekly plan with a realistic application target, and a short note that silence and rejection are normal. No counselling.

### Adaptive intake

Changes to `intake.md` and step 0 of `SKILL.md`:

1. **Read before asking.** Ask for the CV (or profile) first and read it. Then ask only what it leaves open, and turn known facts into confirmations ("Your CV says BSc (Hons) Computer Science, University of Northgate, 2017. Does that match your certificate?").
2. **Role family first.** Infer it from the CV and confirm it as the first question, with the inferred family recommended. Then load that family's profile and ask its questions instead of the engineering-only ones (repos, pull requests).
3. **Branch on answers**: laid off leads to the layoff group; a visa tied to the lost job leads to the grace-period questions first; each target country leads to its work-rights, salary and paper-size questions; no CV leads to building one from the profile or from answers.
4. **Personalised recommendations.** The recommended option comes from what is known (location, targets, deadline, role), not a fixed default. With a visa deadline, "apply widely this week" replaces "5 to 10 well-matched applications a week".
5. **Urgent first.** A visa deadline or a notice period ending soon is asked about and planned for before preferences.
6. **Still short.** Four to six questions per message, `ok` accepts every recommended answer, and the play-back line before starting stays.

The question bank in `intake.md` stays the source of every question and option; the new text is the rules for selection, order and personalisation.

### Home-country and mixed searches

Many people, especially soon after a layoff, apply in the country where they live, alone or alongside roles abroad. Each target country is handled on its own terms:

- **Intake.** The targets question offers the person's own country first when they are not on a temporary visa there (recommended: own country plus remote roles, and abroad only if they want it). Choosing it adds no work-rights questions for that country: the answer bank records `has_work_rights: true`, `needs_sponsorship: false`, `lives_there: true`, and the salary is asked in the local currency.
- **Someone on a work visa in the country they live in** is not "home": their right to stay depends on a job, so the visa questions and the grace-period guidance apply (see Layoff situations).
- **Triage.** For a home country, the work-rights and residence rules do not drop ads (`triage.py` already skips them when `needs_sponsorship` is false and `lives_there` is true; tests confirm it). Location and commute matter instead: on-site and hybrid ads are judged by distance from the person's city, not by relocation.
- **CV and letter.** The CV follows the home country's conventions from the region table, with no relocation or "open to sponsorship" line; letters drop the logistics sentence about visas. A person applying at home and abroad gets one CV version per paper size and region, as today.
- **Job sites and conventions.** Add Sri Lanka to the region tables in `ats-cv.md` (paper size, spelling, personal details: leave out the NIC number always, and date of birth, religion and marital status that older local templates include) and `job-search-and-applications.md` (local sites, each with its terms checked before automation is offered). The full widening of job sources by country is piece 2.
- **Answer bank.** No new fields; the per-country fields from 0.4.0 cover it. The example banks show one home-country entry.
- **Eval.** A laid-off person in their own country applying only locally: no sponsorship questions, local salary currency, local sites recommended, no ads dropped for work-rights clauses.

### Role-neutral answer bank and scripts

- `answers.json` gains `role_family` and an `experience` map: `{ "total_years": 5, "items": { "<tool, method or credential>": <years or true> }, "none": [...] }`. The old `years.total`, `years.skills` and `years.none` keep working: the scripts read `experience` first and fall back to `years`.
- `scripts/apply/lib/answers.mjs`: years questions match any key in `experience.items` (not only the built-in technology aliases); yes/no questions about a credential ("Do you hold ISTQB?") answer from `items` when the value is `true` or `false`, and otherwise are asked.
- `scripts/apply/triage.py`: the stack score uses the candidate's own `experience` keys, so it works for any role; the years and work-rights rules are unchanged.
- `assets/answers.example.json` is updated, and a second fictional example for a non-engineering role is added (for example a QA engineer).

### SKILL.md and other references

- `SKILL.md`: the description adds role and layoff triggers (QA, business analyst, designer, recruiter, laid off, redundancy, visa grace period) within 1024 characters; step 0 describes adaptive intake and loading the role profile; step 1 points evidence at the role profile; mistakes to avoid gain the anti-goals above. Version 0.5.0.
- `ats-cv.md`: "the core stack" becomes "the core skills for the role", with role-neutral wording and a pointer to the role profile for keywords and section order.
- `cover-letters.md` and `interview-prep.md`: a pointer to the layoff wording and the role profile; their full overhaul belongs to piece 5.

### Tests and evals

- Unit tests: `experience` lookups and the `years` fallback in `tests/apply_answers.test.js`; role-neutral stack scoring in `tests/test_apply_triage.py`.
- New eval scenarios (baseline with 0.4.0 first, then with 0.5.0), at least: a QA engineer laid off with no GitHub; a recruiter with no CV, only a profile; a person on a work visa whose job ended last week; a designer whose CV already answers most intake questions (checks that intake asks less); a role outside the 16 families (checks the fallback).
- Triggers: phrases for non-engineering roles and layoffs.

## Settled after the builder check

1. **Deadline dates.** A grace-period deadline may be stored in the private folder's tracker (it drives the countdown and search plan), like the CV itself. It never goes into memory, subagent prompts or outside services. Severance amounts and the person's reasons for the layoff are never stored; only the CV and letter wording they approve is kept. `answers.json` holds no visa data beyond the 0.4.0 per-country `needs_sponsorship` and `has_work_rights` fields.
2. **`experience` and `years` together.** Merge per key: `experience.items` wins where both name the same item, and keys only in `years.skills` still count (so "Java" in an old bank keeps working). `experience.total_years` wins over `years.total`; `none` lists are combined. An unanswered credential question in assisted apply works as any uncovered question does today: the result is `needs-input`, the form is saved as a draft and the candidate is asked.
3. **Every engineering assumption is in scope**, not only the three files listed earlier: "search by stack" in `SKILL.md` step 4 and `job-search-and-applications.md` becomes "search by role title, core skills and recency"; the `assisted-apply.md` search and batch-report examples get a role-neutral or second example; `intake.md` group 3 leads with the role profile's evidence sources, and GitHub or GitLab becomes the engineering profile's first source; in `answers.mjs`, the technology aliases stay (they help engineering banks) and the "total years" rule also matches role titles from `role_family` and generic wording ("years of experience in this role"). `example.md` stays the engineering walkthrough and gains a short non-engineering section (a QA engineer's intake and first CV bullets) instead of a second file.
4. **Measuring "not longer".** Evals compare the number of questions asked before work starts, against the 0.4.0 baseline on the same scenario. Layoff and visa questions count only when they apply, and a CV that already answers a question must remove it. No new harness: scenarios run with subagents as in 0.4.0 (baseline, then with the new version) and are scored by reading the outputs.
5. **Stack scoring for any role.** Word-boundary, case-insensitive matching of `experience.items` keys; keys of one or two characters (for example "R") match case-sensitively as a whole word. Credentials with `true` count like skills with years. The apply/check/skip thresholds stay as in 0.4.0.
6. **Research.** The plan has a research step: web searches for each visa grace-period rule (official government pages only) and each credential's issuing body, recorded with the month checked. Anything that cannot be confirmed from an official page is written as "Unverified: confirm with an adviser" rather than stated as fact. Role-profile norms come from reading real ads in the target countries, stated as patterns ("many QA ads ask for…"), never as rules.

## Decided by the maintainer

- The five-piece order of the next phase, starting with this piece.
- Approach A: separate role profiles, covering as many roles as possible.
- Adaptive intake that runs on the person's existing agent subscription.
- The layoff topics above, and no unemployment-benefit content.
- Home-country searches handled alongside, or instead of, applying abroad.

## Calls made by the designer (open to correction)

- The 16 families and the fallback, all at the same depth.
- The nine-section profile template and the 60 to 100 line target.
- The countries covered first for visa grace periods.
- The `experience` map with a `years` fallback.
- The release number 0.5.0 for the skill.
- Everything under "Settled after the builder check".

## Left to the builder

- Exact wording of each profile, within the template, from official sources and real ad patterns.
- The verified visa grace-period figures and their sources.
- How intake branching is written (prose rules, a table, or both), as long as it stays short.
- Eval wording beyond the scenarios listed.
