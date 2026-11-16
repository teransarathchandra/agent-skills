---
name: job-application-assistant
description: Use when someone wants help applying for jobs - rebuilding a CV or resume so applicant tracking systems (ATS) can read it, writing a cover letter for a specific job ad, deciding which ads to apply for (including ones that need visa sponsorship or remote work from another country), syncing a job-site profile with the CV, or filling in online applications with a browser agent. Builds every claim from the candidate's own evidence, keeps sensitive personal data out of files and memory, and always stops before Submit.
license: MIT
compatibility: Needs a way to write .docx files (a docx skill, or Node.js 18+ with the docx npm package for scripts/build_letter.js). Step 7 needs a browser automation tool such as the Playwright MCP. Microsoft Word or LibreOffice helps to check page counts.
metadata:
  author: teransarathchandra
  version: "0.1.0"
---

# Job application assistant

Take a candidate from an old CV to submitted applications: an ATS-safe CV built from real evidence, one cover letter per job, a job-site profile that matches the CV, and application forms filled in by a browser agent. The candidate presses every Submit button.

## Rules (non-negotiable)

- **Evidence or nothing.** Every line in the CV or a letter traces to a source: the old CV, a certificate, a transcript, an official publication page, a repo README, work tickets, git history or an existing profile. No invented metrics. Counts come from real data.
- **Keep sensitive data out.** Never write current salary, ID, passport or visa numbers, or a home address into files, memory, subagent prompts or outside services. Contact details go in the CV and letters only.
- **The candidate submits.** Stop before every Submit button. Leave privacy-consent checkboxes for the candidate. The candidate logs in; never type or store a password.
- **Answer truthfully.** Work rights, sponsorship and years of experience are answered as they are, even when the honest answer filters the application out.
- **Ask before changing an account.** Show every proposed profile change and wait for approval.

## Steps

1. **Gather evidence.** Read the old CV, then the degree certificate (title, institution, date only; never copy registration or certificate numbers) and transcript (grades only if strong). Take publication metadata (title, authors, venue, year, DOI) from the official page. Read the README of each public repo you might list. For current work, pull completed and in-progress tickets from the work tracker and read the git history, but describe the client generically (`a national education nonprofit`, not its name) unless the candidate says otherwise. Check the candidate's professional profile for certifications and skills the old CV missed.
2. **Build the CV.** One column, standard headings, plain text, two pages, one version per paper size. Details, region formats and the page-count check: [references/ats-cv.md](references/ats-cv.md).
3. **Frame it honestly.** Separate what the product is (one context line) from what the candidate did (bullets). Architecture the candidate understands but did not build goes in the context line, not in a bullet. Leave out commit counts and workshop attendance unless the candidate asks for them. See [references/ats-cv.md](references/ats-cv.md#honest-framing).
4. **Triage job ads.** Search by stack and recency, then read every shortlisted ad in full, including the last lines, where the work-rights clause usually sits. Exclusion rules, sponsorship signals and remote-work facts: [references/job-search-and-applications.md](references/job-search-and-applications.md#triage).
5. **Write one cover letter per job** from [assets/cover-letter.json](assets/cover-letter.json) with `scripts/build_letter.js`. Map the candidate's evidence to the ad's own requirements and name any gap. Guide: [references/cover-letters.md](references/cover-letters.md).
6. **Sync the job-site profile.** Compare it with the CV: stale roles, wrong dates, a degree still "in progress", wrong location, old skills, missing certifications. List the changes, get approval, then make them. See [references/job-search-and-applications.md](references/job-search-and-applications.md#profile-sync).
7. **Fill in the application** with a browser agent: new CV, the matching letter, truthful screening answers. Handle redirects to the employer's own form. Stop before Submit. See [references/job-search-and-applications.md](references/job-search-and-applications.md#filling-in-an-application).
8. **Record and move on.** After the candidate submits, confirm it appears in the site's applied list, update the tracker table below, and start the next job from step 5.

## Output format

Keep one tracker table and update it after every application:

| Job | Employer | Fit | Work-rights clause | CV and letter | Status |
|---|---|---|---|---|---|
| [TARGET ROLE] | [EMPLOYER] | Strong: .NET, Azure | None stated | `CV_A4.docx`, `Letter_[EMPLOYER].docx` | Ready for your Submit |

Status is one of: `Ready for your Submit`, `Submitted by you`, `Blocked: <what the candidate must do>`, `Skipped: <reason>`.

When you stop before Submit, say in a few lines what is filled in, which files are attached, how each screening question was answered, and what is left for the candidate (Submit, consent box, identity check).

## Mistakes to avoid

- Trusting a job site's "visa sponsorship" search. Most matches mention sponsorship only to say it is not available.
- Shortlisting from the ad summary. The "full working rights" line is often the last sentence.
- Attaching the CV the site pre-selects. It is often years old. Upload the new one and check which file is selected.
- Adding a section and not re-checking the page count of every version. The US Letter copy overflows first.
- Keeping a claim from the old CV that no source supports, or a degree title that differs from the certificate.
- Listing commit or ticket counts as achievements. They read as padding.
- Retrying a browser call that hangs. A dialog or file chooser is usually open; dismiss it first.
- Editing a profile while the candidate edits it too. Re-read before each change and report anything that changed between reads.
- Reverting a change in one copy only. When the candidate removes something, remove it from every version of the CV and the design copy.
