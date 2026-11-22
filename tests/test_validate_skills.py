import json
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

    def test_valid_evals_pass(self):
        evals = json.dumps([{"skills": ["sample-skill"], "query": "q", "files": [], "expected_behavior": ["does x"]}])
        triggers = json.dumps({"should_trigger": ["a"], "should_not_trigger": ["b"]})
        self.assertEqual(self.run_skill(GOOD, extra={"evals/evals.json": evals, "evals/triggers.json": triggers}), [])

    def test_bad_evals_are_reported(self):
        cases = {
            "not a list": json.dumps({"query": "q"}),
            "wrong skill": json.dumps([{"skills": ["other"], "query": "q", "expected_behavior": ["x"]}]),
            "no query": json.dumps([{"skills": ["sample-skill"], "query": "", "expected_behavior": ["x"]}]),
            "no behaviour": json.dumps([{"skills": ["sample-skill"], "query": "q", "expected_behavior": []}]),
            "missing file": json.dumps([{"skills": ["sample-skill"], "query": "q", "files": ["nope.pdf"],
                                         "expected_behavior": ["x"]}]),
            "bad json": "[",
        }
        for label, content in cases.items():
            errors = self.run_skill(GOOD, extra={"evals/evals.json": content})
            self.assertTrue(any("evals.json" in e for e in errors), label)

    def test_bad_triggers_are_reported(self):
        errors = self.run_skill(GOOD, extra={"evals/triggers.json": json.dumps({"should_trigger": []})})
        self.assertTrue(any("triggers.json" in e for e in errors))

    def test_long_reference_needs_contents(self):
        long_text = "# Ref\n\n" + "line\n" * 101
        errors = self.run_skill(GOOD, extra={"references/long.md": long_text})
        self.assertTrue(any("Contents" in e for e in errors))
        ok = "# Ref\n\n## Contents\n\n- a\n\n" + "line\n" * 101
        self.assertEqual(self.run_skill(GOOD, extra={"references/long.md": ok}), [])

    def test_long_nested_reference_needs_contents(self):
        long_text = "# Role\n\n" + "line\n" * 101
        errors = self.run_skill(GOOD, extra={"references/roles/long.md": long_text})
        self.assertTrue(any("Contents" in e and "roles/long.md" in e for e in errors))

    def test_script_files_are_scanned(self):
        for name in ("scripts/tool.js", "scripts/tool.mjs", "scripts/tool.cjs", "scripts/tool.ts"):
            errors = self.run_skill(GOOD, extra={name: "// mail jane.doe@corp.com\n"})
            self.assertTrue(any("email address" in e and name in e for e in errors), name)


class RepositoryTests(unittest.TestCase):
    def test_this_repository_is_valid(self):
        errors: list[str] = []
        for skill_dir in sorted((v.ROOT / "skills").iterdir()):
            if skill_dir.is_dir():
                v.validate_skill(skill_dir, errors)
        v.validate_manifests(errors)
        v.validate_readme(errors)
        self.assertEqual(errors, [])


class ReadmeTests(unittest.TestCase):
    def check(self, readme_text, files=()):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            if readme_text is not None:
                (root / "README.md").write_text(readme_text, encoding="utf-8")
            for name in files:
                (root / name).parent.mkdir(parents=True, exist_ok=True)
                (root / name).write_text("x", encoding="utf-8")
            old_root, v.ROOT = v.ROOT, root
            try:
                errors: list[str] = []
                v.validate_readme(errors)
                return errors
            finally:
                v.ROOT = old_root

    def test_missing_readme(self):
        self.assertTrue(any("not found" in e for e in self.check(None)))

    def test_broken_image_and_link_are_reported(self):
        errors = self.check('<img src="docs/assets/banner.svg"> and [guide](docs/guide.md)')
        self.assertEqual(len(errors), 2)

    def test_picture_srcset_is_checked(self):
        errors = self.check('<picture><source srcset="docs/assets/dark.svg"><img src="docs/assets/light.svg"></picture>',
                            ["docs/assets/light.svg"])
        self.assertEqual(len(errors), 1)
        self.assertIn("dark.svg", errors[0])

    def test_existing_targets_external_and_anchors_pass(self):
        text = '<img src="docs/assets/banner.svg"> [guide](docs/guide.md#top) [web](https://example.com) [here](#skills)'
        self.assertEqual(self.check(text, ["docs/assets/banner.svg", "docs/guide.md"]), [])


if __name__ == "__main__":
    unittest.main()
