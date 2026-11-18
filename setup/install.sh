#!/usr/bin/env bash
# agent-skills installer for Claude Code.
# Safe to re-run: unchanged files are skipped, changed ones are backed up first,
# and everything it adds is recorded so setup/uninstall.sh can reverse it.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETUP_DIR="$REPO_DIR/setup"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
MARKET="teransarathchandra"
MANIFEST="$CLAUDE_DIR/.agent-skills-install.json"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$CLAUDE_DIR/backups/agent-skills-$STAMP"

PROFILE="recommended"; DRY=0; PLUGINS=1; TOOLS=0; CHECK=0; YES=0; SOURCE="teransarathchandra/agent-skills"

usage() {
  cat <<'EOF'
Usage: setup/install.sh [options]

  --profile minimal|recommended|full   what to install (default: recommended)
      minimal      core files (kickoff, agents, hooks, routing rules, safe settings) + the flowbar and workbench mods
      recommended  minimal + freelance-kit, builder-kit + superpowers, frontend-design, playwright, typescript-lsp
      full         recommended + plugin-dev, mcp-server-dev, agent-sdk-dev, cc-safety-net + tools (as --with-tools)
  --with-tools        also install CLI tools: Ghostty, pnpm, gh, chezmoi (macOS/Homebrew) and the ccstatusline status line
  --no-plugins        skip everything that needs the `claude` CLI (marketplace and plugins)
  --source <src>      marketplace source: owner/repo (default teransarathchandra/agent-skills) or a local path, e.g. "$(pwd)"
  --dry-run           print what would change and change nothing
  --check             report what is installed and exit
  --yes               do not ask for confirmation
  -h, --help          show this help
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="${2:-}"; shift 2 ;;
    --with-tools) TOOLS=1; shift ;;
    --no-plugins) PLUGINS=0; shift ;;
    --source) SOURCE="${2:-}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --check) CHECK=1; shift ;;
    --yes|-y) YES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done
case "$PROFILE" in minimal|recommended|full) ;; *) echo "Unknown profile: $PROFILE" >&2; exit 2 ;; esac
[ "$PROFILE" = full ] && TOOLS=1

command -v python3 >/dev/null || { echo "python3 is required (macOS: xcode-select --install)." >&2; exit 1; }
HAVE_CLAUDE=0; command -v claude >/dev/null && HAVE_CLAUDE=1

OWN_PLUGINS=(flowbar workbench)
OFFICIAL_PLUGINS=()
if [ "$PROFILE" != minimal ]; then
  OWN_PLUGINS+=(freelance-kit builder-kit)
  OFFICIAL_PLUGINS+=(superpowers frontend-design playwright typescript-lsp)
fi
[ "$PROFILE" = full ] && OFFICIAL_PLUGINS+=(plugin-dev mcp-server-dev agent-sdk-dev)

CORE_FILES=(
  "claude/agents/Explore.md:agents/Explore.md"
  "claude/agents/ac-reviewer.md:agents/ac-reviewer.md"
  "claude/agents/browser-qa.md:agents/browser-qa.md"
  "claude/skills/kickoff/SKILL.md:skills/kickoff/SKILL.md"
  "claude/skills/commit-push-pr/SKILL.md:skills/commit-push-pr/SKILL.md"
  "claude/hooks/ts-gate.sh:hooks/ts-gate.sh"
)

say() { printf '%s\n' "$*"; }
sha() { shasum -a 256 "$1" 2>/dev/null | cut -d' ' -f1; }

# ---------- --check ----------
if [ "$CHECK" = 1 ]; then
  missing=0
  for pair in "${CORE_FILES[@]}"; do
    dest="$CLAUDE_DIR/${pair#*:}"
    if [ -f "$dest" ]; then say "ok       $dest"; else say "missing  $dest"; missing=1; fi
  done
  grep -q '<!-- agent-skills:start -->' "$CLAUDE_DIR/CLAUDE.md" 2>/dev/null && say "ok       routing rules in CLAUDE.md" || { say "missing  routing rules in CLAUDE.md"; missing=1; }
  if [ "$HAVE_CLAUDE" = 1 ]; then
    list="$(claude plugin list 2>/dev/null || true)"
    for p in "${OWN_PLUGINS[@]}"; do
      printf '%s\n' "$list" | grep -qE "(^|[^A-Za-z0-9-])$p@$MARKET([^A-Za-z0-9-]|$)" && say "ok       plugin $p@$MARKET" || say "missing  plugin $p@$MARKET"
    done
  else
    say "skipped  plugins (claude CLI not found)"
  fi
  exit "$missing"
