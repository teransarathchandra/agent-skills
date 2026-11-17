import contextlib
import importlib.util
import io
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent.parent / "skills" / "sanitize-skill-for-public" / "scripts" / "scan_terms.py"
spec = importlib.util.spec_from_file_location("scan_terms", SCRIPT)
scan = importlib.util.module_from_spec(spec)
sys.modules["scan_terms"] = scan
spec.loader.exec_module(scan)


def run(argv, stdin=None):
    out, err = io.StringIO(), io.StringIO()
    old_stdin = sys.stdin
    if stdin is not None:
        sys.stdin = io.StringIO(stdin)
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = scan.main(argv)
    finally:
        sys.stdin = old_stdin
    return code, out.getvalue(), err.getvalue()


class ScanTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        base = Path(self.tmp.name)
        self.work = base / "work"
        self.work.mkdir()
        self.terms = base / "terms.txt"
        self.terms.write_text("# private words\nDana Whitfield\nNorthwind\nre:acct-\\d+\n\n", encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, name, text):
        (self.work / name).write_text(text, encoding="utf-8")

    def scan(self, *extra):
        return run(["--terms", str(self.terms), str(self.work), *extra])

    def test_clean_folder_passes(self):
        self.write("a.md", "Nothing private here, just ABC-123 and a@example.com.\n")
        code, out, _ = self.scan()
        self.assertEqual(code, 0, out)

    def test_term_is_blocked_case_insensitive_with_possessive(self):
        self.write("a.md", "We asked dana whitfield's team.\n")
        code, out, _ = self.scan()
        self.assertEqual(code, 1)
        self.assertIn("a.md:1", out)

    def test_multi_word_term_allows_extra_spaces(self):
        self.write("a.md", "Dana    Whitfield joined.\n")
        self.assertEqual(self.scan()[0], 1)

    def test_whole_word_only(self):
        self.write("a.md", "Northwinds and Northwindow are different words.\n")
        self.assertEqual(self.scan()[0], 0)

    def test_regex_term(self):
        self.write("a.md", "see acct-90210 for details\n")
        self.assertEqual(self.scan()[0], 1)

    def test_file_name_is_scanned(self):
        self.write("northwind-notes.md", "harmless\n")
        code, out, _ = self.scan()
        self.assertEqual(code, 1)
        self.assertIn("file name", out)

    def test_review_hits_do_not_fail_unless_strict(self):
        self.write("a.md", "Contact jane@corp.com about PAY-418 on 2026-03-02.\n")
        code, out, _ = self.scan()
        self.assertEqual(code, 0)
        for label in ("email", "ticket-key", "date"):
            self.assertIn(label, out)
        self.assertEqual(self.scan("--strict")[0], 1)

    def test_other_patterns_are_reported(self):
        self.write("a.md", "id 8d85a9c0-e4c8-103e-b322-e0a5ffccee1c at 10.0.0.12 in /Users/sam/code "
                           "see https://acme.atlassian.net/browse/X key ghp_" + "a" * 24 + "\n")
        _, out, _ = self.scan()
        for label in ("uuid", "ip-address", "home-path", "internal-url", "secret"):
            self.assertIn(label, out)

    def test_fictional_values_are_ignored(self):
        self.write("a.md", "ABC-123 XYZ-9 jane@example.com 75656120+x@users.noreply.github.com\n")
        _, out, _ = self.scan()
        self.assertIn("0 blocked, 0 to review", out)

    def test_character_class_text_is_not_a_ticket_key(self):
        self.write("a.py", "pattern = r'[A-Z0-9]+' and 'UTF-8' and 'x86-64'\n")
        _, out, _ = self.scan()
        self.assertNotIn("ticket-key", out)

    def test_real_shaped_ticket_keys_are_still_found(self):
        self.write("a.md", "see PAY-418 and AB2-7\n")
        _, out, _ = self.scan()
        self.assertEqual(out.count("ticket-key"), 2)

    def test_term_file_inside_scanned_folder_is_refused(self):
        inside = self.work / "terms.txt"
        inside.write_text("Northwind\n", encoding="utf-8")
        code, _, err = run(["--terms", str(inside), str(self.work)])
        self.assertEqual(code, 2)
        self.assertIn("outside", err)

    def test_stdin_mode_for_git_history(self):
        code, out, _ = run(["--terms", str(self.terms), "-"], stdin="commit: fix for Northwind\n")
        self.assertEqual(code, 1)
        self.assertIn("<stdin>:1", out)

    def test_binary_files_are_skipped(self):
        (self.work / "img.bin").write_bytes(b"Northwind\0\0\0")
        self.assertEqual(self.scan()[0], 0)

    def test_missing_or_empty_term_file(self):
        self.assertEqual(run(["--terms", str(self.work / "nope.txt"), str(self.work)])[0], 2)
        empty = Path(self.tmp.name) / "empty.txt"
        empty.write_text("# only a comment\n", encoding="utf-8")
        self.assertEqual(run(["--terms", str(empty), str(self.work)])[0], 2)

    def test_eval_fixture_still_has_its_private_details(self):
        # evals/evals.json expects these hits; if the scanner or fixture changes, update the eval too.
        fixture = SCRIPT.parent.parent / "evals" / "files" / "private-notes"
        code, out, _ = run(["--terms", str(self.terms), str(fixture)])
        self.assertEqual(code, 1)
        for label in ("Dana Whitfield", "Northwind", "email", "ticket-key", "internal-url", "home-path", "date"):
            self.assertIn(label, out, label)


if __name__ == "__main__":
    unittest.main()
