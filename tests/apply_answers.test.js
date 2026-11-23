'use strict';
// Tests for skills/job-application-assistant/scripts/apply/lib/answers.mjs: the rules that
// answer application-form questions from the candidate's answer bank. Questions are real
// wording seen on LinkedIn Easy Apply, Workable, SmartRecruiters and Greenhouse forms.
// Run: node --test tests/*.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const MODULE = pathToFileURL(path.join(__dirname, '..', 'skills', 'job-application-assistant', 'scripts', 'apply', 'lib', 'answers.mjs')).href;

const bank = {
  candidate: { nationality: 'Example', location: 'Colombo, Sri Lanka', linkedin: 'https://www.linkedin.com/in/example', github: 'https://github.com/example' },
  countries: {
    AU: { needs_sponsorship: true, has_work_rights: false, lives_there: false, salary: 115000 },
    UK: { needs_sponsorship: true, has_work_rights: false, lives_there: false, salary: 50000 },
  },
  notice: { text: 'One month', weeks: 4 },
  years: { total: 5, skills: { typescript: 4, 'c#': 2, '.net': 2, react: 2, azure: 2, sql: 5 }, none: ['aws', 'kotlin'] },
  policy: { relocate: true, hybrid_or_onsite_ok: true, has_degree: true, worked_here_before: false, referred: false, has_clearance: false, background_check_ok: true, disability_scheme: false, needs_adjustments: false, currently_employed: true, privacy_consent: true, marketing_contact: false },
  questions: { 'non-compete': 'No' },
};

test('work rights and sponsorship come from the job country', async () => {
  const { yesNo } = await import(MODULE);
  assert.equal(yesNo('Will you now or in the future require sponsorship for employment visa status?', bank, 'AU'), 'Yes');
  assert.equal(yesNo('Are you legally authorized to work in Australia?', bank, 'AU'), 'No');
  assert.equal(yesNo('Do you have full working permission for Czechia, Germany or Denmark without visa sponsorship?', bank, 'UK'), 'No');
  assert.equal(yesNo('Are you legally able to work in Belgium without a company sponsored visa?', bank, 'UK'), 'No');
  assert.equal(yesNo('Do you have the right to work in the UK either now or in future?', bank, 'UK'), 'No');
});

test('a country missing from the bank is not guessed', async () => {
  const { yesNo, text } = await import(MODULE);
  assert.equal(yesNo('Are you legally authorized to work in Canada?', bank, 'CA'), null);
  assert.equal(text('Expected Salary', bank, 'NZ'), null);
});

test('employment questions are not confused with each other', async () => {
  const { yesNo } = await import(MODULE);
  assert.equal(yesNo('Are you currently employed?', bank, 'UK'), 'Yes');
  assert.equal(yesNo('Are you currently employed at Example Privacy?', bank, 'UK'), 'No');
  assert.equal(yesNo('Are you currently, or have you ever been, employed by Example Motors or its subsidiaries?', bank, 'UK'), 'No');
});

test('everyday policy questions', async () => {
  const { yesNo } = await import(MODULE);
  assert.equal(yesNo('Do you currently live in Belgium or are open to relocate for the role?', bank, 'UK'), 'Yes');
  assert.equal(yesNo('Are you comfortable working in an onsite setting?', bank, 'UK'), 'Yes');
  assert.equal(yesNo("Have you completed the following level of education: Bachelor's Degree?", bank, 'UK'), 'Yes');
  assert.equal(yesNo('Are you willing to undergo a background check as part of this process?', bank, 'UK'), 'Yes');
  assert.equal(yesNo('Would you like your application to be considered under the Disability Confident Scheme?', bank, 'UK'), 'No');
  assert.equal(yesNo('Would you like to receive emails, text messages, or phone calls about this job and other matching opportunities?', bank, 'UK'), 'No');
});

test('questions only the candidate can answer stay unanswered, unless the bank has their own answer', async () => {
  const { yesNo } = await import(MODULE);
  assert.equal(yesNo('Do you or a close family member have any financial interest in an Example Consulting competitor, supplier, or client?', bank, 'UK'), null);
  assert.equal(yesNo('Are you currently bound by non-compete agreements with your current or previous employers?', bank, 'UK'), 'No');
});

