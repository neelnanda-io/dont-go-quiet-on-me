"""Build a full-song ElevenLabs Music v2.5 composition plan (the comparison to Suno).

Usage: python tools/eleven_plan.py dgq --style broadway [--bpm 124] [--seed 41]
       then: python tools/eleven_music.py audio/eleven/<slug>/<style>.spec.json --out audio/eleven/<slug>/<style>_s<seed>

The sections are cut from the EXACT text Suno gets (suno_prep.build: same words, cut, per-style section cues, overrides
and spoken asides), so the two engines can't drift. One chunk per section; a [Spoken] aside becomes its own short chunk
(spoken-word styling) and the section resumes after it with the same cue. Section length is set in bars at the tempo:
2 bars per sung line, 1.5 for half-rapped or patter lines, half a bar for a short echo/shout like "(don't go quiet!)",
4 bars for the intro, 2 for a spoken aside, +4 when the cue asks for a dance break / instrumental; each chunk is rounded up
to whole 2-bar phrases (pop phrases come in 2s and 4s). Whole-song arc tags in a style prompt ("key change", "a big
finale") are dropped from the per-section tags: the section cues say where those happen.
Cost when rendered: ~900 credits per minute of audio (a 4:10 song is ~3,800 credits).
"""
import argparse
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from suno_prep import EXCLUDE, SOURCES, STYLES, STYLE_CUES, STYLE_SPOKEN, build as suno_build  # noqa: E402
from syllables import line_bars  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CAP_S = 137.0   # round-1 finalists only: song length that leaves room under the 2:19 MP4 cap
BASE = {  # round-1 short positive-style tags (ElevenLabs wants tags, not a paragraph); later songs derive them from STYLES
    "one_direction": {
        "kpop": ["K-pop boy group dance-pop", "bright synth brass stabs, punchy four-on-the-floor kick, snappy claps",
                 "clean male lead vocals, crisp English enunciation, dry upfront vocal", "boy group gang vocals"],
        "boyband": ["2010s British boy-band pop-rock", "strummed guitars, driving live drums, handclaps",
                    "clean male lead vocals, clear diction, dry upfront vocal", "four-part harmonies"],
    },
    "read_your_mind": {
        "kpop": ["K-pop girl group synth-pop", "glossy bright synths, punchy kick, snappy claps, deep sub bass",
                 "clear bright female lead vocals, crisp English enunciation, dry upfront vocal", "unison girl-group hooks"],
        "y2k": ["Y2K girl-group pop R&B", "crisp drum machine, shiny synth plucks, finger snaps",
                "bright female lead, clear diction, dry upfront vocal", "tight three-part harmonies"],
    },
}
# Counting tempo for styles whose Suno prompt names none. It sizes sections (2 bars per line), so ~116-124 keeps a
# ~13-syllable line at ~3.3 syllables/s; a ballad "feels" half-time at this count.
DEFAULT_BPM = {"acappella_solo": 120, "acappella_choir": 116, "orchestral_ballad": 120, "broadway": 124}
SPOKEN_STYLE = "spoken word: one voice talks this line over a held chord, not sung"
# Whole-song arc words ("key change up for the final chorus", "a big finale", "dramatic builds and drops") must not go on
# EVERY section: each section would try to be the finale and the dynamics flatten. The per-section cues place them.
ARC = re.compile(r"key change|finale|final chorus|\bbuilds?\b|dynamics|tempo and key|\bdrops?\b", re.I)
# A cue that asks for bars with no lyrics gets +4 bars. "<instrument> solo" is a break; "solo piano and voice" is not.
BREAK = re.compile(r"dance break|instrumental|\b(guitar|piano|sax|saxophone|violin|cello|strings?|drum|synth) solo\b", re.I)


