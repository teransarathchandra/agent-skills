#!/usr/bin/env python3
"""Validate every skill and the plugin manifests in this repository.

Standard library only. Exit code 0 when clean, 1 when any error is found.

Rules follow the Agent Skills specification (https://agentskills.io/specification)
plus a few repository rules: descriptions start with a "Use when" trigger, no
secrets or email addresses in skill files, and the manifests agree with each other.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")
LINK_RE = re.compile(r"\]\(([^)\s]+)\)")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
SECRET_RES = [
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
]
SCANNED_SUFFIXES = {".md", ".py", ".sh", ".js", ".mjs", ".cjs", ".ts", ".json", ".txt", ".yml", ".yaml"}
ALLOWED_EMAIL_DOMAINS =("example.com", "example.org", "users.noreply.github.com")
MAX_NAME = 64
MAX_DESCRIPTION = 1024
MAX_COMPATIBILITY = 500
MAX_BODY_LINES = 500


def parse_frontmatter(text: str) -> tuple[dict, str, str | None]:
    """Return (fields, body, error). Supports `key: value` and one nested map."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text, "SKILL.md must start with a '---' frontmatter block"
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration:
        return {}, text, "frontmatter is not closed with '---'"
    fields: dict = {}
    current_map: str | None = None
    for raw in lines[1:end]:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        indented = raw.startswith((" ", "\t"))
        key, sep, value = raw.strip().partition(":")
        if not sep:
            return {}, text, f"cannot parse frontmatter line: {raw!r}"
        value = value.strip().strip('"').strip("'")
        if indented:
            if current_map is None:
                return {}, text, f"unexpected indented line: {raw!r}"
            fields[current_map][key] = value
        elif value == "":
            fields[key] = {}
            current_map = key
        else:
            fields[key] = value
            current_map = None
    return fields, "\n".join(lines[end + 1:]), None


def check_privacy(path: Path, text: str, errors: list[str]) -> None:
    rel = path.relative_to(ROOT)
    for pattern in SECRET_RES:
        if pattern.search(text):
            errors.append(f"{rel}: looks like a secret or key ({pattern.pattern[:20]}...)")
    for match in EMAIL_RE.finditer(text):
        domain = match.group(0).split("@", 1)[1].lower()
        if not domain.endswith(ALLOWED_EMAIL_DOMAINS):
            errors.append(f"{rel}: email address found: {match.group(0)}")


def check_links(path: Path, body: str, errors: list[str]) -> None:
    for target in LINK_RE.findall(body):
        if re.match(r"^(https?:|mailto:|#)", target):
            continue
        if not (path.parent / target.split("#", 1)[0]).exists():
            errors.append(f"{path.relative_to(ROOT)}: broken relative link: {target}")


def validate_skill(skill_dir: Path, errors: list[str]) -> None:
    rel = skill_dir.relative_to(ROOT)
    skill_file = skill_dir / "SKILL.md"
    if not skill_file.is_file():
        errors.append(f"{rel}: missing SKILL.md")
        return
    text = skill_file.read_text(encoding="utf-8")
    fields, body, error = parse_frontmatter(text)
    if error:
        errors.append(f"{rel}/SKILL.md: {error}")
        return

    name = fields.get("name", "")
    if not name:
        errors.append(f"{rel}/SKILL.md: 'name' is required")
    else:
        if len(name) > MAX_NAME or not NAME_RE.match(name):
            errors.append(f"{rel}/SKILL.md: name {name!r} must be lowercase letters, digits and single hyphens, max {MAX_NAME}")
        if name != skill_dir.name:
            errors.append(f"{rel}/SKILL.md: name {name!r} must match the folder name {skill_dir.name!r}")

    description = fields.get("description", "")
    if not description:
        errors.append(f"{rel}/SKILL.md: 'description' is required")
    else:
        if len(description) > MAX_DESCRIPTION:
            errors.append(f"{rel}/SKILL.md: description is {len(description)} characters, max {MAX_DESCRIPTION}")
        if not description.startswith("Use when"):
            errors.append(f"{rel}/SKILL.md: description must start with 'Use when' so agents know when to load it")

    compatibility = fields.get("compatibility", "")
    if compatibility and len(compatibility) > MAX_COMPATIBILITY:
        errors.append(f"{rel}/SKILL.md: compatibility is {len(compatibility)} characters, max {MAX_COMPATIBILITY}")
    if "metadata" in fields and not isinstance(fields["metadata"], dict):
        errors.append(f"{rel}/SKILL.md: metadata must be a key/value map")

    if len(body.splitlines()) > MAX_BODY_LINES:
        errors.append(f"{rel}/SKILL.md: body is over {MAX_BODY_LINES} lines; move detail into references/")

    check_links(skill_file, body, errors)
    for file in sorted(skill_dir.rglob("*")):
        if file.is_file() and file.suffix in SCANNED_SUFFIXES:
            check_privacy(file, file.read_text(encoding="utf-8"), errors)


def load_json(path: Path, errors: list[str]) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"{path.relative_to(ROOT)}: file not found")
    except json.JSONDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON ({exc})")
    return None


def validate_manifests(errors: list[str]) -> None:
    plugin = load_json(ROOT / ".claude-plugin" / "plugin.json", errors)
    market = load_json(ROOT / ".claude-plugin" / "marketplace.json", errors)
    if plugin is None or market is None:
        return
    version = plugin.get("version", "")
    if not SEMVER_RE.match(version):
        errors.append(f".claude-plugin/plugin.json: version {version!r} must look like 1.2.3")
    changelog = ROOT / "CHANGELOG.md"
    if changelog.is_file() and version and f"## [{version}]" not in changelog.read_text(encoding="utf-8"):
        errors.append(f"CHANGELOG.md: no '## [{version}]' heading for the version in plugin.json")
    names = [entry.get("name") for entry in market.get("plugins", [])]
    if len(names) != len(set(names)):
        errors.append(".claude-plugin/marketplace.json: duplicate plugin names")
    if plugin.get("name") not in names:
        errors.append(".claude-plugin/marketplace.json: no entry matches the name in plugin.json")
    for entry in market.get("plugins", []):
        if "version" in entry:
            errors.append(".claude-plugin/marketplace.json: set 'version' only in plugin.json, not in the entry")


def validate_readme(errors: list[str]) -> None:
    """Every relative link and image in README.md must point at a file that exists."""
    readme = ROOT / "README.md"
    if not readme.is_file():
        errors.append("README.md: file not found")
        return
    text = readme.read_text(encoding="utf-8")
    targets = LINK_RE.findall(text) + re.findall(r'(?:src|href)="([^"]+)"', text)
    for target in targets:
        if re.match(r"^(https?:|mailto:|#)", target):
            continue
        if not (ROOT / target.split("#", 1)[0].split("?", 1)[0]).exists():
            errors.append(f"README.md: broken relative link or image: {target}")


def main() -> int:
    errors: list[str] = []
    skills_root = ROOT / "skills"
    skill_dirs = sorted(p for p in skills_root.iterdir() if p.is_dir()) if skills_root.is_dir() else []
    if not skill_dirs:
        errors.append("skills/: no skills found")
    for skill_dir in skill_dirs:
        validate_skill(skill_dir, errors)
    validate_manifests(errors)
    validate_readme(errors)
    if errors:
        print(f"{len(errors)} problem(s) found:\n")
        for error in errors:
            print(f"  - {error}")
        return 1
    print(f"OK: {len(skill_dirs)} skill(s) and the plugin manifests are valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
