#!/usr/bin/env node
// Build a one-page cover letter (.docx) from a JSON file.
//
// Usage:   node build_letter.js <letter.json> <output.docx>
// Needs:   Node.js 18+ and the docx package (npm install docx).
// Input:   see ../assets/cover-letter.json for every field.
//
// Letters hold the candidate's contact details. Keep filled-in JSON and the
// output files in a private folder; never commit them.
'use strict';

const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, BorderStyle } = require('docx');

const PAPER = {
  a4: { width: 11906, height: 16838 },
  letter: { width: 12240, height: 15840 },
};
const FONT = 'Calibri';
const ACCENT = '1D4E89';

function fail(message) {
  console.error(`build_letter: ${message}`);
  process.exit(1);
}

const [, , src, out] = process.argv;
if (!src || !out) fail('usage: node build_letter.js <letter.json> <output.docx>');

let letter;
try {
  letter = JSON.parse(fs.readFileSync(src, 'utf8'));
} catch (error) {
  fail(`cannot read ${src}: ${error.message}`);
}

const required = ['candidate', 'date', 'recipient', 'subject', 'salutation', 'paragraphs'];
const missing = required.filter((key) => !letter[key]);
if (missing.length) fail(`missing field(s): ${missing.join(', ')}`);
if (!letter.candidate.name) fail('missing field: candidate.name');

const leftovers = JSON.stringify(letter).match(/\[[A-Z][A-Z ,./-]+[^\]]*\]/g);
if (leftovers) fail(`placeholders still in the letter: ${[...new Set(leftovers)].join(' ')}`);

const page = PAPER[(letter.paper || 'a4').toLowerCase()];
if (!page) fail(`paper must be "a4" or "letter", not "${letter.paper}"`);

const run = (text, options = {}) => new TextRun({ text, font: FONT, size: 22, ...options });
const para = (text, { bold = false, after = 180 } = {}) =>
  new Paragraph({ children: [run(text, { bold })], spacing: { after, line: 300 } });

const contact = letter.candidate.contactLines || [];
const children = [
  new Paragraph({
    children: [new TextRun({ text: letter.candidate.name, font: FONT, size: 36, bold: true, color: ACCENT })],
    spacing: { after: 20 },
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
  para(letter.candidate.name, { bold: true }),
];

const doc = new Document({
  creator: letter.candidate.name,
  title: `${letter.candidate.name} Cover Letter`,
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{
    properties: { page: { size: page, margin: { top: 1300, bottom: 1300, left: 1300, right: 1300 } } },
    children,
  }],
});

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(out, buffer);
    console.log(`wrote ${out}`);
  })
  .catch((error) => fail(error.message));
