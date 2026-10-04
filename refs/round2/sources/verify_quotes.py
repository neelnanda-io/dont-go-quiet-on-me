"""Check every straight-double-quoted string in the round-2 doc against the source corpus.
Normalizes curly quotes/apostrophes, removes Claude caps/newline markers, collapses whitespace.
Quotes containing an ellipsis are split and each part checked separately."""
import re, glob, sys, os
# The repo root, three levels up from refs/round2/sources/. The research notes named below are not in the public repo.
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DOC = os.path.join(ROOT, "refs/round2/nla_jlens_emotions.md")
files = glob.glob("*.txt") + [os.path.join(ROOT, "refs/web_audit_2026.md"),
                               os.path.join(ROOT, "refs/ledger_digest.md"),
                               os.path.join(ROOT, "refs/papers/neel_other.md"), os.path.join(ROOT, "lyrics/round2/feedback_neel.md")]
def norm(s):
    s = s.replace("­", "")
    for a, b in [("“", '"'), ("”", '"'), ("‘", "'"), ("’", "'"), ("⇪", ""), ("⏎", " "), ("\\n", " ")]:
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s)
    return s
corpus = norm("\n".join(open(f, encoding="utf-8", errors="replace").read() for f in files))
doc = open(DOC, encoding="utf-8").read()
quotes = re.findall(r'"([^"\n]+)"', doc)
miss = 0
for q in quotes:
    parts = [p.strip(" .,;") for p in re.split(r"…|\.\.\.", q) if p.strip(" .,;")]
    bad = [p for p in parts if norm(p) not in corpus]
    if bad:
        miss += 1
        print("MISS:", repr(q[:140]), "| failing part(s):", [b[:80] for b in bad])
print(f"\n{len(quotes)} quotes checked, {miss} with a missing part")
