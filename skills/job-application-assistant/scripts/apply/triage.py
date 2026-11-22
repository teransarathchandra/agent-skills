#!/usr/bin/env python3
"""Sort scanned job ads into apply, check and skip, using the candidate's answer bank.

Usage:
    python triage.py scan.json --answers answers.json --country AU [--json]

scan.json is the output of `node jaa.mjs scan --out scan.json`: a list of
{"id", "title", "company", "location", "easy_apply", "url", "text"}.

The rules mirror the skill's triage guide: drop ads that require citizenship,
permanent residency, full or unrestricted work rights, a security clearance, a
named residence, a language the candidate does not speak, or far more years
than the candidate has; flag ads that offer sponsorship or relocation. The
agent still reads every "apply" and "check" ad in full before applying.
Needs Python 3.9+ and nothing else.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REQUIRES_RIGHTS = [
    r"must be an? (australian|new zealand|nz|us|u\.s\.|canadian|uk|british|eu) citizen",
    r"(australian|new zealand|nz|us|u\.s\.|canadian|uk|british) citizen(ship)? (is )?required",
    r"citizens? or permanent residents? only",
    r"(must be|must hold|require[sd]?|only|be an?) (an? )?(\w+ )?(citizen|permanent resident)s?\b(?! ?ship within)",
    r"(citizens?|permanent residents?) (or|and) (permanent residents?|citizens?) only",
    r"(full|unrestricted|existing) (australian |new zealand |nz |uk |us |canadian )?(working|work) rights",
    r"(right|authori[sz]ed|eligible|legally able) to work in [a-z ]{2,30} without (any )?(visa )?sponsorship",
    r"(no|not able to|unable to|cannot|can't|does not|do not|will not) (provide |offer )?(visa )?sponsor",
    r"sponsorship (is )?not (available|provided|offered)",
    r"must (already )?(have|hold) (the )?(right|authori[sz]ation) to work",
    r"authori[sz]ed to work in (australia|new zealand|canada|the united states|the us|the uk)",
    r"independent visa holders",
]
REQUIRES_CLEARANCE = [r"security clearance", r"\bnv1\b", r"\bnv2\b", r"\btspv\b", r"baseline clearance", r"\bsc clearance\b", r"\bdv clearance\b", r"\bbpss\b", r"active (secret|top secret|public trust)"]
REQUIRES_RESIDENCE = [r"must (currently )?(reside|live|be based|be located) in", r"candidates (must be )?(residing|based|located) in", r"open to candidates based in", r"(local|in-state) candidates only"]
SPONSOR_POSITIVE = [r"visa sponsorship (is )?(available|provided|offered)", r"(will|can|happy to) sponsor", r"sponsorship (for|of) (an? )?(expedited )?(work )?(permit|visa)", r"relocation (support|package|assistance)", r"eligible for visa sponsorship", r"help (you )?(with|apply for) (the |a )?(work permit|visa)", r"sponsor visas"]
WORLDWIDE_REMOTE = [r"work from anywhere", r"remote[- ]first.{0,40}(world|global|any country)", r"anywhere in the world", r"fully remote.{0,30}(global|worldwide)"]
LANGUAGES = ["german", "french", "dutch", "italian", "spanish", "polish", "swedish", "danish", "norwegian", "finnish", "japanese", "mandarin", "portuguese"]


def find(patterns: list[str], text: str) -> list[str]:
    hits = []
    for p in patterns:
        m = re.search(p, text)
        if m:
            start = max(0, m.start() - 60)
            hits.append(text[start:m.end() + 60].replace("\n", " ").strip())
    return hits


def max_years(text: str) -> int | None:
    vals = [int(n) for n in re.findall(r"(\d{1,2})\s*\+?\s*(?:-\s*\d{1,2}\s*)?years?(?:'|’)?\s*(?:of\s+)?(?:professional\s+|commercial\s+|relevant\s+|hands-on\s+)?(?:experience|exp\b)", text)]
    vals = [v for v in vals if v < 25]
    return max(vals) if vals else None


def experience_keys(bank: dict) -> list[str]:
    """Skills and credentials the candidate has, any role. `experience.items` wins over
    `years.skills` per key; values 0 and False are excluded, True (a credential) is kept.
    Keys of 1-2 characters keep their case (they match case-sensitively); longer keys are lowercased."""
    merged: dict[str, tuple[str, object]] = {}
    for src in ((bank.get("years") or {}).get("skills"), (bank.get("experience") or {}).get("items")):
        for k, v in (src or {}).items():
            merged[str(k).lower()] = (str(k), v)
    keys = []
    for low, (orig, v) in merged.items():
        if v is False or v == 0 or v is None:
            continue
        keys.append(orig if len(low) <= 2 else low)
    return sorted(keys)


def key_in_text(key: str, text: str) -> bool:
    """Whole-word match. Keys of 1-2 characters are case-sensitive; longer keys are not.
    A short key with no capital (an older bank's "c#", "go") also tries upper and capitalised forms."""
    if len(key) > 2:
        variants, flags = [key], re.IGNORECASE
    else:
        variants, flags = [key], 0
        if key == key.lower():
            variants += [key.upper(), key.capitalize()]
    return any(re.search(r"(?<![A-Za-z0-9])" + re.escape(v) + r"(?![A-Za-z0-9])", text, flags) for v in variants)


def triage(job: dict, bank: dict, country: str) -> dict:
    original = job.get("text") or ""
    text = original.lower()
    c = (bank.get("countries") or {}).get(country, {})
    reasons, flags = [], []
    if c.get("needs_sponsorship", True):
        hits = find(REQUIRES_RIGHTS, text)
        if hits:
            reasons.append("needs work rights: " + hits[0])
    hits = find(REQUIRES_CLEARANCE, text)
    if hits and not (bank.get("policy") or {}).get("has_clearance"):
        reasons.append("needs clearance: " + hits[0])
    if not c.get("lives_there"):
        hits = find(REQUIRES_RESIDENCE, text)
        if hits:
            reasons.append("needs residence: " + hits[0])
    spoken = [s.lower() for s in (bank.get("candidate") or {}).get("languages", ["english"])]
    for lang in LANGUAGES:
        if lang not in spoken and re.search(rf"(fluent|fluency|native|proficien\w*|business[- ]level)\W+(in\W+)?{lang}|{lang}\W+(is\W+)?(required|essential|fluent|c1|c2|b2)", text):
            reasons.append(f"needs {lang}")
            break
    total = (bank.get("experience") or {}).get("total_years")
    if total is None:
        total = (bank.get("years") or {}).get("total")
    need = max_years(text)
    if total is not None and need is not None and need > total + 1:
        reasons.append(f"asks {need}+ years (you have {total})")
    matched = sorted(k for k in experience_keys(bank) if key_in_text(k, original))
    if find(SPONSOR_POSITIVE, text):
        flags.append("offers sponsorship or relocation")
    if find(WORLDWIDE_REMOTE, text):
        flags.append("remote from anywhere")
    if reasons:
        verdict = "skip"
    elif flags or len(matched) >= 3:
        verdict = "apply"
    else:
        verdict = "check"
    return {"id": job.get("id"), "title": job.get("title"), "company": job.get("company"), "location": job.get("location"),
            "verdict": verdict, "reasons": reasons, "flags": flags, "skills_matched": matched, "url": job.get("url")}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("scan")
    ap.add_argument("--answers", required=True)
    ap.add_argument("--country", required=True)
    ap.add_argument("--json", action="store_true", help="print JSON instead of a table")
    args = ap.parse_args(argv)
    jobs = json.loads(Path(args.scan).read_text(encoding="utf-8"))
    bank = json.loads(Path(args.answers).read_text(encoding="utf-8"))
    rows = [triage(j, bank, args.country) for j in jobs if j.get("id")]
    order = {"apply": 0, "check": 1, "skip": 2}
    rows.sort(key=lambda r: (order[r["verdict"]], -len(r["skills_matched"])))
    if args.json:
        print(json.dumps(rows, indent=1))
        return 0
    print("| Verdict | Job | Company | Location | Skills | Notes |")
    print("|---|---|---|---|---|---|")
    for r in rows:
        notes = "; ".join(r["reasons"] or r["flags"]) or "-"
        print(f"| {r['verdict']} | {r['title']} ({r['id']}) | {r['company']} | {r['location']} | {', '.join(r['skills_matched']) or '-'} | {notes[:140]} |")
    return 0


if __name__ == "__main__":
    sys.exit(main())
