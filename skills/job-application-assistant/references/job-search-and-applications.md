# Job search, profile sync and applications

## Contents

- Triage, and remote work from another country
- Scams and ghost jobs
- Site rules on automation (LinkedIn, Seek, Indeed, employer sites; assisted mode by opt-in)
- Job sites by region
- Profile sync
- Filling in an application (screening questions, AI use, diversity questions)
- After applying
- Troubleshooting
- Sources

## Triage

1. **Search by stack and recency**, not by "visa sponsorship". Run several searches (the main language, the cloud, the framework, "full stack" plus the stack) limited to the last seven days, and merge the results.
2. **Read every shortlisted ad in full.** Summaries hide the clauses that matter. Scripted reads are fine, but read the final paragraph of each ad yourself.
3. **Exclude** ads that require any of: citizenship, permanent residency, "full" or "unrestricted" working rights, an existing security clearance, or residence in a named state or region. Treat government-agency contracts and short contracts through agencies as excluded unless the ad says otherwise; they almost never sponsor.
4. **Signals worth flagging:**
   - An ad titled with an official occupation name (in Australia, ANZSCO titles such as "Developer Programmer" or "Software Engineer" with no seniority) can be a labour-market-testing ad for a sponsored visa. It is a hint, not a promise.
   - An ad that asks the applicant to state their current location and start date.
   - "Relocation support" or "visa sponsorship available" in the body.
