"""Tests for skills/job-application-assistant/scripts/apply/triage.py (fictional ads, real wording)."""
import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "skills" / "job-application-assistant" / "scripts" / "apply" / "triage.py"
spec = importlib.util.spec_from_file_location("triage", SCRIPT)
triage = importlib.util.module_from_spec(spec)
spec.loader.exec_module(triage)

BANK = {
    "candidate": {"languages": ["English"]},
    "countries": {"AU": {"needs_sponsorship": True, "lives_there": False}, "CA": {"needs_sponsorship": True, "lives_there": False}},
    "years": {"total": 5, "skills": {"typescript": 4, "c#": 2, "react": 2, "azure": 2, "node": 2}},
    "policy": {"has_clearance": False},
}


def job(text, country="AU"):
    return triage.triage({"id": "1", "title": "Engineer", "company": "Example", "text": text}, BANK, country)


class TriageTests(unittest.TestCase):
    def test_full_work_rights_is_skipped(self):
        r = job("About the job. Candidates must have full Australian working rights & already be residing in Australia.")
        self.assertEqual(r["verdict"], "skip")

    def test_no_sponsorship_is_skipped(self):
        r = job("Remote in the US. My client is unable to sponsor or transfer work visas, now or in the future.")
        self.assertEqual(r["verdict"], "skip")

    def test_clearance_is_skipped(self):
        r = job("This role requires the successful applicant to be an Australian citizen and hold an active NV1 clearance.")
        self.assertEqual(r["verdict"], "skip")
        self.assertTrue(any("clearance" in x for x in r["reasons"]))

    def test_path_to_residency_is_not_a_requirement(self):
        r = job("For international candidates, sponsorship for an expedited work permit, expedited permanent residency, and citizenship within four years. TypeScript, Node, React.", "CA")
        self.assertEqual(r["verdict"], "apply")
        self.assertIn("offers sponsorship or relocation", r["flags"])

    def test_too_many_years_is_skipped(self):
        r = job("Requirements: 10+ years of professional experience with C# and Azure.")
        self.assertEqual(r["verdict"], "skip")

    def test_language_requirement_is_skipped(self):
        r = job("Fluent German is required for client meetings. TypeScript, React, Node.")
        self.assertEqual(r["verdict"], "skip")

    def test_strong_stack_match_is_apply(self):
        r = job("We use TypeScript, Node, React and Azure. 5+ years of experience.")
        self.assertEqual(r["verdict"], "apply")
        self.assertEqual(r["stack_matched"], ["azure", "node", "react", "typescript"])

    def test_weak_match_is_check(self):
        r = job("Ruby on Rails and Hotwire. Several years of experience.")
        self.assertEqual(r["verdict"], "check")


if __name__ == "__main__":
    unittest.main()
