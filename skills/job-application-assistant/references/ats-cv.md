# ATS-safe CV

An applicant tracking system (ATS) turns the CV into plain text and matches it against the job ad. Anything it cannot parse is lost. Build for the parser first, then for the person.

## Contents

- Layout
- Summary
- Keywords from the ad
- Bullets that show results
- One version per region
- File format
- Checking the page count
- Check with ats_check.py
- Building the .docx
- Honest framing
- Metadata
- How sure this is

## Layout

- One column. No tables, text boxes, icons, skill bars or photo. Word's own column feature parses better than columns built from tables or text boxes, but some systems still read across them line by line, so one column is the safe choice.
- Real text. Never an image or a scanned PDF. Test: open the PDF and select the text.
- Built-in heading styles, with standard names, in this order: **Summary, Skills, Experience, Projects, Publications, Education, Certifications.** Skills sit near the top so a recruiter sees the keywords first.
- Contact block at the top of the body as plain text: name, title, city and country (with time zone if applying abroad), phone, email, profile and repo links, and one line on work preference ("Open to remote, hybrid and on-site roles; willing to relocate"). **Never in the page header or footer**: many parsers skip those parts and the CV arrives without a name.
- A common font (Calibri, Arial, Aptos, Garamond, Georgia or Times New Roman), 10–12 pt for body text and 14–16 pt for headings. Uncommon fonts are swapped on the reader's machine and move the layout.
- One date style throughout, `Mon YYYY – Mon YYYY` (or `Mon YYYY – Present`). Parsers work out years of experience from these dates.
- Each role: `Title, Employer`, then `City, Country | Mon YYYY – Mon YYYY`, then bullets. One project heading per client product, each with a one-line context sentence.
- Two pages. Check the page count after every edit (see below).
- Leave out date of birth, marital status, nationality, photo and references. Employers in the UK, US, Canada and Australia are told not to use them, and they cost space. The [region table](#one-version-per-region) lists the few places where some of them are still expected.
- Skip Europass for tech roles. Its tables parse badly and private employers rarely expect it.

## Summary

Two or three lines under the contact block: the target title (the ad's own title when it honestly fits), years of experience, the core stack, and one standout fact with evidence. No "I", and none of the words in [cover-letters.md](cover-letters.md#words-to-avoid).

## Keywords from the ad

Recruiters search the ATS for the ad's own terms, and many systems rank by them.

1. List the ad's terms: required and preferred skills, tools, certifications, methods and the job title. Write them to a `terms.txt` (one per line, aliases with `|`, for example `AWS|Amazon Web Services`; see [../assets/terms-example.txt](../assets/terms-example.txt)). An alias is another name for the same thing, never a broader or weaker term: `REST APIs|API` or `CI/CD|CI` would count a bare "API" or "CI" as a match and overstate the fit.
2. Use the ad's exact spelling ("Node.js", not "Node"; "CI/CD", not "pipelines"). Write the long form and the acronym once each: "Amazon Web Services (AWS)".
3. Put each term where it was used: the Skills list, and the bullet that shows it. A term only in the Skills list is weak; a term in a bullet is evidence.
4. **Only where the evidence supports it.** A missing term the candidate has not used goes in the letter as a stated gap, never in the CV. Never hide keywords (white text, tiny font): ATS show recruiters the plain text, and it reads as cheating.
5. Run [`scripts/ats_check.py`](#check-with-ats_checkpy) with `--terms` and review what is missing.

Tailor per job by reordering Skills and bullets and adjusting the summary. Do not keep a different set of facts per job.

## Bullets that show results

- **Action, then result, then how:** "Cut CI build time from 20 to 6 minutes by caching dependencies and splitting test stages." Start with a past-tense verb for past work and present tense for the current role.
- Three to six bullets per role, most relevant to the target job first. Older roles get fewer.
- No number in the evidence? Show scope instead (users served, team size, systems touched) or the outcome in words. Never estimate a number.
- One line each where possible, two at most. No "Responsible for" or "Worked on".

## One version per region

| Region | Paper | Spelling | Notes |
|---|---|---|---|
| UK, Ireland, Australia, New Zealand | A4 | UK (programme, specialising) | Two pages is normal |
| USA | US Letter | US (program, specializing) | "Resume"; one page under about 5 years' experience is common, two is fine after |
| Canada | US Letter | Canadian (mostly UK spelling with -ize) | No photo, date of birth or marital status |
| Germany, Austria, Switzerland | A4 | Local language if the ad is in it | A photo and date of birth are still common but optional; leave them out unless the candidate wants them |
| Rest of the EU | A4 | UK, or the ad's language | Follow the ad; Europass is optional |
| India | A4 | UK | Leave out personal details (father's name, religion, date of birth) that older templates include |
| Gulf states | A4 | UK | Nationality, visa status and a photo are often expected; ask the candidate what to include |
| Japan, Korea | A4 | The ad's language | Local employers may want a local-format form (in Japan, the rirekisho); ask before building one. International firms accept an English CV |

When the region is not listed, follow the ad and ask the candidate with a recommendation (see [intake.md](intake.md)).

Generate both from one source so a change lands in both. Letter is shorter than A4, so it overflows first: if it spills, tighten heading spacing or margins (not below 0.5 in) before cutting content.

## File format

- Upload **.docx** to online application forms unless the form asks for PDF. Most parsers read Word files best.
- Send a **PDF** exported from Word (File > Save As > PDF) when emailing a person.
- Name files plainly: `[CANDIDATE NAME]_CV.docx`, `[CANDIDATE NAME]_Resume_US_Letter.docx`.

## Checking the page count

Word reports pages after its own layout, which is what the employer sees.

```bash
# macOS with Microsoft Word
osascript -e 'tell application "Microsoft Word"
  open file name (POSIX file "/path/to/CV.docx" as text)
  set n to compute statistics document 1 statistic statistic pages
  close document 1 saving no
  return n
end tell'

# Anywhere with LibreOffice
soffice --headless --convert-to pdf CV.docx && pdfinfo CV.pdf | grep Pages
```

If Word stops answering (`doesn't understand the "close" message`), a dialog is open in Word. Ask the candidate to close it rather than retrying.

## Check with ats_check.py

`scripts/ats_check.py` reads the .docx the way a parser does (standard library only, nothing leaves the machine):

```bash
python scripts/ats_check.py CV_A4.docx                         # structure
python scripts/ats_check.py CV_A4.docx --terms terms.txt       # plus keyword coverage for one job
```

It reports **errors** (no readable text; contact details only in a header or footer) and **warnings** (tables, text boxes, images, columns, uncommon fonts, non-standard headings, mixed date styles), and with `--terms` the share of the ad's terms found and the ones missing. Exit code 1 means an error. Fix every error. Fix a warning or explain to the candidate why it stays. Run it on every version after every edit, together with the page count.

A clean result means the common traps are avoided. It is not a copy of any vendor's parser and does not promise a score.

## Building the .docx

Use a docx skill or the `docx` npm package. Things that keep it ATS-safe and tidy:

- Section headings as `HeadingLevel.HEADING_1`, with a bottom border instead of a horizontal-rule table.
- Bullets from a numbering config, never a typed `•`.
- `keepNext` on job titles, project headings and context lines, so a heading never ends a page alone.
- `creator` and `title` set in the document properties (see [Metadata](#metadata)).

## Honest framing

- **Context, then contribution.** A one-line description of the product and its architecture, in italics, then bullets that start with what the candidate did: "Built", "Designed", "Fixed", "Wrote".
- **Architecture as context.** If the candidate knows the whole system but built part of it, the system goes in the context line. Interviewers ask about every bullet.
- **Name clients generically** unless the candidate's contract allows names: "a US national education nonprofit", "a global real estate platform".
- **Numbers only from data.** Test counts, user counts and percentages must come from the repo, tracker or a report. Commit counts read as padding; leave them out.
- **Degree title exactly as on the certificate.** Add class of honours, a strong final-year GPA or a dean's-list award. Leave out weak yearly GPAs.
- **Training and workshops** stay off unless the candidate wants them; they are not experience.
- **Skills from research or courses** only if the candidate could discuss them in an interview. Certifications back them up.

## Metadata

A .docx carries author, company and edit history in its properties.

- Set `creator` to the candidate's name and `title` to "[CANDIDATE NAME] CV" when generating.
- To clean a file someone else edited: in Word on Windows, File > Info > Check for Issues > Inspect Document > remove Document Properties and Personal Information, then save. On a Mac, Word > Preferences > Security > tick "Remove personal information from this file on save", then save again.

## How sure this is

ATS vendors do not publish how their parsers treat each layout feature. The rules above are the points that career-service guides and resume-checking tools agree on (checked 2026-11): headers and footers, text boxes and shapes are the most often lost; tables are read out of order by some systems and fine in others; Word's built-in columns parse better than table-based ones. Claims that a named system "ignores headers" come from third-party testing, not vendor documentation. When a candidate asks why a rule exists, say this plainly, and prefer the layout that is safe in every system over one that works in most.
