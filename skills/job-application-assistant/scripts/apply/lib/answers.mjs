// Pure rules that turn an application-form question into an answer from the candidate's
// answer bank (answers.json). No browser code here, so the rules can be unit tested.
//
// The rule of the whole module: answer only what the bank covers. Anything else comes back
// as `null`, and the caller reports it to the agent, which asks the candidate.

// '#' and '+' belong to names such as C# and C++, so they never end a word here.
const hasKey = (q, k) => new RegExp('(?<![a-z0-9#+])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9#+])').test(q);
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const low = (s) => norm(s).toLowerCase();

// Order matters: the first rule whose pattern matches the question decides it.
const YES_NO_RULES = [
  // Sponsorship: "Will you now or in the future require sponsorship?"
  { re: /(require|need|will you).{0,40}sponsor|sponsor.{0,40}(require|need)/, key: 'needs_sponsorship' },
  // Work rights: "Are you legally authorized / eligible / do you have the right to work in X?"
  { re: /right to (live and )?work|authori[sz]ed to work|legally (able|eligible|permitted|authori)|eligible to work|work permit|full (working|work) (rights|permission)|without (a )?(visa|sponsorship)/, key: 'has_work_rights' },
  { re: /relocat/, key: 'relocate' },
  { re: /currently (live|reside|based|located)|are you (currently )?(based|located|living) in|currently in (new zealand|australia|canada|the uk|the job location)/, key: 'lives_in_country' },
  { re: /hybrid|in (the )?office|on-?site|onsite|commut|days (a|per) week|in person/, key: 'hybrid_or_onsite_ok' },
  { re: /bachelor|degree/, key: 'has_degree' },
  { re: /(currently|previously|ever)[ ,]+(been[ ,]+)?(employed|worked)[ ,]+(at|by|for)\b|employee of|worked (at|for) [a-z]/, key: 'worked_here_before' },
  { re: /referr/, key: 'referred' },
  { re: /security clearance|\bclearance\b|\bsc\b|\bbpss\b|\bnv1\b|baseline/, key: 'has_clearance' },
  { re: /background check|criminal (record )?check|pre-employment check/, key: 'background_check_ok' },
  { re: /disability confident|guaranteed interview scheme/, key: 'disability_scheme' },
  { re: /reasonable adjustment|additional support during/, key: 'needs_adjustments' },
  { re: /currently employed|are you employed/, key: 'currently_employed' },
  { re: /full-?time.{0,40}(in-?house|permanent)|permanent.{0,20}(role|position)/, key: 'wants_permanent' },
  // Marketing contact needs contact or consent wording: "experience in digital marketing" or
  // "outbound phone calls" is a skill question, not consent.
  {
    test: (q) => /talent (community|pool|network)|contact you about|keep in touch/.test(q)
      || (/texts?|sms|whatsapp|phone calls?|marketing|newsletter|emails?|future (job |career )?opportunit/.test(q)
        && /contact you|\breceive\b|send (you|me)\b|\bopt.?in\b|emails? about|subscribe|hear from us|keep you (updated|informed)|stay (up to date|in touch)/.test(q)),
    key: 'marketing_contact',
  },
];

/** Answer a yes/no question from the bank. Returns 'Yes', 'No' or null. */
export function yesNo(question, bank, country) {
  const q = low(question);
  // Exact or substring overrides the candidate gave for a specific question win.
  const custom = customAnswer(q, bank);
  if (custom && /^(yes|no)$/i.test(custom)) return custom[0].toUpperCase() + custom.slice(1).toLowerCase();
  if (custom) return null;
  // "Do you hold / have / are you certified in X?" answers from a boolean experience item, but
  // only at the level the candidate holds. Clearance is never a credential key: it goes through
  // policy.has_clearance below.
  const isClearance = CLEARANCE_QUESTION.test(q);
  if (!isClearance && /hold|have|possess|certif|licen[cs]e|accredit/.test(q) && !/willing|plan|obtain|pursue|working toward|intend/.test(q)) {
    const held = credential(q, experienceOf(bank).items);
    if (held !== undefined) return held;
  }
  for (const rule of YES_NO_RULES) {
    if (!(rule.test ? rule.test(q) : rule.re.test(q))) continue;
    const v = fact(rule.key, bank, country);
    // A named clearance level (DV, SC, Top Secret ...) is not answered from a plain "has clearance".
    if (rule.key === 'has_clearance' && v === true && CLEARANCE_LEVEL.test(q)) return null;
    if (v === true) return 'Yes';
    if (v === false) return 'No';
    return null;
  }
  return null;
}

