// Pure rules that turn an application-form question into an answer from the candidate's
// answer bank (answers.json). No browser code here, so the rules can be unit tested.
//
// The rule of the whole module: answer only what the bank covers. Anything else comes back
// as `null`, and the caller reports it to the agent, which asks the candidate.

const hasKey = (q, k) => new RegExp('(?<![a-z0-9])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9])').test(q);
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
  { re: /(texts?|sms|whatsapp|phone calls?|marketing|future (job )?opportunit|talent (community|pool)|contact you about)/, key: 'marketing_contact' },
];

/** Answer a yes/no question from the bank. Returns 'Yes', 'No' or null. */
export function yesNo(question, bank, country) {
  const q = low(question);
  // Exact or substring overrides the candidate gave for a specific question win.
  const custom = customAnswer(q, bank);
  if (custom && /^(yes|no)$/i.test(custom)) return custom[0].toUpperCase() + custom.slice(1).toLowerCase();
  if (custom) return null;
  // "Do you hold / have / are you certified in X?" answers from a boolean experience item.
  if (/hold|have|possess|certif|licen[cs]e|accredit/.test(q) && !/willing|plan|obtain|pursue|working toward|intend/.test(q)) {
    for (const [k, v] of Object.entries(experienceOf(bank).items)) {
      if (typeof v === 'boolean' && hasKey(q, k)) return v ? 'Yes' : 'No';
    }
  }
  for (const rule of YES_NO_RULES) {
    if (!rule.re.test(q)) continue;
    const v = fact(rule.key, bank, country);
    if (v === true) return 'Yes';
    if (v === false) return 'No';
    return null;
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

const SKILL_ALIASES = [
  ['c#', /\bc#|c sharp/], ['.net', /\.net|dotnet|asp\.net/], ['typescript', /typescript/], ['javascript', /javascript|(?<![.\w])js\b/],
  ['react', /react(?!ive)/], ['angular', /angular/], ['vue', /\bvue/], ['node.js', /node/], ['python', /python/], ['java', /\bjava\b/],
  ['sql', /\bsql\b|sql server|database/], ['azure', /azure/], ['aws', /\baws\b|amazon web services/], ['gcp', /\bgcp\b|google cloud/],
  ['docker', /docker/], ['kubernetes', /kubernetes|\bk8s\b/], ['mongodb', /mongo/], ['postgresql', /postgres/],
  ['cloud', /cloud/], ['apis', /\bapi/], ['leadership', /lead(ing|ership)?\b|manag|mentor/],
];

// Wording that means "years in my own field", per role_family (see references/roles/).
const FAMILY_WORDS = {
  'software-engineering': /software|engineering|development|programming|full.?stack|web|object.?oriented/,
  'qa-testing': /\bqa\b|quality assurance|testing/,
  'devops-cloud': /devops|\bsre\b|infrastructure|site reliability/,
  'data-analytics': /data analytics|data analysis|analytics|business intelligence/,
  'cybersecurity': /security|cyber/,
  'technical-writing': /technical writing|documentation/,
  'product-management': /product management|product manager/,
  'project-delivery': /project (management|delivery)|scrum|agile/,
  'business-analysis': /business analy/,
  'ux-ui-design': /\bux\b|\bui\b|ux\/ui|product design/,
  'it-customer-support': /support|service desk|help ?desk/,
  'hr-recruiting': /recruit|talent acquisition|\bhr\b|human resources/,
  'sales-account-management': /sales|account management/,
  'marketing': /marketing/,
  'finance-accounting': /finance|financial|accounting/,
  'operations-admin': /operations|administrat/,
};

/** The role-neutral experience of a bank. `experience` wins over the 0.4.0 `years` block per key. */
export function experienceOf(bank) {
  const y = (bank && bank.years) || {};
  const e = (bank && bank.experience) || {};
  const items = {};
  for (const [k, v] of Object.entries(y.skills || {})) items[low(k)] = v;
  for (const [k, v] of Object.entries(e.items || {})) items[low(k)] = v;
  const none = [...new Set([...(y.none || []), ...(e.none || [])].map(low))];
  return { total: e.total_years !== undefined ? e.total_years : y.total, items, none };
}

/** Years of experience for "How many years of work experience do you have with X?". */
export function years(question, bank) {
  const q = low(question);
  const custom = customAnswer(q, bank);
  if (custom && /^\d+$/.test(custom)) return custom;
  const { total, items, none } = experienceOf(bank);
  const skills = Object.fromEntries(Object.entries(items).filter(([, v]) => typeof v === 'number'));
  for (const [name, re] of SKILL_ALIASES) {
    if (re.test(q)) {
      if (skills[name] !== undefined) return String(skills[name]);
      if (none.includes(name)) return '0';
      return null; // a technology the bank does not cover: ask, do not guess
    }
  }
  // Exact key match for technologies outside the alias list ("Data Pipelines", "Selenium").
  for (const [k, v] of Object.entries(skills)) if (hasKey(q, k)) return String(v);
  if (none.some((n) => hasKey(q, n))) return '0';
  // Role wording ("in this role", "QA experience") counts only when nothing more specific is
  // asked: a "with / using / on / in <thing>" qualifier means a skill the bank does not cover.
  const unqualified = !/\b(with|using|on|in)\b/.test(q.replace(/\bin (this|a similar|similar|the same) (role|roles|position)\b/g, ''));
  const family = FAMILY_WORDS[bank && bank.role_family];
  const generic = /years of (work |professional |relevant )?experience( do you have)?\??$/.test(q)
    || /software|engineering|development|programming|professional|full.?stack|web|object.?oriented/.test(q)
    || (unqualified && (/in this role|relevant experience|similar role/.test(q)
      || Boolean(family && new RegExp('(' + family.source + ')\\s+experience').test(q))));
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
  if (/notice/.test(q)) return find(/1 month|one month|4 weeks|four weeks/) || null;
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

/** Required privacy-notice consent may be ticked only when the candidate agreed at intake. Marketing never. */
export function consentAllowed(label, bank) {
  const l = low(label);
  if (/^follow |stay up to date|marketing|sms|text message|whatsapp|newsletter|future (career )?opportunit|communit|talent pool|phone calls?/.test(l)) return Boolean(bank.policy && bank.policy.marketing_contact === true);
  if (/privacy|personal data|processing of (my )?data|i consent|read.{0,30}(notice|policy)|accept.{0,30}(notice|policy|terms)|details provided.{0,40}(own|accurate)/.test(l)) {
    return Boolean(bank.policy && bank.policy.privacy_consent === true);
  }
  return false;
}