5. **Check the ad is real** (see [Scams and ghost jobs](#scams-and-ghost-jobs)).
6. **Score fit** against the ad's essential list: the share of essentials the candidate can show evidence for, and the years asked versus the years the candidate has in that technology. Skip ads where the core stack is one the candidate has not used commercially. Aim for a few well-matched applications, not many weak ones; tailored applications get far more replies.
7. **Prefer the employer's own site.** When a job-board ad links to the employer's careers page, apply there unless the ad says to apply on the board.

### Remote work from another country

The candidate does not need the employer country's work visa to work for that employer while staying in their own country. Work rights cover work done while physically in the country. The employer still has to accept the arrangement: usually a contractor agreement (the candidate invoices and handles tax at home) or an employer-of-record service that employs the candidate locally. Ads for hybrid or on-site roles rarely accept this; ads marked fully remote, and remote-first job boards, are better targets. This is general information, not legal or tax advice.

## Scams and ghost jobs

Honest employers do not ask applicants to pay to get a job. Drop the ad and tell the candidate when any of these appear:

- A request for money: training, a starter kit, certification, a background check, equipment to buy "and be repaid from the first pay", or a "processing" or visa fee. Payment by gift card, wire transfer, cryptocurrency or a peer-to-peer app makes it near certain.
- A cheque sent in advance with a request to forward part of the money. The cheque bounces after the candidate's money has gone.
- A request for ID, bank or tax details before a written offer.
- First contact out of the blue by text or a messaging app; an interview held only by chat; an offer with no interview.
- A recruiter writing from a free email address, or from a domain that imitates the employer's; a cloned careers site; a company with no registered address, or a careers page that does not list the role.
- Pay far above the market for the role, vague duties, or pressure to accept today.

**Verify before replying** to an unexpected recruiter: find the role on the employer's own careers page (reached by searching for the company, not through the recruiter's link) and, if in doubt, call the company's main number and ask for the recruiter by name. A polished profile and a video call are not proof; fake profiles and cloned sites are common, and some interviews use deepfake video.

If the candidate has already paid or sent documents, tell them to contact their bank at once and report it to their country's fraud-reporting service (in the US, ReportFraud.ftc.gov). Never contact the scammer on the candidate's behalf.

Signs of a ghost job (an ad with no real vacancy behind it): reposted unchanged for more than a month, no hiring contact, and not on the employer's own careers page. Lower its priority rather than dropping it.

## Site rules on automation

Some job sites forbid bots and automated tools in their terms of use. Before steps 6 and 7 on a site, check its terms. Where automation is not allowed, the default is an answer sheet (every screening answer, the files to attach, the letter text) and the candidate fills the form; for a profile, an edit sheet instead (see below). The candidate may opt in to assisted mode on such a site after a plain warning about the account risk ([assisted-apply.md](assisted-apply.md#the-linkedin-opt-in)). Wherever the agent works, it uses the candidate's own signed-in session, at human pace, one application at a time.

| Site | What its terms say | So the agent |
|---|---|---|
| LinkedIn | User Agreement 8.2 bars bots and other automated methods | Prepares; the candidate edits the profile and applies. With the candidate's opt-in: assisted mode, capped at 10 to 15 a day |
| Seek (also JobStreet and Jobsdb) | Website Terms 9(b): no automated process, script, tool or bot to access, search or collect information, except through an API Seek provides | Prepares; the candidate creates the account and applies |
| Indeed | Terms of Service A.3: no automation, scripting or bots to automate Indeed Apply, except Indeed's own tools; the candidate must review and adopt all content before submitting | Prepares; the candidate applies, or switches on Indeed's own Apply For Me in their account if it is offered |
| An employer's own careers site | Varies; read the site's terms | Fills the form in the candidate's logged-in session where allowed; submits only after batch approval |

Creating an account counts too: on these sites the candidate signs up. The agent supplies a setup sheet (headline, summary, skills, the CV to upload, the visibility settings to pick) so it takes minutes. Passwords and email or phone verification are always the candidate's.

## Job sites by region

Offer these in intake question 26, plus the employers' own careers pages, which are recommended everywhere: they cut out the middleman and are the safest against scams.

| Region | Main sites |
|---|---|
| Australia and New Zealand | Seek, LinkedIn, Indeed |
| UK and Ireland | LinkedIn, Indeed, Reed, Totaljobs |
| USA and Canada | LinkedIn, Indeed, Glassdoor; Wellfound for startups |
| Germany, Austria, Switzerland | StepStone, LinkedIn, XING |
| India | Naukri, LinkedIn |
| Gulf states | Bayt, LinkedIn, GulfTalent |
| Singapore, Malaysia, Hong Kong | JobStreet or Jobsdb, LinkedIn |

Read each site's terms before steps 6 and 7; the table above covers only the sites checked so far.

## Profile sync

Job sites send the profile with the application, so it must agree with the CV.

1. Read the whole profile: roles, dates, descriptions, education, certifications, skills, location, phone. Where the site forbids automated tools (LinkedIn does) and the candidate has not opted in, do not open the profile with the browser tool: ask the candidate for the text or the site's own PDF export, and in step 4 give them an edit sheet (each field, its current text, the new text) to make the changes themselves. With the opt-in, read and edit it with the engine's `profile` commands ([assisted-apply.md](assisted-apply.md#profile-edits-in-assisted-mode)).
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
   - Salary: the candidate's figure for that country from the answer bank. With no figure for the country, ask with a recommended market level for that role and city; never convert another country's figure. Many forms accept only a number. Current pay only if the candidate chose to give it, typed for that form and never written down.
   - Use of AI: before drafting, look for the employer's AI policy (in the ad, the careers pages or the application's terms); most candidates never check, and some employers reject applications that break it. When a form asks whether AI helped, answer truthfully as the candidate chose at intake (recommended: "AI helped draft; I reviewed and confirmed every line"). If the employer forbids AI help, stop and ask the candidate how to proceed.
   - Voluntary diversity questions (gender, ethnicity, disability, veteran status): use the candidate's intake choice; the default is "Prefer not to say". Never infer an answer from a name, photo or anything else.
   - References: give names only with the candidate's say-so; usually "available on request".
   - Anything you cannot answer from evidence: stop and ask, with options and a recommendation (see [intake.md](intake.md)).
4. **External forms.** Some ads redirect to the employer's or recruiter's own system. Fill it in the same way. Choose "overseas" or "other" for state or region when the candidate is abroad.
5. **Identity or work-rights checks.** If the site requires identity verification before applying, stop. The candidate does it, because it involves their ID documents.
6. **Stop at the review page.** Check the attached CV's file name and the letter's opening, then add the job to the batch report ([assisted-apply.md](assisted-apply.md#the-batch-report)). Tick a required privacy-notice box only if the candidate agreed at intake; leave marketing and "follow company" boxes off.
7. **Submit only what the candidate approved**, after re-checking the review page, then confirm the site's own confirmation message and that the job appears in the applied list.

## After applying

- Record the date applied and a follow-up date seven to ten working days later in the tracker.
- On the follow-up date, if there is a named contact and no reply, draft a three-sentence note for the candidate to send: the role, one line of fit, a question about timing. One follow-up only.
- When an interview is offered, prepare it with [interview-prep.md](interview-prep.md).
- Mark rejections and silence after about four weeks as closed. Keep the ad text; it is needed if the employer calls months later.
- A rejection that arrives within minutes, at night, or before anyone could have read the CV was probably automated. In the UK and the EU, data-protection law (GDPR Article 22) lets a person ask for human review of a decision made solely by automated means; draft the request for the candidate if they want to send one. Elsewhere, a polite note to the recruiter is the only option.

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
| The site shows a CAPTCHA or "unusual activity" | The site suspects automation | Stop; the candidate solves it or fills the form from the answer sheet. Never try to get around it |

## Sources

Checked 2026-11; re-check before relying on them.

- US Federal Trade Commission, job scams: <https://consumer.ftc.gov/articles/job-scams>, and reporting at <https://reportfraud.ftc.gov>.
- LinkedIn Help, prohibited software and extensions (User Agreement section 8.2 bars bots and automated methods): <https://www.linkedin.com/help/linkedin/answer/a1341387>.
- GDPR Article 22, automated individual decision-making: <https://gdpr-info.eu/art-22-gdpr/>.
- Seek Website Terms and Conditions, clause 9(b), last updated 20 July 2026: <https://au.seek.com/terms>.
- Indeed Terms of Service, section A.3 (Applying to Jobs), last updated 29 September 2026: <https://www.indeed.com/legal>.
