# job-application-assistant v0.2.0 implementation plan

Design: [../specs/2026-11-17-job-application-assistant-v2-design.md](../specs/2026-11-17-job-application-assistant-v2-design.md). Branch: `feat/job-application-assistant-v2`.

Each task ends with its check. Tests are written before the code they test.

1. **ats_check tests (red).** `tests/test_ats_check.py`: a helper writes a minimal .docx (`[Content_Types].xml`, `word/document.xml`, optional header/footer parts) to a temp dir. Cases: clean CV passes; no text is an error; email only in header is an error; table, text box and image are warnings; two columns warn; unknown font warns; missing headings warn; mixed date styles warn; keyword coverage with aliases; `--json` output parses; non-zip input fails cleanly. Check: `python -m unittest tests.test_ats_check` fails on import.
2. **ats_check (green).** `skills/job-application-assistant/scripts/ats_check.py`, stdlib only, importable (`check_docx`, `load_terms`, `keyword_coverage`, `main`). Check: tests pass, `python -W error -m unittest discover -s tests` passes.
3. **build_letter tests (red).** `tests/build_letter.test.js` with `node:test`: valid letter passes; each missing field; wrong types; placeholders; paper value; word-count warning and error; `parseArgs` flags; `--check` run as a child process exits 0 without `docx`; existing output without `--force` exits 1. Check: fails.
4. **build_letter (green).** Refactor with lazy `docx`, exports, `require.main === module`. Add `scripts/package.json` pinning `docx`. Check: node tests pass; a real build in a scratch folder with `docx` installed produces a .docx that `ats_check.py` reads.
5. **References.** New `intake.md` and `interview-prep.md`; update `ats-cv.md`, `cover-letters.md`, `job-search-and-applications.md`. Check: validator passes (links resolve, no emails).
6. **SKILL.md.** Rules, step 0, step updates, tracker columns, mistakes, version, compatibility. Check: validator passes; body well under 500 lines; description under 1024 characters.
7. **CI and release.** Node test step in `ci.yml`; plugin `0.4.0`; CHANGELOG; README row and development notes. Check: validator, Python tests and Node tests all pass locally.
8. **Review and ship.** Self-review the diff, run `graphify update .` if the CLI exists, commit, push, open a PR. Do not merge.
