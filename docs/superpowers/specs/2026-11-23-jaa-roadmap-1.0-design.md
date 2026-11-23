# Job application assistant: roadmap from 0.5.1 to 1.0

Status: draft for approval. Decided with the maintainer in a grilling session on 2026-11-23, informed by the research report `~/reports/Job application assistant next phase.md` (notes in `~/research_notes/Job application assistant next phase/`, including `open_source_comparison.md`).

## Intent

The maintainer's company had a large layoff. Version 0.5.0 made the skill serve any role and any market. The next versions make it *effective*: the research shows cold applications reach interview about 3-4% of the time while referred candidates reach about 40%, and applications per hire rose from 121 to 291 between 2021 and 2026. Volume does not win; better-chosen jobs, referrals, learning from one's own results and good interview prep do.

Positioning: **the safe, honest job-search skill for laid-off people and visa seekers.** It does not race other projects on portal count. Its edge is evidence-only writing, work-rights and visa handling, layoff support, role profiles, batch approval, privacy and tested evals.

## Success measure

The skill steers by **interview rate per application**, shown with interviews per week, computed from the person's own tracker. Public benchmarks are mostly vendor figures, so they are context, never targets.

## Goals by version

| Version | Theme | Contents |
|---|---|---|
| 0.5.1 | Patch | Fix the fail-safe follow-ups from #14: level words that are part of a credential's own name (PMP "Professional", CISSP); versioned credential keys (`itil 4 foundation`) answer level-free questions ("ITIL certification?"); notice edge cases (string weeks, weeks 0 with only an under-2-weeks option); "experience in object-oriented software development" on 0.4.0 banks. Each with a test. |
| 0.6.0 | Tracker | Local event log, funnel summary, follow-up timing, stale/closed rules, ghost-job score, CSV export, optional propose-only email reply tracking, team leads CSV. Replaces the Markdown tracker table. |
| 0.7.0 | Job sources | Sponsor lookup (UK, NL, US, CA) joined to employers' public job feeds; remote boards with their attribution rules; scam check; fit score before tailoring; evidence reviewer for each CV and letter. |
| 0.8.0 | Referrals | Former-colleague matching from the person's own LinkedIn connections export; outreach drafts the person sends; follow-up cadence; opt-in layoff directories; "open to work" guidance. |
| 0.9.0 | Interviews and offers | Employer AI-policy check; text mock interviews with a rubric; story bank; interview debriefs; offer comparison and negotiation prep, including sponsored-offer questions. |
| 1.0.0 | Release | All of the above shipped; the full eval suite passes (all old and new scenarios); a "start here after a layoff" quickstart in the README; a short comparison with other open-source job-search projects. |

## Non-goals

- No new site automation (no auto-apply on more sites) and no automatic sending of any message. The 0.4.0 LinkedIn opt-in mode stays as it is.
- No cloud storage by default. No hosted dashboard. No voice mock interviews.
- No help during a live interview or a proctored assessment, even if asked.
- No hardcoded visa or sponsorship fees; no cost-of-living database.
- No cross-person application tracking in team mode.

## Anti-goals (a failure even if it works)

- The tracker or any feature nudges the person toward more applications instead of better ones.
- A feed or register is polled in a way that breaks its terms (rate limits, attribution, no-aggregation rules).
- An outreach draft reads as mass mail, or the skill sends anything itself.
- The scam check or fit score silently drops a job; the person must see every flag and can override.
- Personal data (applications, contacts from the connections export, interview debriefs, email content) leaves the private folder, or enters the shared leads CSV.
- A statistic is presented as fact when the research marks it vendor or low-confidence.

## Constraints (all versions)

- Agent Skills and repository rules as in 0.5.0: `SKILL.md` body under 500 lines, description at most 1024 characters starting "Use when", references linked from `SKILL.md`, `## Contents` for references over 100 lines (including subfolders), scripts run through their interpreter, fictional examples only.
- New scripts use the Python standard library only (Python 3.9+), or Node 18+ where the existing engine already lives; no new dependencies without a reason in the design of that version.
- Every network read is polite: cached in the private folder, rate-limited, with the source credited; reads only, never submits.
- Facts that change cite official sources with the month checked; unconfirmed facts are written "Unverified: confirm".
- Checks pass after every task: `python scripts/validate_skills.py`, `python -W error -m unittest discover -s tests`, `node --test tests/*.test.js`.
- A 0.4.0 or 0.5.0 answer bank keeps working.

