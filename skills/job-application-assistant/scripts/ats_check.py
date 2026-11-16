#!/usr/bin/env python3
"""Check a CV (.docx) the way an applicant tracking system (ATS) reads it.

Usage:
    python ats_check.py CV.docx
    python ats_check.py CV.docx --terms terms.txt     # keyword coverage against a job ad
    python ats_check.py CV.docx --terms terms.txt --json

terms.txt holds one term from the job ad per line. Put aliases on one line with
"|" (for example "AWS|Amazon Web Services"). Lines starting with "#" are comments.

Reports errors (the parser will lose something important) and warnings (layout
that parses badly in some systems). Exit code: 0 clean or warnings only, 1 when
any error is found, 2 for a usage problem.

Standard library only. The file is read locally and nothing is sent anywhere.
It is a structural check, not a copy of any vendor's parser: a pass means the
common traps are avoided, not that every ATS will score the CV well.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{W_NS}}}"

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# A run of digits, spaces, brackets and hyphens. It only counts as a phone number when it holds
# PHONE_DIGITS digits: 9 is the shortest common national number with its area code, 15 is the
# E.164 maximum. Below 9 a date range such as "2019 - 2023" (8 digits) would match.
PHONE_RE = re.compile(r"\+?\d[\d ()-]{6,}\d")
PHONE_DIGITS = range(9, 16)

# Fonts installed with Windows, macOS or Microsoft Office, plus their metric-compatible open
# twins (Carlito, Liberation) and the most common web fonts. A font outside this list may be
# missing on the recruiter's machine, and Word then substitutes one with different widths.
COMMON_FONTS = {
    "arial", "aptos", "book antiqua", "calibri", "cambria", "carlito", "garamond",
    "georgia", "helvetica", "helvetica neue", "lato", "liberation sans", "liberation serif",
    "noto sans", "open sans", "roboto", "segoe ui", "source sans pro", "tahoma",
    "times new roman", "trebuchet ms", "verdana",
}

# Heading names parsers map to CV sections: (required, accepted names).
HEADING_GROUPS = {
    "Experience": (True, {"experience", "work experience", "professional experience",
                          "employment", "employment history", "work history"}),
    "Education": (True, {"education", "education and training", "qualifications"}),
    "Skills": (True, {"skills", "technical skills", "core skills", "key skills", "skills and tools"}),
    "Summary": (False, {"summary", "professional summary", "profile", "career summary"}),
    "Other": (False, {"projects", "selected projects", "publications", "certifications",
                      "certificates", "licenses and certifications", "awards", "languages",
                      "volunteering", "volunteer experience", "interests", "achievements"}),
}
HEADING_EXAMPLE = {"Experience": "Experience", "Education": "Education", "Skills": "Skills"}

MONTHS = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?"
DATE_STYLES = {
    "Mon YYYY": re.compile(rf"\b{MONTHS} \d{{4}}\b"),
    "MM/YYYY": re.compile(r"\b\d{1,2}/\d{4}\b"),
    "YYYY-MM": re.compile(r"\b\d{4}-(?:0[1-9]|1[0-2])\b"),
    "MM.YYYY": re.compile(r"\b\d{1,2}\.\d{4}\b"),
}


def _paragraphs(root: ET.Element) -> list[tuple[str, str]]:
    """Return (style id, text) for every paragraph under root."""
    result = []
    for p in root.iter(f"{W}p"):
        style_el = p.find(f"{W}pPr/{W}pStyle")
        style = style_el.get(f"{W}val", "") if style_el is not None else ""
        parts = []
        for node in p.iter():
            if node.tag == f"{W}t" and node.text:
                parts.append(node.text)
            elif node.tag == f"{W}tab":
                parts.append(" ")
        result.append((style, "".join(parts).strip()))
    return result


def _has_contact(text: str) -> bool:
    if EMAIL_RE.search(text):
        return True
    return any(sum(c.isdigit() for c in m.group(0)) in PHONE_DIGITS for m in PHONE_RE.finditer(text))


def _fonts(root: ET.Element) -> set[str]:
    fonts = set()
    for el in root.iter(f"{W}rFonts"):
        for attr in ("ascii", "hAnsi"):
            value = el.get(f"{W}{attr}")
            if value:
                fonts.add(value)
    return fonts


def _heading_key(text: str) -> str:
    return text.lower().rstrip(":").strip()


def check_docx(path: str | Path) -> dict:
    """Return {"errors": [...], "warnings": [...], "text": str} for a .docx file."""
    errors: list[str] = []
    warnings: list[str] = []
    try:
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
            document = ET.fromstring(z.read("word/document.xml"))
            margins = [ET.fromstring(z.read(n)) for n in names
                       if re.fullmatch(r"word/(header|footer)\d*\.xml", n)]
            styles = ET.fromstring(z.read("word/styles.xml")) if "word/styles.xml" in names else None
    except (zipfile.BadZipFile, KeyError, ET.ParseError) as exc:
        return {"errors": [f"not a readable .docx ({exc.__class__.__name__}); save it again from Word as .docx"],
                "warnings": [], "text": ""}

    paragraphs = _paragraphs(document)
    text = "\n".join(t for _, t in paragraphs if t)
    if not text.strip():
        errors.append("no text found in the document body; a parser would see an empty CV "
                      "(is the content an image or inside shapes?)")

    margin_text = "\n".join(t for root in margins for _, t in _paragraphs(root) if t)
    if _has_contact(margin_text):
        if _has_contact(text):
            warnings.append("contact details also appear in a page header or footer; some parsers skip "
                            "those parts, so keep the body copy as the main one")
        else:
            errors.append("contact details are only in a page header or footer; many parsers skip those "
                          "parts, so move name, email and phone into the body")

    if document.find(f".//{W}tbl") is not None:
        warnings.append("a table is used; some parsers read tables out of order. Use plain paragraphs")
    if document.find(f".//{W}txbxContent") is not None:
        warnings.append("a text box is used; many parsers skip text boxes. Move that text into the body")
    if any(n.startswith("word/media/") for n in names) or document.find(f".//{W}drawing") is not None:
        warnings.append("an image is embedded; parsers ignore images, so no information should live only in one")
    for cols in document.iter(f"{W}cols"):
        num = cols.get(f"{W}num", "1")
        if num.isdigit() and int(num) > 1:
            warnings.append("the page uses more than one column; Word's columns parse better than tables, but "
                            "some parsers still merge them line by line. One column is safe everywhere")
            break

    fonts = _fonts(document) | (_fonts(styles) if styles is not None else set())
    unusual = sorted(f for f in fonts if f.lower() not in COMMON_FONTS)
    if unusual:
        warnings.append(f"uncommon font(s): {', '.join(unusual)}; if the reader lacks a font, Word substitutes "
                        "one and the layout moves. Use a common font such as Calibri or Arial")

    present = {_heading_key(t) for _, t in paragraphs if t}
    for style, heading in paragraphs:
        if heading and re.fullmatch(r"(?i)heading\s?\d", style):
            if not any(_heading_key(heading) in accepted for _, accepted in HEADING_GROUPS.values()):
                warnings.append(f"heading {heading!r} is not a section name parsers know; use a standard "
                                "name such as Experience, Education or Skills")
    for name, (required, accepted) in HEADING_GROUPS.items():
        if required and not present & accepted:
            warnings.append(f"no standard heading for {name} (for example {HEADING_EXAMPLE[name]!r})")

    styles_used = [name for name, pattern in DATE_STYLES.items() if pattern.search(text)]
    if len(styles_used) > 1:
        warnings.append(f"dates use more than one style ({', '.join(styles_used)}); pick one, "
                        "for example 'Jan 2020 – Mar 2023'")

    return {"errors": errors, "warnings": warnings, "text": text}


def load_terms(path: str | Path) -> list[list[str]]:
    """Read one term per line; aliases separated by '|'; lines starting with '#' are comments."""
    groups = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        aliases = [alias.strip() for alias in line.split("|") if alias.strip()]
        if aliases:
            groups.append(aliases)
    return groups


# Terms this short (Go, R, C#, AWS, SQL) are often ordinary words in another case ("go", "r"),
# so they match case-sensitively. Longer terms match in any case ("Kubernetes", "kubernetes").
CASE_SENSITIVE_MAX_LEN = 3


def _term_pattern(alias: str) -> re.Pattern:
    flags = 0 if len(alias) <= CASE_SENSITIVE_MAX_LEN else re.IGNORECASE
    return re.compile(rf"(?<![A-Za-z0-9]){re.escape(alias)}(?![A-Za-z0-9])", flags)


def keyword_coverage(text: str, terms: list[list[str]]) -> dict:
    """Return the terms found and missing in text, each named by its first alias."""
    found, missing = [], []
    for aliases in terms:
        (found if any(_term_pattern(a).search(text) for a in aliases) else missing).append(aliases[0])
    coverage = len(found) / len(terms) if terms else 1.0
    return {"found": found, "missing": missing, "coverage": coverage}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check a CV (.docx) for ATS parsing problems.")
    parser.add_argument("cv", help="path to the CV .docx")
    parser.add_argument("--terms", help="file with one job-ad term per line (aliases separated by '|')")
    parser.add_argument("--json", action="store_true", help="print the result as JSON")
    args = parser.parse_args(argv)

    cv = Path(args.cv)
    if not cv.is_file():
        print(f"ats_check: file not found: {cv}", file=sys.stderr)
        return 2
    result = check_docx(cv)
    if args.terms:
        if not Path(args.terms).is_file():
            print(f"ats_check: terms file not found: {args.terms}", file=sys.stderr)
            return 2
        result["keywords"] = keyword_coverage(result["text"], load_terms(args.terms))
    result.pop("text")

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        for error in result["errors"]:
            print(f"ERROR  {error}")
        for warning in result["warnings"]:
            print(f"WARN   {warning}")
        if not result["errors"] and not result["warnings"]:
            print("OK  no structural problems found")
        if "keywords" in result:
            kw = result["keywords"]
            total = len(kw["found"]) + len(kw["missing"])
            print(f"KEYWORDS  {len(kw['found'])}/{total} found ({kw['coverage']:.0%})")
            if kw["missing"]:
                print(f"  missing: {', '.join(kw['missing'])}")
                print("  Add a missing term only where the candidate's evidence supports it.")
    return 1 if result["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
