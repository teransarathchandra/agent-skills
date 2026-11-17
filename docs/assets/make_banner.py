"""Generate the README banner (light and dark) and the social preview from one token set.

Usage: python docs/assets/make_banner.py docs/assets
Then render the PNG that GitHub's social preview needs, for example with Chrome:
  chrome --headless=new --window-size=1280,640 --screenshot=docs/assets/social-preview.png docs/assets/social-preview.svg
The art names no skill on purpose, so it stays true as skills are added.
"""
import sys
from pathlib import Path

OUT = Path(sys.argv[1])

THEMES = {
    "light": dict(bg="#F2F4F1", ink="#1C232A", muted="#5E6A73", gutter="#A4AEA8",
                  panel="#FFFFFF", border="#D8DED9", key="#0E6B66"),
    "dark": dict(bg="#13171A", ink="#E4E8E6", muted="#9AA6A0", gutter="#56615C",
                 panel="#1A1F23", border="#2B3338", key="#5BC0B4"),
}
SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
TAGLINE = ["Plain-Markdown skills that teach an AI agent", "one job, and the checks that keep it honest."]
FRONTMATTER = [
    [("muted", "---")],
    [("key", "name"), ("ink", ": careful-work")],
    [("key", "description"), ("ink", ": Use when the work has to be right.")],
    [("muted", "---")],
]
DESC = ("agent-skills: plain-Markdown skills that teach an AI agent one job, and the checks that keep it honest. "
        "Beside the name, an excerpt of a SKILL.md file: name careful-work, description Use when the work has to be right.")


def panel(c, x, y, w, size, line_h):
    """A SKILL.md excerpt: file name, a rule, then numbered frontmatter lines."""
    label_h = round(size * 2.1)
    h = label_h + line_h * len(FRONTMATTER) + round(size * 1.3)
    gutter_x = x + round(size * 2.2)
    code_x = gutter_x + round(size * 1.2)
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{c["panel"]}" stroke="{c["border"]}"/>',
        f'<text x="{x + round(size * 1.4)}" y="{y + round(size * 1.4)}" font-family="{SANS}" font-size="{round(size * 0.88)}" '
        f'font-weight="600" fill="{c["muted"]}">SKILL.md</text>',
        f'<line x1="{x}" y1="{y + label_h}" x2="{x + w}" y2="{y + label_h}" stroke="{c["border"]}"/>',
    ]
    for i, line in enumerate(FRONTMATTER, 1):
        base = y + label_h + line_h * i - round(line_h * 0.22)
        parts.append(f'<text x="{gutter_x}" y="{base}" text-anchor="end" font-family="{MONO}" font-size="{size}" '
                     f'fill="{c["gutter"]}">{i}</text>')
        spans = "".join(f'<tspan fill="{c[role]}">{text}</tspan>' for role, text in line)
        parts.append(f'<text x="{code_x}" y="{base}" font-family="{MONO}" font-size="{size}" xml:space="preserve">{spans}</text>')
    return "\n  ".join(parts), h


def svg(width, height, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
            f'role="img" aria-labelledby="t d">\n  <title id="t">agent-skills</title>\n  <desc id="d">{DESC}</desc>\n  '
            f'{body}\n</svg>\n')


def banner(c):
    p, _ = panel(c, x=640, y=77, w=568, size=16, line_h=28)  # centred on the wordmark block (y 160)
    body = [
        f'<rect width="1280" height="320" rx="12" fill="{c["bg"]}"/>',
        f'<text x="72" y="150" font-family="{SANS}" font-size="68" font-weight="700" letter-spacing="-1.6" fill="{c["ink"]}">agent-skills</text>',
        f'<text x="74" y="194" font-family="{SANS}" font-size="20" fill="{c["muted"]}">{TAGLINE[0]}</text>',
        f'<text x="74" y="222" font-family="{SANS}" font-size="20" fill="{c["muted"]}">{TAGLINE[1]}</text>',
        p,
    ]
    return svg(1280, 320, "\n  ".join(body))


def social(c):
    p, _ = panel(c, x=424, y=346, w=760, size=22, line_h=38)  # lower right, opposite the wordmark
    body = [
        f'<rect width="1280" height="640" fill="{c["bg"]}"/>',
        f'<text x="92" y="196" font-family="{SANS}" font-size="104" font-weight="700" letter-spacing="-2.6" fill="{c["ink"]}">agent-skills</text>',
        f'<text x="96" y="256" font-family="{SANS}" font-size="30" fill="{c["muted"]}">{TAGLINE[0]}</text>',
        f'<text x="96" y="298" font-family="{SANS}" font-size="30" fill="{c["muted"]}">{TAGLINE[1]}</text>',
        p,
    ]
    return svg(1280, 640, "\n  ".join(body))


(OUT / "banner-light.svg").write_text(banner(THEMES["light"]))
(OUT / "banner-dark.svg").write_text(banner(THEMES["dark"]))
(OUT / "social-preview.svg").write_text(social(THEMES["light"]))
print("wrote", *sorted(p.name for p in OUT.glob("*.svg")))
