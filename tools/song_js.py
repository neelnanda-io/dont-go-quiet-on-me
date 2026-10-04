"""Bundle a song's timing (beats.json + lyrics.json) into video/kit/src/data/song.js for the animation kit.

Usage:
  python tools/song_js.py --beats audio/ref/beats.json --lyrics audio/ref/lyrics.json \
      --audio ../../audio/ref/pdoom.mp3 --out video/kit/src/data/song.js [--fix audio/<song>/timing_fixes.json]

Why a .js file and not fetch(): the studio page is opened from file://, where Chrome blocks fetch() unless it was
launched with --allow-file-access-from-files (the renderer is, a normal browser isn't). A <script> that sets a
global works everywhere and makes every frame a pure function of (t, SONG).

What it adds on top of the raw alignment:
  * display-word timings. On-screen text (display) and sung text differ ("P(doom)" vs "P doom", "34M" vs
    "thirty-four million"), so display words are aligned to sung words with difflib on normalised tokens, and
    display words with no match are interpolated between their matched neighbours (split evenly across the gap).
  * optional hand fixes (--fix): {"<line index>": {"t0": .., "t1": .., "words": {"<sung word index>": [t0, t1]}}}
    for the 50-150 ms nudges forced alignment sometimes needs. Applied before display mapping.
  * a sections list (consecutive lines with the same section tag) with start/end times.
"""
import argparse
import difflib
import json
import re
from pathlib import Path


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower().replace("’", "'"))


def display_tokens(text):
    # keep punctuation attached to words (it is drawn), split on whitespace and em dashes surrounded by spaces
    return [w for w in re.split(r"\s+", text.strip()) if w]


def map_display(disp, sung):
    """Give each display token a (t0, t1) from the sung word timings. sung = [{w, t0, t1}]."""
    if not sung:
        return [{"w": d, "t0": None, "t1": None} for d in disp]
    dn = [norm(d) for d in disp]
    sn = [norm(s["w"]) for s in sung]
    out = [None] * len(disp)
    sm = difflib.SequenceMatcher(a=dn, b=sn, autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            if dn[a + k]:
                out[a + k] = (sung[b + k]["t0"], sung[b + k]["t1"])
    # a display token that concatenates several sung words ("P(doom)" = "P" + "doom") or vice versa: try joins
    for i, d in enumerate(dn):
        if out[i] is not None or not d:
            continue
        for j in range(len(sn)):
            acc = ""
            for k in range(j, min(len(sn), j + 4)):
                acc += sn[k]
                if acc == d:
                    out[i] = (sung[j]["t0"], sung[k]["t1"])
                    break
                if not d.startswith(acc):
                    break
            if out[i] is not None:
                break
    # interpolate the rest: runs of unmatched tokens share the gap between matched neighbours
    first_t, last_t = sung[0]["t0"], sung[-1]["t1"]
    i = 0
    while i < len(out):
        if out[i] is not None:
            i += 1
            continue
        j = i
        while j < len(out) and out[j] is None:
            j += 1
        lo = out[i - 1][1] if i > 0 else first_t
        hi = out[j][0] if j < len(out) else last_t
        if hi < lo:
            hi = lo
        n = j - i
        for k in range(n):
            out[i + k] = (lo + (hi - lo) * k / n, lo + (hi - lo) * (k + 1) / n)
        i = j
    return [{"w": d, "t0": round(a, 3), "t1": round(b, 3)} for d, (a, b) in zip(disp, out)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--beats", required=True)
    ap.add_argument("--lyrics", required=True)
    ap.add_argument("--audio", default="", help="path to the song, relative to video/kit (muxed by render.mjs)")
    ap.add_argument("--fix", default=None)
    ap.add_argument("--out", default="video/kit/src/data/song.js")
    a = ap.parse_args()
    beats = json.loads(Path(a.beats).read_text())
    lyr = json.loads(Path(a.lyrics).read_text())
    fixes = json.loads(Path(a.fix).read_text()) if a.fix else {}
    lines = []
    for ln in lyr["lines"]:
        words = [dict(w) for w in ln["words"]]
        fx = fixes.get(str(ln["i"]), {})
        for k, (t0, t1) in fx.get("words", {}).items():
            words[int(k)]["t0"], words[int(k)]["t1"] = t0, t1
        t0 = fx.get("t0", words[0]["t0"] if words else ln["t0"])
        t1 = fx.get("t1", words[-1]["t1"] if words else ln["t1"])
        lines.append({
            "i": ln["i"], "section": ln["section"], "display": ln["display"], "t0": t0, "t1": t1,
            "sung": [{"w": w["w"], "t0": w["t0"], "t1": w["t1"]} for w in words],
            "words": map_display(display_tokens(ln["display"]), words),
            "refs": ln.get("refs", ""),
        })
    sections = []
    for ln in lines:
        if ln["t0"] is None:
            continue
        if sections and sections[-1]["name"] == ln["section"]:
            sections[-1]["t1"], sections[-1]["lines"] = ln["t1"], sections[-1]["lines"] + [ln["i"]]
        else:
            sections.append({"name": ln["section"], "t0": ln["t0"], "t1": ln["t1"], "lines": [ln["i"]]})
    song = {
        "audio": a.audio, "duration": beats["duration"], "bpm": beats["bpm"], "beat": beats["beat_period"],
        "bar": beats["bar_period"], "first_downbeat": beats["first_downbeat"], "beats": beats["beats"],
        "downbeats": beats["downbeats"], "rms10": beats["rms_10hz"], "lines": lines, "sections": sections,
    }
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text("// generated by tools/song_js.py: do not edit by hand (re-run it instead)\n"
                           "const SONG = " + json.dumps(song, separators=(",", ":")) + ";\n")
    n_interp = sum(1 for ln in lines for w in ln["words"] if norm(w["w"]) and not any(norm(w["w"]) == norm(s["w"]) for s in ln["sung"]))
    print(f"wrote {a.out}: {len(lines)} lines, {len(sections)} sections, {beats['bpm']} bpm, "
          f"{n_interp} display words timed by join/interpolation")


if __name__ == "__main__":
    main()
