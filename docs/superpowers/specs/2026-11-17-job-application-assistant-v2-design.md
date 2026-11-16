# job-application-assistant v0.2.0 design

Date: 2026-11-17. Status: approved by delegation (the owner asked for the recommended answer at every decision and for spec, plan and implementation to run without stopping).

## Intent

Bring the `job-application-assistant` skill up to current hiring-industry practice and to this repository's engineering standards. The owner also asked for one behaviour change: **whenever the skill needs something from the candidate (a file path, a tool that is not connected, a preference), it asks a question with concrete options and one recommended answer**, instead of an open question or a silent guess. A missing Jira (work-tracker) connection is the named example.

## Goals

1. An intake step that collects every input up front, as questions with options and a recommendation, with a fallback for each missing source or tool.
2. Current CV practice: keywords mirrored from the ad (only where evidence supports them), achievement bullets in an action-and-result shape, no contact details in page headers or footers, standard fonts, consistent dates, region rules beyond UK/US.
3. Safer job search: scam and ghost-job checks, a site's own rules on automation, quality over volume.
4. Honest screening answers for the newer questions: AI-use disclosure, voluntary diversity (EEO) questions, salary expectations.
5. After-submit work: follow-up dates in the tracker and STAR interview stories built from the same evidence.
6. Tooling a builder can trust: the letter script validates its input fully, has a dry run that needs no dependencies, refuses to overwrite, pins its dependency and is tested in CI. A new stdlib-only `ats_check.py` reads a .docx the way a parser does and reports structure risks and keyword coverage.

## Non-goals

- No new skill, and no change to the other two skills.
- No CV generator script. CV layout is too personal for one template; the agent builds it with a docx tool and checks it with `ats_check.py`.
- No automated submitting, scraping or bulk applying.

## Anti-goals (a failure even if it works)

- Encouraging keyword stuffing or any claim without evidence.
- Asking the candidate a stream of one-at-a-time questions. Intake batches them.
- Storing or sending sensitive data (salary, IDs, visa numbers, home address) anywhere new.
- Breaking a job site's terms by automating where the site forbids it.

## Constraints

- Agent Skills spec and the repo validator: `SKILL.md` body under 500 lines, description starts with "Use when", max 1024 characters, relative links resolve, no emails or secrets.
- CI runs on `ubuntu-latest` with Python 3.12 and the runner's preinstalled Node; no new third-party actions (actions are SHA-pinned here and new pins cannot be verified offline).
- Python scripts are stdlib only, like the existing ones.

## Approaches considered

1. **Docs only.** Update `SKILL.md` and the references. Cheapest, but leaves the letter script's weak input checks and gives no way to check a CV against a parser. Rejected: the owner asked for industry standards "and everything".
2. **Docs plus hardened tooling (chosen).** References and `SKILL.md` updated, intake added as its own reference, letter script hardened and tested, new `ats_check.py` with tests, CI runs both. Moderate size; every new behaviour is testable.
3. **Docs plus full generators** (CV builder from JSON, tracker as CSV tooling). Most automation, but a CV template fights the honest-framing rules and the candidate's own design, and doubles the surface to maintain. Rejected.

## Design

### SKILL.md

- New **rule**: ask, don't guess. Every question has options and one "(Recommended)" with a reason. Batch questions; use the agent's structured-question tool when it has one, else a numbered list with the recommended option first.
- New **rule**: follow each site's terms on automation; human pace, one application at a time.
- New **step 0, Intake**, linking `references/intake.md`.
- Step 2 mentions `scripts/ats_check.py`; step 7 mentions AI-use and diversity questions; step 8 adds follow-up and interview prep.
- Tracker gains `Applied` and `Follow up` columns.
- Version `0.2.0`; compatibility mentions Python 3.9+ for `ats_check.py`.
- Mistakes list gains: header/footer contact block, fake-recruiter scams, open questions without options.

### references/intake.md (new)

A question bank in groups (goals, sources, tool access, work rights and logistics, preferences, privacy). Each question: why it is asked, options, the recommended option with its reason, and what happens for each answer. Includes the work-tracker fallback ladder: connect the tracker tool (recommended), export tickets to a file, paste ticket titles, git history only, skip. Includes a worked example of a batched question message.

### references/ats-cv.md

Adds: keyword mirroring (exact ad terms, acronym plus long form, only with evidence), action-and-result bullets with an example, no headers/footers or contact block in them, standard fonts and sizes, one date format, more regions (Germany/DACH, Canada, India, Gulf states, Japan as "use local format, ask"), and a "Check with ats_check.py" section.

### references/cover-letters.md

Adds: skip when the ad says not to send one; a short letter when the field is optional; dry run before building; the candidate reviews and owns every sentence.

### references/job-search-and-applications.md

Adds: scam red flags, ghost-job signals, apply on the employer's own site where possible, site terms on automation, AI-use disclosure answers, voluntary diversity questions (ask the candidate; recommended "prefer not to say" unless they choose to share), follow-up timing.

### references/interview-prep.md (new)

STAR stories from the same evidence, one per CV bullet the interviewer is likely to ask about; questions to ask the employer; a gap answer for each gap named in the letter.

### scripts/build_letter.js

- `--help`, `--check` (validate and count words, no `docx` needed), `--force` to overwrite.
- Type checks on every field, placeholder check, word-count warning under 150 or over 400 words (150 leaves room for the short letter an optional field calls for), error over 450.
- `docx` loaded lazily, so `--check` and tests need no install.
- Exports `validateLetter`, `countWords`, `parseArgs` for tests; runs only when executed directly.
- `scripts/package.json` pins `docx` to an exact version.

### scripts/ats_check.py (new)

`python ats_check.py CV.docx [--terms terms.txt] [--json]`. Reads the .docx zip with the standard library and reports:

- errors: no extractable body text; contact details (email or phone pattern) only in a header or footer;
- warnings: tables, text boxes, images, more than one column, non-standard fonts, missing standard headings, more than one date style;
- keyword coverage when `--terms` is given (one term per line, `|` for aliases like `AWS|Amazon Web Services`), with the missing terms listed.

Exit code 1 when any error is found, so CI-style use works.

### Tests and CI

- `tests/test_ats_check.py` builds tiny .docx files in a temp folder.
- `tests/build_letter.test.js` uses `node:test`.
- CI adds `node --test tests/*.test.js`.

### Release

Plugin `0.4.0`, CHANGELOG entry, README row and development notes updated.

## Left to the builder

Exact wording, the list of standard fonts and headings, the phone regex, and test cases beyond the ones named.