const CLEARANCE_QUESTION = YES_NO_RULES.find((r) => r.key === 'has_clearance').re;
const CLEARANCE_LEVEL = /\bdv\b|developed vetting|\bsc\b|security check|\bnv ?[12]\b|negative vetting|\bpv\b|positive vetting|\bts\b|top secret|\bsecret\b|\bsci\b|baseline|\bbpss\b|\bctc\b|counter.?terroris|public trust|\benhanced\b/;

// Level and tier words of a credential ("ISTQB Foundation Level", "PRINCE2 Practitioner",
// "CIPD Level 5", "ITIL 4 Managing Professional", "PSM II").
const LEVEL_WORDS = /\bmanaging professional\b|\bstrategic leader\b|\bfoundation\b|\bpractitioner\b|\badvanced\b|\bexpert\b|\bassociate\b|\bprofessional\b|\bspecialist\b|\bchartered\b|\bfellow(ship)?\b|\bmember(ship)?\b|\blevel\s*(\d+|i{1,3}|iv|v)\b/g;
const ROMAN = /^(i{1,3}|iv|v)$/;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const levelWords = (s) => (s.match(LEVEL_WORDS) || []).map((w) => w.replace(/ship$/, '').replace(/\s+/g, ' '));
const stripLevels = (s) => norm(s.replace(LEVEL_WORDS, ' ').replace(/\blevel\b/g, ' '));

/** A boolean credential split into its name and the levels it was recorded at. */
function credentialKey(key) {
  const levels = levelWords(key);
  const words = stripLevels(key).split(' ');
  if (words.length > 1 && ROMAN.test(words[words.length - 1])) levels.push('r:' + words.pop());
  return { base: words.join(' '), levels };
}

/**
 * 'Yes' or 'No' from the boolean items for a credential question, null when the question names
 * a level the matching key lacks, undefined when no key names the credential. The longest
 * matching key decides.
 */
function credential(q, items) {
  const qBase = stripLevels(q);
  const qWords = levelWords(q);
  const keys = Object.entries(items)
    .filter(([, v]) => typeof v === 'boolean')
    .map(([k, v]) => ({ ...credentialKey(k), v }))
    .filter((c) => c.base && hasKey(qBase, c.base))
    .sort((a, b) => b.base.length - a.base.length || b.levels.length - a.levels.length);
  if (!keys.length) return undefined;
  for (const c of keys) {
    const roman = qBase.match(new RegExp('(?<![a-z0-9])' + escapeRe(c.base) + '\\s*-?\\s*(i{1,3}|iv|v)(?![a-z0-9])'));
    const asked = [...qWords, ...(roman ? ['r:' + roman[1]] : [])];
    const covered = asked.every((w) => c.levels.includes(w));
    // Held at this level (or a level-free question): Yes. "No" only for the same levels, or a
    // level-free key that says the candidate holds none of this credential.
    if (c.v && covered) return 'Yes';
    if (!c.v && (c.levels.length === 0 || (covered && asked.length === c.levels.length))) return 'No';
  }
  return null;
}

/** Look up a fact for a rule key. Country-specific facts come from bank.countries[country]. */
export function fact(key, bank, country) {
  const c = (bank.countries && country && bank.countries[country]) || {};
  const p = bank.policy || {};
  switch (key) {
    case 'needs_sponsorship': return typeof c.needs_sponsorship === 'boolean' ? c.needs_sponsorship : undefined;
    case 'has_work_rights': return typeof c.has_work_rights === 'boolean' ? c.has_work_rights : undefined;
    case 'lives_in_country': return typeof c.lives_there === 'boolean' ? c.lives_there : undefined;
    case 'marketing_contact': return typeof p.marketing_contact === 'boolean' ? p.marketing_contact : false;
    default: return typeof p[key] === 'boolean' ? p[key] : undefined;
  }
}

/** The candidate's own answer for a question they were asked before (bank.questions). */
export function customAnswer(question, bank) {
  const q = low(question);
  const entries = Object.entries(bank.questions || {});
  for (const [needle, answer] of entries) if (q.includes(low(needle))) return String(answer);
  return null;
}

