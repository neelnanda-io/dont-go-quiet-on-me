"""Tests for tools/lyricfmt.py: the .lyr line format must parse its three optional fields in ANY order.

Run: .venv/bin/python -m pytest tests/test_lyricfmt.py -q   (or: .venv/bin/python tests/test_lyricfmt.py)
"""
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from lyricfmt import parse  # noqa: E402

CASES = [
    # (source line, display, sung, refs, note)
    ("Plain line", "Plain line", "Plain line", [], ""),
    ("A || sung: AY ## refs: X1, X2 ## note: n", "A", "AY", ["X1", "X2"], "n"),
    ("A ## refs: X1 || sung: AY ## note: n", "A", "AY", ["X1"], "n"),          # sung after refs (the bug)
    ("A ## note: n ## refs: X1 || sung: AY", "A", "AY", ["X1"], "n"),          # fully reversed
    ("A ## refs: X1", "A", "A", ["X1"], ""),
    ('"I hate you because —" (spoken:) "x" ## refs: R', '"I hate you because —" (spoken:) "x"', '"I hate you because —" (spoken:) "x"', ["R"], ""),
]


def test_field_order():
    for src, disp, sung, refs, note in CASES:
        with tempfile.NamedTemporaryFile("w", suffix=".lyr", delete=False) as f:
            f.write("# T\n[Verse]\n" + src + "\n")
        ln = parse(Path(f.name))["sections"][0]["lines"][0]
        assert (ln["display"], ln["sung"], ln["refs"], ln["note"]) == (disp, sung, refs, note), (src, ln)


def test_no_marker_leaks_in_finalists():
    """No parsed field of any finalist may contain another field's marker."""
    root = Path(__file__).resolve().parents[1] / "lyrics/finalists"
    for p in sorted(root.glob("*/v9.lyr")):
        for sec in parse(p)["sections"]:
            for ln in sec["lines"]:
                blob = " ".join([ln["display"], ln["sung"], ln["note"], *ln["refs"]])
                assert "|| sung:" not in blob and "## refs:" not in blob and "## note:" not in blob, (p.parent.name, ln)


if __name__ == "__main__":
    test_field_order()
    test_no_marker_leaks_in_finalists()
    print("ok")
