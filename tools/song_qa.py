"""QA every take of the chosen song and write the manifest the song-pick page is built from. (I can't hear: this is
how I shortlist, and the page says so.)

Usage:
  python tools/song_qa.py dgq audio/takes/dgq/*.wav [--lines 11,12,13,14] [--no-align]
  (round 1: python tools/song_qa.py one_direction audio/takes/one_direction/*.mp3)
Writes audio/takes/<slug>/qa/<take>.qa.json (+ .lyrics.json alignment) and audio/takes/<slug>/manifest.json.

Per take:
  * technical checks (duration, vs the 2:19 cap for round-1 finalists; loudness, peak, clipping, dead air)
  * Demucs vocal stem, then two UNPROMPTED transcribers (gpt-4o-transcribe, whisper large-v3-turbo)
  * per-line word recall against the lines Suno was given (the cut; display words, ad-libs in parentheses excluded)
  * jargon heard: each key term with the spellings a transcriber might legitimately produce
  * forced alignment of the kept lines (align.align) -> section start/end times for the page's jump buttons, and the
    time of each jargon line (the page's "listen for" buttons: a term a transcriber missed is where Neel should listen)
--lines restricts the expected lines (global .lyr indices) for short clips such as sketches.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from align import align  # noqa: E402
from lyricfmt import parse  # noqa: E402
from suno_prep import SOURCES, SPOKEN, clean  # noqa: E402
from vocal_qa import line_recall, norm_words, separate, tech_checks, term_heard, tx_openai, tx_whisper  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CAP_S = 139.0  # round-1 finalists only (the 2:19 MP4 cap); later songs (SOURCES) have no length cap
# key terms -> spellings a transcriber could fairly produce for them (all lowercase, compared after norm_words)
TERMS = {
    "one_direction": {"superposition": ["superposition"], "mod 113": ["one thirteen", "113", "one-thirteen"],
                      "grokked": ["grokked", "grokd", "grok"], "dictionary": ["dictionary"], "SAE": ["s a e", "sae", "ess ay ee"],
                      "Golden Gate": ["golden gate"], "yoga": ["yoga"], "steering vector": ["steering vector"],
                      "misaligned": ["misaligned"], "Wood Labs": ["wood labs", "woodlabs"], "type-hint": ["type hint", "typehint"],
                      "probe": ["probe"], "CoT": ["c o t", "cot", "see oh tee"], "scheming": ["scheming"], "Qwen": ["qwen", "quen", "kwen"]},
    "read_your_mind": {"superposition": ["superposition"], "mod 113": ["one thirteen", "113"], "grokked": ["grokked", "grok"],
                       "logit lens": ["logit lens", "lojit lens"], "tuned lens": ["tuned lens"], "J-lens": ["j lens", "jay lens"],
                       "dictionary": ["dictionary"], "Golden Gate": ["golden gate"], "probe": ["probe"],
                       "steering vector": ["steering vector"], "Wood Labs": ["wood labs"], "neuralese": ["neuralese"],
                       "SAEs": ["s a es", "saes", "ess ay eez"], "scheming": ["scheming"], "it kinda works": ["kinda works", "kind of works"]},
    # "Don't Go Quiet On Me": sung from respellings (SON-it, JAY-lens, EN-EL-AY); count only what a listener would hear as
    # the word ("sun it" for Sonnet is NOT counted, so the page flags it for Neel's ear)
    "dgq": {"mod 113": ["one thirteen", "113", "1 13"], "grokked": ["grokked", "grokd", "grok"], "dictionary": ["dictionary"],
            "A-B-C": ["a b c", "abc"], "Golden Gate Bridge": ["golden gate bridge"], ".999": ["point nine nine nine", "999"],
            "mech interp": ["mech interp", "mechinterp", "mech interpretability"], "probe": ["probe"],
            "Let's hack": ["lets hack"], "Sunday best": ["sunday best"], "cartoonish": ["cartoonish"],
            "Sonnet": ["sonnet", "son it"], "eight percent": ["eight percent", "8 percent", "8"],
            "J-Lens": ["j lens", "jay lens", "jlens", "jaylens"], "oracle said ten": ["oracle said ten", "oracle said 10"],
            "NLA": ["n l a", "nla", "en el ay"], "Astra": ["astra"]},
}


def lyr_path(slug, ver="v9"):
    return SOURCES.get(slug, ROOT / f"lyrics/finalists/{slug}/{ver}.lyr")


def capped(slug):
    return slug not in SOURCES


def expected_lines(slug, ver="v9", only=None):
    song = parse(lyr_path(slug, ver))
    cutf = ROOT / f"lyrics/finalists/{slug}/cut_{ver}.json"
    cut = set(json.loads(cutf.read_text())["cut"]) if cutf.exists() else set()
    out, k = [], -1
    for sec in song["sections"]:
        for ln in sec["lines"]:
            k += 1
            if k in cut or (only is not None and k not in only):
                continue
            # compare against the DISPLAY words: a transcriber writes "superposition", not the singer's
            # respelling "su-per-po-SI-tion"
            out.append(clean(SPOKEN.sub("", ln["display"])))
    return out, cut


def weak_lines(lines, rec, thr=.6):
    """Lines either transcriber mostly missed. line_recall gives (line, fraction) pairs and skips wordless lines, so
    key by the line text rather than zipping by position (repeated chorus lines collapse into one entry)."""
    pa, pb = dict(rec["gpt4o"][1]), dict(rec["whisper"][1])
    out, seen = [], set()
    for ln in lines:
        if ln in pa and ln in pb and ln not in seen and min(pa[ln], pb[ln]) < thr:
            seen.add(ln)
            out.append({"line": ln, "gpt4o": round(pa[ln], 2), "whisper": round(pb[ln], 2)})
    return out


def qa_take(slug, path, only=None, do_align=True, ver="v9"):
    qa_dir = ROOT / "audio/takes" / slug / "qa"
    qa_dir.mkdir(parents=True, exist_ok=True)
    stem = path.stem
    lines, cut = expected_lines(slug, ver, only)
    tech = tech_checks(path)
    voc = separate(path)
    hyp = {"gpt4o": tx_openai(voc), "whisper": tx_whisper(voc)}
    rec = {k: line_recall(lines, norm_words(v)) for k, v in hyp.items()}
    # a term counts if it is in the lyrics given, ad-libs included (norm_words drops parenthesised text, which is right
    # for recall, since backing vocals are often buried, but would hide "(I AM THE GOLDEN GATE BRIDGE!)")
    terms, given = {}, " ".join(lines).replace("(", " ").replace(")", " ")
    for term, variants in TERMS.get(slug, {}).items():
        if not any(term_heard(v, given) for v in variants):
            continue   # the term's line was cut (or isn't in this clip): don't score a word nobody sang
        terms[term] = [any(term_heard(v, hyp[k]) for v in variants) for k in ("gpt4o", "whisper")]
    sections, term_t = [], {}
    if do_align:
        al = align(path, lyr_path(slug, ver), qa_dir / f"{stem}.lyrics.json", cut=cut, only=only)
        for term, variants in TERMS.get(slug, {}).items():  # when the term's line starts: where to listen for it
            hit = next((l for l in al["lines"] if l["t0"] is not None and
                        any(term_heard(v, l["display"].replace("(", " ").replace(")", " ")) for v in variants)), None)
            if hit and term in terms:
                term_t[term] = round(hit["t0"], 2)
        for l in al["lines"]:
            if l["t0"] is None:
                continue
            if sections and sections[-1]["name"] == l["section"]:
                sections[-1]["t1"] = l["t1"]
            else:
                sections.append({"name": l["section"], "t0": l["t0"], "t1": l["t1"]})
    res = {"id": stem, "file": str(path.relative_to(ROOT)), "tech": tech,
           "cap_s": CAP_S if capped(slug) else None, "over_cap": capped(slug) and tech["duration_s"] > CAP_S,
           "recall": {k: round(v[0], 3) for k, v in rec.items()},
           "weak_lines": weak_lines(lines, rec),
           "terms": terms, "term_t": term_t, "sections": sections, "transcripts": hyp}
    (qa_dir / f"{stem}.qa.json").write_text(json.dumps(res, indent=1))
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("takes", nargs="+")
    ap.add_argument("--lines", default=None)
    ap.add_argument("--no-align", action="store_true")
    a = ap.parse_args()
    only = {int(x) for x in a.lines.split(",")} if a.lines else None
    man_p = ROOT / "audio/takes" / a.slug / "manifest.json"
    man = json.loads(man_p.read_text()) if man_p.exists() else {"slug": a.slug, "takes": []}
    for t in a.takes:
        r = qa_take(a.slug, Path(t).resolve(), only, not a.no_align)
        man["takes"] = [x for x in man["takes"] if x["id"] != r["id"]] + [{k: v for k, v in r.items() if k != "transcripts"}]
        heard = sum(all(v) for v in r["terms"].values())
        print(f"{r['id']:<28} {r['tech']['duration_s']:6.1f}s  recall {r['recall']['gpt4o']:.2f}/{r['recall']['whisper']:.2f}  "
              f"terms both-heard {heard}/{len(r['terms'])}  {'OVER CAP' if r['over_cap'] else ''}")
    man_p.parent.mkdir(parents=True, exist_ok=True)
    man_p.write_text(json.dumps(man, indent=1))


if __name__ == "__main__":
    main()
