# Job search, profile sync and applications

## Triage

1. **Search by stack and recency**, not by "visa sponsorship". Run several searches (the main language, the cloud, the framework, "full stack" plus the stack) limited to the last seven days, and merge the results.
2. **Read every shortlisted ad in full.** Summaries hide the clauses that matter. Scripted reads are fine, but read the final paragraph of each ad yourself.
3. **Exclude** ads that require any of: citizenship, permanent residency, "full" or "unrestricted" working rights, an existing security clearance, or residence in a named state or region. Treat government-agency contracts and short contracts through agencies as excluded unless the ad says otherwise; they almost never sponsor.
4. **Signals worth flagging:**
   - An ad titled with an official occupation name (in Australia, ANZSCO titles such as "Developer Programmer" or "Software Engineer" with no seniority) can be a labour-market-testing ad for a sponsored visa. It is a hint, not a promise.
   - An ad that asks the applicant to state their current location and start date.
   - "Relocation support" or "visa sponsorship available" in the body.
5. **Score fit** against the ad's essential list: the share of essentials the candidate can show evidence for, and the years asked versus the years the candidate has in that technology. Skip ads where the core stack is one the candidate has not used commercially.

### Remote work from another country

The candidate does not need the employer country's work visa to work for that employer while staying in their own country. Work rights cover work done while physically in the country. The employer still has to accept the arrangement: usually a contractor agreement (the candidate invoices and handles tax at home) or an employer-of-record service that employs the candidate locally. Ads for hybrid or on-site roles rarely accept this; ads marked fully remote, and remote-first job boards, are better targets. This is general information, not legal or tax advice.

## Profile sync

Job sites send the profile with the application, so it must agree with the CV.

1. Read the whole profile: roles, dates, descriptions, education, certifications, skills, location, phone.
2. List what is wrong or missing, for example:
   - a past role still marked "Present";
   - a completed degree shown as "in progress" or "expected";
   - a location in the wrong country;
   - skills from years ago with none of the current stack;
   - certifications on another profile but not this one;
   - duplicates the site imported from the CV upload.
3. Show the list and wait for approval.
4. Make each change, then re-read the field to confirm it saved. Location fields often need an option chosen from the suggestion list; typed text alone is not saved. Some sites accept only a country, not a city, for overseas candidates.
5. If something changes between your reads that you did not touch, the candidate is editing at the same time. Report it; do not restore or overwrite it.

## Filling in an application

1. **The candidate logs in.** Open the site's sign-in page and wait. Never type a password or read one from a file.
2. **Documents.** Upload the new CV even if the site shows a default. Confirm by name and upload time which file is selected. Upload the job's own cover letter.
3. **Screening questions.**
   - Work rights: pick the option that matches the truth ("I require sponsorship to work for a new employer").
   - Years of experience: count from the first professional role, and stay inside the evidence.
   - Salary: give the market rate for that role and city in the local currency, inside the ad's range if it gives one. Never use the candidate's current pay from their home country, and never write it down.
   - Anything you cannot answer from evidence: stop and ask.
4. **External forms.** Some ads redirect to the employer's or recruiter's own system. Fill it in the same way. Choose "overseas" or "other" for state or region when the candidate is abroad.
5. **Identity or work-rights checks.** If the site requires identity verification before applying, stop. The candidate does it, because it involves their ID documents.
6. **Stop before Submit.** Leave consent checkboxes and the Submit button to the candidate. Report what is filled in.
7. **After submit**, confirm the job appears in the applied list.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Every browser call hangs or times out | A native dialog, pop-up or file chooser is open, often in another tab | Ask the candidate to close it; cancel the hung calls; do not retry in a loop |
| "Does not handle the modal state" | A file chooser opened (sometimes from a stray click on "Upload photo") | Cancel the chooser with an empty upload, then continue |
| A click times out because another element "intercepts pointer events" | An overlay or modal covers the page | Read the modal text and act on it (or close it) before clicking |
| Typed text is appended to the old value | Typing character by character keeps the field's content | Clear the field first, then type |
| A location will not save | The field needs a suggestion selected | Type, wait for suggestions, click the right one, then save |
| A design preview of the CV cuts off the last section | The frame is shorter than the content | Measure the rendered height and set the frame to match |
| A page break splits a heading from its bullets | The heading or context line is not kept with the next paragraph | Set "keep with next" on headings and context lines |
| The site's search returns a different domain | The site redirects by region | Follow the redirect; job ids stay the same |
