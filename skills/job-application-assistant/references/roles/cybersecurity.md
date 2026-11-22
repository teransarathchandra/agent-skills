# Role profile: cybersecurity

Load this when the person works in security: engineering, SOC, GRC (governance, risk, compliance), penetration testing. Follow it for intake, evidence, CV shape, keywords and screening answers.

## Titles and adjacent roles

- Common titles: Security Engineer, SOC Analyst, Security Analyst, Penetration Tester, GRC or Compliance Analyst, Cloud Security Engineer, Incident Responder, Security Architect.
- Realistic moves after a layoff: SOC analyst to detection engineer or incident responder; sysadmin or network engineer to security engineer; GRC to risk or privacy; developer to application security.
- Search the person's title plus "information security" and "cyber".

## Evidence sources

- Case and alert records: SIEM and ticket summaries (Splunk, Sentinel), counts of alerts triaged, mean time to detect or respond. Counts only, no incident detail.
- Assessments and audits: pen test reports, control assessments, ISO 27001 or SOC 2 audit outcomes, vulnerability reduction. Use outcomes the person can state.
- Engineering work: detection rules, automation scripts, hardening, repos the person wrote.
- Documents: policies written, risk registers, training delivered, praise messages.
- Public: CTF results, labs (Hack The Box, TryHackMe), a blog, CVE credits, bug bounty acknowledgements. Private under an NDA: client and employer names, vulnerabilities found, incident details, network layouts, tooling configs. Never describe an unpatched weakness in a named organisation.

## Intake questions

1. Which area is the strength? (answer as it is: SOC, engineering, GRC, pen testing, cloud security)
2. Which direction do you want?
   a) **Same role and level (Recommended: strongest evidence)**
   b) Toward engineering or detection
   c) Toward GRC or risk
   d) Other: type it
3. Where is the proof of your work? (pick any)
   a) **Reports and metrics you can state in general terms (Recommended: shows impact)**
   b) Scripts, rules or repos you own
   c) Public CTFs, labs or blog posts
   d) Other: type it
4. Which certifications do you hold? (answer as it is: name and issuer, or none)
5. Do you hold or can you obtain a security clearance? (answer as it is: none, held, or can apply; citizenship may matter. No recommendation.)

## CV shape

- Order: header, summary, skills (tools, frameworks, cloud), experience, certifications, education, labs and CTFs for juniors.
- Summary leads with years, the area (SOC, GRC, pen testing), the environment size and the frameworks (NIST, ISO 27001, MITRE ATT&CK).
- Bullets, action then result then how, generic about clients:
  - "Cut false-positive alerts by about a third by tuning 40 detection rules in Splunk at Example Logistics."
  - "Led a SOC 2 readiness project that closed 25 control gaps ahead of the audit, with a tracked remediation plan."
  - "Found and reported 12 web vulnerabilities in internal apps, all fixed, using OWASP-based testing."
- Never include exploit detail for a real system.

## Keywords and credentials

- Keywords from the ad: SIEM, EDR, incident response, threat hunting, vulnerability management, NIST, ISO 27001, SOC 2, MITRE ATT&CK, OWASP, IAM, cloud security, risk assessment.
- Credentials seen, with issuer: CompTIA Security+ (CompTIA, common at entry level); CISSP (ISC2, usually senior roles, with five years of experience asked by the issuer); CISM and CISA (ISACA, management and audit); OSCP (OffSec, penetration testing); GIAC certifications such as GSEC (GIAC; SANS training is separate); CEH (EC-Council).
- Entry-level ads often name Security+; no certification was consistently required for SOC analyst in sampled ads. Never state a credential as required unless the ad does. Government and defence roles may add clearance rules.

## Portfolio and work samples

- Not expected for SOC or GRC. Offensive and engineering roles value public labs, write-ups, tools or CTF profiles.
- Write-ups must use legal targets only (your own lab, CTF, authorised programme).

## Screening questions

- "Which SIEM or EDR have you used": from `experience.items`.
- "Do you hold CISSP / Security+": true or false; "in progress" only with an exam date.
- "Experience with frameworks (NIST, ISO 27001)": say hands-on or read-only, honestly.
- "Clearance or background check": answer as it is; consent to a check is a fact, not a preference.

## Answer-bank experience keys

Collect lowercase keys with years or true/false: `splunk`, `sentinel`, `crowdstrike`, `siem`, `edr`, `nessus`, `burp suite`, `metasploit`, `wireshark`, `nist`, `iso 27001`, `soc 2`, `incident response`, `threat hunting`, `python`, `security+`, `cissp`, `cism`, `oscp`, `clearance`.

## Mistakes to avoid

- Naming clients, incidents or unpatched vulnerabilities.
- Listing tools run once as expertise.
- Claiming a credential whose experience requirement the person has not met, or that has lapsed.
- Putting a clearance level the person does not hold.

## Sources

Checked 2026-11:
- Dice, Coursera, Splunk and Monitor career guides for cybersecurity credentials; ISC2, CompTIA, ISACA and OffSec pages for issuers and prerequisites.
- GIAC GSEC: giac.org/certification/security-essentials-gsec (issuer GIAC).
- Unverified: EC-Council CEH (cert.eccouncil.org): current version and eligibility not confirmed on the issuer's page. Unverified: no consistent certification requirement for SOC analyst found; confirm in target ads. Unverified: confirm current exam prerequisites with each issuer.
