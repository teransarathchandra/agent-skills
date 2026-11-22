# Role profile: DevOps, cloud and SRE

Load this when the person runs infrastructure and delivery: DevOps, cloud, SRE, platform, infrastructure. Follow it for intake, evidence, CV shape, keywords and screening answers.

## Titles and adjacent roles

- Common titles: DevOps Engineer, Cloud Engineer, Site Reliability Engineer (SRE), Platform Engineer, Infrastructure Engineer, Systems Administrator, Release Engineer, Cloud Architect.
- Realistic moves after a layoff: sysadmin to cloud or DevOps; DevOps to SRE or platform; developer to DevOps; cloud engineer to cloud security or solutions architect.
- Search the person's title plus "platform", "reliability" and "infrastructure".

## Evidence sources

- Infrastructure repos: Terraform, Ansible, Helm, pipeline definitions (GitHub Actions, GitLab CI, Jenkins). Use the person's own commits and pull requests.
- Monitoring and incident records: uptime or SLO reports, incident reviews (postmortems), on-call summaries, Grafana or Datadog exports.
- Cost and delivery metrics: cloud bill reductions, deploy frequency, build time, lead time. Use only what the person has records of.
- Work tracker: tickets for migrations and incidents, summary and dates only.
- Public: a personal infra repo, a blog. Private under an NDA: account IDs, hostnames, network layouts, secrets, client names, internal runbooks. Never paste config that holds credentials; describe it.

## Intake questions

1. Which clouds and tools should lead? (answer as it is: AWS, Azure, Google Cloud, Kubernetes, Terraform)
2. Which direction do you want?
   a) **Same role and level (Recommended: strongest evidence)**
   b) Toward SRE or platform engineering
   c) Toward cloud architecture or security
   d) Other: type it
3. Where is the proof of your work? (pick any)
   a) **Infra and pipeline repos on GitHub or GitLab (Recommended: dated, real)**
   b) Incident reports, uptime or cost reports
   c) Tracker or an export
   d) Other: type it
4. Which certifications do you hold? (answer as it is: name and issuer, or none)
5. Do you accept on-call?
   a) **Yes, say so where the ad has on-call (Recommended: it is often asked)**
   b) No
   c) Other: type it

## CV shape

- Order: header, summary, skills (cloud, IaC, containers, CI/CD, monitoring), experience, certifications, education.
- Summary leads with years, the cloud and tools, the scale (services, environments, traffic) and the outcome type (reliability, cost, speed).
- Bullets, action then result then how:
  - "Cut deployment time from 45 to 8 minutes by moving 20 services to GitHub Actions and Helm at Example Logistics."
  - "Raised availability from 99.5% to 99.95% by adding health checks, autoscaling and alerting in Prometheus."
  - "Reduced monthly cloud spend by about a fifth by rightsizing instances and scheduling dev environments with Terraform." Use only with the bill evidence.

## Keywords and credentials

- Keywords from the ad: Kubernetes, Docker, Terraform, Ansible, CI/CD, AWS, Azure, GCP, monitoring, observability, incident response, SLO, Linux, scripting, IaC.
- Credentials seen in ads, with issuer: AWS Certified Solutions Architect (Associate, Professional) and AWS Certified DevOps Engineer Professional (Amazon Web Services); Microsoft Azure Administrator AZ-104 and DevOps Engineer Expert (Microsoft); Google Cloud Associate Cloud Engineer and Professional Cloud DevOps Engineer (Google Cloud); CKA, CKAD and CKS (CNCF, with the Linux Foundation); Terraform Associate (HashiCorp).
- Many ads list one as preferred and some ask for a cloud certification; many ask for none. Never present a credential as required unless the target ads show it. Hiring teams still test hands-on skill.

## Portfolio and work samples

- Not usually expected. A small public repo (Terraform module, CI pipeline, Helm chart with README) helps for career changers and juniors.
- Never publish real account IDs, hostnames or secrets, even old ones.

## Screening questions

- "Years with AWS, Azure, Kubernetes": from `experience.items`; count hands-on production years, not course time.
- "Have you managed production on-call?": answer as it is, with rotation size if known.
- "Do you hold certification X?": true or false from the bank; add the expiry year if known.
- "Have you built CI/CD from scratch?": yes only with the evidence; otherwise say what was owned.

## Answer-bank experience keys

Collect lowercase keys with years or true/false: `aws`, `azure`, `gcp`, `kubernetes`, `docker`, `terraform`, `ansible`, `helm`, `jenkins`, `github actions`, `gitlab ci`, `prometheus`, `grafana`, `datadog`, `linux`, `bash`, `python`, `on-call`, `aws solutions architect`, `cka`, `az-104`.

## Mistakes to avoid

- Listing every tool as expert; pick the few with real production use.
- Bullets about "maintained infrastructure" with no reliability, cost or speed result.
- Pasting real hostnames, account IDs or secrets into samples.
- Claiming a certification that has lapsed without saying so.

## Sources

Checked 2026-11:
- Indeed career advice, Linux Foundation certification roadmap and AWS, Microsoft and Google Cloud certification pages: certification names and issuers; sources are career guides, not postings.
- Sampled public DevOps and cloud ads that list CKA, CKAD or AWS certifications as preferred.
- HashiCorp Terraform Associate (004): developer.hashicorp.com/certifications/terraform-associate (issuer HashiCorp).
- Unverified: confirm which certification the target ads ask for; one aggregator's "most in-demand" claim was not confirmed. Unverified: confirm HashiCorp's current corporate branding (HashiCorp is now part of IBM) on the issuer's page before naming it on a CV.
