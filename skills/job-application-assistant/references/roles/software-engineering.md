# Role profile: software engineering

Load this when the person builds software: web, mobile, back end, full stack, embedded. Follow it for intake, evidence, CV shape, keywords and screening answers.

## Titles and adjacent roles

- Common titles: Software Engineer, Backend Developer, Full Stack Developer, Frontend Engineer, Mobile (iOS, Android) Developer, Embedded Engineer, .NET or Java Developer.
- Realistic moves after a layoff: one level up in the same stack; backend to platform or DevOps; full stack to frontend or backend; developer to SDET or solutions engineer when the stack matches.
- Titles differ by company (Engineer, Developer, Programmer, Member of Technical Staff). Search both the person's title and the family.

## Evidence sources

- Code hosting: pull requests written, reviews given, issues and commits (see Code-hosting commands below). Real, dated evidence.
- Work tracker (Jira, Linear, Azure DevOps): tickets the person worked on; read summary, status, type and dates only.
- Documents: performance reviews, promotion cases, release notes, design docs, praise messages. Take what the person did and the result.
- Public: open-source contributions, a personal site, deployed side projects. Private under an NDA: employer code, client names, internal metrics, ticket keys. Describe the client generically ("a logistics client").

### Code-hosting commands

Check which account `gh auth status` shows. For a work account that is not the default, pass `GH_TOKEN=$(gh auth token --user <name>)` on each command instead of switching accounts. Pull the person's own work for the date range:

```bash
gh search prs --author @me --merged --created ">=2024-01-01" --json title,repository,createdAt,url --limit 200
gh search prs --reviewed-by @me --created ">=2024-01-01" --json title,repository,createdAt --limit 200
gh search issues --author @me --created ">=2024-01-01" --json title,repository,createdAt --limit 100
gh search commits --author <login> --committer-date ">=2024-01-01" --json repository,commit --limit 200
```

Private organisation repos appear only when the account can see them. Group results by product area and read PR descriptions for scope and results. Drop ticket keys and counts from anything on the CV. For local repos use `git log --author="<email>" --since="2 years ago" --date=short --pretty=format:'%ad %s'`. Never send code from a client's private repo to an outside service.

## Intake questions

1. Which stack should lead the CV? (answer as it is: languages, frameworks, cloud)
2. Which kind of work do you want next?
   a) **Same kind of work as now (Recommended: your strongest evidence)**
   b) A different layer (backend to full stack, web to mobile)
   c) Adjacent role (platform, DevOps, SDET)
   d) Other: type it
3. Which proof of current work can I use? (pick any)
   a) **Your GitHub or GitLab account (Recommended: dated, real)**
   b) Local repo paths
   c) Tracker or an export
   d) Documents: reviews, release notes
   e) Other: type it
4. Do you have public code or a live project you want linked?
   a) **Yes, link the best one or two (Recommended: recruiters click them)**
   b) No, all work was private
   c) Other: type it

## CV shape

- Order: header, summary, skills, experience, projects (if public), education, certifications.
- Summary: years of experience, main stack, the kind of system built, one scope fact (users, services, team size).
- Skills: group by language, framework, cloud, data, tooling. List only what the person has used.
- Bullets, action then result then how, one line each:
  - "Cut checkout API latency from 900 to 250 ms by adding a read cache and batching queries at Example Logistics."
  - "Led migration of 14 services to containers, ending manual deploys, using Docker and GitHub Actions."
  - "Reviewed about 20 pull requests a month across a team of eight, which kept release defects low." Use only when the evidence shows it.

## Keywords and credentials

- Keywords come from the ad: languages, frameworks, cloud, "CI/CD", "microservices", "REST", "code review". Mirror the ad's wording where the person has the skill.
- Many software ads ask for a degree or equivalent experience, not a certification. Vendor certifications (AWS, Microsoft Azure, Google Cloud, Oracle for Java) appear as "nice to have" more than required; confirm in the target ads before leading with one.

## Portfolio and work samples

- Many ads ask for a GitHub or portfolio link; it is not universal. A good one has two or three pinned repos with a README, run instructions and tests, plus recent commits.
- Never publish employer code. A short write-up of a design decision works as a sample.

## Screening questions

- "Years of experience with X": answer from the answer bank `experience.items`; give the real number, round down.
- "Do you have experience with Y?": yes only if in the bank; otherwise "no, but I have used Z, which is similar" if true.
- Take-home tests and live coding: ask the person to confirm the time they can give.
- Notice period and right to work: answer as it is (see the logistics group).

## Answer-bank experience keys

Collect lowercase keys with years: `python`, `java`, `javascript`, `typescript`, `c#`, `go`, `react`, `node`, `sql`, `aws`, `azure`, `docker`, `kubernetes`, `git`, `ci/cd`, `rest apis`, `microservices`. Credentials as true or false (for example `aws solutions architect`). Add the person's own stack.

## Mistakes to avoid

- A skills list of every tool ever seen; ATS matches count, humans want depth.
- Bullets about duties ("worked on the backend") with no result or scope.
- Ticket keys, client names or internal repo names on the CV.
- Claiming a framework from a tutorial as work experience.

## Sources

Checked 2026-11:
- GitHub CLI manual, `gh search` commands (cli.github.com/manual), carried over from the skill's earlier intake guidance.
- Sampled public software engineer job ads (company career pages, job boards): degree or experience asked, certifications rarely required.
- Unverified: confirm which vendor certifications the target ads name before leading with one.