fi

# ---------- plan ----------
say "agent-skills installer"
say "  profile:      $PROFILE$( [ "$TOOLS" = 1 ] && echo ' + tools')"
say "  claude dir:   $CLAUDE_DIR"
say "  marketplace:  $MARKET from $SOURCE$( [ "$PLUGINS" = 0 ] && echo ' (skipped: --no-plugins)')"
[ "$PLUGINS" = 1 ] && [ "$HAVE_CLAUDE" = 0 ] && say "  note:         claude CLI not found; plugins will be skipped. Install Claude Code, then re-run."
say "  own plugins:  ${OWN_PLUGINS[*]}"
[ ${#OFFICIAL_PLUGINS[@]} -gt 0 ] && say "  official:     ${OFFICIAL_PLUGINS[*]}"
say "  core files:   kickoff, commit-push-pr, Explore/ac-reviewer/browser-qa agents, ts-gate.sh hook"
say "  settings:     routing rules block in CLAUDE.md; env CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0 and CLAUDE_CODE_SUBAGENT_MODEL=sonnet (only if unset); .claude/worktrees/ in the global gitignore"
[ "$TOOLS" = 1 ] && say "  tools:        Ghostty, pnpm, gh, chezmoi (Homebrew), ccstatusline status line (only if none is set)$( [ "$PROFILE" = full ] && echo ', cc-safety-net')"
say ""

if [ "$DRY" = 1 ]; then say "Dry run: nothing will change."; fi
if [ "$DRY" = 0 ] && [ "$YES" = 0 ]; then
  if [ -t 0 ]; then
    printf 'Proceed? [y/N] '; read -r answer
    case "$answer" in y|Y|yes) ;; *) say "Cancelled."; exit 0 ;; esac
  else
    say "Not running interactively: re-run with --yes to apply." >&2; exit 3
  fi
fi

RECORD_FILES=()
RECORD_PLUGINS=()

backup() { # file
  [ -e "$1" ] || return 0
  local rel="${1#"$CLAUDE_DIR"/}"
  [ "$rel" = "$1" ] && rel="external/$(basename "$1")"
  mkdir -p "$BACKUP/$(dirname "$rel")"; cp -p "$1" "$BACKUP/$rel"
}

# ---------- core files ----------
say "Core files"
for pair in "${CORE_FILES[@]}"; do
  src="$SETUP_DIR/${pair%%:*}"; dest="$CLAUDE_DIR/${pair#*:}"
  if [ -f "$dest" ] && [ "$(sha "$src")" = "$(sha "$dest")" ]; then
    say "  unchanged  $dest"
  elif [ "$DRY" = 1 ]; then
    [ -f "$dest" ] && say "  would update (backup first)  $dest" || say "  would add  $dest"
  else
    if [ -f "$dest" ]; then backup "$dest"; say "  updated    $dest (backup in $BACKUP)"; else say "  added      $dest"; fi
    mkdir -p "$(dirname "$dest")"; cp "$src" "$dest"
    case "$dest" in *.sh) chmod +x "$dest" ;; esac
  fi
  RECORD_FILES+=("$dest")
done

# ---------- CLAUDE.md routing block ----------
say "Routing rules"
if [ "$DRY" = 1 ]; then
  grep -q '<!-- agent-skills:start -->' "$CLAUDE_DIR/CLAUDE.md" 2>/dev/null && say "  would refresh the block in $CLAUDE_DIR/CLAUDE.md" || say "  would append a block to $CLAUDE_DIR/CLAUDE.md"
else
  mkdir -p "$CLAUDE_DIR"; [ -f "$CLAUDE_DIR/CLAUDE.md" ] && backup "$CLAUDE_DIR/CLAUDE.md"
  RULES="$SETUP_DIR/claude/routing-rules.md" TARGET="$CLAUDE_DIR/CLAUDE.md" python3 - <<'PY'