test('years of experience use the evidence, and unknown technologies are asked', async () => {
  const { years } = await import(MODULE);
  assert.equal(years('How many years of work experience do you have with TypeScript?', bank), '4');
  assert.equal(years('How many years of work experience do you have with C#?', bank), '2');
  assert.equal(years('How many years of work experience do you have with Cloud Development?', bank), null);
  assert.equal(years('How many years of work experience do you have with Amazon Web Services (AWS)?', bank), '0');
  assert.equal(years('How many years of work experience do you have with MongoDB?', bank), null);
  assert.equal(years('How many years of professional experience do you have designing and developing object-oriented software?', bank), '5');
});

test('framework names ending in .js are not read as JavaScript', async () => {
  const { years, text } = await import(MODULE);
  assert.equal(years('How many years of work experience do you have with React.js?', bank), '2');
  assert.equal(years('How many years of work experience do you have with Next.js?', bank), null);
  assert.equal(text('How many yrs of .Net fullstack exp do you have?', bank, 'AU'), '2');
});

test('salary is the figure for the job country; current pay only when the candidate chose to give it', async () => {
  const { text } = await import(MODULE);
  assert.equal(text('What are your salary expectations?', bank, 'UK'), '50000');
  assert.equal(text('Current Salary', bank, 'UK'), null);
  assert.equal(text('Notice Period in Weeks', bank, 'UK'), '4');
  assert.equal(text('What is your current notice period?', bank, 'UK'), 'One month');
});

test('options: work status, salary bands, English, demographics', async () => {
  const { pickOption } = await import(MODULE);
  const uk = ['Select an option', 'British or Irish citizen', 'Indefinite Leave to Remain', 'Graduate visa', 'I require sponsorship to work in the UK'];
  assert.equal(pickOption('Right to work status', uk, bank, 'UK'), 'I require sponsorship to work in the UK');
  const nz = ['Select an option', 'I am a New Zealand Citizen or Permanent Resident', 'I do not currently have legal authority to work in New Zealand and will require employer visa sponsorship to be able to legally work in New Zealand.'];
  assert.match(pickOption('What is your current work status in New Zealand?', nz, { ...bank, countries: { NZ: { needs_sponsorship: true } } }, 'NZ'), /require employer visa sponsorship/);
  const bands = ['Select an option', '£40,001 to £45,000', '£45,001 to £50,000', '£50,001 to £55,000'];
  assert.equal(pickOption('Salary expectation band', bands, bank, 'UK'), '£45,001 to £50,000');
  const english = ['Select an option', 'Native or bilingual proficiency', 'Fluent/Professional working proficiency', 'Limited working proficiency'];
  assert.equal(pickOption('What is your proficiency level in English?', english, bank, 'UK'), null, 'no recorded level: ask');
  const withLevel = { ...bank, candidate: { ...bank.candidate, english_level: 'professional' } };
  assert.equal(pickOption('What is your proficiency level in English?', english, withLevel, 'UK'), 'Fluent/Professional working proficiency');
  assert.equal(pickOption('What is your gender?', ['Select an option', 'Male', 'Female', 'Prefer Not to Say'], bank, 'UK'), 'Prefer Not to Say');
  assert.equal(pickOption('How many years of experience do you have?', ['Select an option', '0-12 months', '1-3 years', '3-5 years', '5+ years'], bank, 'UK'), '5+ years');
});

test('consent: required privacy notice only with the intake answer; marketing never by default', async () => {
  const { consentAllowed } = await import(MODULE);
  assert.equal(consentAllowed('By applying for this job, I confirm I have read the Privacy Notice and consent to the processing of my data', bank), true);
  assert.equal(consentAllowed('I agree to receive WhatsApp messages for future career opportunities', bank), false);
  assert.equal(consentAllowed('By applying for this job, I confirm I have read the Privacy Notice', { ...bank, policy: { ...bank.policy, privacy_consent: false } }), false);
});

test('LinkedIn hosts are recognised however they are written', async () => {
  const { isLinkedInHost } = await import(MODULE.replace('answers.mjs', 'linkedin.mjs'));
  for (const h of ['linkedin.com', 'www.linkedin.com', 'WWW.LinkedIn.com', 'www.linkedin.com.', 'au.linkedin.com..', 'lnkd.in']) assert.equal(isLinkedInHost(h), true, h);
  for (const h of ['example.com', 'notlinkedin.com', 'linkedin.com.example.com', '']) assert.equal(isLinkedInHost(h), false, h);
});

