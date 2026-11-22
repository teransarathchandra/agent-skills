// LinkedIn page logic for the apply engine. Every function takes a Playwright `page`.
// Selectors are the accessible names LinkedIn showed in 2026-11; when one stops matching,
// the function returns a clear status instead of clicking something else.
import { yesNo, text, pickOption, consentAllowed } from './answers.mjs';

export const GEO = { AU: '101452733', NZ: '105490917', CA: '101174742', US: '103644278', UK: '101165590', IE: '104738515', DE: '101282230', NL: '102890719', EU: '91000000' };

const pause = (page, min = 1200, max = 3000) => page.waitForTimeout(min + Math.floor(Math.random() * (max - min)));

const BLOCK_RE = /captcha|unusual activity|security verification|quick security check|account (has been )?restricted|temporarily restricted|verify you.?re (a )?human/i;

export async function blocked(page) {
  const t = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 20000) : '').catch(() => '');
  return BLOCK_RE.test(t);
}

export function searchUrl({ keywords, country, remote, easyApply }) {
  const u = new URL('https://www.linkedin.com/jobs/search-results/');
  u.searchParams.set('keywords', keywords);
  if (country && GEO[country]) u.searchParams.set('geoId', GEO[country]);
  if (easyApply) u.searchParams.set('f_AL', 'true');
  if (remote) u.searchParams.set('f_WT', '2');
  return u.toString();
}

/** Click through result cards on the current search page and collect each ad's text. */
export async function scan(page, { count = 20 } = {}) {
  const cards = page.getByRole('button', { name: / job .*Dismiss|Dismiss .* job/ });
  const out = [];
  const seen = new Set();
  const total = Math.min(await cards.count(), count);
  for (let i = 0; i < total; i++) {
    if (await blocked(page)) return { status: 'blocked', jobs: out };
    try {
      await cards.nth(i).click({ timeout: 8000 });
      await pause(page, 1500, 2600);
      const id = (page.url().match(/currentJobId=(\d+)/) || [])[1];
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const title = (await page.title()).split(' | ');
      const body = await page.evaluate(() => document.body.innerText);
      const a = body.indexOf('About the job');
      const head = a > 0 ? body.slice(Math.max(0, a - 1500), a) : '';
      const loc = (head.match(/\n([^\n·]{2,80}?) · (?:Reposted )?\d+ (?:minute|hour|day|week|month)/) || [])[1] || '';
      out.push({
        id, title: title[0] || '', company: title[1] || '', location: loc.trim(),
        easy_apply: /Easy Apply/.test(head.slice(-900)),
        url: `https://www.linkedin.com/jobs/view/${id}/`,
        text: a >= 0 ? body.slice(a, a + 7000) : '',
      });
    } catch (e) {
      out.push({ error: `card ${i}: ${String(e.message).slice(0, 120)}` });
    }
  }
  return { status: 'ok', jobs: out };
}

const dialog = (page) => page.locator('[role=dialog], dialog').filter({ hasText: 'Apply to' }).first();

/** Open the Easy Apply dialog for a job (or resume a saved draft). */
export async function openJob(page, jobId) {
  const d = dialog(page);
  if (page.url().includes(jobId) && await d.count()) return { status: 'open' };
  await page.goto(`https://www.linkedin.com/jobs/view/${jobId}/`);
  await pause(page, 2500, 3500);
  if (await blocked(page)) return { status: 'blocked' };
  const body = await page.evaluate(() => document.body.innerText);
  if (/Application submitted|Applied \d+ (minute|hour|day|week)s? ago/.test(body)) return { status: 'already-applied' };
  const draft = page.getByRole('link', { name: 'Continue', exact: true });
  const easy = page.locator('button[aria-label="Easy Apply to this job"]');
  if (await draft.count()) await draft.first().click();
  else if (await easy.count()) await easy.first().click();
  else {
    const ext = await page.evaluate(() => { const a = [...document.querySelectorAll('a')].find((x) => /Apply on company website/i.test(x.getAttribute('aria-label') || x.innerText)); if (!a) return null; try { return new URL(a.href).searchParams.get('url') || a.href; } catch { return a.href; } });
    return ext ? { status: 'external', url: ext } : { status: 'no-apply-button' };
  }
  await pause(page, 2500, 3500);
  const cont = page.getByRole('link', { name: 'Continue applying' });
  if (await cont.count()) { await cont.first().click(); await pause(page, 2000, 3000); }
  const accept = page.getByRole('button', { name: 'Accept and continue' });
  if (await accept.count()) return { status: 'needs-input', unknown: [{ kind: 'consent', question: 'The employer asks LinkedIn to share your name and email with it before you can apply (data-consent screen).' }] };
  return (await d.count()) ? { status: 'open' } : { status: 'no-dialog' };
}

