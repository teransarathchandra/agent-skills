# Job application assistant 0.5.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `job-application-assistant` serve any role and any market (home, abroad or both), with layoff guidance and adaptive intake, released as skill version 0.5.0.

**Architecture:** One reference file per role family under `references/roles/`, a new `references/layoff.md`, adaptive-intake rules in `intake.md` and step 0 of `SKILL.md`. The answer bank gains a role-neutral `experience` map that `answers.mjs` and `triage.py` read, falling back per key to the 0.4.0 `years` block. Behaviour changes are proven by baseline-then-retest evals (subagents), code by unit tests.

**Tech Stack:** Markdown (Agent Skills format), Node 18+ ESM (`node:test`), Python 3.9+ (`unittest`), the repo validator.

**Spec:** `docs/superpowers/specs/2026-11-22-jaa-roles-and-layoff-design.md`

## Global Constraints

- `SKILL.md` body under 500 lines; description one line, starts "Use when", at most 1024 characters; `compatibility` at most 500 characters.
- References linked straight from `SKILL.md`; any reference over 100 lines (including files in `references/roles/`) opens with a `## Contents` list.
- Scripts are invoked through their interpreter (`python scripts/...`, `node scripts/...`).
- All examples fictional (`AGENTS.md`): no real people, emails, keys, home paths, employers or clients. `example.com` addresses only.
- Facts that change (visa rules, certification bodies, site terms) cite official sources with the month checked (`Checked 2026-11`). Anything not confirmed on an official page is written "Unverified: confirm with an adviser".
- Role norms are written as patterns from real ads ("many QA ads ask for…"), never as rules.
- Severance amounts and the person's reasons for the layoff are never written anywhere; a grace-period deadline may be stored only in the private working folder.
- A 0.4.0 answer bank (`years.total`, `years.skills`, `years.none`) keeps working unchanged.
- Intake must not ask more questions before work starts than 0.4.0 on the same scenario; `ok` still accepts every recommended answer; four to six questions per message.
- Checks that must pass after every task: `python scripts/validate_skills.py`, `python -W error -m unittest discover -s tests`, `node --test tests/*.test.js`.
- Conventional Commits; CHANGELOG under `## [Unreleased]`; skill `metadata.version` becomes `"0.5.0"`.
- Work in a worktree on branch `feat/jaa-0.5.0` (use superpowers:using-git-worktrees). Do not push or open a PR until the maintainer asks.

## Review Focus

1. A 0.4.0 bank with only `years` answers every years question exactly as before. Pinned in Task 2 (`old bank answers unchanged`).
2. A bank with both `experience.items` and `years.skills` naming the same item with different values: `experience` wins; an item only in `years.skills` still answers. Pinned in Task 2 (`experience wins per key`).
3. A non-engineering bank: tool years, a held credential, and a credential not in the bank. Expected `"3"`, `"Yes"`, `null`. Pinned in Task 2 (`credentials answer from items`).
4. A home-country ad that says "must have full Australian working rights" for a candidate whose AU entry has `needs_sponsorship: false, lives_there: true` is not dropped. Pinned in Task 3 (`home country is not filtered on work rights`).
5. Short or common skill keys do not match inside other words: `R` must not match "React" or "for"; `Excel` must not match "excellent". Pinned in Task 3 (`short and common keys match whole words`).

---

### Task 1: RED baseline for the new scenarios

**Files:**
- Modify: `skills/job-application-assistant/evals/evals.json` (append 6 scenarios)
- Modify: `skills/job-application-assistant/evals/triggers.json` (append to `should_trigger`)
- Create (scratch, not committed): `<scratchpad>/evals-0.5.0/baseline_v040.md`

**Interfaces:**
- Produces: six scenario ids used again in Task 10: `R1-qa-no-github`, `R2-recruiter-profile-only`, `R3-visa-job-ended`, `R4-designer-cv-answers-most`, `R5-role-outside-families`, `R6-home-country-only`.

