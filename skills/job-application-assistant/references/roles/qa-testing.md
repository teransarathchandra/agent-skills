# Role profile: QA and testing

Load this when the person tests software: manual and automation testing, SDET, performance testing. Follow it for intake, evidence, CV shape, keywords and screening answers.

## Titles and adjacent roles

- Common titles: QA Engineer, QA Analyst, Test Engineer, Software Tester, Automation Engineer, SDET (Software Development Engineer in Test), Performance Tester, QA Lead.
- Realistic moves after a layoff: manual QA to automation QA or SDET; QA to business analyst or product owner (domain knowledge); QA to DevOps or release engineer; automation QA to developer.
- Search the person's title plus "tester", "test engineer" and "quality engineer".

## Evidence sources

- Test management tools: Jira with Xray or Zephyr, TestRail, Azure Test Plans. Read test cycle counts, coverage, pass rates, defects raised and their severity.
- Defect reports and release sign-off notes: defects found before release, escaped defects, regression cycle time.
- Automation repos: GitHub or GitLab frameworks and CI runs (Selenium, Playwright, Cypress, API tests). Use the person's own commits and pull requests (`gh search prs --author @me`).
- Documents: test plans, strategy documents, performance test reports, praise messages.
- Public: a personal automation repo, a test blog. Private under an NDA: client application names, real defect text, test data, internal dashboards. Describe the product generically.

## Intake questions

1. Which kind of testing is the main strength? (answer as it is: manual, automation, API, performance, mobile)
2. Which direction do you want?
   a) **Same role and level (Recommended: strongest evidence)**
   b) Manual to automation or SDET
   c) QA to another role (business analyst, product owner)
   d) Other: type it
3. Where is the proof of your testing? (pick any)
   a) **Test management tool or an export (Recommended: shows scale)**
   b) Automation repo on GitHub or GitLab
   c) Defect reports and release notes
   d) Other: type it
4. Do you have an ISTQB or other testing certificate? (answer as it is: name and level, or none)
5. Can you share any automation code publicly?
   a) **Yes, a personal repo (Recommended: safe sample)**
   b) No, only employer code, so I will describe it
   c) Other: type it

## CV shape

- Order: header, summary, skills (testing types, tools, languages), experience, certifications, education.
- Summary leads with years of testing, the testing types (manual, automation, API, performance), the domain (payments, logistics) and a scale fact (releases, regression suite size).
- Bullets, action then result then how:
  - "Cut regression time from 3 days to 4 hours by automating 320 UI and API checks with Playwright and GitHub Actions at Example Logistics."
  - "Found and documented 140 defects across 12 releases, helping lower production incidents, using risk-based test design in TestRail."
  - "Built an API test suite for 40 endpoints with Postman and Newman, run on every build."
- Show defects found, coverage, time saved or releases supported. Never invent a number.

## Keywords and credentials

- Keywords from the ad: test plan, test cases, regression, UAT, CI/CD, Selenium, Playwright, Cypress, Postman, JMeter, API testing, BDD, Cucumber, Agile.
- ISTQB (International Software Testing Qualifications Board, via national boards) Foundation Level appears in many QA ads, sometimes as required and often as preferred. It is a pattern, not a rule; check the target ads.
- Other names seen: ISTQB Advanced and Agile Tester extensions, ISEB (BCS, the UK body), vendor tool certificates. Unverified: confirm any other certificate in the target ads.

## Portfolio and work samples

- Not expected for manual QA. Automation and SDET ads often ask for a GitHub link; a small framework repo with a README, CI badge and readable tests works.
- Never publish a real client's test data or defects. Test a public demo site instead.

## Screening questions

- "Years of experience in automation testing": count only automation work from the bank; manual years are separate.
- "Which tools have you used": list `experience.items` with years; do not add tools the person only watched.
- "Do you have ISTQB?": answer from the bank, true or false; "in progress" only if booked.
- "Do you write code?": say which languages and what was written.

## Answer-bank experience keys

Collect lowercase keys with years or true/false: `selenium`, `playwright`, `cypress`, `postman`, `jmeter`, `appium`, `cucumber`, `testrail`, `jira`, `xray`, `api testing`, `performance testing`, `sql`, `python`, `java`, `javascript`, `ci/cd`, `istqb`.

## Mistakes to avoid

- Listing "test cases written" with no outcome; show defects found or time saved.
- Hiding manual testing the person is good at; many ads want both.
- Claiming automation from running someone else's scripts.
- Naming the client product or real bug details under an NDA.

## Sources

Checked 2026-11:
- Sampled public QA and Playwright test engineer ads (NTT DATA, adesso, Randstad, Djinni listings): ISTQB Foundation shown as required in some and preferred in most; Playwright, Selenium and Cypress common.
- ISTQB (istqb.org) for the certification scheme and body.
- Unverified: confirm any non-ISTQB certificate before leading with it.
