# ATS-safe CV

An applicant tracking system (ATS) turns the CV into plain text and matches it against the job ad. Anything it cannot parse is lost. Build for the parser first, then for the person.

## Layout

- One column. No tables, text boxes, columns, icons, skill bars or photo.
- Real text. Never an image or a scanned PDF. Test: open the PDF and select the text.
- Built-in heading styles, with standard names, in this order: **Summary, Skills, Experience, Projects, Publications, Education, Certifications.** Skills sit near the top so a recruiter sees the keywords first.
- Contact block at the top as plain text: name, title, city and country (with time zone if applying abroad), phone, email, profile and repo links, and one line on work preference ("Open to remote, hybrid and on-site roles; willing to relocate").
- Each role: `Title, Employer`, then `City, Country | Mon YYYY – Mon YYYY`, then bullets. One project heading per client product, each with a one-line context sentence.
- Two pages. Check the page count after every edit (see below).
- Leave out date of birth, marital status, nationality, photo and references. Employers in the UK, US, Canada and Australia are told not to use them, and they cost space.
- Skip Europass for tech roles. Its tables parse badly and private employers rarely expect it.

## One version per region

| Region | Paper | Spelling | Notes |
|---|---|---|---|
| UK, Europe, Australia, New Zealand | A4 | UK (programme, specialising) | Two pages is normal |
| USA, Canada | US Letter | US (program, specializing) | "Resume"; two pages is fine at 5+ years |

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