// Synonyms of a bank key. They are tried only after the bank's own keys, and they answer only
// from the bank key they name (or a key that is just another spelling of it, like "node" or
// "postgres"); a hit on a technology the bank does not cover is asked, not guessed.
const SKILL_ALIASES = [
  ['c#', /\bc#|c sharp/], ['.net', /\.net|dotnet|asp\.net/], ['typescript', /typescript/], ['javascript', /javascript|(?<![.\w])js\b/],
  ['react', /react(?!ive)/], ['angular', /angular/], ['vue', /\bvue/], ['node.js', /node/], ['python', /python/], ['java', /\bjava\b/],
  ['sql', /\bsql\b|sql server/], ['azure', /azure/], ['aws', /\baws\b|amazon web services/], ['gcp', /\bgcp\b|google cloud/],
  ['docker', /docker/], ['kubernetes', /kubernetes|\bk8s\b/], ['mongodb', /mongo/], ['postgresql', /postgres/],
  ['cloud', /cloud/], ['apis', /\bapi/], ['leadership', /lead(ing|ership)?\b|manag|mentor/],
];

// Wording that means "years in my own field", per role_family (see references/roles/).
const FAMILY_WORDS = {
  'software-engineering': /software|engineering|development|programming|full.?stack|web|object.?oriented/,
  'qa-testing': /\bqa\b|quality (assurance|engineering)|testing|software test|test automation|manual test|automation test/,
  'devops-cloud': /devops|\bsre\b|infrastructure|site reliability|platform engineering|cloud (engineering|operations|infrastructure)/,
  'data-analytics': /data analy|analytics|business intelligence|\bbi\b/,
  'cybersecurity': /security|cyber|infosec/,
  'technical-writing': /technical writ|documentation|technical communication/,
  'product-management': /product (management|manager|owner)/,
  'project-delivery': /project (management|delivery|manager|coordinat)|program(me)? management|delivery management|scrum master|scrum|agile/,
  'business-analysis': /business analy/,
  'ux-ui-design': /(?:ux|ui|ux\/ui|ui\/ux) design|\bux\b|\bui\b|ux\/ui|ui\/ux|user experience|product design|interaction design/,
  'it-customer-support': /support|service desk|help ?desk|it support|technical support|desktop support|customer (service|support|success)/,
  'hr-recruiting': /recruit|talent acquisition|\bhr\b|human resources|people operations/,
  'sales-account-management': /sales|account management|business development/,
  'marketing': /marketing|digital marketing/,
  'finance-accounting': /finance|financial|accounting|management accounting|bookkeeping/,
  'operations-admin': /operations|administrat|office (management|administration)/,
};

// "years of <family wording> experience": the family wording sits directly before "experience".
// Another word in between names a specific skill ("financial modeling"), which the bank must cover.
const familyPhrase = (family) => new RegExp('\\bof\\s+(?:(?:relevant|professional|work|hands-on|industry|commercial|direct|paid|full-time)\\s+)?(?:'
  + family.source + ')[\\w/+-]*\\s+experience\\b');

const isNum = (v) => (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v.trim()));
const plain = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
const list = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);

/** The role-neutral experience of a bank. `experience` wins over the 0.4.0 `years` block per key. */
export function experienceOf(bank) {
  const y = plain(bank && bank.years);
  const e = plain(bank && bank.experience);
  const items = {};
  for (const [k, v] of Object.entries(plain(y.skills))) items[low(k)] = v;
  for (const [k, v] of Object.entries(plain(e.items))) items[low(k)] = v;
  // A non-array `none` is ignored: a string would otherwise split into single letters.
  const none = [...new Set([...list(y.none), ...list(e.none)].map(low))].filter(Boolean);
  // A missing or non-numeric total (null, "") is unknown, never the text "null".
  const total = isNum(e.total_years) ? String(e.total_years).trim() : isNum(y.total) ? String(y.total).trim() : undefined;
  return { total: total === undefined ? undefined : Number(total), items, none };
}

