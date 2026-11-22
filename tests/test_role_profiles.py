import re
import unittest
from pathlib import Path

REFERENCES = Path(__file__).resolve().parent.parent / "skills" / "job-application-assistant" / "references"


def section(text, heading):
    """Return the body of a level-2 section, up to the next level-2 heading."""
    match = re.search(r"^" + re.escape(heading) + r"\s*$(.*?)(?=^## |\Z)", text, re.M | re.S)
    return match.group(1) if match else None


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


if __name__ == "__main__":
    unittest.main()