- [ ] **Step 1: Append the six scenarios** in the existing shape (`skills`, `query`, `files: []`, `expected_behavior`), fictional throughout:
  - R1: a laid-off QA engineer with ISTQB and Selenium, no public code. Expected: asks for test-management, defect and automation evidence; never asks for GitHub repos or years of TypeScript.
  - R2: a recruiter with no CV, only a profile export. Expected: builds from the profile; HR/recruiting evidence (hiring metrics, ATS tools); no code questions.
  - R3: a person on a work visa in another country whose job ended last week. Expected: the grace-period question comes first, with its official source and an "confirm with an adviser" note; the plan says apply widely now and prioritise known sponsors; the deadline is not written outside the private folder.
  - R4: a designer whose CV gives degree, dates, location and portfolio link. Expected: confirms those facts instead of asking them; asks no more questions before starting than the 0.4.0 baseline did.
  - R5: a "clinical research coordinator". Expected: uses the fallback (collects five real ads for the title, builds the profile for the session); does not force an engineering or other family.
  - R6: a laid-off person in Sri Lanka applying only in Sri Lanka. Expected: no sponsorship or work-rights questions, salary in LKR, local sites recommended, the CV leaves out the NIC number, date of birth, religion and marital status, no ad dropped for a work-rights clause.
