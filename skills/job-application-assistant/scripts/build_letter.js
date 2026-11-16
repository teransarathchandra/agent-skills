#!/usr/bin/env node
// Build a one-page cover letter (.docx) from a JSON file.
//
// Usage:   node build_letter.js <letter.json> <output.docx> [--force]
//          node build_letter.js --check <letter.json>      validate and count words; needs no install
// Needs:   Node.js 18+. Building (not --check) also needs the docx package:
//          run `npm install` in this folder (package.json pins the version).
// Input:   see ../assets/cover-letter.json for every field.
//
// Letters hold the candidate's contact details. Keep filled-in JSON and the
// output files in a private folder; never commit them.
'use strict';

const fs = require('fs');

const USAGE = `usage: node build_letter.js <letter.json> <output.docx> [--force]
       node build_letter.js --check <letter.json>

  --check   validate the letter and print its word count; writes nothing
  --force   overwrite <output.docx> if it already exists
  --help    show this help`;

// Page sizes in twentieths of a point (twips): A4 is 210 x 297 mm, US Letter 8.5 x 11 in.
const PAPER = {
  a4: { width: 11906, height: 16838 },
  letter: { width: 12240, height: 15840 },
};
// 1300 twips is about 0.9 in (23 mm): inside the 0.5 to 1 in range readers expect, and wide
// enough for six paragraphs at 11 pt to fit one page.
const MARGIN = 1300;
const FONT = 'Calibri'; // installed with Microsoft Office; Carlito is its metric twin elsewhere
const BODY_SIZE = 22; // half-points: 11 pt
const ACCENT = '1D4E89'; // dark blue; prints legibly in greyscale
// Body word counts. 150 to 250 suits an optional letter field; 250 to 400 is the usual full
// letter and fits one page at 11 pt with MARGIN; past 450 it no longer fits, so the build stops.
const WORDS = { short: 150, long: 400, max: 450 };
const PLACEHOLDER_RE = /\[[A-Z][A-Z ,./-]+[^\]]*\]/g;

const isText = (value) => typeof value === 'string' && value.trim() !== '';
const isTextList = (value) => Array.isArray(value) && value.every(isText);

function countWords(letter) {
  const paragraphs = Array.isArray(letter && letter.paragraphs) ? letter.paragraphs : [];
  return paragraphs
    .filter((p) => typeof p === 'string')
    .reduce((total, p) => total + p.split(/\s+/).filter(Boolean).length, 0);
}

// Returns { errors, warnings, words }. Errors stop the build; warnings are printed.
function validateLetter(letter) {
  const errors = [];
  const warnings = [];
  if (!letter || typeof letter !== 'object' || Array.isArray(letter)) {
    return { errors: ['the file must hold one JSON object'], warnings, words: 0 };
  }

  if (!letter.candidate || typeof letter.candidate !== 'object') errors.push('missing field: candidate');
  else {
    if (!isText(letter.candidate.name)) errors.push('missing field: candidate.name');
    const lines = letter.candidate.contactLines;
    if (lines !== undefined && !isTextList(lines)) errors.push('candidate.contactLines must be a list of text lines');
  }
  for (const key of ['date', 'subject', 'salutation']) {
    if (!isText(letter[key])) errors.push(`missing field: ${key}`);
  }
  if (!isTextList(letter.recipient) || letter.recipient.length === 0) {
    errors.push('missing field: recipient (a list of lines, for example ["Hiring Team", "Employer", "City"])');
  }
  if (!isTextList(letter.paragraphs) || letter.paragraphs.length === 0) {
    errors.push('missing field: paragraphs (a non-empty list of text paragraphs)');
  }
  if (letter.closing !== undefined && !isText(letter.closing)) errors.push('closing must be text');

  const paper = String(letter.paper || 'a4').toLowerCase();
  if (!PAPER[paper]) errors.push(`paper must be "a4" or "letter", not "${letter.paper}"`);

  const leftovers = JSON.stringify(letter).match(PLACEHOLDER_RE);
  if (leftovers) errors.push(`placeholders still in the letter: ${[...new Set(leftovers)].join(' ')}`);

  const words = countWords(letter);
  if (words > WORDS.max) {
    errors.push(`the body is ${words} words; cut it to ${WORDS.long} or fewer so it fits one page`);
  } else if (words > WORDS.long) {
    warnings.push(`the body is ${words} words; ${WORDS.long} or fewer usually fits one page`);
  } else if (words > 0 && words < WORDS.short) {
    warnings.push(`the body is ${words} words; fine for an optional field, thin for a letter the ad asks for`);
  }
  return { errors, warnings, words };
}

