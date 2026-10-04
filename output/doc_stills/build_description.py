"""Build the YouTube description for the final cut (https://youtu.be/xhTMRykVb8I).

Writes output/youtube_description.txt: the opening line, the link to the "every reference" doc, then one YouTube
chapter per lyric section (the timestamp lines become the named segments in the progress bar), each followed by its
lyrics, then the credits. Run from the repo root: python3 output/doc_stills/build_description.py

YouTube's chapter rules, checked below: the first stamp is 0:00, the stamps ascend, there are at least 3, and every
chapter lasts at least 10 s (the 8 s pre-chorus is therefore folded into "Chain of thought"). The description must
stay under 5000 characters and contain no angle brackets.
"""
import re

LYRICS = 'lyrics/final/dont_go_quiet.display.md'
OUT = 'output/youtube_description.txt'
DOC = 'https://neelnanda-io.github.io/dont-go-quiet-on-me/'  # the public references page
DURATION = 262  # seconds, the length of the final cut

# (timestamp, chapter title, indices into the display lyrics' bracketed sections). The stamps are the section
# starts in video/kit/src/data/dgq_shots.js, rounded down to the second.
CHAPTERS = [
    ("0:00", "Intro: the riffle back from 2027", [0]),
    ("0:19", "Circuits, superposition & grokking (2020–22)", [1]),
    ("0:37", "Chorus: transformer circuits (2022)", [2]),
    ("0:54", "Sparse autoencoders & Golden Gate Claude (2023–24)", [3]),
    ("1:10", "Pragmatic interpretability & probes (2025)", [4]),
    ("1:27", "Chain of thought (2024–25)", [5, 6]),  # pre-chorus + chorus 2
    ("1:52", "Eval awareness (2025)", [7]),
    ("2:09", "Chorus: it knows it's being tested (2025)", [8]),
    ("2:25", "Reading what it won't say: J-Lens, oracles, NLAs (2026)", [9]),
    ("2:50", "Chorus: emotion concepts (2026)", [10]),
    ("3:07", "Model forensics (2026)", [11]),
    ("3:29", "Opaque reasoning: GPT-6 Astra (2026)", [12]),
    ("3:46", "Final chorus: reading the quiet (2026–27)", [13]),
]
CREDITS = ["4:09 Credits", "vocals & band: Suno v6", "lyrics, animation & mix: Claude Opus 5.5",
           "prompt inspiration: Donald Jewkes", "moral support: Neel Nanda"]


def lyric_sections(path):
    """The display lyrics as [(heading, lines)], with the 〔sung: …〕 pronunciation notes stripped."""
    raw = open(path).read()
    body = raw.split('\n', 2)[2].strip()  # drop the title line and the blank line after it
    secs = []
    for block in re.split(r'\n(?=\[)', body):
        head, *lines = block.strip().split('\n')
        secs.append((head, [re.sub(r'\s*〔.*?〕', '', l).rstrip() for l in lines if l.strip()]))
    return secs


def build():
    secs = lyric_sections(LYRICS)
    assert len(secs) == 14, f'expected 14 lyric sections, got {len(secs)}: the CHAPTERS indices need updating'
    out = ["A stylised history of mech interp (with as many references as Opus and I could cram in)", "",
           f"Every reference in the video, with stills and sources: {DOC}", ""]
    for ts, title, idx in CHAPTERS:
        out.append(f"{ts} {title}")
        for k, i in enumerate(idx):
            if k:
                out.append("")
            out += secs[i][1]
        out.append("")
    out += CREDITS
    return "\n".join(out)


def check(text):
    assert len(text) <= 5000, f'{len(text)} characters, over YouTube\'s 5000'
    assert '<' not in text and '>' not in text, 'YouTube rejects angle brackets in descriptions'
    stamps = [int(m) * 60 + int(s) for m, s in re.findall(r'^(\d+):(\d\d) ', text, re.M)]
    assert stamps[0] == 0 and stamps == sorted(stamps) and len(stamps) >= 3
    lengths = [b - a for a, b in zip(stamps, stamps[1:] + [DURATION])]
    assert min(lengths) >= 10, f'a chapter is shorter than 10 s: {lengths}'
    return len(text), len(stamps), min(lengths)


if __name__ == '__main__':
    text = build()
    n, k, shortest = check(text)
    open(OUT, 'w').write(text)
    print(f'{OUT}: {n} characters, {k} chapters, shortest {shortest} s')
