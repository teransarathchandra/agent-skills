import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import validate_skills as v  # noqa: E402

GOOD = """---
name: sample-skill
description: Use when testing the validator with a well-formed skill.
license: MIT
metadata:
  author: someone
  version: "1.0.0"
---

# Sample

Body text.
"""


class SkillTests(unittest.TestCase):
    def run_skill(self, text, folder="sample-skill", extra=None):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = root / folder
            skill_dir.mkdir()
            (skill_dir / "SKILL.md").write_text(text, encoding="utf-8")
            for rel, content in (extra or {}).items():
                (skill_dir / rel).parent.mkdir(parents=True, exist_ok=True)
                (skill_dir / rel).write_text(content, encoding="utf-8")
            old_root, v.ROOT = v.ROOT, root
            try:
                errors: list[str] = []
                v.validate_skill(skill_dir, errors)
                return errors
            finally:
                v.ROOT = old_root

    def test_good_skill_has_no_errors(self):
        self.assertEqual(self.run_skill(GOOD), [])

    def test_name_must_match_folder(self):
        errors = self.run_skill(GOOD, folder="other-name")
        self.assertTrue(any("must match the folder" in e for e in errors))

    def test_bad_name_characters(self):
        errors = self.run_skill(GOOD.replace("name: sample-skill", "name: Sample--Skill"))
        self.assertTrue(any("lowercase letters" in e for e in errors))

    def test_description_must_start_with_use_when(self):
        errors = self.run_skill(GOOD.replace("Use when testing", "Helps with testing"))
        self.assertTrue(any("Use when" in e for e in errors))

    def test_description_too_long(self):
        errors = self.run_skill(GOOD.replace("with a well-formed skill.", "x" * 1100))
        self.assertTrue(any("max 1024" in e for e in errors))

    def test_missing_frontmatter(self):
        errors = self.run_skill("# No frontmatter\n")
        self.assertTrue(any("frontmatter" in e for e in errors))

    def test_body_too_long(self):
        errors = self.run_skill(GOOD + "line\n" * 600)
        self.assertTrue(any("over 500 lines" in e for e in errors))

    def test_broken_relative_link(self):
        errors = self.run_skill(GOOD + "\nSee [more](references/missing.md).\n")
        self.assertTrue(any("broken relative link" in e for e in errors))

    def test_valid_relative_link(self):
        errors = self.run_skill(GOOD + "\nSee [more](references/more.md).\n", extra={"references/more.md": "# More\n"})
        self.assertEqual(errors, [])

    def test_email_is_rejected(self):
        errors = self.run_skill(GOOD + "\nContact jane.doe@corp.com\n")
        self.assertTrue(any("email address" in e for e in errors))

    def test_example_email_is_allowed(self):
        self.assertEqual(self.run_skill(GOOD + "\nContact jane@example.com\n"), [])

    def test_secret_is_rejected(self):
        errors = self.run_skill(GOOD + "\ntoken ghp_" + "a" * 30 + "\n")
        self.assertTrue(any("secret" in e for e in errors))


class RepositoryTests(unittest.TestCase):
    def test_this_repository_is_valid(self):
        errors: list[str] = []
        for skill_dir in sorted((v.ROOT / "skills").iterdir()):
            if skill_dir.is_dir():
                v.validate_skill(skill_dir, errors)
        v.validate_manifests(errors)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
