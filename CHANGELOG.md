# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.4.0] - 2026-11-17

### Added

- `job-application-assistant` 0.2.0: an intake step (`references/intake.md`) that asks for every missing input as a choice with a recommended answer, including the paths to the old CV, degree certificate and transcript, and a fallback ladder when the work tracker (for example a Jira MCP) is not connected.
- `scripts/ats_check.py` in that skill (standard library only): reads a CV .docx the way a parser does and reports contact details hidden in headers or footers, tables, text boxes, images, columns, uncommon fonts, non-standard headings and mixed date styles, plus keyword coverage against a job ad's terms.
- `references/interview-prep.md`: STAR stories, gap answers and questions for the employer, built from the same evidence as the CV.
- Guidance on ad keywords, action-and-result bullets, more regional CV formats, scam and ghost-job checks, job sites' rules on automation, AI-use and voluntary diversity questions, and follow-ups.
- Tests for both scripts (`tests/test_ats_check.py`, `tests/build_letter.test.js`); CI now runs the Node tests too.
- `references/example.md`: a fictional end-to-end run (intake, checker output, tracker, stop-before-Submit report), and `assets/terms-example.txt` for `ats_check.py --terms`.
- The validator's privacy scan now also covers `.js`, `.mjs`, `.cjs` and `.ts` files in skills.
- `evals/evals.json` (8 scenarios: no tracker connected, missing paths, a scam recruiter, a keyword without evidence, a work-rights clause, stop before Submit, current salary, bulk automation) and `evals/triggers.json` for `job-application-assistant`.
- The validator checks the shape of `evals/evals.json` and `evals/triggers.json` when present, and requires a `## Contents` list in reference files over 100 lines.
- `docs/authoring-skills.md`: rules from Anthropic's skill-authoring guide (third-person trigger descriptions, references one level deep, copyable checklists, scripts run through their interpreter, documented constants, cited sources) and a section on evaluations.
- Research-backed guidance: fuller scam signs (payment methods, fake cheques, cloned sites, deepfake interviews), how to verify a recruiter and where to report; checking an employer's AI policy before drafting; asking for human review of a solely automated rejection under GDPR Article 22; a note on how sure the ATS layout rules are. Sources listed with the month checked.

### Changed

- `build_letter.js` checks every field's type, warns on letters under 150 or over 400 words and stops over 450, adds `--check` (no install needed), `--force` and `--help`, refuses to overwrite by default, and loads `docx` only when building. `scripts/package.json` pins `docx` to 9.15.2.
- The tracker table gains Applied and Follow up columns and more statuses.
- Plugin and marketplace descriptions name all three skills; new keywords `job-search`, `cv`, `ats`.
- `job-application-assistant` SKILL.md: a copyable progress checklist; scripts are called through `python`/`node`; `ats_check.py` is re-run until it exits 0; the description lists triggers only.
- Both scripts document why each constant has its value.
- After running the evals with subagents on Haiku, Sonnet and Opus (with and without the skill): triage now records every dropped ad in the tracker as `Skipped: <reason>` (Haiku and Sonnet left it out), and the progress checklist is used only for multi-step requests, kept in the agent's todo tool when it has one (Opus had pasted it into every reply). Two expected behaviours added to the evals to cover both, and `docs/authoring-skills.md` describes how to run evals with subagents.
- A second eval round: five more scenarios (profile sync, degree certificate, AI-use and diversity questions, an automated rejection with a follow-up, interview prep) and a hands-on one with a real CV fixture (`evals/files/cv-with-ats-problems.docx`) that the agent fixes with `ats_check.py`. Fixes from it: profile sync on a site that forbids automated tools (LinkedIn) is done through an edit sheet the candidate applies; keyword aliases must be other names for the same term, not broader ones (`REST APIs|API` overstated coverage); a new mistake entry against writing stronger words than the evidence and asking afterwards. A test keeps the fixture's findings in step with the eval.
- A third round: the core rules repeated five times (Haiku three, Sonnet two) all held, and a hands-on cover letter run on Haiku and Sonnet built valid 260-word letters with `build_letter.js --check` first. Haiku passed `--force` on a first build, so `cover-letters.md` now says to leave it off unless rebuilding a letter from the same session.

## [0.3.0] - 2026-11-17

### Added

- `job-application-assistant` skill: builds an ATS-safe CV from the candidate's own evidence, writes one cover letter per job ad, triages ads by work-rights clauses, syncs the job-site profile and fills in applications with a browser agent. It always stops before Submit and keeps salary and ID data out of files.
- `scripts/build_letter.js` inside that skill, with a placeholder template in `assets/cover-letter.json`: builds a one-page cover letter (.docx) and refuses to run while placeholders are left.
- Cover art: `docs/assets/banner.svg` for the README and `docs/assets/social-preview.png` (1280x640) for the GitHub social preview.
- `SUPPORT.md`.
- The validator now checks that every relative link and image in `README.md` exists.

### Changed

- README redesigned: banner, badges, why, skills table with example prompts, install and update steps, how-it-works diagram, repository layout, development and acknowledgements.

## [0.2.0] - 2026-11-16

### Added

- `sanitize-skill-for-public` skill: turns a skill or notes written for private or work use into a fictional, public-safe copy, and proves it with a scan. Prepares only; never publishes.
- `scripts/scan_terms.py` inside that skill: scans files, file names and git history for a private term list and for risky patterns (emails, ticket keys, ids, dates, internal links, secrets, home paths). Refuses a term list stored inside the scanned folder.

## [0.1.0] - 2026-11-16

### Added

- `pr-review-with-ticket-context` skill: reviews a pull request against its Jira ticket and returns two grids, comments on the files the PR changed and gaps outside the PR.
- Claude Code plugin and marketplace manifests.
- `scripts/validate_skills.py` and its tests, run in CI.
- Skill template, contributing guide, security policy and code of conduct.
- Release workflow: pushing a `vX.Y.Z` tag validates the repo and publishes a GitHub release from these notes.
