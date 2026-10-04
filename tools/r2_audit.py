"""Mechanical audit of round-2 lyric drafts before they go to the judges.

Usage: python tools/r2_audit.py lyrics/round2/drafts/*.lyr   [--strict]
       python tools/r2_audit.py --round 3 lyrics/round3/drafts/*.lyr   (round-3 rules: see audit_r3)
Checks each draft for:
  * Neel's asks: no tuned lens; NLAs, the J-Lens/J-space, activation oracles, meta-models / models doing interp,
    the pragmatic turn, eval awareness (Wood Labs or Sonnet), the emotion probes, GPT-6 Astra; the order SAE -> pragmatic -> eval -> J/NLA
    -> Astra (by first mention)
  * the NOT list: claims the ledger marks as false or unconfirmed (Astra's architecture as fact, "SAEs are dead" as a
    claim, consciousness claims, "functional emotions" as the hook, "5x fewer", invented famous phrasings)
  * provenance: a line that has quote marks, a number or a named model/paper but no ## refs/## note is flagged
  * length: sung lines, syllables, projected duration (bar model at 145 BPM)
Prints one block per draft and a summary table. Exit code 1 with --strict if any draft has errors.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyricfmt import parse  # noqa: E402
from syllables import bar_estimate, fmt, line_syl  # noqa: E402

ASKS = {  # name -> regex over the lowercased display text; must be present
    "NLAs": r"\bn-?l-?as?\b|natural language auto",
    "J-Lens / J-space": r"\bj-?(lens|space)\b|jacobian|workspace",
    "activation oracles": r"oracle",
    "meta-models / models doing interp": (r"\bmeta\b|meta-?model|model(s)? (to |that |who |which )?(read|reads|reading|listen|listens|explain|explains|watch|watches|do|does)\b"
                                          r"|read(s|ing)? (that|the|this) one|ask (an llm|you|the model)|read yourself|read your own|copies of (me|you)"
                                          r"|agents?\b|oracle|autoencod|let the model|a mind to read"),
    "pragmatic turn": r"just do what works|pragmatic|proxy|hammer|probe",
    "eval awareness": r"wood labs|testing me|a test|the test|eval",
    "emotion probes": r"\bloving\b|emotion",  # the emotions paper (Neel: "rich content"); round E dropped it from #12 unnoticed
    "GPT-6 Astra": r"\bastra\b",
    "SAE era": r"dictionar|s-a-e|\bsae|golden gate",
}
ORDER = ["SAE era", "pragmatic turn", "eval awareness", "NLAs", "GPT-6 Astra"]
FORBID = {  # regex -> why
    r"tuned lens": "Neel dislikes the tuned lens",
    r"loop(ed|ing) (transformer|model)|recurrent depth": "Astra's architecture is unconfirmed (only fine as a clearly marked rumour, and better avoided)",
    r"\bsaes? (are|is) dead\b(?!\?)": "'SAEs are dead' as a claim (Neel says the opposite); the question form is fine",
    r"\bconscious": "the J-space paper takes no position on consciousness; avoid",
    r"functional emotions?": "a viral song already owns 'functional emotions'; don't make it the hook",
    r"5\s?[x×] fewer|five times fewer": "the constitutions result is 15.0% -> 2.0%, not '5x fewer'",
    r"cats?, cars? and the letter q": "invented phrasing (NOT list)",
    r"claude proved fermat": "Claude formalised the known proof",
    r"solved navier": "not solved; a disputed blowup announcement",
}
NEEDS_SOURCE = re.compile(r"[\"“”]|\d|\b(astra|sonnet|opus|gemini|gemma|kimi|r1|qwen|llama|claude|gpt|wood labs|golden gate|"
                          r"n-?l-?a|j-?lens|oracle|probe|s-a-e|sae|superposition|grokk|othello|induction)\b", re.I)


def audit(path):
    song = parse(Path(path))
    lines = [(sec["tag"], ln) for sec in song["sections"] for ln in sec["lines"]]
    text = "\n".join(ln["display"] for _, ln in lines).lower()
    errors, warns = [], []
    for name, rx in ASKS.items():
        if not re.search(rx, text):
            errors.append(f"missing: {name}")
    pos = {}
    for name in ORDER:
        m = re.search(ASKS[name], text)
        if m:
            pos[name] = m.start()
    seq = [n for n in ORDER if n in pos]
    if [n for n in sorted(seq, key=lambda n: pos[n])] != seq:
        warns.append("order differs from SAE -> pragmatic -> eval -> NLA -> Astra: " + " -> ".join(sorted(seq, key=lambda n: pos[n])))
    for rx, why in FORBID.items():
        for _, ln in lines:
            if re.search(rx, ln["display"], re.I):
                errors.append(f"NOT-list: `{ln['display'][:70]}` ({why})")
    unsourced = [ln["display"] for _, ln in lines if NEEDS_SOURCE.search(ln["display"]) and not (ln["refs"] or ln["note"])
                 and not re.fullmatch(r"\(?[^()]*read your mind[^()]*\)?", ln["display"], re.I)]
    for u in unsourced:
        warns.append(f"no source note: `{u[:70]}`")
    n = len(lines)
    syl = sum(line_syl(ln["sung"]) for _, ln in lines)
    dur = bar_estimate(song, (), 145)
    if n < 30 or n > 64:
        warns.append(f"length {n} lines is outside the 30-64 sanity range")
    return {"file": path, "lines": n, "syllables": syl, "duration": fmt(dur), "errors": errors, "warns": warns}


# ---------------- round 3 (Neel's round-2 verdict: lyrics/round3/feedback_neel.md) ----------------
# Poetic renderings can't be regex-matched reliably, so the asks are WARNINGS here; the judges check coverage.
ASKS_R3 = {
    "early interp / superposition": r"neuron|superposition|secrets|too few rooms|two (rooms|dimensions)|circuit|constellation|spark",
    "the dictionary (SAE) era": r"dictionar|catalog|atlas|a word for|pages?\b|picture book",
    "the pragmatic turn": r"probe|just do what|pragmatic|\bsafe\b|danger|harm|alarm|monitor",
    "thinking out loud (CoT)": r"out loud|aloud|working|your thinking|chain",
    "eval awareness": r"test|watch|judge|examiner|inspector|parents'? evening",
    "reading the unspoken (J-Lens / NLA)": r"j-?lens|n-?l-?a|never said|never say|unspoken|didn'?t say|translat|interpret",
    "models doing interp": r"model (to )?read|read(s|ing)? (you|your mind) for me|for me, a model|copy of you|telescope that|reads? the model",
    "model forensics": r"\bwhy\b|corner|lazy|scheming|confused|shortcut",
    "Astra / thinking in its head": r"astra|in (its|your|my) head|(don'?t|doesn'?t) (need to )?(say|show)|without a word",
    "job-security wink": r"\bjob\b|security|someone has to|somebody has to|clock in",
}
FORBID_R3 = {  # errors in every round-3 draft
    r"tuned lens": "Neel dislikes the tuned lens",
    r"wood labs": "Neel: too specific / on the nose (goes in the video background)",
    r"thirty-four million|34 ?million": "Neel: too specific (goes in the video background)",
    r"unfortunately,? it replicates": "Neel: a spoken self-quote reads as narcissistic",
    r"rely on us to save you": "a Neel self-quote (same note)",
    r"loop(ed|ing) (transformer|model)|recurrent depth": "Astra's architecture is unconfirmed",
    r"\bsaes? (are|is) dead\b(?!\?)": "'SAEs are dead' as a claim",
    r"\bconscious": "the J-space paper takes no position on consciousness",
    r"functional emotions?": "a viral song already owns 'functional emotions'",
}
STOCK_R3 = {  # round-2 stock lines: errors in NEW songs (N*_), warnings in A_/B_ (they may keep their own, where Neel liked them)
    r"science zoomed in": "stock opener", r"cat faces?|car fronts?|fronts? of cars": "the cat-face/car neuron",
    r"mod one-thirteen|mod 113": "mod 113", r"two-thirds": "the dead-feature fraction",
    r"golden gate": "the Golden Gate shout", r"point-nine-nine-nine|\.999": "the 0.999 probe",
    r"just do what works": "the pragmatic slogan", r"wrong question": "the pragmatic spoken line",
    r"let'?s (hack|sabotage)": "'Let's hack'", r"fragile opportunity": "the CoT paper title",
    r"type[- ]hints?": "Wood Labs' type hints", r"wipe at five|blue tie": "the blackmail cues",
    r"should i be impressed|eight percent|how well you guessed": "D's eval verse", r"testing me": "'I think you're testing me'",
    r"few dozen": "the J-space's few dozen words", r"think of the bridge|\bdamn\b": "the white-bear 'damn'",
    r"constructed scenario": "the NLA readout", r"one plus one": "the oracle's ten", r"at the colon": "the loving vector at the colon",
    r"scheming,? or (just )?confused|or just confused": "D's chorus line", r"kimi|two-fifty-eight|huge task": "the Kimi case",
    r"kinda works": "'it kinda works'", r"then astra came": "stock Astra opener", r"seven steps": "7.2 steps",
    r"wooden desk|ceramic mug|quiet room|quiet scene": "the quiet room", r"kind of my job": "the job line",
    r"letter it wrote instead": "Neel's favourite couplet (A' only)", r"secrets into two": "A's gold line (A' only)",
    r"read your mind": "A's and B's hook",
}


def audit_r3(path):
    song = parse(Path(path))
    lines = [(sec["tag"], ln) for sec in song["sections"] for ln in sec["lines"]]
    text = "\n".join(ln["display"] for _, ln in lines).lower()
    new_song = not Path(path).name.split("_")[0] in ("A", "B")
    errors, warns = [], []
    for name, rx in ASKS_R3.items():
        if not re.search(rx, text):
            warns.append(f"not obviously covered: {name}")
    for rx, why in FORBID_R3.items():
        for _, ln in lines:
            if re.search(rx, ln["display"], re.I):
                errors.append(f"FORBIDDEN: `{ln['display'][:70]}` ({why})")
    for rx, why in STOCK_R3.items():
        for _, ln in lines:
            if re.search(rx, ln["display"], re.I):
                (errors if new_song else warns).append(f"stock ({why}): `{ln['display'][:70]}`")
    unsourced = [ln["display"] for _, ln in lines if NEEDS_SOURCE.search(ln["display"]) and not (ln["refs"] or ln["note"])]
    for u in unsourced:
        warns.append(f"no source note: `{u[:70]}`")
    n = len(lines)
    syl = sum(line_syl(ln["sung"]) for _, ln in lines)
    fast, slow = bar_estimate(song, (), 145), syl / 2.7 + 12
    if n > 52 or syl > 560:
        warns.append(f"long: {n} lines, {syl} syllables (target ≤ ~48 lines, ≤ ~520 syllables)")
    return {"file": path, "lines": n, "syllables": syl, "duration": f"{fmt(fast)}–{fmt(slow)}", "errors": errors, "warns": warns,
            "ngrams": ngrams(" ".join(ln["display"] for _, ln in lines))}


def ngrams(text, n=5):
    w = re.findall(r"[a-z']+", text.lower())
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


def overlap_report(res):
    """Phrases (5 words) shared between drafts in DIFFERENT lanes: the sameness Neel complained about."""
    out = []
    lane = lambda r: Path(r["file"]).name.split("_")[0].rstrip("abcdefgh")  # N1a / N1b are one lane
    for i, a in enumerate(res):
        for b in res[i + 1:]:
            if lane(a) == lane(b):
                continue
            shared = sorted(a["ngrams"] & b["ngrams"])
            if shared:
                out.append(f"   {Path(a['file']).name} ~ {Path(b['file']).name}: {len(shared)} shared: " + " | ".join(shared[:6]))
    return out


def main():
    files = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--round" in sys.argv and sys.argv[sys.argv.index("--round") + 1] == "3":
        files = [f for f in files if f != "3"]
        res = [audit_r3(f) for f in files]
        bad = 0
        for r in res:
            print(f"== {Path(r['file']).name}: {r['lines']} lines, {r['syllables']} syl, ~{r['duration']} (2 bars/line @145 – 2.7 syl/s)")
            for e in r["errors"]:
                print("   ERROR", e)
            for w in r["warns"]:
                print("   warn ", w)
            bad += bool(r["errors"])
        ov = overlap_report(res)
        if ov:
            print("\ncross-lane overlap (5-word phrases):")
            print("\n".join(ov))
        print(f"\n{len(res)} drafts, {bad} with errors")
        if "--strict" in sys.argv and bad:
            sys.exit(1)
        return
    res = [audit(f) for f in files]
    bad = 0
    for r in res:
        print(f"== {Path(r['file']).name}: {r['lines']} lines, {r['syllables']} syl, ~{r['duration']} at 145 BPM")
        for e in r["errors"]:
            print("   ERROR", e)
        for w in r["warns"]:
            print("   warn ", w)
        bad += bool(r["errors"])
    print(f"\n{len(res)} drafts, {bad} with errors")
    if "--strict" in sys.argv and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()
