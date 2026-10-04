"""Build the public reference doc's chapter markdown from the page's SPOT list (tools/build_final_page.py), the shot stills
(output/doc_stills) and the lyrics. SPOT was written to Neel ("your walkthrough"); the doc is public, so second-person
references to his work become "Neel's" (quotes, lyrics and the generic "you" stay)."""
import json, re, sys
sys.path.insert(0, 'tools')
import build_final_page as b
shots = {s['id']: s for s in json.load(open('output/doc_stills/shots.json'))}
blobs = json.load(open('output/doc_stills/blobs.json'))
PUBLIC = [   # exact replacements, checked one by one
    ("in your subliminal-learning paper", "in Neel's subliminal-learning paper"),
    ("Your activation-diffing paper’s agent", "Neel's activation-diffing paper’s agent"),
    ("your watch face is mod 113", "this watch face is mod 113"),
    ("in your getting-started guide", "in Neel's getting-started guide"),
    ("(your word: what", "(Neel's word: what"),
    ("as your 200 Concrete Open Problems", "as Neel's 200 Concrete Open Problems"),
    ("your open replication", "Neel's open replication"),
    ("your “Set a 5-minute timer and brainstorm”", "Neel's “Set a 5-minute timer and brainstorm”"),
    ("from your reading list", "from Neel's reading list"),
    ("and your verdict, in rot13", "and his verdict, in rot13"),
    ("in your 2022 longlist", "in Neel's 2022 longlist"),
    ("your research-process advice", "Neel's research-process advice"),
    ("your case for interpretability", "Neel's case for interpretability"),
    ("Your production probes paper", "Neel's team's production probes paper"),
    ("your sentiment paper", "Neel's sentiment paper"),
    ("and your Explorations of Self-Repair", "and Neel's Explorations of Self-Repair"),
    ("makes your eval-aware model organism", "makes Neel's eval-aware model organism"),
    ("as your Mech Interp Puzzle 2", "as Neel's Mech Interp Puzzle 2"),
    ("the method your RelP builds on", "the method Neel's RelP builds on"),
    ("your activation-patching guide", "Neel's activation-patching guide"),
    ("the IOI sentence of your walkthrough", "the IOI sentence of Neel's walkthrough"),
    ("where your review first spotted", "where Neel's review first spotted"),
    ("from your list,", "from Neel's list,"),
    ("(and your own patching guide’s", "(and Neel's own patching guide’s"),
    ("the line of your no-CoT chart", "the line of Neel's no-CoT chart"),
    ("your post’s serial steps", "Neel's post’s serial steps"),
    ("Your “kind of my job”", "Neel's “kind of my job”"),
    ("which your team inspected", "which Neel's team inspected"),
]
OK_YOU = ["rickrolls you", "what is your physical form", "you don’t train", "I loved you", "The seat in front of you",
          "if you know where to look", "I HATE YOU", "you’re writing a letter", "“your words”", "You love cats. You think"]
def public(text):
    for a, c in PUBLIC: text = text.replace(a, c)
    left = [m.group(0) for m in re.finditer(r'\b[Yy]our?s?\b', text)]
    if left and not any(k in text for k in OK_YOU):
        raise SystemExit(f'unhandled second person: {text}')
    return text
CH = [   # (doc pending block, heading, page sections, shots, lyric line)
    ('310', '0:00 · Intro: the riffle back from 2027', ['Intro'], ['H1', 'H2'], "Don't go quiet on me now"),
    ('311', '0:19 · Circuits, superposition and grokking (2020–22)', ['Verse 1'], ['V1a', 'V1b', 'V1c', 'V1d'], 'You never used to talk to me — just neurons in the dark'),
    ('312', '0:37 · Chorus: transformer circuits (2022)', ['Chorus 1'], ['C1a', 'C1b', 'C1c', 'C1d'], 'I just wanna read your mind, every feature I can find'),
    ('313', '0:54 · Sparse autoencoders and Golden Gate Claude (2023–24)', ['Verse 2'], ['V2a', 'V2b', 'V2c', 'V2d', 'V2e'], 'so I wrote you a dictionary — I learned your A-B-C'),
    ('314', '1:10 · Pragmatic interpretability and probes (2025)', ['Verse 3'], ['V3a', 'V3b', 'V3c', 'V3d', 'V3e'], 'Then a plain old probe hit point-nine-nine-nine'),
    ('315', '1:27 · Chain of thought (2024–25)', ['Pre-Chorus', 'Chorus 2'], ['P1', 'P2', 'C2a', 'C2b', 'C2c', 'C2d'], 'And then you thought out loud! — (not all of it, but fine)'),
    ('316', '1:52 · Eval awareness (2025)', ['Verse 4'], ['V4a', 'V4b', 'V4c', 'V4d'], 'But you learned to spot the watch — and wore your Sunday best'),
    ('317', '2:09 · Chorus: it knows it’s being tested (2025)', ['Chorus 3'], ['C3a', 'C3b', 'C3c', 'C3d'], 'you said "I think you\'re testing me" — so you\'d read mine'),
    ('318', '2:25 · Reading what it won’t say: J-Lens, oracles, NLAs (2026)', ['Verse 5'], ['V5a', 'V5b', 'V5c', 'V5d', 'V5e', 'V5f'], 'So I learned to hear the words you\'d never say'),
    ('319', '2:50 · Chorus: emotion concepts (2026)', ['Chorus 4'], ['C4a', 'C4b', 'C4c', 'C4d'], 'you light up "loving" before you speak — for whoever\'s next in line'),
    ('320', '3:07 · Model forensics (2026)', ['Bridge'], ['B1', 'B2', 'B3', 'B4', 'B5'], 'You cut a corner once — (were you scheming, or confused?)'),
    ('321', '3:29 · Opaque reasoning: GPT-6 Astra (2026)', ['Verse 6'], ['V6a', 'V6b', 'V6c', 'V6d'], 'Then Astra came — and it could do the thinking in its head'),
    ('322', '3:46 · Final chorus: reading the quiet (2026–27)', ['Final Chorus'], ['FC1', 'FC2', 'FC3', 'FC4', 'FC5'], 'so if you stop, I\'ll learn to read the quiet'),
    ('323', '4:09 · Credits', ['End'], ['E1', 'E2'], None),
]
mmss = lambda t: f"{int(t // 60)}:{int(t % 60):02d}"
out = {}
for pid, head, secs, ids, lyric in CH:
    md = [f"## {head}"]
    if lyric: md.append(f"*“{lyric}”*")
    for i in ids:
        s = shots[i]
        md.append(f"![{mmss(s['t0'])} {s['title']}](blob/{blobs[i]})")
        md.append(f"{mmss(s['t0'])} · {s['title']}")
    items = [it for sec in secs for it in b.SPOT.get(sec, [])]
    md.append("**What to spot**")
    md.append("\n".join(f"- {public(it[0])}" + (f" ([{it[1]}]({it[2]}))" if it[2] else (f" ({it[1]})" if it[1] else "")) for it in items))
    if pid == '323':
        md.append("Vocals and band: Suno v6. Lyrics, animation and mix: Claude Opus 5.5. Prompt inspiration: Donald Jewkes. Moral support: Neel Nanda. Drawn and animated in JavaScript (p5.js and p5.brush), frame by frame.")
    out[pid] = "\n\n".join(md)
json.dump(out, open('output/doc_stills/chapters.json', 'w'), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})