import os, re
target, rules = os.environ["TARGET"], open(os.environ["RULES"]).read().strip()
text = open(target).read() if os.path.exists(target) else ""
block = f"<!-- agent-skills:start -->\n{rules}\n<!-- agent-skills:end -->"
pattern = re.compile(r"<!-- agent-skills:start -->.*?<!-- agent-skills:end -->", re.S)
new = pattern.sub(block, text) if pattern.search(text) else (text.rstrip("\n") + ("\n\n" if text.strip() else "") + block + "\n")
open(target, "w").write(new)
PY
  say "  routing rules block written to $CLAUDE_DIR/CLAUDE.md"
fi

# ---------- settings.json ----------
say "Settings"
SETTINGS="$CLAUDE_DIR/settings.json"
if [ "$DRY" = 0 ]; then mkdir -p "$CLAUDE_DIR"; [ -f "$SETTINGS" ] && backup "$SETTINGS"; fi
SETTINGS_ADDED="$(SETTINGS="$SETTINGS" DRY="$DRY" TOOLS="$TOOLS" python3 - <<'PY'
import json, os
path, dry, tools = os.environ["SETTINGS"], os.environ["DRY"] == "1", os.environ["TOOLS"] == "1"
data = json.load(open(path)) if os.path.exists(path) else {}
env = data.setdefault("env", {})
added = {"env": [], "statusLine": False}
for key, value in (("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS", "0"), ("CLAUDE_CODE_SUBAGENT_MODEL", "sonnet")):
    if key not in env:
        env[key] = value; added["env"].append(key)
    elif key == "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS" and env[key] != "0":
        print(f"WARN agent teams are on ({key}={env[key]}); they can multiply token use. Set it to \"0\" unless you need teams.", flush=True)
if tools and "statusLine" not in data:
    data["statusLine"] = {"type": "command", "command": "npx -y ccstatusline@latest", "padding": 0}
    added["statusLine"] = True
if not dry:
    tmp = path + ".tmp"; json.dump(data, open(tmp, "w"), indent=2); os.replace(tmp, path)
print("ADDED " + json.dumps(added))
PY
)"
printf '%s\n' "$SETTINGS_ADDED" | grep '^WARN' | sed 's/^WARN /  warning: /' || true
ADDED_JSON="$(printf '%s\n' "$SETTINGS_ADDED" | grep '^ADDED ' | sed 's/^ADDED //')"
say "  $( [ "$DRY" = 1 ] && echo would set || echo set ): $ADDED_JSON"

# ---------- global gitignore ----------
say "Git"
EXCLUDES="$(git config --global core.excludesfile 2>/dev/null || true)"; EXCLUDES="${EXCLUDES/#\~/$HOME}"
[ -z "$EXCLUDES" ] && EXCLUDES="$HOME/.config/git/ignore"
GITLINE_ADDED=0
if grep -qxF '.claude/worktrees/' "$EXCLUDES" 2>/dev/null; then
  say "  unchanged  .claude/worktrees/ already ignored in $EXCLUDES"
elif [ "$DRY" = 1 ]; then
  say "  would add  .claude/worktrees/ to $EXCLUDES"
else
  mkdir -p "$(dirname "$EXCLUDES")"; printf '.claude/worktrees/\n' >> "$EXCLUDES"; GITLINE_ADDED=1
  say "  added      .claude/worktrees/ to $EXCLUDES"
fi

# ---------- plugins ----------
if [ "$PLUGINS" = 1 ] && [ "$HAVE_CLAUDE" = 1 ]; then
  say "Plugins"
  if [ "$DRY" = 1 ]; then
    say "  would add or update marketplace $MARKET ($SOURCE)"
    for p in "${OWN_PLUGINS[@]}"; do say "  would install $p@$MARKET"; done
    for p in ${OFFICIAL_PLUGINS[@]+"${OFFICIAL_PLUGINS[@]}"}; do say "  would install $p@claude-plugins-official"; done
  else
    if KNOWN="$CLAUDE_DIR/plugins/known_marketplaces.json" NAME="$MARKET" python3 -c 'import json,os,sys; p=os.environ["KNOWN"]; sys.exit(0 if os.path.exists(p) and os.environ["NAME"] in json.load(open(p)) else 1)'; then
      claude plugin marketplace update "$MARKET" >/dev/null 2>&1 && say "  updated marketplace $MARKET" || say "  warning: could not update marketplace $MARKET"
    else
      claude plugin marketplace add "$SOURCE" >/dev/null 2>&1 && say "  added marketplace $MARKET" || { say "  error: could not add marketplace from $SOURCE" >&2; exit 1; }
    fi
    for p in "${OWN_PLUGINS[@]}"; do
      if claude plugin install "$p@$MARKET" --scope user >/dev/null 2>&1; then say "  installed  $p@$MARKET"; RECORD_PLUGINS+=("$p@$MARKET"); else say "  warning: could not install $p@$MARKET"; fi
    done
    for p in ${OFFICIAL_PLUGINS[@]+"${OFFICIAL_PLUGINS[@]}"}; do
      if claude plugin install "$p@claude-plugins-official" --scope user >/dev/null 2>&1; then say "  installed  $p@claude-plugins-official"; RECORD_PLUGINS+=("$p@claude-plugins-official"); else say "  warning: could not install $p@claude-plugins-official"; fi
    done
  fi
