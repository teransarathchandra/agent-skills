# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `job-application-assistant` skill: builds an ATS-safe CV from the candidate's own evidence, writes one cover letter per job ad, triages ads by work-rights clauses, syncs the job-site profile and fills in applications with a browser agent. It always stops before Submit and keeps salary and ID data out of files.
- `scripts/build_letter.js` inside that skill, with a placeholder template in `assets/cover-letter.json`: builds a one-page cover letter (.docx) and refuses to run while placeholders are left.

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
