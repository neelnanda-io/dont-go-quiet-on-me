"""Syllable counting for duration estimates (vowel-group heuristic; ~±10% per line, fine for totals).

Also: projected sung duration. Measured on our ElevenLabs sketches (2026-09-30): 2.1-3.2 sung syllables/s during the
vocal span, ~2.7 typical at 120-130 BPM; add ~12 s for intro, breaks and outro.
"""
import re

RATE, OVERHEAD = 2.7, 12.0
# Stage directions inside sung lines: never sung, so never counted or aligned. Shared with align.py.
DIRECTIONS = re.compile(r"\((spoken|a researcher|one full bar of silence|fast|held)[^)]*\):?", re.I)


def strip_directions(text):
    return DIRECTIONS.sub("", text)


def syl(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and n > 1 and not w.endswith("le"):
        n -= 1
    return max(1, n)


def line_syl(text):
    # letter spellings ("S-A-E", "C-O-T") are sung letter by letter: one syllable per letter
    total = 0
    for tok in re.split(r"[\s—]+", strip_directions(text)):
        if re.fullmatch(r"\(?([A-Z]-)+[A-Z][!?.,)]*", tok):
            total += len(re.findall(r"[A-Z]", tok))
        else:
            total += sum(syl(p) for p in tok.split("-"))
    return total


def projected(n_syl, rate=RATE):
    s = n_syl / rate + OVERHEAD
    return f"{int(s // 60)}:{int(s % 60):02d}"


# ---- bar model (the second, line-count-driven estimate) ----
# Pop lines take about a phrase each whatever their syllable count: our sketches' choruses ran 3.3-4.8 s per line.
# 2 bars per sung line, 1.5 when the section cue says rap, 0.5 for an echo-only ad-lib "(read your mind!)", 4 bars
# for the intro hook, each section rounded up to an even number of bars. eleven_plan.py uses the same rule.
def line_bars(text, rapped):
    t = strip_directions(text).strip()
    if re.fullmatch(r"\(.*\)", t) and len(t) < 30:
        return 0.5
    return 1.5 if rapped else 2.0


def bar_estimate(song, cut=(), bpm=140.0):
    """Seconds for a parsed .lyr song with the given global line indices cut."""
    import math
    total, k = 0.0, -1
    for sec in song["sections"]:
        name, _, cue = sec["tag"].partition("|")
        bars, kept = 0.0, 0
        for ln in sec["lines"]:
            k += 1
            if k in cut:
                continue
            kept += 1
            bars += line_bars(ln["sung"], "rap" in cue.lower())
        if kept:
            total += 4 if name.strip() == "Intro" else max(2, 2 * math.ceil(bars / 2))
    return total * 4 * 60 / bpm


def fmt(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"
