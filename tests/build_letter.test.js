'use strict';
// Tests for skills/job-application-assistant/scripts/build_letter.js.
// Run: node --test tests/*.test.js   (no npm install needed; docx is only loaded to build a file)

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'skills', 'job-application-assistant', 'scripts', 'build_letter.js');
const { validateLetter, countWords, parseArgs } = require(SCRIPT);

const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

function goodLetter(overrides = {}) {
  return {
    paper: 'a4',
    candidate: { name: 'Alex Doe', contactLines: ['City, Country | +1 555 010 0000'] },
    date: '17 November 2026',
    recipient: ['Hiring Team', 'Example Ltd', 'Example City'],
    subject: 'Application for Software Engineer',
    salutation: 'Dear Hiring Team,',
    paragraphs: [words(100), words(100), words(100)],
    closing: 'Yours sincerely,',
    ...overrides,
  };
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'letter-test-'));
}

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
}

test('a complete letter has no errors or warnings', () => {
  const result = validateLetter(goodLetter());
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.words, 300);
});

test('each required field is reported when missing', () => {
  for (const key of ['candidate', 'date', 'recipient', 'subject', 'salutation', 'paragraphs']) {
    const letter = goodLetter();
    delete letter[key];
    const { errors } = validateLetter(letter);
    assert.ok(errors.some((e) => e.includes(key)), `${key}: ${errors}`);
  }
  const noName = goodLetter({ candidate: { contactLines: [] } });
  assert.ok(validateLetter(noName).errors.some((e) => e.includes('candidate.name')));
});

test('wrong types are errors', () => {
  assert.ok(validateLetter(goodLetter({ recipient: 'Hiring Team' })).errors.some((e) => e.includes('recipient')));
  assert.ok(validateLetter(goodLetter({ paragraphs: [] })).errors.some((e) => e.includes('paragraphs')));
  assert.ok(validateLetter(goodLetter({ paragraphs: ['ok', 3] })).errors.some((e) => e.includes('paragraphs')));
  assert.ok(validateLetter(goodLetter({ candidate: { name: 'A', contactLines: 'x' } }))
    .errors.some((e) => e.includes('contactLines')));
  assert.ok(validateLetter(null).errors.length > 0);
});

test('placeholders left from the template are errors', () => {
  const { errors } = validateLetter(goodLetter({ subject: 'Application for [TARGET ROLE]' }));
  assert.ok(errors.some((e) => e.includes('[TARGET ROLE]')));
});

test('paper must be a4 or letter', () => {
  assert.ok(validateLetter(goodLetter({ paper: 'legal' })).errors.some((e) => e.includes('paper')));
  assert.deepEqual(validateLetter(goodLetter({ paper: 'Letter' })).errors, []);
});

test('word count warns outside the usual range and fails when far too long', () => {
  assert.ok(validateLetter(goodLetter({ paragraphs: [words(120)] })).warnings.some((w) => w.includes('120')));
  assert.ok(validateLetter(goodLetter({ paragraphs: [words(420)] })).warnings.some((w) => w.includes('420')));
  assert.ok(validateLetter(goodLetter({ paragraphs: [words(460)] })).errors.some((e) => e.includes('460')));
});

test('countWords counts body paragraphs only', () => {
  assert.equal(countWords({ paragraphs: ['one two', '  three  '] }), 3);
});

test('parseArgs reads flags and positionals', () => {
  assert.deepEqual(parseArgs(['a.json', 'b.docx', '--force']),
    { help: false, check: false, force: true, src: 'a.json', out: 'b.docx' });
  assert.deepEqual(parseArgs(['--check', 'a.json']),
    { help: false, check: true, force: false, src: 'a.json', out: undefined });
  assert.throws(() => parseArgs(['--nope']), /unknown option/);
});

test('--check validates without docx installed and prints the word count', () => {
  const dir = tmpDir();
  const src = path.join(dir, 'letter.json');
  fs.writeFileSync(src, JSON.stringify(goodLetter()));
  const result = run(['--check', src]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /300 words/);
});

test('--check fails on an invalid letter', () => {
  const dir = tmpDir();
  const src = path.join(dir, 'letter.json');
  fs.writeFileSync(src, JSON.stringify(goodLetter({ date: '' })));
  const result = run(['--check', src]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /date/);
});

test('refuses to overwrite an existing file without --force', () => {
  const dir = tmpDir();
  const src = path.join(dir, 'letter.json');
  const out = path.join(dir, 'out.docx');
  fs.writeFileSync(src, JSON.stringify(goodLetter()));
  fs.writeFileSync(out, 'old');
  const result = run([src, out]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--force/);
  assert.equal(fs.readFileSync(out, 'utf8'), 'old');
});

test('--help exits 0 and missing arguments exit 1', () => {
  assert.equal(run(['--help']).status, 0);
  assert.equal(run([]).status, 1);
});
