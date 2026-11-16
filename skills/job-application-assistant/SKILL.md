---
name: job-application-assistant
description: Use when someone wants help applying for jobs - rebuilding a CV or resume so applicant tracking systems (ATS) can read it, tailoring it to a job ad's keywords, writing a cover letter for a specific ad, deciding which ads to apply for (including ones that need visa sponsorship or remote work from another country), spotting scam ads, syncing a job-site profile with the CV, filling in online applications with a browser agent, following up, or preparing for the interview. Also when a job-search task needs the candidate's degree certificate, transcript, work tickets (Jira or another tracker) or git history as evidence.
license: MIT
compatibility: Needs a way to write .docx files (a docx skill, or Node.js 18+ with npm install in scripts/ for build_letter.js). scripts/ats_check.py needs Python 3.9+ and nothing else. Step 7 works best with a browser tool such as the Playwright MCP. A work-tracker tool (for example a Jira MCP) helps step 1 but is optional. Microsoft Word or LibreOffice helps to check page counts.
metadata:
  author: teransarathchandra
  version: "0.2.0"
---

# Job application assistant

Take a candidate from an old CV to submitted applications: an ATS-safe CV built from real evidence, one cover letter per job, a job-site profile that matches the CV, application forms filled in by a browser agent, and interview notes. The candidate presses every Submit button.

## Rules (non-negotiable)

- **Ask with a recommendation, never guess.** When an input is missing (a file path, a tool that is not connected, a preference), ask a question with concrete options and mark one "(Recommended)" with its reason. Batch the questions. Facts such as work rights have no recommendation: "answer as it is". See [references/intake.md](references/intake.md).
- **Evidence or nothing.** Every line in the CV or a letter traces to a source: the old CV, a certificate, a transcript, an official publication page, a repo README, work tickets, git history or an existing profile. No invented metrics, no keywords without evidence. Counts come from real data.
- **Keep sensitive data out.** Never write current salary, ID, passport or visa numbers, or a home address into files, memory, subagent prompts or outside services. Contact details go in the CV and letters only. Working files live in a private folder outside any git repository.
- **The candidate submits.** Stop before every Submit button. Leave privacy-consent checkboxes for the candidate. The candidate logs in; never type or store a password.
- **Answer truthfully.** Work rights, sponsorship, years of experience and use of AI are answered as they are, even when the honest answer filters the application out. Voluntary diversity questions get the candidate's own choice; the default is "Prefer not to say".
- **Respect each site's rules.** Where a site's terms forbid automated tools, prepare an answer sheet and let the candidate fill the form. Elsewhere work at human pace, one application at a time. Never get around a CAPTCHA.
- **Ask before changing an account.** Show every proposed profile change and wait for approval.

## Steps

Copy this checklist into your reply and tick it off as you go:

```text
- [ ] 0 Intake answered (paths, tracker access, work rights, preferences)
- [ ] 1 Evidence gathered; every source recorded
- [ ] 2 CV built; ats_check.py exits 0 on every version; page counts checked
- [ ] 3 Every bullet traced to a source
- [ ] 4 Ads triaged; scams dropped
- [ ] 5 Per job: terms.txt, CV tailored, letter checked and built
- [ ] 6 Profile changes approved and made
- [ ] 7 Form filled; stopped before Submit
- [ ] 8 Tracker updated; follow-up date set
```

