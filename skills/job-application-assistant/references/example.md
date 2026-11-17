# Example run

Everything below is fictional: the candidate, the employers, the ads and the files. It shows the shape of each message, not real advice for a real person.

## 1. Intake

**Candidate:** "Help me apply for .NET jobs in Australia. My CV is old."

The message answers the role (question 1) and a region (question 2). The agent asks the rest of the first groups in one message:

> Before I start, a few choices. Reply with numbers and letters, for example `5a ~/JobSearch/old/CV.docx`.
>
> 2. Besides Australia? a) **Also fully remote roles anywhere (Recommended: no visa needed, widest pool)** b) Australia only c) Add New Zealand
> 5. Most recent CV? a) **Path to the .docx (Recommended: cleanest text)** b) Path to a PDF c) No CV, build from your profile
> 6. Degree certificate? a) **Path to the scan or PDF (Recommended: the title must match it exactly)** b) Type the exact title, institution and date c) No degree
> 7. Grades on the CV? a) **Only if strong: give the transcript path (Recommended)** b) No grades
> 12. Right to work in Australia? a) Citizen or permanent resident b) A visa that allows work c) Need sponsorship. Answer as it is.

**Candidate:** `2a 5a ~/JobSearch/old/CV.docx 6a ~/JobSearch/docs/degree.pdf 7b 12c`

No work tracker is connected, so the next group starts with:

> Your work tracker is not connected. How should I get evidence of your current work?
> a) **Connect the tracker tool now, then tell me (Recommended: real ticket titles and dates)**
> b) Export your tickets to CSV and give me the path
> c) Paste ticket titles
> d) Use git history only
> e) Skip; I will mark every claim "to verify"

**Candidate:** `b ~/JobSearch/docs/tickets.csv`

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

The tickets show REST endpoints the candidate built, so "REST APIs" goes into that bullet. Nothing shows Kubernetes, so it stays off the CV and the letter names it as a gap.

## 3. Tracker

| Job | Employer | Fit | Work-rights clause | CV and letter | Applied | Follow up | Status |
|---|---|---|---|---|---|---|---|
| Senior .NET Developer | Example Logistics | Strong: C#, Azure, SQL Server (keywords 7/8) | None stated | `CV_A4.docx`, `Letter_Example_Logistics.docx` | – | – | Ready for your Submit |
| .NET Engineer | Example Health | Good: C#, .NET (keywords 5/8) | "Full Australian working rights" | – | – | – | Skipped: needs full working rights |
| Software Engineer (remote) | Example Software | Strong: C#, React | Remote, contractor accepted | `CV_A4.docx`, `Letter_Example_Software.docx` | 17 Nov 2026 | 28 Nov 2026 | Submitted by you |
| Backend Developer | "Example Careers" | – | – | – | – | – | Skipped: recruiter asked for a fee to "process the visa" (scam pattern) |

## 4. Stop before Submit

> **Senior .NET Developer, Example Logistics: ready for your Submit.**
> Filled in: name, email, phone, location (Overseas), profile URL.
> Attached: `CV_A4.docx` (uploaded today 10:42; the old 2023 CV the site pre-selected is not selected) and `Letter_Example_Logistics.docx`.
> Screening answers: right to work, "I require sponsorship"; years with C#, 6; salary expectation, the market rate for Sydney inside the ad's range; "Did you use AI?", "AI helped draft; I reviewed and confirmed every line" (your intake choice).
> Left for you: the privacy-consent box and Submit.
