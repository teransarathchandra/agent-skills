#!/usr/bin/env bash
# Reverses setup/install.sh using the record it wrote. Files you edited after
# installing are kept, and settings are only removed when they still hold the
# value the installer set.
set -euo pipefail

CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
MANIFEST="$CLAUDE_DIR/.agent-skills-install.json"
DRY=0; YES=0; KEEP_PLUGINS=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY=1; shift ;;
    --yes|-y) YES=1; shift ;;
    --keep-plugins) KEEP_PLUGINS=1; shift ;;
    -h|--help) echo "Usage: setup/uninstall.sh [--dry-run] [--yes] [--keep-plugins]"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

[ -f "$MANIFEST" ] || { echo "Nothing to undo: $MANIFEST not found."; exit 0; }
command -v python3 >/dev/null || { echo "python3 is required." >&2; exit 1; }

if [ "$DRY" = 0 ] && [ "$YES" = 0 ]; then
  if [ -t 0 ]; then printf 'Remove what agent-skills installed? [y/N] '; read -r a; case "$a" in y|Y|yes) ;; *) echo "Cancelled."; exit 0 ;; esac
  else echo "Not running interactively: re-run with --yes." >&2; exit 3; fi
fi

PLUGINS="$(MANIFEST="$MANIFEST" CLAUDE_DIR="$CLAUDE_DIR" DRY="$DRY" python3 - <<'PY'
import hashlib, json, os, re
m = json.load(open(os.environ["MANIFEST"]))
dry = os.environ["DRY"] == "1"
claude_dir = os.environ["CLAUDE_DIR"]
verb = "would remove" if dry else "removed"

for f in m.get("files", []):
    p = f["path"]
    if not os.path.exists(p):
        continue
    if hashlib.sha256(open(p, "rb").read()).hexdigest() != f["sha256"]:
        print(f"MSG   kept (you changed it)  {p}")
        continue
    if not dry:
        os.remove(p)
        d = os.path.dirname(p)
        if os.path.isdir(d) and not os.listdir(d) and os.path.basename(os.path.dirname(d)) == "skills":
            os.rmdir(d)
    print(f"MSG   {verb}  {p}")

md = os.path.join(claude_dir, "CLAUDE.md")
if m.get("claudeMdBlock") and os.path.exists(md):
    text = open(md).read()
    new = re.sub(r"\n*<!-- agent-skills:start -->.*?<!-- agent-skills:end -->\n?", "\n", text, flags=re.S).rstrip("\n") + "\n"
    if new != text:
        if not dry:
            open(md, "w").write(new if new.strip() else "")
        print(f"MSG   {verb}  routing rules block in {md}")

settings = os.path.join(claude_dir, "settings.json")
if os.path.exists(settings):
    data = json.load(open(settings))
    expected = {"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "0", "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet"}
    env = data.get("env", {})
    changed = False
    for key in m.get("settingsEnvAdded", []):
        if env.get(key) == expected.get(key):
            env.pop(key); changed = True
            print(f"MSG   {verb}  env {key}")
    if m.get("statusLineAdded") and data.get("statusLine", {}).get("command") == "npx -y ccstatusline@latest":
        data.pop("statusLine"); changed = True
        print(f"MSG   {verb}  statusLine")
    if "env" in data and not data["env"]:
        data.pop("env")
    if changed and not dry:
        json.dump(data, open(settings, "w"), indent=2)

ignore = m.get("gitIgnoreFile")
if ignore and os.path.exists(ignore):
    lines = open(ignore).read().splitlines()
    if ".claude/worktrees/" in lines:
        if not dry:
            open(ignore, "w").write("".join(l + "\n" for l in lines if l != ".claude/worktrees/"))
        print(f"MSG   {verb}  .claude/worktrees/ from {ignore}")

for p in m.get("plugins", []):
    print(f"PLUGIN {p}")
print(f"MARKET {m.get('marketplace', '')}")
PY
)"

printf '%s\n' "$PLUGINS" | grep '^MSG ' | sed 's/^MSG //'
if [ "$KEEP_PLUGINS" = 0 ] && command -v claude >/dev/null; then
  for p in $(printf '%s\n' "$PLUGINS" | grep '^PLUGIN ' | cut -d' ' -f2); do
    if [ "$DRY" = 1 ]; then echo "  would uninstall $p"; else claude plugin uninstall "$p" >/dev/null 2>&1 && echo "  uninstalled $p" || echo "  could not uninstall $p (already gone?)"; fi
  done
  MARKET="$(printf '%s\n' "$PLUGINS" | grep '^MARKET ' | cut -d' ' -f2)"
  if [ -n "$MARKET" ]; then
    if [ "$DRY" = 1 ]; then echo "  would remove marketplace $MARKET"; else claude plugin marketplace remove "$MARKET" >/dev/null 2>&1 && echo "  removed marketplace $MARKET" || true; fi
  fi
fi
if [ "$DRY" = 0 ]; then rm -f "$MANIFEST"; echo "Done. Backups of replaced files stay in $CLAUDE_DIR/backups/."; else echo "Dry run: nothing changed."; fi