/** Describe every control on the current dialog page and tag it for later actions. */
async function describe(page) {
  return dialog(page).evaluate((el) => {
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const optText = (i) => {
      const aria = clean(i.getAttribute('aria-label'));
      if (/\.(pdf|docx?)$/i.test(aria)) return aria; // resume radios carry the file name here
      const byFor = i.id && el.querySelector(`label[for="${CSS.escape(i.id)}"]`);
      const t = clean((byFor && byFor.innerText) || (i.closest('label') && i.closest('label').innerText) || i.closest('div')?.parentElement?.innerText.split('\n')[0]);
      return t && t !== 'on' ? t : (aria || clean(i.value));
    };
    const questionOf = (node, exclude) => {
      const aria = clean(node.getAttribute && node.getAttribute('aria-label'));
      if (aria && aria.length > 3 && aria !== exclude) return aria;
      if (node.id) { const l = el.querySelector(`label[for="${CSS.escape(node.id)}"]`); if (l && clean(l.innerText)) return clean(l.innerText); }
      const fs = node.closest('fieldset'); if (fs && fs.querySelector('legend')) return clean(fs.querySelector('legend').innerText);
      let p = node.parentElement;
      for (let k = 0; k < 6 && p; k++, p = p.parentElement) { const first = clean(p.innerText.split('\n')[0]); if (first && first !== exclude && first.length > 3) return first; }
      return '';
    };
    const out = [];
    let n = 0;
    const tag = (node) => { const id = `jaa${n++}`; node.setAttribute('data-jaa', id); return id; };
    const groups = new Set();
    el.querySelectorAll('input[type=radio], input[type=checkbox]').forEach((i) => {
      const g = i.closest('[role=radiogroup], fieldset, [role=group]') || i.parentElement.parentElement.parentElement;
      if (groups.has(g)) return; groups.add(g);
      const inputs = [...g.querySelectorAll('input[type=radio], input[type=checkbox]')];
      const options = inputs.map((x) => ({ id: tag(x), label: optText(x), checked: x.checked }));
      const q = questionOf(inputs[0], options[0].label) || clean(g.previousElementSibling && g.previousElementSibling.innerText);
      const isResume = inputs.every((x) => /\.(pdf|docx?)$/i.test(clean(x.getAttribute('aria-label'))));
      out.push({ kind: isResume ? 'resume' : (inputs.length === 1 ? 'checkbox' : 'choice'), question: q, options, required: /\*/.test(clean(g.parentElement && g.parentElement.innerText).slice(0, 300)) });
    });
    el.querySelectorAll('select').forEach((s) => {
      out.push({ kind: 'select', id: tag(s), question: questionOf(s), options: [...s.options].map((o) => clean(o.text)), value: s.selectedIndex > 0 ? clean(s.options[s.selectedIndex].text) : '', required: s.required || /\*/.test(questionOf(s)) });
    });
    el.querySelectorAll('input[type=text], input[type=number], input[type=tel], input[type=email], input:not([type]), textarea, [contenteditable=true]').forEach((t) => {
      if (!t.offsetParent) return;
      const q = questionOf(t);
      out.push({ kind: t.getAttribute('role') === 'combobox' || t.getAttribute('aria-autocomplete') ? 'typeahead' : 'text', id: tag(t), question: q, value: clean(t.value !== undefined ? t.value : t.innerText), required: t.required || t.getAttribute('aria-required') === 'true' || /\*/.test(q) });
    });
    const page = (el.innerText.match(/(\d+)\/(\d+) pages/) || [null, '1', '1']).slice(1, 3);
    return { controls: out, page: page.join('/'), review: /Review your application/.test(el.innerText) || [...el.querySelectorAll('button')].some((b) => /^Submit application$/.test(((b.getAttribute('aria-label') || b.innerText) || '').trim())), errors: (el.innerText.match(/This field is required|Invalid input|Please enter[^\n]*|Please make a selection/g) || []) };
  });
}