test('old bank answers unchanged', async () => {
  const { years } = await import(MODULE);
  assert.equal(years('How many years of work experience do you have with TypeScript?', bank), '4');
  assert.equal(years('How many years of work experience do you have with Amazon Web Services (AWS)?', bank), '0');
  assert.equal(years('How many years of work experience do you have with MongoDB?', bank), null);
  assert.equal(years('How many years of professional experience do you have designing and developing object-oriented software?', bank), '5');
});
test('experience wins per key', async () => {
  const { years, experienceOf } = await import(MODULE);
  const b = { ...bank, experience: { total_years: 6, items: { typescript: 5, playwright: 3 } } };
  assert.equal(years('How many years of work experience do you have with TypeScript?', b), '5');
  assert.equal(years('How many years of work experience do you have with C#?', b), '2');
  assert.equal(years('How many years of work experience do you have with Playwright?', b), '3');
  assert.equal(experienceOf(b).total, 6);
});
test('credentials answer from items', async () => {
  const { years, yesNo } = await import(MODULE);
  const qa = { role_family: 'qa-testing', experience: { total_years: 4, items: { selenium: 3, 'istqb foundation level': true, jmeter: 1 } }, policy: {} };
  assert.equal(years('How many years of work experience do you have with Selenium?', qa), '3');
  assert.equal(yesNo('Do you hold an ISTQB certification?', qa, 'UK'), 'Yes');
  assert.equal(yesNo('Are you a Certified ScrumMaster (CSM)?', qa, 'UK'), null);
  assert.equal(years('How many years of experience do you have in this role?', qa), '4');
  assert.equal(years('How many years of QA experience do you have?', qa), '4');
});

test('credential and fallback matching stays tight', async () => {
  const { years, yesNo } = await import(MODULE);
  const da = { role_family: 'data-analytics', experience: { total_years: 5, items: {} } };
  assert.equal(years('How many years of data entry experience do you have?', da), null);
  assert.equal(years('How many years of data analytics experience do you have?', da), '5');
  const qa = { role_family: 'qa-testing', experience: { total_years: 4, items: { istqb: false, ci: true } }, policy: {} };
  assert.equal(years('How many years of testing experience with Cypress do you have?', qa), null);
  const ux = { role_family: 'ux-ui-design', experience: { total_years: 7, items: {} } };
  assert.equal(years('How many years of experience do you have with design systems?', ux), null);
  assert.equal(years('How many years of relevant experience do you have with Terraform?', qa), null);
  assert.equal(yesNo('Do you hold an ISTQB certification?', qa, 'UK'), 'No');
  assert.equal(yesNo('Are you willing to obtain an ISTQB certification?', qa, 'UK'), null);
  assert.equal(yesNo('Do you have a Cisco certification?', qa, 'UK'), null);
  const sh = { experience: { total_years: 4, items: { ci: 2 } } };
  assert.equal(years('How many years of experience do you have with Cisco networking?', sh), null);
});

test('example QA bank answers its own questions', async () => {
  const { years, yesNo } = await import(MODULE);
  const file = path.join(__dirname, '..', 'skills', 'job-application-assistant', 'assets', 'answers.example-qa.json');
  const qa = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.notEqual(years('How many years of work experience do you have with Selenium?', qa), null);
  assert.notEqual(yesNo('Do you hold an ISTQB certification?', qa, 'UK'), null);
});

