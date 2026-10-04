"""One source of truth per song draft → display lyrics, sung lyrics, annotations.

Source format (lyrics/finalists/<slug>/vN.lyr):

    # Title
    [Verse 1 | half-rapped, drums and bass only]
    Science zoomed in and there you were   || sung: Science zoomed in and there you were   ## refs: B1.01
    You put me in superposition            ## refs: B1.04
    (one direction!)                       ← ad-lib/backing line (kept in sung, shown small on screen)

  * `|| sung: ...`  optional respelling for the singer (S-A-E, JEM-uh, numbers as words).
                    If absent, sung = display.
  * `## refs: ...`  ledger IDs this line leans on (for annotations + the density audit).
  * `## note: ...`  free-text annotation (what the reference means / why it's accurate).

Usage:
  python tools/lyricfmt.py lyrics/finalists/one_direction/v3.lyr        # writes .display.md, .sung.txt, .notes.md
  python tools/lyricfmt.py FILE --stats                                 # syllables/line, refs per section
"""
import json
import re
import sys
from pathlib import Path

# The three optional fields may appear in any order after the display text (drafts were edited by hand and by
# script, so both "|| sung: … ## refs: …" and "## refs: … || sung: …" exist). Split on the markers wherever they are.
FIELD_RE = re.compile(r"\s*(\|\|\s*sung:|##\s*refs:|##\s*note:)\s*")


def split_line(s):
    parts = FIELD_RE.split(s)
    d = {"text": parts[0], "sung": None, "refs": None, "note": None}
    for marker, val in zip(parts[1::2], parts[2::2]):
        key = "sung" if marker.startswith("||") else "refs" if "refs" in marker else "note"
        d[key] = val.strip()
    return d


def parse(path: Path) -> dict:
    title, sections, cur = None, [], None
    for raw in path.read_text().splitlines():
        s = raw.rstrip()
        if not s.strip():
            continue
        if s.startswith("# "):
            title = s[2:].strip()
            continue
        if s.lstrip().startswith("[") and s.rstrip().endswith("]"):
            cur = {"tag": s.strip()[1:-1], "lines": []}
            sections.append(cur)
            continue
        if cur is None:
            cur = {"tag": "Intro", "lines": []}
            sections.append(cur)
        d = split_line(s.strip())
        text = d["text"].strip()
        cur["lines"].append({
            "display": text,
            "sung": (d["sung"] or text).strip(),
            "refs": [r.strip() for r in (d["refs"] or "").split(",") if r.strip()],
            "note": (d["note"] or "").strip(),
        })
    return {"title": title, "sections": sections}


def syllables(line: str) -> int:
    """Rough English syllable count (vowel groups), good enough for scansion checks."""
    words = re.findall(r"[a-zA-Z']+", line.lower())
    n = 0
    for w in words:
        w = w.replace("'", "")
        groups = re.findall(r"[aeiouy]+", w)
        c = len(groups)
        if w.endswith("e") and not w.endswith(("le", "ee")) and c > 1:
            c -= 1
        n += max(1, c)
    return n


def render(song: dict, path: Path):
    disp, sung, notes = [f"# {song['title']}", ""], [], [f"# {song['title']} — annotations", "",
                                                           "| Section | Line | References | Note |", "|---|---|---|---|"]
    for sec in song["sections"]:
        disp.append(f"[{sec['tag']}]")
        sung.append(f"[{sec['tag']}]")
        for ln in sec["lines"]:
            disp.append(ln["display"] + (f"   〔sung: {ln['sung']}〕" if ln["sung"] != ln["display"] else ""))
            sung.append(ln["sung"])
            if ln["refs"] or ln["note"]:
                notes.append(f"| {sec['tag'].split('|')[0].strip()} | {ln['display']} | {', '.join(ln['refs'])} | {ln['note']} |")
        disp.append("")
        sung.append("")
    base = path.with_suffix("")
    Path(str(base) + ".display.md").write_text("\n".join(disp))
    Path(str(base) + ".sung.txt").write_text("\n".join(sung))
    Path(str(base) + ".notes.md").write_text("\n".join(notes))
    Path(str(base) + ".json").write_text(json.dumps(song, indent=1))
    # judge view: the lyric as heard/seen, then the writer's annotations for fact-checking
    judge = ["\n".join(disp), "", "---", "",
             "## Writer's annotations (for fact-checking only; key terms appear on screen as the lyric is sung)", ""]
    for sec in song["sections"]:
        for ln in sec["lines"]:
            if ln["note"]:
                judge.append(f"- `{ln['display']}` — {ln['note']}")
    Path(str(base) + ".judge.md").write_text("\n".join(judge))


def stats(song: dict):
    for sec in song["sections"]:
        nref = sum(len(l["refs"]) for l in sec["lines"])
        print(f"[{sec['tag']}]  lines={len(sec['lines'])} refs={nref} "
              f"({nref / max(1, len(sec['lines'])):.1f}/line)")
        for l in sec["lines"]:
            print(f"   {syllables(l['sung']):2d}  {l['display']}")


if __name__ == "__main__":
    p = Path(sys.argv[1])
    song = parse(p)
    render(song, p)
    if "--stats" in sys.argv:
        stats(song)
    print("ok:", p)