def chunks_from_suno(text, base_tags, negatives, bpm):
    """Split Suno lyrics ("[Name | cue]" section tags, "[Spoken]" asides, "[Name]" re-entries, "[End]") into chunks."""
    bar_ms = 4 * 60000 / bpm
    chunks, cur, sec_name, sec_cue = [], None, None, ""

    def flush():
        if not cur or not cur["lines"]:
            return
        rapped = any(w in cur["cue"].lower() for w in ("rap", "patter"))
        if cur["spoken"]:
            bars = 2
        elif cur["name"] == "Intro":
            bars = 4
        else:
            bars = max(2, 2 * math.ceil(sum(line_bars(ln, rapped) for ln in cur["lines"]) / 2))
            bars += 4 if BREAK.search(cur["cue"]) else 0
        pos = [f"{bpm:g} BPM", *base_tags] + ([SPOKEN_STYLE] if cur["spoken"] else [cur["cue"]])
        chunks.append({"text": f"[{'Spoken' if cur['spoken'] else cur['name']}]\n" + "\n".join(cur["lines"]),
                       "duration_ms": int(round(bars * bar_ms)), "positive_styles": [p for p in pos if p],
                       "negative_styles": negatives, "context_adherence": "high", "_bars": bars})

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        m = re.fullmatch(r"\[(.+)\]", line)
        if not m:
            cur["lines"].append(line)
            continue
        name, _, cue = (s.strip() for s in m.group(1).partition("|"))
        flush()
        if name == "End":
            cur = None
            break
        if name == "Spoken":
            cur = {"name": sec_name, "cue": sec_cue, "spoken": True, "lines": []}
            continue
        if cue or name != sec_name:  # a new section; a bare "[Verse 3]" after an aside resumes the same one
            sec_name, sec_cue = name, cue
        cur = {"name": sec_name, "cue": sec_cue, "spoken": False, "lines": []}
    flush()
    return chunks


def style_tags(slug, style):
    """Positive tags: the round-1 table if present, else the Suno style prompt split at commas (minus its BPM)."""
    if style in BASE.get(slug, {}):
        return BASE[slug][style]
    return [t.strip() for t in STYLES[slug][style].split(",") if t.strip() and "BPM" not in t and not ARC.search(t)]


def negatives(slug, style):
    ex = EXCLUDE[slug]
    ex = ex[style] if isinstance(ex, dict) else ex
    return [x.strip() for x in ex.split(",") if x.strip()]


def style_bpm(slug, style):
    m = re.search(r"(\d+)\s*BPM", STYLES.get(slug, {}).get(style, ""))
    if m:
        return float(m.group(1))
    if style in DEFAULT_BPM:
        return float(DEFAULT_BPM[style])
    cutf = ROOT / f"lyrics/finalists/{slug}/cut_v9.json"
    return float(json.loads(cutf.read_text()).get("bpm", 140)) if cutf.exists() else 128.0


def build(slug, style, bpm, ver="v9"):
    lyrics, _ = suno_build(slug, ver, True, STYLE_CUES.get(slug, {}).get(style), STYLE_SPOKEN.get(slug, {}).get(style))
    chunks = chunks_from_suno(lyrics, style_tags(slug, style), negatives(slug, style), bpm)
    return chunks, sum(c["duration_ms"] for c in chunks)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--style", default="kpop")
    ap.add_argument("--bpm", type=float, default=None, help="default: the style prompt's BPM, else DEFAULT_BPM")
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    bpm = a.bpm or style_bpm(a.slug, a.style)
    chunks, total = build(a.slug, a.style, bpm)
    for c in chunks:
        print(f"{c['text'].splitlines()[0]:<16} {c['_bars']:>3} bars {c['duration_ms'] / 1000:6.1f}s  {len(c['text'].splitlines()) - 1} lines")
    verdict = "" if a.slug in SOURCES else (f" vs cap {CAP_S:.0f}s -> " + ("OK" if total / 1000 <= CAP_S else "OVER"))
    print(f"TOTAL {total / 1000:.1f}s ({int(total // 60000)}:{int(total / 1000 % 60):02d}) at {bpm:g} BPM{verdict}")
    d = ROOT / "audio/eleven" / a.slug
    d.mkdir(parents=True, exist_ok=True)
    spec = {"chunks": [{k: v for k, v in c.items() if not k.startswith("_")} for c in chunks], "seed": a.seed}
    (d / f"{a.style}.spec.json").write_text(json.dumps(spec, indent=1))
    print(f"wrote {d / (a.style + '.spec.json')}  (~{round(total / 60000 * 900, -2):.0f} credits to render)")


if __name__ == "__main__":
    main()
