"""Tests for tools/r2_audit.py: every one of Neel's round-2 asks must be checked mechanically.

Regression: round E's polish dropped #12's only emotion-probe line and the audit still passed, because the ask list
had no entry for the emotions paper (Neel: "the J Lens paper and emotion probes paper have rich content").
Run: python -m pytest tests/test_r2_audit.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
from r2_audit import audit  # noqa: E402

# A minimal draft that satisfies every ask except the emotion probes.
BASE = """# Test
[Verse 1]
I built a dictionary, the Golden Gate   ## refs: X
a plain old probe — just do what works   ## refs: X
Wood Labs? You knew it was a test   ## refs: X
the J-Lens and the N-L-A read you   ## refs: X
an oracle, so let a model read your mind   ## refs: X
Then Astra came   ## refs: X
"""


def _audit(tmp_path, extra=""):
    p = tmp_path / "draft.lyr"
    p.write_text(BASE + extra)
    return audit(str(p))


def test_missing_emotion_probes_is_an_error(tmp_path):
    r = _audit(tmp_path)
    assert "missing: emotion probes" in r["errors"]


def test_loving_probe_line_satisfies_the_ask(tmp_path):
    r = _audit(tmp_path, 'a probe caught "loving" at the colon   ## refs: X\n')
    assert "missing: emotion probes" not in r["errors"]


# ---- round 3 ----
from r2_audit import audit_r3, overlap_report  # noqa: E402

R3_BASE = """# Test
[Verse 1]
you kept your secrets in a crowded room   ## refs: X
"""


def _r3(tmp_path, name, extra=""):
    p = tmp_path / name
    p.write_text(R3_BASE + extra)
    return audit_r3(str(p))


def test_r3_stock_line_is_an_error_in_a_new_song(tmp_path):
    r = _r3(tmp_path, "N1a_x.lyr", "and a plain old probe hit point-nine-nine-nine   ## refs: X\n")
    assert any("stock" in e for e in r["errors"])


def test_r3_stock_line_is_only_a_warning_in_A(tmp_path):
    r = _r3(tmp_path, "A_x.lyr", "and a plain old probe hit point-nine-nine-nine   ## refs: X\n")
    assert not any("stock" in e for e in r["errors"]) and any("stock" in w for w in r["warns"])


def test_r3_self_quote_is_forbidden_everywhere(tmp_path):
    r = _r3(tmp_path, "A_x.lyr", "(spoken:) Unfortunately, it replicates.   ## refs: X\n")
    assert any("FORBIDDEN" in e for e in r["errors"])


def test_r3_overlap_flags_shared_phrases_across_lanes(tmp_path):
    line = "the lighthouse keeps its light on for the ships\n"
    a, b, c = _r3(tmp_path, "N1a_x.lyr", line), _r3(tmp_path, "N2a_y.lyr", line), _r3(tmp_path, "N1b_z.lyr", line)
    rep = overlap_report([a, b, c])
    assert any("N1a_x.lyr ~ N2a_y.lyr" in x for x in rep)
    assert not any("N1a_x.lyr ~ N1b_z.lyr" in x for x in rep)  # same lane (N1): variants may share