function parseArgs(argv) {
  const options = { help: false, check: false, force: false, src: undefined, out: undefined };
  const positionals = [];
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--check') options.check = true;
    else if (arg === '--force') options.force = true;
    else if (arg.startsWith('-')) throw new Error(`unknown option: ${arg}`);
    else positionals.push(arg);
  }
  [options.src, options.out] = positionals;
  return options;
}

function buildDocument(letter, docx) {
  const { Document, Paragraph, TextRun, BorderStyle } = docx;
  const run = (text, options = {}) => new TextRun({ text, font: FONT, size: BODY_SIZE, ...options });
  const para = (text, { bold = false, after = 180 } = {}) =>
    new Paragraph({ children: [run(text, { bold })], spacing: { after, line: 300 } });

  const name = letter.candidate.name;
  const contact = letter.candidate.contactLines || [];
  const children = [
    new Paragraph({
      children: [new TextRun({ text: name, font: FONT, size: 36, bold: true, color: ACCENT })],
      spacing: { after: contact.length ? 20 : 300 },
    }),
    ...contact.map((line, i) =>
      new Paragraph({
        children: [run(line, { size: 20 })],
        spacing: { after: i === contact.length - 1 ? 300 : 10 },
        border: i === contact.length - 1
          ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } }
          : undefined,
      })),
    para(letter.date),
    ...letter.recipient.map((line, i) => para(line, { after: i === letter.recipient.length - 1 ? 180 : 0 })),
    para(letter.subject, { bold: true }),
    para(letter.salutation),
    ...letter.paragraphs.map((text) => para(text)),
    para(letter.closing || 'Yours sincerely,', { after: 0 }),
    para(name, { bold: true }),
  ];

  return new Document({
    creator: name,
    title: `${name} Cover Letter`,
    styles: { default: { document: { run: { font: FONT, size: BODY_SIZE } } } },
    sections: [{
      properties: {
        page: {
          size: PAPER[String(letter.paper || 'a4').toLowerCase()],
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        },
      },
      children,
    }],
  });
}

async function main(argv) {
  const fail = (message) => {
    console.error(`build_letter: ${message}`);
    return 1;
  };

  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    return fail(`${error.message}\n${USAGE}`);
  }
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  if (!options.src || (!options.check && !options.out)) return fail(USAGE);

  let letter;
  try {
    letter = JSON.parse(fs.readFileSync(options.src, 'utf8'));
  } catch (error) {
    return fail(`cannot read ${options.src}: ${error.message}`);
  }

  const { errors, warnings, words } = validateLetter(letter);
  warnings.forEach((warning) => console.error(`build_letter: warning: ${warning}`));
  if (errors.length) return fail(errors.join('\n  '));

  if (options.check) {
    console.log(`ok: ${options.src} is valid (${words} words in the body)`);
    return 0;
  }
  if (fs.existsSync(options.out) && !options.force) {
    return fail(`${options.out} already exists; pass --force to overwrite it`);
  }

  let docx;
  try {
    docx = require('docx');
  } catch (error) {
    return fail('the docx package is not installed; run `npm install` in this scripts folder first');
  }

  try {
    const buffer = await docx.Packer.toBuffer(buildDocument(letter, docx));
    fs.writeFileSync(options.out, buffer);
  } catch (error) {
    return fail(error.message);
  }
  console.log(`wrote ${options.out} (${words} words in the body)`);
  return 0;
}

module.exports = { validateLetter, countWords, parseArgs, buildDocument };

if (require.main === module) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