## Design decisions

### Tracker (0.6.0)

- **Storage:** `tracker.jsonl` in the private folder, one event per line: `{ "at": ISO date, "job": id, "event": "found|applied|follow_up|response|interview|offer|rejected|closed|withdrawn", ... }`. A job's first event carries its fields: employer, title, URL, source (site or register), channel (cold, referral, recruiter, company site), referral (yes/no, and who only as initials), CV version, letter version, role family, country, remote/hybrid/on-site, sponsorship needed, sponsorship offered (yes/no/unknown), posting age at apply, on the company's own site (yes/no).
- **Script:** `scripts/track.py` (stdlib) with `add`, `event`, `summary` and `export` commands. `summary` writes `tracker-summary.md`: the funnel (applied, responded, interview, offer), interview rate overall and by segment (source, channel, CV version, country, role family, remote), follow-ups due, stale and likely-closed jobs. `export` writes CSV.
- **Follow-up defaults (convention, not data):** one follow-up 7-10 days after applying; a thank-you within 24 hours of an interview; stop after two unanswered follow-ups. Adjustable.
- **Stale and closed:** stale after 14 days without a response; "likely closed" after 30 days, stretched by country median time to hire where sourced (Germany 55). A later response reopens the job.
- **Ghost-job score:** shown with reasons (posting age, reposts, evergreen wording, not on the company's own site); never auto-skips.
- **Migration:** existing Markdown tracker tables can be imported once; SKILL.md's tracker section points to the new log.
- **Email reply tracking (optional, off by default):** only when the person connects an email tool; the agent asks before reading, proposes tracker updates from replies, never sends, files or deletes mail.
- **Team leads (opt-in):** `leads.csv` export and import with job URL, employer, country, sponsors (yes/no and its source), date found. No personal data. The group shares it however it likes; the skill never syncs.

### Job sources, scam check, fit score and reviewer (0.7.0)

- **Sponsor lookup:** `scripts/sponsors.py` (stdlib) downloads, caches and normalises the UK register of licensed sponsors (find the current CSV link on the gov.uk page each time; the filename changes), the Netherlands IND public register (format to confirm when building; if no bulk download, link it for manual checks), the USCIS H-1B Employer Data Hub export, and Canada's positive LMIA employer lists. It fuzzy-matches employer names and reports the register, route and date. Other countries (Australia, New Zealand, Germany, Ireland, UAE, Singapore) get official links for manual checks until their data is confirmed.
- **Live jobs:** for matched employers, read public job feeds from Greenhouse, Lever and Ashby (SmartRecruiters if its terms allow anonymous reads); cache, a few requests a minute at most, send the person to the employer's own apply page.
- **Remote boards:** Remote OK, Remotive, We Work Remotely and Arbeitnow (visa filter) with each board's rules honoured (Remotive: about four requests a day, no passing jobs to other aggregators; attribution and links back for all).
- **Scam check:** a triage check on every ad and on pasted recruiter messages: fees or equipment purchases, chat-app-only interviews, pay far above the market, domain not matching the company, ID or bank details before an offer, task-for-pay schemes. Flags with a reason line; never drops silently. Sources: the FTC, UK Action Fraud and Scamwatch warnings, re-checked when building.
- **Fit score:** 1-5 from the role profile's skills, years, the work-rights result and ghost-job risk, with reasons. Below 3 the agent asks before tailoring.
- **Evidence reviewer:** for each tailored CV and letter, a fresh-context reviewer (where the agent supports subagents) checks every claim against the evidence, the ad's requirements and keyword stuffing before the batch report; otherwise a self-check pass with the same checklist.

### Referrals (0.8.0)

- **Former colleagues:** from the person's own LinkedIn connections export (CSV they download from LinkedIn's settings), kept in the private folder; matched against target employers to suggest who to ask. No scraping.
- **Outreach drafts:** 200-400 characters; one line on who they are, one specific reason for this person, one line of proof, one small ask with an easy out; lead with a request for information or an intro, not "refer me"; no attachments. The person sends every message from their own account.
- **Cadence:** one follow-up after about a week, at most a second, then stop; honour a "no" immediately.
- **Layoff networking:** prompt to list former colleagues elsewhere; suggest opt-in layoff directories (consent-based only).
- **"Open to work":** recommend the recruiters-only setting by default; explain the public banner's trade-offs and leave the choice to the person.
- **Every referral attempt is paired with a normal tailored application.**