/** Years of experience for "How many years of work experience do you have with X?". */
export function years(question, bank) {
  const q = low(question);
  const custom = customAnswer(q, bank);
  if (custom && /^\d+$/.test(custom)) return custom;
  const { total, items, none } = experienceOf(bank);
  const skills = Object.fromEntries(Object.entries(items).filter(([, v]) => isNum(v)));
  // 1. The bank's own keys, longest first ("stakeholder management" before "management").
  //    `none` keys answer 0; a key with years wins over the same key in `none`.
  const own = [...Object.entries(skills).map(([k, v]) => [k, String(v)]), ...none.filter((n) => skills[n] === undefined).map((n) => [n, '0'])]
    .sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of own) if (hasKey(q, k)) return v;
  // Role wording ("in this role", "QA experience") counts only when nothing more specific is
  // asked: a "with / using / on / in <thing>" qualifier means a skill the bank does not cover.
  const unqualified = !/\b(with|using|on|in)\b/.test(q.replace(/\bin (this|a similar|similar|the same) (role|roles|position)\b/g, ''));
  const fam = bank && bank.role_family;
  const family = FAMILY_WORDS[fam];
  // 2. The candidate's own field ("recruiting experience" for an hr-recruiting bank).
  if (unqualified && family && total !== undefined && familyPhrase(family).test(q)) return String(total);
  // 3. Synonyms that name a bank key; any other technology they name is asked.
  for (const [name, re] of SKILL_ALIASES) {
    if (!re.test(q)) continue;
    const whole = new RegExp('^(?:' + re.source + ')$');
    const key = skills[name] !== undefined ? name : Object.keys(skills).find((k) => whole.test(k));
    if (key !== undefined) return String(skills[key]);
    if (none.includes(name) || none.some((n) => whole.test(n))) return '0';
    return null; // a technology the bank does not cover: ask, do not guess
  }
  // 4. Generic wording. The software wording counts as total years only for a software
  //    engineer, or a 0.4.0 bank with no role_family; "professional" only in the anchored form.
  const softwareBank = !fam || fam === 'software-engineering';
  const generic = /years of (work |professional |relevant )?experience( do you have)?\??$/.test(q)
    || (unqualified && (/in this role|relevant experience|similar role/.test(q)
      || (softwareBank && /software|engineering|development|programming|full.?stack|web|object.?oriented/.test(q))));
  if (generic && total !== undefined) return String(total);
  return null;
}

/** Text answer for a free-text field, or null when the bank does not cover it. */
export function text(question, bank, country) {
  const q = low(question);
  const custom = customAnswer(q, bank);
  if (custom) return custom;
  const c = (bank.countries && bank.countries[country]) || {};
  const p = bank.policy || {};
  const me = bank.candidate || {};
  if (/current (salary|pay|compensation|ctc)/.test(q)) return p.current_salary ? String(p.current_salary) : null;
  if (/salary|compensation|remuneration|pay expectation|desired pay|ote/.test(q)) return c.salary ? String(c.salary) : null;
  if (/notice/.test(q)) return /week/.test(q) ? (bank.notice && bank.notice.weeks !== undefined ? String(bank.notice.weeks) : null) : (bank.notice && bank.notice.text) || null;
  if (/how many (years|yrs)|(years|yrs) of (work |professional )?(experience|exp)\b/.test(q)) return years(q, bank);
  if (/nationality|citizenship/.test(q)) return me.nationality || null;
  if (/linkedin/.test(q)) return me.linkedin || null;
  if (/github|portfolio|website/.test(q)) return me.github || me.website || null;
  if (/where are you located|current location|location \(city\)|^city$/.test(q)) return me.location || null;
  if (/start date|available to start|availability/.test(q)) return (bank.notice && bank.notice.start) || null;
  if (/how did you hear|where did you (hear|find)/.test(q)) return 'LinkedIn';
  if (/full legal name/.test(q)) return me.legal_name || null;
  return null;
}

/** Pick an option from a select/radio list for a question, or null. */
export function pickOption(question, options, bank, country) {
  const q = low(question);
  const opts = options.map(norm).filter((o) => o && !/^select an option$/i.test(o));
  const find = (re) => opts.find((o) => re.test(low(o))) || null;
  const custom = customAnswer(q, bank);
  if (custom) return opts.find((o) => low(o) === low(custom)) || opts.find((o) => low(o).includes(low(custom))) || null;
  const c = (bank.countries && bank.countries[country]) || {};
  const p = bank.policy || {};
  if (/gender|ethnic|race|disab|sexual|religio|veteran|pronoun|age range/.test(q) && !/confident/.test(q)) {
    return find(/prefer not|decline|don.?t wish|not to (say|disclose|answer)/);
  }
  if (/notice/.test(q)) return noticeOption(opts, bank.notice);
  if (/salary|compensation|£|\$|€/.test(q)) {
    if (!c.salary) return null;
    const target = Number(c.salary);
    return opts.find((o) => { const n = o.replace(/,/g, '').match(/(\d+)\D+(\d+)/); return n && target > Number(n[1]) && target <= Number(n[2]); }) || null;
  }
  if (/english/.test(q)) {
    // Only the level the candidate recorded; never assume native or fluent.
    const level = low((bank.candidate || {}).english_level);
    return level ? opts.find((o) => low(o).includes(level)) || null : null;
  }
  if (/hear about|source|find (out )?about/.test(q)) return find(/^linkedin$/) || find(/linkedin/);
  if (/sponsor|right to work|work (status|authori)|immigration|visa|eligib/.test(q)) {
    if (c.needs_sponsorship === true) return find(/require.{0,30}sponsor|need.{0,30}sponsor|not .{0,20}(authori|entitled)|do not (currently )?have (legal|the right)|will require/);
    if (c.has_work_rights === true) return find(/citizen|permanent resident|authori[sz]ed to work now|no (employer )?sponsorship required/);
    return null;
  }
  if (/years of experience|how many years/.test(q)) {
    const y = years(q, bank);
    if (y === null) return null;
    const n = Number(y);
    return opts.find((o) => { const m = low(o).match(/(\d+)\s*(\+|or more|plus)/); return m && n >= Number(m[1]); })
      || opts.find((o) => { const m = low(o).match(/(\d+)\s*-\s*(\d+)/); return m && n >= Number(m[1]) && n <= Number(m[2]); }) || null;
  }
  const yn = yesNo(q, bank, country);
  if (yn) return opts.find((o) => low(o) === low(yn)) || null;
  return null;
}

