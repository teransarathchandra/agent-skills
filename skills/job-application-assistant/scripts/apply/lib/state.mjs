// Local state for the apply engine: the candidate's LinkedIn opt-in, today's submission count and
// the submission log. Lives in JAA_HOME (default ~/.jaa), never in a repository.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const HOME = process.env.JAA_HOME || path.join(os.homedir(), '.jaa');
const FILE = path.join(HOME, 'state.json');
export const DEFAULT_DAILY_CAP = 15;

export function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}

export function save(state) {
  fs.mkdirSync(HOME, { recursive: true, mode: 0o700 });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
}

const today = () => new Date().toISOString().slice(0, 10);

export function optIn(site, cap) {
  const s = load();
  s.opt_in = s.opt_in || {};
  s.opt_in[site] = { at: new Date().toISOString(), daily_cap: cap || DEFAULT_DAILY_CAP };
  save(s);
  return s.opt_in[site];
}

export function optOut(site) {
  const s = load();
  if (s.opt_in) delete s.opt_in[site];
  save(s);
}

export function isOptedIn(site) {
  const s = load();
  return Boolean(s.opt_in && s.opt_in[site]);
}

export function submittedToday(site) {
  const s = load();
  return (s.log || []).filter((e) => e.site === site && e.at.startsWith(today())).length;
}

export function capFor(site) {
  const s = load();
  return (s.opt_in && s.opt_in[site] && s.opt_in[site].daily_cap) || DEFAULT_DAILY_CAP;
}

export function logSubmission(entry) {
  const s = load();
  s.log = s.log || [];
  s.log.push({ ...entry, at: new Date().toISOString() });
  save(s);
}