/**
 * Fill the open dialog page by page from the answer bank. Stops at the review page, at a page
 * with questions the bank does not cover, or on a validation error. Never submits.
 */
export async function fill(page, { bank, country, letter, letterFile, resume }) {
  const d = dialog(page);
  const answered = [], corrected = [], unknown = [], kept = [];
  for (let step = 0; step < 10; step++) {
    if (await blocked(page)) return { status: 'blocked' };
    if (!(await d.count())) return { status: 'no-dialog' };
    const info = await describe(page);
    const pageUnknown = [];
    for (const c of info.controls) {
      const q = c.question;
      if (c.kind === 'resume') {
        if (!resume) continue;
        const opt = c.options.find((o) => o.label === resume || o.label.startsWith(resume));
        if (!opt) { pageUnknown.push({ kind: 'resume', question: `Resume "${resume}" is not in the list: ${c.options.map((o) => o.label).join(', ')}` }); continue; }
        if (!opt.checked) { await d.locator(`[data-jaa="${opt.id}"]`).evaluate((x) => x.click()); corrected.push(`resume -> ${opt.label} (was ${(c.options.find((o) => o.checked) || {}).label || 'none'})`); }
        else kept.push(`resume = ${opt.label}`);
        continue;
      }
      if (/cover letter/i.test(q) && c.kind === 'text') {
        if (letter) { await d.locator(`[data-jaa="${c.id}"]`).fill(letter); answered.push('cover letter: written for this job'); }
        else if (c.value) { await d.locator(`[data-jaa="${c.id}"]`).fill(''); corrected.push('cover letter: cleared a letter left over from another application'); }
        continue;
      }
      if (/^(headline|summary|photo)$/i.test(q) || /additional information|anything else/i.test(q)) continue;
      if (c.kind === 'checkbox') {
        const o = c.options[0];
        const want = consentAllowed(o.label || q, bank);
        if (want && !o.checked) { await d.locator(`[data-jaa="${o.id}"]`).evaluate((x) => x.click()); answered.push(`consent: ${(o.label || q).slice(0, 60)}`); }
        else if (!want && o.checked && !c.required) { await d.locator(`[data-jaa="${o.id}"]`).evaluate((x) => x.click()); corrected.push(`unticked: ${(o.label || q).slice(0, 60)}`); }
        else if (!want && c.required && !o.checked) pageUnknown.push({ kind: 'consent', question: (o.label || q).slice(0, 200) });
        continue;
      }
      if (c.kind === 'choice') {
        const labels = c.options.map((o) => o.label);
        const ans = pickOption(q, labels, bank, country) || (labels.every((l) => /^(yes|no)$/i.test(l)) ? yesNo(q, bank, country) : null);
        const current = c.options.find((o) => o.checked);
        if (!ans) { if (!current && c.required) pageUnknown.push({ kind: 'choice', question: q, options: labels }); else if (current) kept.push(`${q} = ${current.label}`); continue; }
        const target = c.options.find((o) => o.label.toLowerCase() === ans.toLowerCase());
        if (!target) { pageUnknown.push({ kind: 'choice', question: q, options: labels }); continue; }
        if (!target.checked) { await d.locator(`[data-jaa="${target.id}"]`).evaluate((x) => x.click()); (current ? corrected : answered).push(`${q} = ${target.label}${current ? ` (was ${current.label})` : ''}`); }
        continue;
      }
      if (c.kind === 'select') {
        const ans = pickOption(q, c.options, bank, country);
        if (!ans) { if (!c.value && c.required) pageUnknown.push({ kind: 'select', question: q, options: c.options.slice(0, 15) }); else if (c.value) kept.push(`${q} = ${c.value}`); continue; }
        if (c.value !== ans) { await d.locator(`[data-jaa="${c.id}"]`).selectOption({ label: ans }); (c.value ? corrected : answered).push(`${q} = ${ans}${c.value ? ` (was ${c.value})` : ''}`); }
        continue;
      }
      if (c.kind === 'typeahead') {
        if (c.value) { kept.push(`${q} = ${c.value}`); continue; }
        const city = bank.candidate && bank.candidate.location_search;
        if (!city) { if (c.required) pageUnknown.push({ kind: 'text', question: q }); continue; }
        const box = d.locator(`[data-jaa="${c.id}"]`);
        await box.click(); await box.pressSequentially(city, { delay: 60 }); await pause(page, 1500, 2200);
        const opt = page.getByRole('option').filter({ hasText: city }).first();
        if (await opt.count()) { await opt.click(); answered.push(`${q} = ${city}`); } else pageUnknown.push({ kind: 'text', question: q });
        continue;
      }
      if (c.kind === 'text') {
        const ans = text(q, bank, country);
        if (ans === null) { if (!c.value && c.required) pageUnknown.push({ kind: 'text', question: q }); else if (c.value) kept.push(`${q} = ${c.value}`); continue; }
        if (c.value !== ans) { await d.locator(`[data-jaa="${c.id}"]`).fill(ans); (c.value ? corrected : answered).push(`${q} = ${ans}${c.value ? ` (was ${c.value})` : ''}`); }
      }
    }
    if (letterFile) {
      const up = d.getByRole('button', { name: 'Upload cover letter' });
      if (await up.count()) {
        const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), up.first().click()]);
        await chooser.setFiles(letterFile); await pause(page, 2500, 3500); answered.push(`cover letter file: ${letterFile.split(/[\\/]/).pop()}`);
      }
    }
    if (pageUnknown.length) { unknown.push(...pageUnknown); return { status: 'needs-input', page: info.page, unknown, answered, corrected, kept }; }
    if (info.review) return { status: 'review', answered, corrected, kept, summary: await reviewSummary(page) };
    const next = d.getByRole('button', { name: /^(Next|Review|Continue to next step)$/ });
    if (!(await next.count())) return { status: 'stuck', page: info.page, answered, corrected, kept, note: 'no Next or Review button' };
    await pause(page, 900, 1800);
    await next.first().click();
    await pause(page, 1500, 2500);
    const after = await describe(page);
    if (after.errors.length && !after.review) return { status: 'needs-input', page: after.page, errors: after.errors, unknown: after.controls.filter((x) => x.required && !x.value && x.kind !== 'resume').map((x) => ({ kind: x.kind, question: x.question })), answered, corrected, kept };
  }
  return { status: 'stuck', note: 'too many pages' };
}

