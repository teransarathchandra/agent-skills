#!/usr/bin/env python3
"""Scan files for private terms and risky patterns before you publish them.

Standard library only.

    python3 scan_terms.py --terms ~/private-terms.txt path/to/folder
    git log -p --all | python3 scan_terms.py --terms ~/private-terms.txt -

The term file lists your private words, one per line:
    plain text    matched case-insensitively as a whole word ("Dana Whitfield")
    re:PATTERN    a regular expression
    # comment     ignored

Two kinds of hit:
    block   a term from your list. Always fails the scan (exit 1).
    review  a risky pattern (email, ticket key, id, date, secret, internal URL,
            home path). Fails only with --strict.

Exit codes: 0 clean, 1 hits, 2 bad usage (including a term file inside the
scanned folder, because publishing that list would defeat the purpose).
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv"}
MAX_BYTES = 2_000_000
FICTIONAL_KEY_PREFIXES = {
    "ABC", "XYZ", "PROJ", "EXAMPLE", "UTF", "SHA", "ISO", "CVE", "RFC", "AES",
    "RSA", "TLS", "HTTP", "MD", "PR", "ID",
}

AUTO_PATTERNS = {
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "ticket-key": re.compile(r"\b[A-Z]{2,}[A-Z0-9]{0,8}-\d{1,6}\b"),
    "uuid": re.compile(r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b"),
    "ip-address": re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    "date": re.compile(r"\b20\d\d-\d\d-\d\d\b"),
    "home-path": re.compile(r"/(?:Users|home)/[A-Za-z0-9._-]+"),
    "internal-url": re.compile(
        r"https?://[\w.-]*(?:atlassian\.net|sharepoint\.com|\.internal|\.corp|\.local|\.lan|intranet)[^\s)\"']*",
        re.IGNORECASE,
    ),
    "secret": re.compile(
        r"ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}"
        r"|-----BEGIN [A-Z ]*PRIVATE KEY-----"
    ),
}


class Hit:
    def __init__(self, kind: str, label: str, where: str, line: int, text: str):
        self.kind, self.label, self.where, self.line, self.text = kind, label, where, line, text

    def __str__(self) -> str:
        place = f"{self.where}:{self.line}" if self.line else f"{self.where} (file name)"
        return f"{place}: [{self.kind}] {self.label}: {self.text}"


def compile_term(raw: str) -> re.Pattern | None:
    raw = raw.strip()
    if not raw or raw.startswith("#"):
        return None
    if raw.startswith("re:"):
        return re.compile(raw[3:], re.IGNORECASE)
    body = r"\s+".join(re.escape(part) for part in raw.split())
    return re.compile(rf"(?<![A-Za-z0-9]){body}(?![A-Za-z0-9])", re.IGNORECASE)


def load_terms(path: Path) -> list[tuple[str, re.Pattern]]:
    terms = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        pattern = compile_term(raw)
        if pattern is not None:
            terms.append((raw.strip(), pattern))
    return terms


def scan_text(text: str, where: str, terms, auto: bool, line_offset: int = 0) -> list[Hit]:
    hits: list[Hit] = []
    for number, line in enumerate(text.splitlines(), start=1):
        for label, pattern in terms:
            for match in pattern.finditer(line):
                hits.append(Hit("block", "listed term", where, number + line_offset, match.group(0)))
        if not auto:
            continue
        for label, pattern in AUTO_PATTERNS.items():
            for match in pattern.finditer(line):
                value = match.group(0)
                if label == "ticket-key" and value.split("-")[0] in FICTIONAL_KEY_PREFIXES:
                    continue
                if label == "email" and value.lower().endswith(("@example.com", "@example.org", ".noreply.github.com")):
                    continue
                hits.append(Hit("review", label, where, number + line_offset, value))
    return hits


def iter_files(root: Path):
    if root.is_file():
        yield root
        return
    for path in sorted(root.rglob("*")):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        if path.is_file():
            yield path


def is_text(path: Path) -> bool:
    try:
        if path.stat().st_size > MAX_BYTES:
            return False
        with path.open("rb") as handle:
            return b"\0" not in handle.read(2048)
    except OSError:
        return False


def inside(child: Path, parent: Path) -> bool:
    try:
        child.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def scan_paths(paths: list[str], terms, auto: bool) -> list[Hit]:
    hits: list[Hit] = []
    for raw in paths:
        if raw == "-":
            hits += scan_text(sys.stdin.read(), "<stdin>", terms, auto)
            continue
        root = Path(raw)
        for file in iter_files(root):
            shown = str(file)
            for label, pattern in terms:
                for match in pattern.finditer(file.name):
                    hits.append(Hit("block", "listed term", shown, 0, match.group(0)))
            if is_text(file):
                hits += scan_text(file.read_text(encoding="utf-8", errors="ignore"), shown, terms, auto)
    return hits


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("paths", nargs="+", help="files or folders to scan; '-' reads stdin")
    parser.add_argument("--terms", required=True, help="file with your private terms, kept OUTSIDE the scanned folder")
    parser.add_argument("--no-auto", action="store_true", help="skip the risky-pattern checks")
    parser.add_argument("--strict", action="store_true", help="also fail on review hits")
    args = parser.parse_args(argv)

    terms_path = Path(args.terms).expanduser()
    if not terms_path.is_file():
        print(f"error: term file not found: {terms_path}", file=sys.stderr)
        return 2
    for raw in args.paths:
        if raw != "-" and Path(raw).is_dir() and inside(terms_path, Path(raw)):
            print(f"error: the term file is inside '{raw}'. Move it outside the folder you publish.", file=sys.stderr)
            return 2

    terms = load_terms(terms_path)
    if not terms:
        print("error: the term file has no terms", file=sys.stderr)
        return 2
    hits = scan_paths(args.paths, terms, auto=not args.no_auto)
    for hit in hits:
        print(hit)
    blocked = sum(1 for h in hits if h.kind == "block")
    review = len(hits) - blocked
    print(f"\n{blocked} blocked, {review} to review ({len(terms)} terms scanned).")
    if blocked or (args.strict and review):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