test('a credential answers only at the level held', async () => {
  const { yesNo } = await import(MODULE);
  const b = (items, policy = {}) => ({ experience: { total_years: 9, items }, policy });
  const qa = b({ 'istqb foundation level': true });
  assert.equal(yesNo('Do you hold an ISTQB certification?', qa, 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold the ISTQB Foundation Level certificate?', qa, 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold ISTQB Advanced Test Analyst?', qa, 'UK'), null);
  assert.equal(yesNo('Do you hold ISTQB Advanced Test Analyst?', b({ istqb: true }), 'UK'), null);
  assert.equal(yesNo('Do you hold PRINCE2 Practitioner?', b({ prince2: true }), 'UK'), null);
  assert.equal(yesNo('Do you hold PRINCE2 Practitioner?', b({ 'prince2 foundation': true }), 'UK'), null);
  assert.equal(yesNo('Do you hold PRINCE2 Practitioner?', b({ 'prince2 practitioner': true }), 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold PSM II?', b({ psm: true }), 'UK'), null);
  assert.equal(yesNo('Do you hold PSM II?', b({ 'psm i': true }), 'UK'), null);
  assert.equal(yesNo('Do you hold PSM I?', b({ 'psm i': true }), 'UK'), 'Yes');
  assert.equal(yesNo('Do you have ITIL 4 Managing Professional?', b({ itil: true }), 'UK'), null);
  assert.equal(yesNo('Do you have ITIL 4 Managing Professional?', b({ 'itil 4 foundation': true }), 'UK'), null);
  assert.equal(yesNo('Do you hold CIPD Level 7 (Chartered)?', b({ cipd: true }), 'UK'), null);
  assert.equal(yesNo('Do you hold CIPD Level 7 (Chartered)?', b({ 'cipd level 5': true }), 'UK'), null);
  assert.equal(yesNo('Do you hold CIPD Level 5?', b({ 'cipd level 5': true }), 'UK'), 'Yes');
  // The longest key decides: a specific "No" beats a generic "Yes".
  const two = b({ 'istqb foundation level': true, 'istqb advanced level': false });
  assert.equal(yesNo('Do you hold ISTQB Advanced Level?', two, 'UK'), 'No');
  // "No ISTQB at all" answers No to every level.
  assert.equal(yesNo('Do you hold ISTQB Advanced Test Analyst?', b({ istqb: false }), 'UK'), 'No');
});

test('clearance goes through policy.has_clearance, never a credential key, and never a level not held', async () => {
  const { yesNo } = await import(MODULE);
  const b = (items, policy = {}) => ({ experience: { total_years: 9, items }, policy });
  assert.equal(yesNo('Do you hold active DV (Developed Vetting) clearance?', b({ clearance: true }), 'UK'), null);
  assert.equal(yesNo('Do you currently hold Top Secret clearance?', b({ clearance: true }), 'US'), null);
  assert.equal(yesNo('Do you hold active DV (Developed Vetting) clearance?', b({}, { has_clearance: true }), 'UK'), null);
  assert.equal(yesNo('Do you hold active DV (Developed Vetting) clearance?', b({}, { has_clearance: false }), 'UK'), 'No');
  assert.equal(yesNo('Do you hold a current security clearance?', b({}, { has_clearance: true }), 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold SC clearance?', { ...b({}, { has_clearance: true }), questions: { 'sc clearance': 'Yes' } }, 'UK'), 'Yes');
});

test('total years answer only the candidate\'s own field', async () => {
  const { years } = await import(MODULE);
  const hr = { role_family: 'hr-recruiting', experience: { total_years: 8, items: { workday: 4, greenhouse: 3 }, none: [] } };
  assert.equal(years('How many years of software development experience do you have?', hr), null);
  assert.equal(years('How many years of professional experience with SAP SuccessFactors do you have?', hr), null);
  assert.equal(years('How many years of learning and development experience do you have?', hr), null);
  const mk = { role_family: 'marketing', experience: { total_years: 6, items: { hubspot: 3 } } };
  assert.equal(years('How many years of web analytics experience do you have?', mk), null);
  const eng = { role_family: 'software-engineering', experience: { total_years: 4, items: { typescript: 3 } } };
  assert.equal(years('How many years of professional experience with Rust do you have?', eng), null);
  assert.equal(years('How many years of software development experience do you have?', eng), '4');
  assert.equal(years('How many years of professional experience do you have?', eng), '4');
  const old = { years: { total: 5, skills: { typescript: 4 } } };
  assert.equal(years('How many years of professional experience with Rust do you have?', old), null);
  assert.equal(years('How many years of web development experience do you have?', old), '5');
});

test('the bank\'s own keys answer before aliases; family wording counts for every role', async () => {
  const { years } = await import(MODULE);
  const b = (f, items) => ({ role_family: f, experience: { total_years: 9, items } });
  assert.equal(years('How many years of experience do you have with Node.js?', b('software-engineering', { node: 3 })), '3');
  assert.equal(years('How many years of experience do you have with REST APIs?', b('software-engineering', { 'rest apis': 4 })), '4');
  assert.equal(years('How many years of stakeholder management experience do you have?', b('project-delivery', { 'stakeholder management': 6, 'project management': 5 })), '6');
  assert.equal(years('How many years of experience in account management do you have?', b('sales-account-management', { 'account management': 4 })), '4');
  assert.equal(years('How many years of experience with vendor management?', b('operations-admin', { 'vendor management': 3 })), '3');
  assert.equal(years('How many years of experience with Salesforce Marketing Cloud?', b('marketing', { 'salesforce marketing cloud': 2 })), '2');
  assert.equal(years('How many years of experience with PostgreSQL?', b('software-engineering', { postgres: 2 })), '2');
  assert.equal(years('How many years of experience with database design?', b('data-analytics', { sql: 4 })), null);
  assert.equal(years('How many years of people management experience do you have?', b('hr-recruiting', { workday: 4 })), null);
  const fam = (f) => ({ role_family: f, experience: { total_years: 5, items: {}, none: [] } });
  for (const [f, q] of [
    ['hr-recruiting', 'How many years of recruiting experience do you have?'],
    ['hr-recruiting', 'How many years of recruitment experience do you have?'],
    ['business-analysis', 'How many years of business analysis experience do you have?'],
    ['business-analysis', 'How many years of business analyst experience do you have?'],
    ['operations-admin', 'How many years of administration experience do you have?'],
    ['ux-ui-design', 'How many years of UX design experience do you have?'],
    ['it-customer-support', 'How many years of customer service experience do you have?'],
    ['it-customer-support', 'How many years of IT support experience do you have?'],
    ['project-delivery', 'How many years of Scrum Master experience do you have?'],
    ['project-delivery', 'How many years of project management experience do you have?'],
    ['devops-cloud', 'How many years of cloud engineering experience do you have?'],
    ['qa-testing', 'How many years of software testing experience do you have?'],
  ]) assert.equal(years(q, fam(f)), '5', `${f}: ${q}`);
  assert.equal(years('How many years of clinical research experience do you have?', fam('any-role')), null);
  assert.equal(years('How many years of recruiting experience with Workday do you have?', fam('hr-recruiting')), null);
  assert.equal(years('How many years of Python development experience do you have?', fam('software-engineering')), null);
});

test('marketing-contact consent is not read into skill questions', async () => {
  const { yesNo } = await import(MODULE);
  const mk = { role_family: 'marketing', experience: { total_years: 6, items: { hubspot: 3 } }, policy: { marketing_contact: false } };
  assert.equal(yesNo('Do you have experience in digital marketing?', mk, 'UK'), null);
  const sales = { role_family: 'sales-account-management', experience: { total_years: 6, items: { salesforce: 4 } }, policy: {} };
  assert.equal(yesNo('Are you comfortable making outbound phone calls?', sales, 'UK'), null);
  assert.equal(yesNo('May we contact you about future opportunities by SMS?', sales, 'UK'), 'No');
  assert.equal(yesNo('Would you like to join our talent community?', sales, 'UK'), 'No');
});

test('notice options come from the bank\'s notice, not a fixed month', async () => {
  const { pickOption } = await import(MODULE);
  const opts = ['Select an option', 'Immediately', '2 weeks', '1 month', '3 months'];
  const b = (notice) => ({ notice, policy: {}, countries: {} });
  assert.equal(pickOption('What is your notice period?', ['Available immediately', '2 weeks', '1 month'], b({ text: 'None', weeks: 0 }), 'UK'), 'Available immediately');
  assert.equal(pickOption('What is your notice period?', opts, b({ text: 'None', weeks: 0 }), 'UK'), 'Immediately');
  assert.equal(pickOption('What is your notice period?', opts, b({ text: 'Two weeks', weeks: 2 }), 'UK'), '2 weeks');
  assert.equal(pickOption('What is your notice period?', opts, b({ text: 'One month', weeks: 4 }), 'UK'), '1 month');
  assert.equal(pickOption('What is your notice period?', opts, b({ text: 'Six weeks', weeks: 6 }), 'UK'), null);
  assert.equal(pickOption('What is your notice period?', opts, b(undefined), 'UK'), null);
  assert.equal(pickOption('What is your notice period?', ['Less than 1 month', '1-3 months'], b({ text: 'Two months', weeks: 8 }), 'UK'), '1-3 months');
});

test('experience type guards: null total and a non-array none', async () => {
  const { years, experienceOf } = await import(MODULE);
  assert.equal(years('How many years of work experience do you have?', { experience: { total_years: null, items: {} } }), null);
  assert.equal(experienceOf({ experience: { total_years: 5, items: {}, none: 'AWS' } }).none.length, 0);
  assert.equal(years('How many years of experience do you have with a CRM?', { experience: { total_years: 5, items: {}, none: 'AWS' } }), null);
});

test('PR review: notice ranges are kept, not read as no notice', async () => {
  const { pickOption } = await import(MODULE);
  const opts = ['Select an option', 'Immediately', 'Less than 2 weeks', '1 month', '2 months'];
  const ranged = { ...bank, notice: { text: 'Less than 2 weeks' } };
  assert.equal(pickOption('What is your notice period?', opts, ranged, 'UK'), 'Less than 2 weeks');
  assert.equal(pickOption('What is your notice period?', ['Select an option', 'Immediately', '1 month'], ranged, 'UK'), null);
  const textWeeks = { ...bank, notice: { weeks: '4' } };
  assert.equal(pickOption('What is your notice period?', opts, textWeeks, 'UK'), '1 month');
});

test('PR review: a family word followed by a specific skill is asked, not answered with the total', async () => {
  const { years } = await import(MODULE);
  const fin = { role_family: 'finance-accounting', experience: { total_years: 8, items: {} } };
  assert.equal(years('How many years of financial modeling experience do you have?', fin), null);
  assert.equal(years('How many years of accounting experience do you have?', fin), '8');
  const ux = { role_family: 'ux-ui-design', experience: { total_years: 5, items: {} } };
  assert.equal(years('How many years of UX design experience do you have?', ux), '5');
  const pd = { role_family: 'project-delivery', experience: { total_years: 6, items: {} } };
  assert.equal(years('How many years of Scrum Master experience do you have?', pd), '6');
});

test('PR review: a one-letter key does not match C# or C++', async () => {
  const { years } = await import(MODULE);
  const c = { experience: { total_years: 6, items: { c: 3 } } };
  assert.equal(years('How many years of work experience do you have with C#?', c), null);
  assert.equal(years('How many years of work experience do you have with C++?', c), null);
  assert.equal(years('How many years of work experience do you have with C?', c), '3');
  const none = { experience: { total_years: 6, items: {}, none: ['c'] } };
  assert.equal(years('How many years of work experience do you have with C#?', none), null);
});

test('0.5.1: a level word inside a credential\'s own name does not block the answer', async () => {
  const { yesNo } = await import(MODULE);
  const b = { experience: { items: { pmp: true, cissp: true, 'psm i': true } }, policy: {} };
  assert.equal(yesNo('Do you hold a PMP (Project Management Professional) certification?', b, 'UK'), 'Yes');
  assert.equal(yesNo('Are you CISSP (Certified Information Systems Security Professional) certified?', b, 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold the Professional Scrum Master I (PSM I) certification?', b, 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold the Professional Scrum Master II (PSM II) certification?', b, 'UK'), null);
});

test('0.5.1: versioned credential keys answer general questions but never another version', async () => {
  const { yesNo } = await import(MODULE);
  const b = { experience: { items: { 'itil 4 foundation': true, 'istqb advanced level test analyst': true } }, policy: {} };
  assert.equal(yesNo('Do you have an ITIL Foundation certification?', b, 'UK'), 'Yes');
  assert.equal(yesNo('Do you have an ITIL certification?', b, 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold ITIL v3 Foundation?', b, 'UK'), null);
  assert.equal(yesNo('Do you hold an ISTQB certification?', b, 'UK'), 'Yes');
  assert.equal(yesNo('Do you hold the ISTQB Test Manager certification?', b, 'UK'), null);
});

test('0.5.1: no notice matches an under-2-weeks option when there is no "immediately"', async () => {
  const { pickOption } = await import(MODULE);
  const b = { ...bank, notice: { weeks: 0 } };
  assert.equal(pickOption('Notice period', ['Select an option', 'Less than 2 weeks', '1 month', '3 months'], b, 'UK'), 'Less than 2 weeks');
});

test('0.5.1: general software wording after "in" still counts as total years on a 0.4.0 bank', async () => {
  const { years } = await import(MODULE);
  assert.equal(years('How many years of experience do you have in object-oriented software development?', bank), '5');
  assert.equal(years('How many years of experience do you have in software development?', bank), '5');
  assert.equal(years('How many years of experience do you have in Kubernetes?', bank), null);
});
