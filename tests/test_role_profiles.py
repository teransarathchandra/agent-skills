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


if __name__ == "__main__":
    unittest.main()
