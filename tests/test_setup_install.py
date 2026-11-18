"""setup/install.sh and setup/uninstall.sh against a throwaway home directory.

Plugins are skipped (--no-plugins), so the test needs only bash and python3.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INSTALL = ROOT / "setup" / "install.sh"
UNINSTALL = ROOT / "setup" / "uninstall.sh"


@unittest.skipUnless(shutil.which("bash"), "bash is required")
class SetupInstallTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.home = Path(self._tmp.name)
        self.claude = self.home / ".claude"
        self.claude.mkdir()
        (self.claude / "CLAUDE.md").write_text("# my notes\nkeep me\n", encoding="utf-8")
        (self.claude / "settings.json").write_text(
            json.dumps({"model": "opus", "env": {"FOO": "1"}}), encoding="utf-8"
        )
        self.env = {
            "HOME": str(self.home),
            "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "GIT_CONFIG_NOSYSTEM": "1",
        }

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def run_script(self, script: Path, *args: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            ["bash", str(script), *args], env=self.env, capture_output=True, text=True, check=False
        )

    def settings(self) -> dict:
        return json.loads((self.claude / "settings.json").read_text(encoding="utf-8"))

    def test_dry_run_changes_nothing(self) -> None:
        result = self.run_script(INSTALL, "--no-plugins", "--dry-run")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.claude / "agents").exists())
        self.assertEqual(self.settings(), {"model": "opus", "env": {"FOO": "1"}})

    def test_refuses_without_yes_when_not_interactive(self) -> None:
        result = self.run_script(INSTALL, "--no-plugins")
        self.assertEqual(result.returncode, 3)

    def test_install_is_idempotent_and_keeps_user_content(self) -> None:
        for _ in range(2):
            result = self.run_script(INSTALL, "--no-plugins", "--yes")
            self.assertEqual(result.returncode, 0, result.stderr)
        claude_md = (self.claude / "CLAUDE.md").read_text(encoding="utf-8")
        self.assertIn("keep me", claude_md)
        self.assertEqual(claude_md.count("<!-- agent-skills:start -->"), 1)
        for rel in ("agents/Explore.md", "agents/ac-reviewer.md", "agents/browser-qa.md",
                    "skills/kickoff/SKILL.md", "skills/commit-push-pr/SKILL.md", "hooks/ts-gate.sh"):
            self.assertTrue((self.claude / rel).is_file(), rel)
        self.assertTrue(os.access(self.claude / "hooks" / "ts-gate.sh", os.X_OK))
        env = self.settings()["env"]
        self.assertEqual(env["FOO"], "1")
        self.assertEqual(env["CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"], "0")
        self.assertEqual(env["CLAUDE_CODE_SUBAGENT_MODEL"], "sonnet")
        ignore = (self.home / ".config" / "git" / "ignore").read_text(encoding="utf-8")
        self.assertEqual(ignore.splitlines().count(".claude/worktrees/"), 1)

    def test_existing_env_values_are_not_overwritten(self) -> None:
        (self.claude / "settings.json").write_text(
            json.dumps({"env": {"CLAUDE_CODE_SUBAGENT_MODEL": "haiku"}}), encoding="utf-8"
        )
        self.run_script(INSTALL, "--no-plugins", "--yes")
        self.assertEqual(self.settings()["env"]["CLAUDE_CODE_SUBAGENT_MODEL"], "haiku")

    def test_uninstall_restores_the_original_state(self) -> None:
        self.run_script(INSTALL, "--no-plugins", "--yes")
        (self.claude / "skills" / "kickoff" / "SKILL.md").write_text("my edit\n", encoding="utf-8")
        result = self.run_script(UNINSTALL, "--yes")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.settings(), {"model": "opus", "env": {"FOO": "1"}})
        self.assertEqual((self.claude / "CLAUDE.md").read_text(encoding="utf-8"), "# my notes\nkeep me\n")
        self.assertFalse((self.claude / "agents" / "Explore.md").exists())
        self.assertTrue((self.claude / "skills" / "kickoff" / "SKILL.md").exists(), "edited files are kept")
        self.assertFalse((self.claude / ".agent-skills-install.json").exists())


    def test_uninstall_keeps_identical_preexisting_files(self) -> None:
        agents = self.claude / "agents"
        agents.mkdir()
        shutil.copy(ROOT / "setup" / "claude" / "agents" / "Explore.md", agents / "Explore.md")
        self.run_script(INSTALL, "--no-plugins", "--yes")
        self.run_script(UNINSTALL, "--yes")
        self.assertTrue((agents / "Explore.md").exists(), "a file the user already had must survive")

    def test_uninstall_restores_replaced_files_even_after_reinstall(self) -> None:
        skill = self.claude / "skills" / "kickoff" / "SKILL.md"
        skill.parent.mkdir(parents=True)
        skill.write_text("my own kickoff\n", encoding="utf-8")
        for _ in range(2):
            self.run_script(INSTALL, "--no-plugins", "--yes")
        self.assertNotEqual(skill.read_text(encoding="utf-8"), "my own kickoff\n")
        self.run_script(UNINSTALL, "--yes")
        self.assertEqual(skill.read_text(encoding="utf-8"), "my own kickoff\n")

    def test_check_fails_when_a_core_file_is_missing(self) -> None:
        self.run_script(INSTALL, "--no-plugins", "--yes")
        (self.claude / "agents" / "ac-reviewer.md").unlink()
        result = self.run_script(INSTALL, "--no-plugins", "--check")
        self.assertEqual(result.returncode, 1)
        self.assertIn("missing", result.stdout)


if __name__ == "__main__":
    unittest.main()