fi

# ---------- tools ----------
if [ "$TOOLS" = 1 ]; then
  say "Tools"
  if [ "$(uname)" = Darwin ] && command -v brew >/dev/null; then
    for f in pnpm gh chezmoi; do
      if command -v "$f" >/dev/null; then say "  present    $f"; elif [ "$DRY" = 1 ]; then say "  would install $f (brew)"; else brew install "$f" >/dev/null && say "  installed  $f"; fi
    done
    if [ -d /Applications/Ghostty.app ]; then say "  present    Ghostty"; elif [ "$DRY" = 1 ]; then say "  would install Ghostty (brew cask)"; else brew install --cask ghostty >/dev/null && say "  installed  Ghostty"; fi
  else
    say "  skipped: Homebrew tools need macOS with Homebrew; install Ghostty, pnpm, gh and chezmoi your usual way."
  fi
  if [ "$PROFILE" = full ] && [ "$HAVE_CLAUDE" = 1 ] && command -v npx >/dev/null; then
    if [ "$DRY" = 1 ]; then say "  would install cc-safety-net (destructive-command guard) for Claude Code"
    else npx -y cc-safety-net@latest install --claude-code >/dev/null 2>&1 && say "  installed  cc-safety-net" || say "  warning: cc-safety-net install failed; see https://github.com/kenryu42/cc-safety-net"; fi
  fi
fi

# ---------- manifest ----------
if [ "$DRY" = 0 ]; then
  MANIFEST="$MANIFEST" PROFILE="$PROFILE" ADDED_JSON="$ADDED_JSON" GITLINE="$( [ "$GITLINE_ADDED" = 1 ] && echo "$EXCLUDES" )" \
  FILES="$(printf '%s\n' "${RECORD_FILES[@]}")" PLUGINS_LIST="$(printf '%s\n' ${RECORD_PLUGINS[@]+"${RECORD_PLUGINS[@]}"})" MARKET="$MARKET" python3 - <<'PY'
import hashlib, json, os, time
path = os.environ["MANIFEST"]
old = json.load(open(path)) if os.path.exists(path) else {}
added = json.loads(os.environ["ADDED_JSON"] or "{}")
files = {f["path"]: f for f in old.get("files", [])}
for p in filter(None, os.environ["FILES"].split("\n")):
    files[p] = {"path": p, "sha256": hashlib.sha256(open(p, "rb").read()).hexdigest()}
manifest = {
    "installedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
    "profile": os.environ["PROFILE"],
    "marketplace": os.environ["MARKET"],
    "files": sorted(files.values(), key=lambda f: f["path"]),
    "claudeMdBlock": True,
    "settingsEnvAdded": sorted(set(old.get("settingsEnvAdded", [])) | set(added.get("env", []))),
    "statusLineAdded": bool(old.get("statusLineAdded")) or bool(added.get("statusLine")),
    "gitIgnoreFile": os.environ["GITLINE"] or old.get("gitIgnoreFile"),
    "plugins": sorted(set(old.get("plugins", [])) | set(filter(None, os.environ["PLUGINS_LIST"].split("\n")))),
}
json.dump(manifest, open(path, "w"), indent=2)
PY
fi

say ""
if [ "$DRY" = 1 ]; then
  say "Dry run finished. Re-run without --dry-run (add --yes when not interactive) to apply."
else
  say "Done. Restart Claude Code so new plugins, agents and skills load."
  say "Start a project:  cd ~/Development/Projects && claude   then   /kickoff <your idea>"
  say "Check later:      setup/install.sh --check      Undo:  setup/uninstall.sh"
fi
