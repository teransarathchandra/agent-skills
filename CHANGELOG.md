# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- `job-application-assistant` 0.5.0: any role, not only engineering. Role profiles for 16 role families plus an any-role fallback (`references/roles/`) cover evidence, ATS keywords, CV shape, portfolio and interview material per family. A QA example bank is included.
- Layoff guidance (`references/layoff.md`): first-week steps, severance and notice questions, and visa grace periods for 10 countries from official sources.
- Adaptive intake: the assistant reads the CV first, asks role family first, branches on the answers, offers personalised recommendations and handles urgent cases first. Work rights are asked before triage. Questions before work starts dropped from 6 to 3-5 on the new eval scenarios.
- Home-country and mixed searches: no sponsorship questions when searching at home. Sri Lanka added to the CV and job-site tables.
- Role-neutral answer bank: `role_family` and `experience` keys, with per-key fallback to the 0.4.0 `years` block, used by `answers.mjs` and `triage.py`.
- Six new eval scenarios (roles, layoff, home-country search, urgent intake).
- `job-application-assistant` 0.4.0: assisted applying. A bundled apply engine (`scripts/apply/jaa.mjs`, Node and Playwright) drives one signed-in browser and prints JSON for any agent: LinkedIn search, scan, Easy Apply filling from an answer bank, drafts, approved-only submits, and profile reads and edits. The served browser listens on a random local port recorded in a 0600 file, and scanned ad text is marked untrusted. LinkedIn commands refuse to run until the candidate opts in after a risk warning, with a daily cap (default 15) and human-pace waits; `submit` refuses jobs missing from the candidate's approvals file.
- `scripts/apply/triage.py` sorts scanned ads into apply, check and skip (work-rights, clearance, residence, language and years clauses; sponsorship and relocation signals).
- New references: `setup.md` (check, ask, then install Node, Python, Playwright and LibreOffice; connect the Playwright MCP in Claude Code, Codex and other agents; team rollout) and `assisted-apply.md` (modes, opt-in text, answer bank, apply loop, result codes, batch report, salary fields, form pitfalls, employer ATS pages). `assets/answers.example.json` is a fictional answer bank.
- Tests: `tests/apply_answers.test.js` (answer rules from real form wording) and `tests/test_apply_triage.py`.

### Changed
- The validator now checks `Contents` lists in reference subfolders.
- `job-application-assistant`: batch approval replaces "the candidate presses Submit". Forms are filled to their review page and submitted only after the candidate names the jobs. Required privacy-notice boxes are ticked only with the intake choice; marketing and "follow company" boxes stay off. Salary is a per-country figure from intake, never converted or invented; current salary is a decision and is never stored. Six new eval scenarios cover the opt-in, batch approval, number-only salary fields, pre-filled wrong files, setup on Codex and unknown questions.
- README restructured for readability: a short pitch, "What's inside", a quick start first, one-sentence skill rows, the agentic workflow explained as spec, check and rules, collapsible details, and an FAQ.

### Fixed
- `job-application-assistant`: the apply engine's `goto` refuses LinkedIn without the opt-in however it is reached: mixed case or a trailing dot in the host, `lnkd.in` short links, server redirect chains (checked hop by hop before navigating; a chain it cannot fully check is refused), client-side redirects, delayed refreshes and popups. The guard lives in the `serve` process, so it covers every tab for as long as the browser runs. It also opens only http and https URLs.
- The validator's privacy scan skips `node_modules` inside skills, as it already did for plugins, so an installed apply engine does not fail it.
- `setup/install.sh --check` now exits 1 when plugins are expected but cannot be verified because the `claude` CLI is missing, instead of reporting success.

## [0.7.0] - 2026-11-18

