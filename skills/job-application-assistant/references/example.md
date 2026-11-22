# Example run

Everything below is fictional: the candidate, the employers, the ads and the files. It shows the shape of each message, not real advice for a real person.

## 1. Intake

**Candidate:** "Help me apply for .NET jobs in Australia. My CV is old."

The message answers the role (question 1) and a region (question 2). The agent asks the rest of the first groups in one message:

> Before I start, a few choices. Reply `ok` to take every recommended answer, or change only what you want, for example `ok, 7b, 5: ~/JobSearch/old/CV.docx`.
>
> 2. Besides Australia? a) **Also fully remote roles anywhere (Recommended: no visa needed, widest pool)** b) Australia only c) Other: type the countries
> 5. Most recent CV? a) **Path to the .docx (Recommended: cleanest text)** b) Path to a PDF c) Other: type a path or "none"
> 6. Degree certificate? a) **Path to the scan or PDF (Recommended: the title must match it exactly)** b) Type the exact title, institution and date c) Other: type it
> 7. Grades on the CV? a) **Only if strong: give the transcript path (Recommended)** b) No grades c) Other: type it
> 12. No work tracker is connected. Where can I find what you worked on? (pick any) a) **Your GitHub or GitLab pull requests, reviews and commits (Recommended: real, dated evidence)** b) Local repo paths c) A tracker export (CSV or PDF) d) **Performance reviews or release notes (Recommended if you have them)** e) Other: type it
> 13. Right to work in Australia? a) Citizen or permanent resident b) A visa that allows work c) Need sponsorship. Answer as it is.

**Candidate:** `ok, 7b, 5: ~/JobSearch/old/CV.docx, 6: ~/JobSearch/docs/degree.pdf, 12a,c ~/JobSearch/docs/tickets.csv, 13c`

The agent plays the answers back in one line ("Australia plus remote; your GitHub PRs and reviews plus the ticket export as evidence; no grades; you need sponsorship") and starts. `gh auth status` shows the candidate's GitHub account, so it runs `gh search prs --author @me --merged` and `gh search prs --reviewed-by @me` for the time in the current role.

## 2. CV check

The old CV, run through `scripts/ats_check.py` with the terms from the first ad ([../assets/terms-example.txt](../assets/terms-example.txt)):

```text
ERROR  contact details are only in a page header or footer; many parsers skip those parts, so move name, email and phone into the body
WARN   a table is used; some parsers read tables out of order. Use plain paragraphs
WARN   uncommon font(s): Montserrat; if the reader lacks a font, Word substitutes one and the layout moves. Use a common font such as Calibri or Arial
WARN   heading 'Tech Stack' is not a section name parsers know; use a standard name such as Experience, Education or Skills
WARN   no standard heading for Education (for example 'Education')
WARN   no standard heading for Skills (for example 'Skills')
WARN   dates use more than one style (Mon YYYY, MM/YYYY); pick one, for example 'Jan 2020 – Mar 2023'
KEYWORDS  2/8 found (25%)
  missing: .NET, ASP.NET Core, SQL Server, REST APIs, Kubernetes, TypeScript
  Add a missing term only where the candidate's evidence supports it.
```

The rebuilt CV:

```text
OK  no structural problems found
KEYWORDS  6/8 found (75%)
  missing: REST APIs, Kubernetes
  Add a missing term only where the candidate's evidence supports it.
```

The tickets and merged pull requests show REST endpoints the candidate built, so "REST APIs" goes into that bullet. Nothing shows Kubernetes, so it stays off the CV and the letter names it as a gap.

## 3. Job sites and accounts

With the CV and the first letter passing their checks, the agent asks:

> Your CV and letter are ready. Reply `ok` for the recommended choices.
>
> 26. Where should we apply? (pick any) a) **Employers' own careers pages (Recommended: no middleman, fewest scams)** b) **Seek (Recommended for Australia)** c) **LinkedIn (Recommended)** d) Indeed e) Other: type a site
> 27. Accounts? a) **You create any you don't have, with my setup sheet (Recommended: about ten minutes per site)** b) You have them all c) Other: type it
> 28. How should we apply? a) **I fill employers' own forms to the review page, give you answer sheets for Seek, LinkedIn and Indeed, and submit only the batches you approve (Recommended: no account risk)** b) As (a), plus LinkedIn Easy Apply filled for you after you read the account-risk warning and opt in c) Answer sheets only d) Other: type it
>
> Seek, LinkedIn and Indeed forbid bots and automated tools in their terms, and accounts that use them can be restricted, so (a) keeps me off those sites. The setup sheet makes the accounts quick.

**Candidate:** `ok, 26a,b,c,d`

The agent writes a setup sheet per site (headline, summary, skills, which CV to upload, profile visibility), and the candidate creates the Seek and Indeed accounts.

## 4. Tracker

| Job | Employer | Fit | Work-rights clause | CV and letter | Applied | Follow up | Status |
|---|---|---|---|---|---|---|---|
| Senior .NET Developer | Example Logistics | Strong: C#, Azure, SQL Server (keywords 7/8) | None stated | `CV_A4.pdf`, `Letter_Example_Logistics.pdf` | – | – | Awaiting approval |
| .NET Engineer | Example Health | Good: C#, .NET (keywords 5/8) | "Full Australian working rights" | – | – | – | Skipped: needs full working rights |
| Software Engineer (remote) | Example Software | Strong: C#, React | Remote, contractor accepted | `CV_A4.pdf`, `Letter_Example_Software.pdf` | 17 Nov 2026 | 28 Nov 2026 | Submitted |
| Backend Developer | "Example Careers" | – | – | – | – | – | Skipped: recruiter asked for a fee to "process the visa" (scam pattern) |

## 5. Batch report

> **1. Senior .NET Developer, Example Logistics (Sydney): on its review page.**
> Filled in: name, email, phone, location (Overseas), profile URL.
> Attached: `CV_A4.pdf` (the old 2023 CV the site pre-selected is no longer selected) and `Letter_Example_Logistics.pdf`.
> Screening answers: right to work, "I require sponsorship"; years with C#, 6; expected salary, 120000 (your Australia figure); "Did you use AI?", "AI helped draft; I reviewed and confirmed every line" (your intake choice). Privacy notice ticked (your intake choice); job alerts left off.
>
> Reply `submit all`, `submit 1`, or change an answer (`1: notice = 2 weeks`).

**Candidate:** `submit 1`

The agent re-opens the form, checks the review page still matches, submits, and records the site's confirmation message in the tracker.