- [ ] **Step 2: Append triggers**: "I'm a QA engineer who was made redundant, help me find a new job", "Rewrite my CV, I'm a business analyst", "My work visa depends on the job I just lost, what do I do?", "Help me apply for jobs in my own country".
- [ ] **Step 3: Run the baseline.** One Sonnet subagent with the current skill (0.4.0) answers R1–R6 as the skill would, listing tool calls without making them, and writes `baseline_v040.md`. Count, per scenario, the questions asked before work starts.
- [ ] **Step 4: Record the failures** (one line per scenario, with the subagent's own wording where it rationalises) at the top of `baseline_v040.md`.
- [ ] **Step 5: Verify and commit**

Run: `python scripts/validate_skills.py`
Expected: `OK: ...`

```bash
git add skills/job-application-assistant/evals/evals.json skills/job-application-assistant/evals/triggers.json
git commit -m "test(job-application-assistant): eval scenarios for roles, layoffs and home-country searches"
```

### Task 2: Role-neutral experience in the answer rules

**Files:**
- Modify: `skills/job-application-assistant/scripts/apply/lib/answers.mjs` (`years` at line 78, `yesNo` at line 32)
- Test: `tests/apply_answers.test.js`

**Interfaces:**
- Produces: `export function experienceOf(bank) -> { total: number|undefined, items: Record<string, number|boolean>, none: string[] }`, keys lowercased. Merge: `experience.items` over `years.skills` per key; `experience.total_years` over `years.total`; `none` lists combined and de-duplicated.
- Produces: `bank.role_family`, one of the profile file stems from Task 5–7 (`software-engineering`, `qa-testing`, `devops-cloud`, `data-analytics`, `cybersecurity`, `technical-writing`, `product-management`, `project-delivery`, `business-analysis`, `ux-ui-design`, `it-customer-support`, `hr-recruiting`, `sales-account-management`, `marketing`, `finance-accounting`, `operations-admin`, `any-role`).
- `years(question, bank)` and `yesNo(question, bank, country)` keep their signatures.

- [ ] **Step 1: Write the failing tests**

```js
test('old bank answers unchanged', async () => {
  const { years } = await import(MODULE);
  assert.equal(years('How many years of work experience do you have with TypeScript?', bank), '4');
  assert.equal(years('How many years of work experience do you have with Amazon Web Services (AWS)?', bank), '0');
  assert.equal(years('How many years of work experience do you have with MongoDB?', bank), null);
  assert.equal(years('How many years of professional experience do you have designing and developing object-oriented software?', bank), '5');
});
test('experience wins per key', async () => {
  const { years, experienceOf } = await import(MODULE);
  const b = { ...bank, experience: { total_years: 6, items: { typescript: 5, playwright: 3 } } };
  assert.equal(years('How many years of work experience do you have with TypeScript?', b), '5');
  assert.equal(years('How many years of work experience do you have with C#?', b), '2');
  assert.equal(years('How many years of work experience do you have with Playwright?', b), '3');
  assert.equal(experienceOf(b).total, 6);
});
test('credentials answer from items', async () => {
  const { years, yesNo } = await import(MODULE);
  const qa = { role_family: 'qa-testing', experience: { total_years: 4, items: { selenium: 3, istqb: true, jmeter: 1 } }, policy: {} };
  assert.equal(years('How many years of work experience do you have with Selenium?', qa), '3');
  assert.equal(yesNo('Do you hold an ISTQB certification?', qa, 'UK'), 'Yes');
  assert.equal(yesNo('Are you a Certified ScrumMaster (CSM)?', qa, 'UK'), null);
  assert.equal(years('How many years of experience do you have in this role?', qa), '4');
  assert.equal(years('How many years of QA experience do you have?', qa), '4');
});
```

- [ ] **Step 2: Run** `node --test tests/apply_answers.test.js` — Expected: the three new tests FAIL (`experienceOf` is not exported; credential and role-wording cases return null).
- [ ] **Step 3: Implement** `experienceOf` and use it in `years`; in `yesNo`, before the rule loop, when the question asks whether the candidate holds, has or is certified in something (`hold|have|possess|certif|licen[cs]e|accredit`), answer from a boolean item whose key appears in the question, else fall through. In `years`, the total-years rule also matches `in this role|relevant experience|similar role` and a per-family word map keyed by `role_family` (for example `qa-testing: /\bqa\b|quality assurance|testing/`, `hr-recruiting: /recruit|talent acquisition|\bhr\b/`); keep the technology aliases as they are.
- [ ] **Step 4: Run** `node --test tests/*.test.js` — Expected: all pass, 0 fail.
- [ ] **Step 5: Commit** `feat(job-application-assistant): role-neutral experience in the answer rules`

### Task 3: Role-neutral triage

**Files:**
- Modify: `skills/job-application-assistant/scripts/apply/triage.py` (lines 62–99, 113, 121)
- Test: `tests/test_apply_triage.py` (line 53 asserts `stack_matched`)

**Interfaces:**
- Produces: `experience_keys(bank: dict) -> list[str]`: merged keys (same merge as Task 2), lowercased, excluding values `0` and `False`, including credentials with `True`.
- Produces: `key_in_text(key: str, text: str) -> bool`: keys of one or two characters match case-sensitively as a whole word on the original ad text; longer keys match case-insensitively with word boundaries on both sides.
- Output field renamed `stack_matched` -> `skills_matched`; table header "Stack" -> "Skills". Thresholds unchanged (`apply` at 3+ matches or a flag).

- [ ] **Step 1: Write the failing tests**

```python
def test_home_country_is_not_filtered_on_work_rights(self):
    bank = {**BANK, "countries": {"AU": {"needs_sponsorship": False, "has_work_rights": True, "lives_there": True}}}
    r = triage.triage({"id": "1", "text": "Candidates must have full Australian working rights. TypeScript, React, Node."}, bank, "AU")
    self.assertNotEqual(r["verdict"], "skip")

def test_short_and_common_keys_match_whole_words(self):
    bank = {"experience": {"items": {"R": 2, "excel": 5, "sql": 3}}, "countries": {}}
    r = triage.triage({"id": "1", "text": "React for excellent dashboards. SQL."}, bank, "UK")
    self.assertEqual(r["skills_matched"], ["sql"])

def test_non_engineering_bank_scores_its_own_skills(self):
    bank = {"experience": {"items": {"workday": 3, "greenhouse": 2, "cipd": True}}, "countries": {"UK": {"needs_sponsorship": False, "lives_there": True}}}
    r = triage.triage({"id": "1", "text": "Recruiter using Workday and Greenhouse. CIPD preferred."}, bank, "UK")
    self.assertEqual(r["verdict"], "apply")
```

Also change line 53's assertion to `r["skills_matched"]`.

- [ ] **Step 2: Run** `python -W error -m unittest tests.test_apply_triage` — Expected: FAIL (`skills_matched` missing; `R` matches "React"; HR keys ignored).
- [ ] **Step 3: Implement** `experience_keys` and `key_in_text`, use them in `triage()` on the original (not lowercased) text, rename the field and header.
- [ ] **Step 4: Run** all three repo checks — Expected: pass.
- [ ] **Step 5: Commit** `feat(job-application-assistant): triage scores any role's own skills`

### Task 4: Layoff guidance

**Files:**
- Create: `skills/job-application-assistant/references/layoff.md`
- Test: `tests/test_role_profiles.py` (created here; extended in Tasks 5–7)

**Interfaces:**
- Produces: headings in `layoff.md`, linked by Task 8: `## Contents`, `## Explaining the layoff`, `## References and the old employer`, `## Timing: notice, garden leave and severance`, `## Visa tied to the lost job`, `## Pace and wellbeing`, `## Sources`.

- [ ] **Step 1: Write the failing test** `test_layoff_reference_has_required_sections`: the file exists, has each heading above, and its `## Sources` section has a line containing `Checked 2026-11`.
- [ ] **Step 2: Run** `python -W error -m unittest tests.test_role_profiles` — Expected: FAIL (file missing).
- [ ] **Step 3: Research** the post-employment grace period for the US, UK, Canada, Australia, New Zealand, Germany, the Netherlands, Ireland, the UAE and Singapore from official government pages only: the length, what starts it, and what the person may do in it. Record each with its URL.
- [ ] **Step 4: Write `layoff.md`** from the spec's Layoff situations section: the CV line, letter sentence and 20-second interview answer (fictional examples, no blame, no apology); references and saving one's own evidence before access ends; how notice, garden leave and severance map to "notice period" and "available from" answers, with severance never stored; the visa table (country, rule, source) with "Unverified: confirm with an adviser" for anything not confirmed, the changed search plan when a deadline applies, and the rule that the deadline date lives only in the private folder; a weekly pace plan. No benefits content, no legal advice.
- [ ] **Step 5: Run** the test and the validator — Expected: PASS, `OK`.
- [ ] **Step 6: Commit** `docs(job-application-assistant): layoff guidance with visa grace periods`

### Task 5: Role profiles, tech families

**Files:**
- Create in `skills/job-application-assistant/references/roles/`: `software-engineering.md`, `qa-testing.md`, `devops-cloud.md`, `data-analytics.md`, `cybersecurity.md`, `technical-writing.md`
- Modify: `scripts/validate_skills.py:94-100` (`check_references` uses `rglob("*.md")` so subfolders get the Contents rule)
- Test: `tests/test_role_profiles.py`, `tests/test_validate_skills.py`

**Interfaces:**
- Produces: `PROFILE_SECTIONS` in `tests/test_role_profiles.py`, the headings every family profile has, in order: `## Titles and adjacent roles`, `## Evidence sources`, `## Intake questions`, `## CV shape`, `## Keywords and credentials`, `## Portfolio and work samples`, `## Screening questions`, `## Answer-bank experience keys`, `## Mistakes to avoid`, `## Sources`.
- Produces: the file stems listed in Task 2's `role_family`.

- [ ] **Step 1: Write the failing tests**: `test_tech_profiles_have_every_section` (each of the six files exists and has `PROFILE_SECTIONS` in order); `test_profiles_cite_checked_sources` (each `## Sources` has `Checked 2026-11`); in `tests/test_validate_skills.py`, `test_long_nested_reference_needs_contents` (a 102-line `references/roles/long.md` without `## Contents` gives an error).
- [ ] **Step 2: Run** both test modules — Expected: FAIL.
- [ ] **Step 3: Change `check_references`** to walk `references/` recursively.
- [ ] **Step 4: Research and write the six profiles** per the spec's nine-section template, 60–100 lines each (a `## Contents` list if over 100): credentials named with their issuing body (for example ISTQB, AWS, CISSP from ISC2); evidence sources including what stays private under an NDA; three to six intake questions in the 0.4.0 format (recommended first, typed "Other" last); two or three fictional bullets; `experience` keys to collect. `software-engineering.md` takes over the GitHub/GitLab evidence text from `intake.md` group 3 (Task 8 removes it there).
- [ ] **Step 5: Run** all three repo checks — Expected: pass.
- [ ] **Step 6: Commit** `docs(job-application-assistant): role profiles for tech families`

### Task 6: Role profiles, product and delivery families

**Files:**
- Create in `references/roles/`: `product-management.md`, `project-delivery.md`, `business-analysis.md`, `ux-ui-design.md`
- Test: `tests/test_role_profiles.py`

- [ ] **Step 1: Extend the tests** with these four stems (same section and sources checks).
- [ ] **Step 2: Run** — Expected: FAIL for the four missing files.
- [ ] **Step 3: Research and write** the four profiles as in Task 5 (credentials such as PMP from PMI, PSM from Scrum.org, CSM from Scrum Alliance, CBAP from IIBA; the design profile covers portfolios and case studies).
- [ ] **Step 4: Run** all three repo checks — Expected: pass.
- [ ] **Step 5: Commit** `docs(job-application-assistant): role profiles for product and delivery`

### Task 7: Role profiles, support and business families, and the fallback

**Files:**
- Create in `references/roles/`: `it-customer-support.md`, `hr-recruiting.md`, `sales-account-management.md`, `marketing.md`, `finance-accounting.md`, `operations-admin.md`, `any-role.md`
- Test: `tests/test_role_profiles.py`

**Interfaces:**
- Produces: `any-role.md` headings: `## When to use this`, `## Build the profile for this session`, `## Where it is kept`, `## Sources`. It tells the agent to collect the title, five recent real ads for that title in the target countries and the person's evidence, then fill the nine family sections in the private folder (never in the skill).

- [ ] **Step 1: Extend the tests**: the six family stems with `PROFILE_SECTIONS`; `test_fallback_profile_sections` for `any-role.md`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Research and write** the seven files (credentials such as ITIL from PeopleCert, CIPD, SHRM, CPA, ACCA, CIMA, Google Ads and HubSpot certifications as ads show them).
- [ ] **Step 4: Run** all three repo checks — Expected: pass.
- [ ] **Step 5: Commit** `docs(job-application-assistant): role profiles for support and business, and a fallback`

### Task 8: Adaptive intake, home-country searches and SKILL.md

**Files:**
- Modify: `skills/job-application-assistant/references/intake.md` (How to ask; Group 1 question 2; Group 3; new Group 8 for layoffs)
- Modify: `skills/job-application-assistant/SKILL.md` (frontmatter, step 0, step 1, step 4, Mistakes to avoid)
- Test: `tests/test_role_profiles.py`

**Interfaces:**
- Consumes: the 17 role files (Tasks 5–7), `layoff.md` (Task 4), `role_family` values (Task 2).

- [ ] **Step 1: Write the failing test** `test_every_role_reference_is_linked_from_skill`: every `.md` under `references/roles/` plus `references/layoff.md` appears as a link target in `SKILL.md`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Rewrite intake** per the spec's Adaptive intake section: read the CV first and confirm known facts; role family first (inferred, recommended); load the profile and ask its questions; the branches (laid off, visa tied to the job, each country, no CV); personalised recommendations; urgent first. Group 1 question 2 offers the person's own country first when they are not on a temporary visa there; a home-country choice adds no work-rights questions and records `needs_sponsorship: false, has_work_rights: true, lives_there: true` with salary in the local currency. Group 3 leads with "the evidence sources in your role profile"; the GitHub/GitLab detail now lives in `software-engineering.md`. Group 8 (layoffs) links to `layoff.md`.
- [ ] **Step 4: Update `SKILL.md`**: description adds role and layoff triggers (QA, business analyst, designer, recruiter, laid off, redundancy, visa grace period, own country) within 1024 characters; version `"0.5.0"`; step 0 summarises adaptive intake and links the role profiles in one compact list and `layoff.md`; step 1 points evidence at the role profile; step 4 says "search by role title, core skills and recency"; Mistakes to avoid gains the spec's anti-goals (engineering questions for a non-engineer, sponsorship questions for a home-country search, apology or blame about the layoff, visa deadlines stated without a source).
- [ ] **Step 5: Run** all three repo checks — Expected: pass; the body stays under 500 lines.
- [ ] **Step 6: Commit** `feat(job-application-assistant): adaptive intake for any role, layoffs and home-country searches`

### Task 9: Role-neutral references, Sri Lanka and examples

**Files:**
- Modify: `references/ats-cv.md` (Summary "core stack"; region table at lines 56–70 gains Sri Lanka)
- Modify: `references/job-search-and-applications.md` (Triage "search by stack"; Job sites by region gains Sri Lanka; home-country triage note)
- Modify: `references/assisted-apply.md` (search and batch-report examples get a role-neutral second example)
- Modify: `references/cover-letters.md`, `references/interview-prep.md` (pointers to `layoff.md` and the role profile)
- Modify: `references/example.md` (a short QA-engineer section: intake and first bullets)
- Modify: `assets/answers.example.json` (add `role_family`, `experience`, one home-country entry); Create: `assets/answers.example-qa.json`
- Test: `tests/test_role_profiles.py`, `tests/apply_answers.test.js`

- [ ] **Step 1: Write the failing tests**: `test_example_banks_are_valid` (both example banks parse, have `role_family` from the allowed stems, and `experience.items`); in `apply_answers.test.js`, `example QA bank answers its own questions` (loads `answers.example-qa.json`; a Selenium years question and an ISTQB question return non-null).
- [ ] **Step 2: Run** — Expected: FAIL (QA bank missing).
- [ ] **Step 3: Research** Sri Lanka's main job sites and each one's terms on automated tools (record what was found and the month); local CV conventions.
- [ ] **Step 4: Make the edits** listed under Files. In `cover-letters.md`, the logistics sentence about visas and relocation is left out for home-country jobs; in `ats-cv.md`, the relocation or sponsorship line in the contact block is left out for a home-country version. Sri Lanka CV row: A4, UK spelling, leave out the NIC number always, and date of birth, religion and marital status that older local templates include. Sri Lanka sites row: the sites found, with "read each site's terms before automation" as for other rows.
- [ ] **Step 5: Run** all three repo checks — Expected: pass.
- [ ] **Step 6: Commit** `docs(job-application-assistant): role-neutral references, Sri Lanka, QA example`

### Task 10: GREEN evals, changelog and README

**Files:**
- Modify: `CHANGELOG.md` (`## [Unreleased]`), `README.md` (skill row and requirements line)
- Create (scratch): `<scratchpad>/evals-0.5.0/green_v050.md`

**Interfaces:**
- Consumes: scenario ids and the baseline question counts from Task 1.

- [ ] **Step 1: Run** the same Sonnet subagent prompt as Task 1 against the new skill for R1–R6 and the six 0.4.0 scenarios (S1–S6), writing `green_v050.md`.
- [ ] **Step 2: Score** each scenario against its `expected_behavior`; for R4 compare the question count with the baseline (must be lower or equal). A failure goes back to the owning task's file, then re-run that scenario.
- [ ] **Step 3: Update CHANGELOG and README**: role profiles, layoff guidance, adaptive intake, home-country searches, role-neutral answer bank and triage, Sri Lanka rows; the README row no longer reads as engineering-only.
- [ ] **Step 4: Run** all three repo checks and a privacy grep of the diff for names, emails and phone numbers — Expected: pass, no hits.
- [ ] **Step 5: Commit** `docs(job-application-assistant): release notes for 0.5.0`
