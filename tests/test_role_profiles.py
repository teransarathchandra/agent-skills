import re
import unittest
from pathlib import Path

REFERENCES = Path(__file__).resolve().parent.parent / "skills" / "job-application-assistant" / "references"


def section(text, heading):
    """Return the body of a level-2 section, up to the next level-2 heading."""
    match = re.search(r"^" + re.escape(heading) + r"\s*$(.*?)(?=^## |\Z)", text, re.M | re.S)
    return match.group(1) if match else None


def table_rows(body, first_header):
    """Return the data rows (lists of stripped cells) of the table whose header starts with first_header."""
    rows, in_table = [], False
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            if in_table:
                break
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if not in_table:
            in_table = cells[0] == first_header
            continue
        if all(set(cell) <= set("-: ") for cell in cells):
            continue
        rows.append(cells)
    return rows


ROLES = REFERENCES / "roles"

PROFILE_SECTIONS = (
    "## Titles and adjacent roles",
    "## Evidence sources",
    "## Intake questions",
    "## CV shape",
    "## Keywords and credentials",
    "## Portfolio and work samples",
    "## Screening questions",
    "## Answer-bank experience keys",
    "## Mistakes to avoid",
    "## Sources",
)

TECH_STEMS = (
    "software-engineering",
    "qa-testing",
    "devops-cloud",
    "data-analytics",
    "cybersecurity",
    "technical-writing",
)

PRODUCT_DELIVERY_STEMS = (
    "product-management",
    "project-delivery",
    "business-analysis",
    "ux-ui-design",
)

SUPPORT_BUSINESS_STEMS = (
    "it-customer-support",
    "hr-recruiting",
    "sales-account-management",
    "marketing",
    "finance-accounting",
    "operations-admin",
)


def assert_profile(case, stem):
    """Check one role profile has every PROFILE_SECTIONS heading in order and a checked Sources section."""
    path = ROLES / f"{stem}.md"
    case.assertTrue(path.is_file(), f"{path} is missing")
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    positions = []
    for heading in PROFILE_SECTIONS:
        case.assertIn(heading, lines, f"{stem}: missing heading {heading!r}")
        positions.append(lines.index(heading))
    case.assertEqual(positions, sorted(positions), f"{stem}: sections are out of order")
    sources = section(text, "## Sources")
    case.assertTrue(
        any("Checked 2026-11" in line for line in sources.splitlines()),
        f"{stem}: ## Sources has no 'Checked 2026-11' line",
    )


class TechProfileTests(unittest.TestCase):
    def test_tech_profiles_have_every_section(self):
        for stem in TECH_STEMS:
            with self.subTest(stem=stem):
                assert_profile(self, stem)

    def test_profiles_cite_checked_sources(self):
        for stem in TECH_STEMS:
            with self.subTest(stem=stem):
                text = (ROLES / f"{stem}.md").read_text(encoding="utf-8")
                self.assertIn("Checked 2026-11", section(text, "## Sources") or "")


class ProductDeliveryProfileTests(unittest.TestCase):
    def test_product_delivery_profiles_have_every_section(self):
        for stem in PRODUCT_DELIVERY_STEMS:
            with self.subTest(stem=stem):
                assert_profile(self, stem)


class SupportBusinessProfileTests(unittest.TestCase):
    def test_support_business_profiles_have_every_section(self):
        for stem in SUPPORT_BUSINESS_STEMS:
            with self.subTest(stem=stem):
                assert_profile(self, stem)

    def test_fallback_profile_sections(self):
        path = ROLES / "any-role.md"
        self.assertTrue(path.is_file(), f"{path} is missing")
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        headings = (
            "## When to use this",
            "## Build the profile for this session",
            "## Where it is kept",
            "## Sources",
        )
        positions = []
        for heading in headings:
            self.assertIn(heading, lines, f"any-role: missing heading {heading!r}")
            positions.append(lines.index(heading))
        self.assertEqual(positions, sorted(positions), "any-role: sections are out of order")
        sources = section(text, "## Sources")
        self.assertTrue(any("Checked 2026-11" in line for line in sources.splitlines()))


class LayoffReferenceTests(unittest.TestCase):
    HEADINGS = (
        "## Contents",
        "## Explaining the layoff",
        "## References and the old employer",
        "## Timing: notice, garden leave and severance",
        "## Visa tied to the lost job",
        "## Pace and wellbeing",
        "## Sources",
    )

    def test_layoff_reference_has_required_sections(self):
        path = REFERENCES / "layoff.md"
        self.assertTrue(path.is_file(), f"{path} is missing")
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        for heading in self.HEADINGS:
            self.assertIn(heading, lines, f"missing heading {heading!r}")
        sources = section(text, "## Sources")
        self.assertIsNotNone(sources)
        self.assertTrue(
            any("Checked 2026-11" in line for line in sources.splitlines()),
            "## Sources has no 'Checked 2026-11' line",
        )

    def test_layoff_visa_rows_cite_a_source_and_an_adviser(self):
        text = (REFERENCES / "layoff.md").read_text(encoding="utf-8")
        self.assertIn("registered migration adviser or lawyer", text)
        rows = table_rows(section(text, "## Visa tied to the lost job"), "Country")
        self.assertGreaterEqual(len(rows), 10, "visa table is missing or has fewer than 10 rows")
        for cells in rows:
            self.assertTrue(cells[-1], f"visa row {cells[0]!r} has an empty Source cell")


class SkillLinkTests(unittest.TestCase):
    def test_every_role_reference_is_linked_from_skill(self):
        skill = (REFERENCES.parent / "SKILL.md").read_text(encoding="utf-8")
        targets = {target.split("#", 1)[0] for target in re.findall(r"\]\(([^)\s]+)\)", skill)}
        expected = [f"references/roles/{path.name}" for path in sorted(ROLES.glob("*.md"))]
        self.assertEqual(len(expected), 17, "expected 16 role profiles plus any-role.md")
        expected.append("references/layoff.md")
        for target in expected:
            with self.subTest(target=target):
                self.assertIn(target, targets, f"SKILL.md does not link {target}")


if __name__ == "__main__":
    unittest.main()