const NUMBER_WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, eight: 8, twelve: 12 };
const IMMEDIATE = /immediate|^none$|no notice|not (currently )?employed|right away|^0 (days|weeks)$/;

/** A notice length in weeks from "2 weeks", "One month", "1-3 months"; [min, max], or null. */
function noticeWeeks(s) {
  const t = low(s).replace(/\b(a|an|one|two|three|four|five|six|eight|twelve)\b/g, (w) => String(NUMBER_WORDS[w]));
  if (IMMEDIATE.test(t)) return [0, 0];
  const unit = (u) => (/^day/.test(u) ? 1 / 7 : /^month/.test(u) ? 52 / 12 : 1);
  const range = t.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(day|week|month)s?/);
  if (range) return [Number(range[1]) * unit(range[3]), Number(range[2]) * unit(range[3])];
  const one = t.match(/(\d+)\s*(day|week|month)s?/);
  if (!one) return null;
  const w = Number(one[1]) * unit(one[2]);
  if (/less than|under|up to/.test(t)) return [0, w - 0.01];
  if (/more than|over|\+/.test(t)) return [w + 0.01, Infinity];
  return [w, w];
}

/** The notice option for the bank's notice, or null when no option matches it closely. */
function noticeOption(opts, notice) {
  if (!notice) return null;
  const given = isNum(notice.weeks) ? [Number(notice.weeks), Number(notice.weeks)] : noticeWeeks(notice.text || '');
  if (!given) return null;
  // A range ("less than 2 weeks") is not a fixed notice: only the same range on the form matches it.
  if (given[0] !== given[1]) {
    return opts.find((o) => { const r = noticeWeeks(o); return r && r[0] === given[0] && r[1] === given[1]; }) || null;
  }
  const weeks = given[0];
  if (weeks === 0) return opts.find((o) => IMMEDIATE.test(low(o))) || null;
  const parsed = opts.map((o) => [o, noticeWeeks(o)]).filter(([, r]) => r && !(r[0] === 0 && r[1] === 0));
  const within = parsed.filter(([, [a, b]]) => a !== b && weeks >= a && weeks <= b);
  if (within.length) return within[0][0];
  // A fixed length: the nearest option, and only if it is within a week of the real notice.
  const exact = parsed.filter(([, [a, b]]) => a === b).sort((x, y) => Math.abs(x[1][0] - weeks) - Math.abs(y[1][0] - weeks));
  return exact.length && Math.abs(exact[0][1][0] - weeks) <= 1 ? exact[0][0] : null;
}

/** Required privacy-notice consent may be ticked only when the candidate agreed at intake. Marketing never. */
export function consentAllowed(label, bank) {
  const l = low(label);
  if (/^follow |stay up to date|marketing|sms|text message|whatsapp|newsletter|future (career )?opportunit|communit|talent pool|phone calls?/.test(l)) return Boolean(bank.policy && bank.policy.marketing_contact === true);
  if (/privacy|personal data|processing of (my )?data|i consent|read.{0,30}(notice|policy)|accept.{0,30}(notice|policy|terms)|details provided.{0,40}(own|accurate)/.test(l)) {
    return Boolean(bank.policy && bank.policy.privacy_consent === true);
  }
  return false;
}