### Interviews and offers (0.9.0)

- **AI policy first:** before prep, find the employer's candidate AI policy; prep only; never live or proctored help.
- **Mock interviews:** text-based; questions from the role profile and the ad; the candidate answers; the agent scores against a rubric (structure such as STAR, evidence, specificity, length) and suggests a better version built only from the person's real evidence.
- **Story bank:** STAR stories from real evidence, tagged by competency, in the private folder.
- **Debrief:** after each interview, questions asked, what went well, what to fix; feeds the next mock and the tracker.
- **Offers:** a checklist of what to ask (who pays which visa cost, relocation, clawbacks, timeline, conditions), links to official fee pages re-read at the time of the offer, side-by-side comparison of the person's offers; negotiation prep framed as convention, with country notes only where sourced.
- **Rejections:** ask for feedback politely; in the UK and EU, the right to human review of solely automated decisions (sources re-checked when building).

## Approaches considered

| Approach | Trade-offs | Decision |
|---|---|---|
| One version per piece, ending at 1.0 | Each piece tested, reviewed and released on its own; colleagues get improvements sooner | **Chosen** |
| One large 1.0 release | Single launch; much harder to test and review; slower to reach anyone | Rejected |
| Tracker first, then sources, referrals, interviews | Every later piece writes into the tracker and can show its effect on interview rate | **Chosen** order |
| Cloud tracker (Sheets, Notion) | Easy on a phone; puts a laid-off person's application history on third-party servers | Rejected as default |

## Delivery

Each version follows the 0.5.0 process: an implementation plan from this document's section for that version, one worker per task with a fresh reviewer after each, a baseline-then-retest eval run for that version's new scenarios, a whole-branch review, a PR, and merge. The maintainer gets a short summary and the PR link at each merge. Work stops only for decisions only the maintainer can make, or for anything risky.

## Settled after the builder check

1. **Plans per version.** Each version gets its own plan, written when that version starts, from its section here. The 0.6.0 event schema is still designed for the fields later versions need (below), so 0.7.0-0.9.0 add events without reworking it.
2. **Who writes tracker events, and job ids.** The agent writes events by running `python scripts/track.py`. The Node apply engine is not changed to write the log; instead `track.py import-engine` reads the engine's submission log in `JAA_HOME` and adds `applied` events it does not have yet. A job id is `<source>:<id>` where the source gives one (`linkedin:4000000001`, `greenhouse:<board>/<id>`, `lever:<company>/<id>`), otherwise `url:` plus a short hash of the normalised URL; repeat finds of the same id are one job. The SKILL.md tracker table, step 8 and `assisted-apply.md` step 9 are updated to use the log.
3. **What a subagent may receive.** The existing rule stands: current salary, ID, passport or visa numbers and a home address never go into subagent prompts. The evidence reviewer gets the tailored CV and letter, the ad text and an evidence summary (each claim with its source name), with contact details removed; never raw private files. The connections export, interview debriefs and email content are never sent to a subagent. Where a rule can be checked by a script it gets a test (the leads CSV has only its five columns; the summary contains no contact names); the rest is enforced by instruction and eval scenarios.
4. **Unit tests versus evals.** Script behaviour (tracker maths, stale and ghost rules, sponsor matching, CSV columns, rate limits and caching) is proven by unit tests. Agent behaviour (outreach tone and length, never dropping a job silently, asking before tailoring a low-fit job, mock-interview scoring, refusing live or proctored help, asking before reading email) gets eval scenarios, with a baseline-then-retest run for each version's new scenarios. "The full eval suite passes" at 1.0 means every scenario in `evals/evals.json` passes in one run with the 1.0 skill.
5. **Format versions.** Every tracker event carries `"v": 1`; `leads.csv` has a header row with a version comment. `track.py` tolerates unknown and missing fields, and every command works when no log exists yet.
6. **Small samples.** A segment in the summary with fewer than 5 applications is shown as "too few to read", with its counts but no rate, so noise is never presented as a finding.

## Left to the builder

- Exact file names beyond those above, and how each new reference splits its content.
- Matching details (fuzzy-match thresholds) as long as every match shows its register, route and date.
- Eval scenario wording per version.
- Whether SmartRecruiters and the Netherlands register can be read automatically, decided from their terms and formats when building.