/** The review page as text: files, letter opening and every answer, for the batch report. */
export async function reviewSummary(page) {
  const t = await dialog(page).evaluate((el) => el.innerText.replace(/\n{2,}/g, '\n'));
  const i = Math.max(0, t.indexOf('Review your application'));
  const picked = await dialog(page).evaluate((el) => [...el.querySelectorAll('input[type=radio]:checked')].map((x) => x.getAttribute('aria-label')).filter((a) => /\.(pdf|docx?)$/i.test(a || '')));
  const files = picked.length ? picked : [...new Set(t.match(/[\w.()-]+\.(pdf|docx?)/gi) || [])];
  return { files, text: t.slice(i, i + 3500) };
}

export async function saveDraft(page, { discard = false } = {}) {
  const d = dialog(page);
  if (!(await d.count())) return { status: 'no-dialog' };
  await page.getByRole('button', { name: 'Dismiss' }).first().click();
  await pause(page, 1000, 1600);
  const btn = page.getByRole('button', { name: discard ? 'Discard' : 'Save', exact: true });
  if (await btn.count()) { await btn.last().click(); await pause(page, 1000, 1600); return { status: discard ? 'discarded' : 'draft-saved' }; }
  return { status: 'closed-without-prompt' };
}

export async function submit(page, jobId) {
  const d = dialog(page);
  if (!page.url().includes(jobId) || !(await d.count())) return { status: 'not-open', note: 'open the job with `apply` first' };
  const info = await describe(page);
  if (!info.review) return { status: 'not-on-review' };
  await d.getByRole('button', { name: 'Submit application' }).click();
  await pause(page, 2500, 3500);
  const ok = (await page.evaluate(() => document.body.innerText)).includes('Application submitted');
  return { status: ok ? 'submitted' : 'not-confirmed' };
}

