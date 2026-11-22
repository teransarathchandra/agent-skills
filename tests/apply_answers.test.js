'use strict';
// Tests for skills/job-application-assistant/scripts/apply/lib/answers.mjs: the rules that
// answer application-form questions from the candidate's answer bank. Questions are real
// wording seen on LinkedIn Easy Apply, Workable, SmartRecruiters and Greenhouse forms.
// Run: node --test tests/*.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
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
