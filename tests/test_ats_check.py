import contextlib
import io
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "skills" / "job-application-assistant" / "scripts"))
import ats_check as a  # noqa: E402

W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
CONTACT = "Alex Doe | City, Country | +1 555 010 0000 | alex@example.com"
HEADINGS = ["Summary", "Skills", "Experience", "Education"]


def para(text, font=None, style=None):
    ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    rpr = f'<w:rPr><w:rFonts w:ascii="{font}"/></w:rPr>' if font else ""
    return f"<w:p>{ppr}<w:r>{rpr}<w:t>{text}</w:t></w:r></w:p>"


def body(paragraphs, extra="", sect=""):
    return f'<?xml version="1.0"?><w:document {W}><w:body>{"".join(paragraphs)}{extra}{sect}</w:body></w:document>'


def clean_paragraphs():
    items = [para(CONTACT, font="Calibri")]
    for heading in HEADINGS:
        items.append(para(heading, style="Heading1"))
        items.append(para("Built things with Python and AWS. Jan 2020 – Mar 2023", font="Calibri"))
    return items


def write_docx(folder, name="cv.docx", document=None, header=None, footer=None, media=False):
    path = Path(folder) / name
    with zipfile.ZipFile(path, "w") as z:
        z.writestr("[Content_Types].xml", "<Types/>")
        z.writestr("word/document.xml", document if document is not None else body(clean_paragraphs()))
        if header is not None:
            z.writestr("word/header1.xml", f"<w:hdr {W}>{header}</w:hdr>")
        if footer is not None:
            z.writestr("word/footer1.xml", f"<w:ftr {W}>{footer}</w:ftr>")
        if media:
            z.writestr("word/media/image1.png", b"\x89PNG")
    return path


class CheckDocxTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)

    def check(self, **kwargs):
        return a.check_docx(write_docx(self.tmp.name, **kwargs))

    def test_clean_cv_has_no_errors_or_warnings(self):
        result = self.check()
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["warnings"], [])
        self.assertIn("Python", result["text"])

    def test_no_text_is_an_error(self):
        result = self.check(document=body([]))
        self.assertTrue(any("no text" in e for e in result["errors"]))

    def test_contact_only_in_header_is_an_error(self):
        result = self.check(document=body(clean_paragraphs()[1:]), header=para(CONTACT))
        self.assertTrue(any("header or footer" in e for e in result["errors"]))

    def test_contact_in_body_and_footer_is_only_a_warning(self):
        result = self.check(footer=para("alex@example.com"))
        self.assertEqual(result["errors"], [])
        self.assertTrue(any("header or footer" in w for w in result["warnings"]))

    def test_table_text_box_and_image_warn(self):
        extra = ("<w:tbl><w:tr><w:tc>" + para("cell") + "</w:tc></w:tr></w:tbl>"
                 "<w:txbxContent>" + para("box") + "</w:txbxContent>")
        result = self.check(document=body(clean_paragraphs(), extra=extra), media=True)
        joined = " ".join(result["warnings"])
        self.assertIn("table", joined)
        self.assertIn("text box", joined)
        self.assertIn("image", joined)

    def test_two_columns_warn(self):
        sect = '<w:sectPr><w:cols w:num="2"/></w:sectPr>'
        result = self.check(document=body(clean_paragraphs(), sect=sect))
        self.assertTrue(any("column" in w for w in result["warnings"]))

    def test_unusual_font_warns(self):
        result = self.check(document=body(clean_paragraphs() + [para("Fancy", font="Papyrus")]))
        self.assertTrue(any("Papyrus" in w for w in result["warnings"]))

    def test_missing_standard_headings_warn(self):
        result = self.check(document=body([para(CONTACT), para("My Journey", style="Heading1"), para("Did work.")]))
        self.assertTrue(any("heading" in w.lower() for w in result["warnings"]))

    def test_mixed_date_styles_warn(self):
        result = self.check(document=body(clean_paragraphs() + [para("Role two 03/2019 - 12/2019")]))
        self.assertTrue(any("date" in w for w in result["warnings"]))

    def test_not_a_docx_is_an_error(self):
        path = Path(self.tmp.name) / "cv.docx"
        path.write_text("not a zip", encoding="utf-8")
        self.assertTrue(a.check_docx(path)["errors"])

    def test_eval_fixture_still_shows_its_problems(self):
        # evals/evals.json expects these findings; if the checker changes, update the eval too.
        fixture = (Path(__file__).resolve().parent.parent / "skills" / "job-application-assistant"
                   / "evals" / "files" / "cv-with-ats-problems.docx")
        result = a.check_docx(fixture)
        self.assertTrue(any("header or footer" in e for e in result["errors"]))
        for expected in ("table", "Papyrus", "About Me", "date"):
            self.assertTrue(any(expected in w for w in result["warnings"]), expected)


class KeywordTests(unittest.TestCase):
    def test_load_terms_supports_aliases_and_comments(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "terms.txt"
            path.write_text("# from the ad\nAWS|Amazon Web Services\n\nC#\n", encoding="utf-8")
            self.assertEqual(a.load_terms(path), [["AWS", "Amazon Web Services"], ["C#"]])

    def test_coverage_matches_aliases_whole_words_and_symbols(self):
        text = "Built services on Amazon Web Services with C# and .NET."
        terms = [["AWS", "Amazon Web Services"], ["C#"], [".NET"], ["Java"], ["Go"]]
        result = a.keyword_coverage(text, terms)
        self.assertEqual(result["found"], ["AWS", "C#", ".NET"])
        self.assertEqual(result["missing"], ["Java", "Go"])
        self.assertAlmostEqual(result["coverage"], 0.6)

    def test_java_does_not_match_javascript(self):
        self.assertEqual(a.keyword_coverage("JavaScript", [["Java"]])["missing"], ["Java"])

    def test_empty_terms(self):
        self.assertEqual(a.keyword_coverage("text", [])["coverage"], 1.0)


class MainTests(unittest.TestCase):
    def run_main(self, argv):
        out = io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(io.StringIO()):
            code = a.main(argv)
        return code, out.getvalue()

    def test_json_output_and_exit_codes(self):
        with tempfile.TemporaryDirectory() as tmp:
            cv = write_docx(tmp)
            terms = Path(tmp) / "terms.txt"
            terms.write_text("Python\nKubernetes\n", encoding="utf-8")
            code, out = self.run_main([str(cv), "--terms", str(terms), "--json"])
            self.assertEqual(code, 0)
            data = json.loads(out)
            self.assertEqual(data["keywords"]["missing"], ["Kubernetes"])
            self.assertNotIn("text", data)

            bad = write_docx(tmp, name="bad.docx", document=body([]))
            code, _ = self.run_main([str(bad)])
            self.assertEqual(code, 1)

    def test_text_output_lists_problems(self):
        with tempfile.TemporaryDirectory() as tmp:
            cv = write_docx(tmp, document=body(clean_paragraphs() + [para("x", font="Papyrus")]))
            code, out = self.run_main([str(cv)])
            self.assertEqual(code, 0)
            self.assertIn("Papyrus", out)

    def test_missing_file_exits_2(self):
        code, _ = self.run_main(["/no/such/cv.docx"])
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