### Added
- Agentic workflow setup: `setup/install.sh` (profiles `minimal`, `recommended`, `full`; `--dry-run`, `--check`, `--with-tools`), `setup/uninstall.sh`, and `SETUP.md`, which an AI agent follows when someone pastes this repository and asks for it to be set up. The installer backs up anything it replaces, only sets settings that are unset, and records each file's origin, so uninstall removes what it created, restores files it replaced and keeps files that were already there or that you edited. `--check` verifies every recorded plugin and exits 1 when anything is missing.
- Core files the installer places in `~/.claude`: `/kickoff` (interview, `SPEC.md` with checkbox acceptance criteria, scaffold, `scripts/verify.sh`, Stop hook, the matching kit installed per project), `/commit-push-pr`, the `Explore` (Haiku), `ac-reviewer` and `browser-qa` agents, a TypeScript check hook and token-saving routing rules.
- 18 plugins in this marketplace: 14 project kits (web, mobile, API, AI app, CLI/npm, desktop, extension, bot, automation, data, game, media, infra, commerce), `freelance-kit`, `builder-kit`, and the `flowbar` and `workbench` mods.
- `docs/agentic-workflow.md`: the loop, which command to use when, and walkthroughs for a portfolio, a mobile app and a website.
- The validator checks every plugin (manifest, marketplace entry, `kit.json`, executable `verify.sh`), the setup scripts, and scans `plugins/` and `setup/` for secrets, emails and personal home paths. New installer tests and a CI job that runs `claude plugin validate . --strict`.

### Changed
- README: leads with the agentic setup alongside the skills, with the install profiles, the build loop, `/kickoff` examples, single-plugin installs, and the new repository layout and checks.

## [0.6.0] - 2026-11-17

### Changed

- `job-application-assistant` 0.3.0, easier questions: every question lists the recommended answer first, ends with a typed "Other", and the candidate can reply `ok` to take every recommended answer or change only some (`ok, 2c, 5: ~/CV.docx`). Pick-many questions say "(pick any)". The agent uses a structured question tool when it has one, and plays the answers back before starting.
- Without Jira or tracker access, the evidence question is a pick-any list: GitHub, GitLab or Bitbucket pull requests, reviews, issues and commits (recommended, with the `gh search` commands and a per-command work-account token); local repos; other trackers or exports; performance reviews and release notes.
- A new question once the CV and letter pass their checks: which job sites (recommended per region, with a new "Job sites by region" table), accounts and how to apply. On Seek, Indeed and LinkedIn the candidate creates the account from a setup sheet and applies from an answer sheet, because their terms forbid automated tools (Seek Website Terms 9(b), Indeed Terms of Service A.3, LinkedIn User Agreement 8.2; sources in the guide). Passwords, verification and Submit stay with the candidate.
- Four new eval scenarios (easy first message, GitHub evidence with a work account, the job-sites question, a request to create Seek and Indeed accounts and apply). With the skill, Haiku, Sonnet and Opus passed them; without it, Sonnet scored about 5 of 15.

## [0.5.0] - 2026-11-17

### Added

- Evals for `pr-review-with-ticket-context` (6 scenarios: no Jira connected, private ticket data with subagents, a fix that misses the root cause in another file, uncommitted local changes, several `gh` accounts, posting findings) and `sanitize-skill-for-public` (7 scenarios, one hands-on with a fictional private playbook in `evals/files/private-notes/`), each with trigger prompts.
- A test that keeps the sanitizer fixture's scanner hits in step with its eval.

### Changed

- Results from running the evals with subagents on Haiku, Sonnet and Opus, with and without the skills: with them, about 36 to 37 of 39 checks; without, about 22 to 28. Trigger prompts routed 20/20 on every model, against competing code-review, Jira and security skills.
- `pr-review-with-ticket-context` 0.2.0: when the Jira MCP is not connected, asks how to get the ticket as options with one recommended (connect the MCP); when asked to post, shows the exact comments first and posts only Section A rows of Medium and above, with Section B going to the ticket.
- `sanitize-skill-for-public` 0.2.0: asks how to build the term list as options with one recommended (draft it from the source material); a new mistake entry against a quiet name swap that leaves an identifying story.
- Both descriptions now list only when to use the skill, without a summary of the workflow. Routing stayed at 20/20 after the change.
- Hands-on runs of the sanitizer on Haiku and Sonnet produced copies that pass the scanner with a stricter term list than the agents were given.

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
- New cover art that names no skill, so it stays current as skills are added: `docs/assets/banner-light.svg` and `banner-dark.svg` (shown by GitHub theme through `<picture>`) and a new `social-preview.svg`/`.png`, all generated by `docs/assets/make_banner.py`. `banner.svg` is removed.
- README: the ATS checker's Python requirement, the `evals/` folder in the layout, and how to run evals. The validator now also checks `srcset` paths in the README.
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
