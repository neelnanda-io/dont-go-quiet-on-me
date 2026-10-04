"""tools/describe_check.py: checking Gemini's descriptive claims against measurements.

Run with the project venv: .venv/bin/python -m pytest tests -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import describe_check as dc  # noqa: E402


def test_spearman_perfect_reversed_and_ties():
    assert dc.spearman([1, 2, 3, 4], [10, 20, 30, 40]) == 1.0
    assert dc.spearman([1, 2, 3, 4], [40, 30, 20, 10]) == -1.0
    assert abs(dc.spearman([1, 1, 2, 2], [1, 2, 3, 4]) - 0.894) < 0.01   # ties get average ranks


def test_mentions_key_change():
    assert dc.mentions_key_change(["the final chorus modulates up a whole step"])
    assert dc.mentions_key_change(["Key change into the last chorus"])
    assert not dc.mentions_key_change(["the key line lands hard", "it changes texture"])


def test_level_claims_checked_against_the_median():
    secs = [{"mix_db": -20.0}, {"mix_db": -25.0}, {"mix_db": -16.0}, {"mix_db": -20.0}]
    calls = ["medium", "very low", "very high", "low"]
    res = dc.level_claims(calls, secs)   # median -20: section 1 quiet (ok), 2 loud (ok), 3 "low" but at the median (not ok)
    assert [r["ok"] for r in res] == [True, True, False]
