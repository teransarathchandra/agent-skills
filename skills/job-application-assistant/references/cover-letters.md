# Cover letters

One letter per job, written after reading the whole ad. A letter that could be sent to any employer does more harm than none.

## When to write one

| The ad or form | Do this |
|---|---|
| Asks for a cover letter | Full letter, 250–400 words |
| Has an optional letter field | A short letter, 150–250 words: why this job, the best evidence, logistics |
| Says not to send one | None |
| Has a "message to the recruiter" box | Three or four sentences from the letter; never paste the whole letter |

The candidate reads every letter before it is sent and confirms each sentence is true. They are the author; the agent drafts.

## Read the ad first

Read the full text, not the summary card. Note:

- The ad's own requirement list. The letter answers it in the same order and words.
- A named recruiter or contact ("contact Alex for a confidential discussion"). Address the letter to that person.
- What the ad asks the letter to include ("tell us your current location and when you could start").
- The work-rights clause, usually in the last lines. If it rules the candidate out, do not write the letter (see [job-search-and-applications.md](job-search-and-applications.md#triage)).

## Structure (one page, about 250–400 words)

1. **Why this job.** One or two sentences tied to something specific in the ad: the product, the customers, the way the team works.
2. **Evidence.** Map the candidate's real work to the top two or three requirements. Name the technology the ad names. Use the CV's facts; add no new claims.
3. **Something extra.** A publication, an open-source project, a certification, or a domain match ("much of my work has been for the same kinds of customers you serve").
4. **Gaps, stated plainly.** "I have not yet worked with [TECHNOLOGY]; I would approach it by ..." Honest gaps read better than a bluff an interviewer will find.
5. **Logistics.** Current location, work rights, relocation, the remote-contractor option while a visa is processed, notice period, time-zone overlap with the employer's city.
6. **Close.** One sentence asking for a conversation.

## Logistics sentence patterns

- Needs sponsorship, will relocate: "I am based in [CITY, COUNTRY] and would need visa sponsorship to join you in [EMPLOYER CITY]; I am ready to relocate."
- Remote start: "If it helps while a visa is processed, I can start remotely as a contractor, since a [CANDIDATE CITY] working day overlaps the [EMPLOYER CITY] afternoon."
- Notice: "My notice period is [NOTICE PERIOD]."

Work out the time-zone difference for the date of application (daylight saving changes it) and say it as overlap, not as a problem.

## Building the file

Copy [../assets/cover-letter.json](../assets/cover-letter.json) into the private working folder, fill it, and run from the skill folder:

```bash
(cd scripts && npm install)                                   # once; installs the pinned docx version
node scripts/build_letter.js --check ~/JobSearch/letter.json  # validate and count words; writes nothing
node scripts/build_letter.js ~/JobSearch/letter.json ~/JobSearch/"[CANDIDATE NAME]_Cover_Letter_[EMPLOYER].docx"
```

The script refuses to run while a `[PLACEHOLDER]` is left, checks every field, warns when the body is under 150 or over 400 words, stops over 450, and will not overwrite an existing file unless you pass `--force`. Leave `--force` off by default; add it only to rebuild a letter you built earlier in the same session, after the candidate asked for a change. `paper` is `a4` or `letter`. Keep one JSON per job in the private folder; they hold the candidate's contact details, so never commit them.

Check the result is one page (see [ats-cv.md](ats-cv.md#checking-the-page-count)). Six paragraphs at 400 words is the usual limit on A4 with 11 pt text.

## Words to avoid

They read as generated and say nothing: "passionate", "leverage", "synergy", "dynamic", "results-driven", "fast-paced environment", "I am writing to express my interest", "I believe I would be a great fit", "delve", "seamless", "cutting-edge". Replace each with the concrete thing the candidate did.