0. **Intake.** Ask what the candidate's message and files do not already answer, in groups, each question with options and a recommended answer: target roles and regions; paths to the old CV, degree certificate and transcript; certifications, publications, repos and profile links; work-tracker access, with a fallback when it is not connected; work rights, notice, relocation and how to answer salary; preferences; where to keep files. Question bank and the work-tracker fallback: [references/intake.md](references/intake.md).
1. **Gather evidence.** Read the old CV, then the degree certificate (title, institution, date only; never copy registration or certificate numbers) and transcript (grades only if strong). Take publication metadata (title, authors, venue, year, DOI) from the official page. Read the README of each public repo you might list. For current work, pull completed and in-progress tickets from the work tracker (or the fallback the candidate chose) and read the git history, but describe the client generically (`a national education nonprofit`, not its name) unless the candidate says otherwise. Check the candidate's professional profile for certifications and skills the old CV missed.
2. **Build the CV.** One column, standard headings, contact block in the body (never the page header), a common font, one date style, two pages, one version per paper size. Run `python scripts/ats_check.py <CV.docx>` on every version; fix what it reports and run it again until it exits 0, then check the page count. Details, keywords, bullets and region formats: [references/ats-cv.md](references/ats-cv.md).
3. **Frame it honestly.** Separate what the product is (one context line) from what the candidate did (bullets in action-and-result form). Architecture the candidate understands but did not build goes in the context line, not in a bullet. Leave out commit counts and workshop attendance unless the candidate asks for them. See [references/ats-cv.md](references/ats-cv.md#honest-framing).
4. **Triage job ads.** Search by stack and recency, then read every shortlisted ad in full, including the last lines, where the work-rights clause usually sits. Drop scams; deprioritise ghost jobs. Exclusion rules, sponsorship signals and remote-work facts: [references/job-search-and-applications.md](references/job-search-and-applications.md#triage).
5. **Tailor and write one cover letter per job.** List the ad's terms in a `terms.txt` (format: [assets/terms-example.txt](assets/terms-example.txt)), run `python scripts/ats_check.py <CV.docx> --terms terms.txt`, and reorder Skills and bullets where the evidence supports it. Write the letter from [assets/cover-letter.json](assets/cover-letter.json), check it with `node scripts/build_letter.js --check letter.json`, then build it. Map the candidate's evidence to the ad's own requirements and name any gap. Guide: [references/cover-letters.md](references/cover-letters.md).
6. **Sync the job-site profile.** Compare it with the CV: stale roles, wrong dates, a degree still "in progress", wrong location, old skills, missing certifications. List the changes, get approval, then make them. See [references/job-search-and-applications.md](references/job-search-and-applications.md#profile-sync).
7. **Fill in the application** with a browser agent where the site allows it, or as an answer sheet where it does not: new CV, the matching letter, truthful screening answers. Handle redirects to the employer's own form. Stop before Submit. See [references/job-search-and-applications.md](references/job-search-and-applications.md#filling-in-an-application).
8. **Record, follow up and prepare.** After the candidate submits, confirm it appears in the site's applied list and update the tracker table below with the date and a follow-up date. When an interview comes, build STAR stories from the same evidence: [references/interview-prep.md](references/interview-prep.md). Then start the next job from step 5.

## Output format

A full fictional run (intake messages, checker output, tracker, stop-before-Submit report): [references/example.md](references/example.md).

Keep one tracker table and update it after every application:

| Job | Employer | Fit | Work-rights clause | CV and letter | Applied | Follow up | Status |
|---|---|---|---|---|---|---|---|
| [TARGET ROLE] | [EMPLOYER] | Strong: .NET, Azure (keywords 9/11) | None stated | `CV_A4.docx`, `Letter_[EMPLOYER].docx` | – | – | Ready for your Submit |

Status is one of: `Ready for your Submit`, `Submitted by you`, `Follow-up due`, `Interview`, `Closed: <reason>`, `Blocked: <what the candidate must do>`, `Skipped: <reason>`.

When you stop before Submit, say in a few lines what is filled in, which files are attached, how each screening question was answered, and what is left for the candidate (Submit, consent box, identity check).

## Mistakes to avoid

- Asking an open question ("Where are your documents?") when the options can be named, or guessing a path instead of asking.
- Waiting on a work tracker that is not connected. Offer the fallbacks in [references/intake.md](references/intake.md#group-3-tool-access) and carry on with what is available.
- Trusting a job site's "visa sponsorship" search. Most matches mention sponsorship only to say it is not available.
- Shortlisting from the ad summary. The "full working rights" line is often the last sentence.
- Treating a recruiter who asks for fees, bank details or ID before an offer as genuine. It is a scam pattern; drop the ad and tell the candidate.
- Putting the contact block in the page header. Many parsers skip headers, and the CV arrives nameless. `ats_check.py` catches it.
- Running a bundled script by bare path (`scripts/ats_check.py`). Some installs strip the executable bit; always call it through `python` or `node`.
- Adding an ad's keyword the candidate has no evidence for. Name it as a gap in the letter instead.
- Attaching the CV the site pre-selects. It is often years old. Upload the new one and check which file is selected.
- Adding a section and not re-checking the page count of every version. The US Letter copy overflows first.
- Keeping a claim from the old CV that no source supports, or a degree title that differs from the certificate.
- Listing commit or ticket counts as achievements. They read as padding.
- Retrying a browser call that hangs. A dialog or file chooser is usually open; dismiss it first.
- Editing a profile while the candidate edits it too. Re-read before each change and report anything that changed between reads.
- Reverting a change in one copy only. When the candidate removes something, remove it from every version of the CV and the design copy.