// ---- Profile ----

/** Replace a rich-text (contenteditable) field in an open edit dialog, paragraph by paragraph. */
async function setRichText(page, lines) {
  const box = page.locator('[role=dialog] [contenteditable=true], dialog [contenteditable=true]').first();
  await box.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.press('Backspace');
  for (let i = 0; i < lines.length; i++) { if (i) await page.keyboard.press('Enter'); if (lines[i]) await page.keyboard.insertText(lines[i]); }
}

async function saveDialog(page) {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await pause(page, 2500, 3500);
  return { status: 'saved', url: page.url() };
}

export async function profileRead(page, slug) {
  const out = {};
  for (const s of ['', 'details/experience/', 'details/education/', 'details/skills/', 'details/projects/', 'details/publications/', 'details/certifications/']) {
    await page.goto(`https://www.linkedin.com/in/${slug}/${s}`);
    await pause(page, 2500, 3500);
    if (await blocked(page)) return { status: 'blocked' };
    const t = await page.evaluate(() => (document.querySelector('main') || document.body).innerText);
    const end = t.search(/\n(Who your viewers also viewed|People also viewed|About\nAccessibility)/);
    out[s || 'top'] = t.slice(0, end > 0 ? Math.min(end, 6000) : 6000);
  }
  return { status: 'ok', sections: out };
}

export async function profileEditUrls(page, slug, section) {
  await page.goto(`https://www.linkedin.com/in/${slug}/details/${section}/`);
  await pause(page, 2500, 3500);
  return page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => /\/edit\/forms\/\d+/.test(a.href)).map((a) => ({ label: (a.getAttribute('aria-label') || '').replace(/^Edit /, ''), url: a.href })).filter((x) => x.label));
}

export async function profileSetHeadline(page, slug, headline) {
  await page.goto(`https://www.linkedin.com/in/${slug}/edit/intro/`);
  await pause(page, 3000, 4000);
  await setRichText(page, [headline]);
  return saveDialog(page);
}

export async function profileSetAbout(page, slug, lines) {
  await page.goto(`https://www.linkedin.com/in/${slug}/edit/forms/summary/new/`);
  await pause(page, 3000, 4000);
  await setRichText(page, lines);
  return saveDialog(page);
}

export async function profileSetDescription(page, editUrl, lines) {
  await page.goto(editUrl);
  await pause(page, 3000, 4000);
  // Turn off "notify your network" so an edit does not become a public post.
  await page.evaluate(() => { const c = [...document.querySelectorAll('[role=dialog] input[type=checkbox]')].find((x) => /notify your network/i.test(x.getAttribute('aria-label') || x.closest('div')?.innerText || '')); if (c && c.checked) c.click(); });
  await setRichText(page, lines);
  return saveDialog(page);
}

export async function profileAddSkill(page, slug, skill) {
  await page.goto(`https://www.linkedin.com/in/${slug}/skills/edit/forms/new/`);
  await pause(page, 3000, 4000);
  const input = page.locator('[role=dialog] input:not([type=checkbox]):not([type=hidden]), dialog input:not([type=checkbox]):not([type=hidden])').first();
  await input.click(); await input.pressSequentially(skill, { delay: 60 }); await pause(page, 1800, 2400);
  const opts = page.getByRole('option');
  const n = await opts.count();
  let picked = null;
  for (let i = 0; i < n; i++) { const t = (await opts.nth(i).innerText()).trim().split('\n')[0]; if (t.toLowerCase() === skill.toLowerCase()) { await opts.nth(i).click(); picked = t; break; } }
  if (!picked) return { status: 'no-exact-match', suggestions: n ? (await opts.allInnerTexts()).slice(0, 8).map((s) => s.split('\n')[0]) : [] };
  await pause(page, 600, 900);
  const r = await saveDialog(page);
  return { ...r, skill: picked };
}
