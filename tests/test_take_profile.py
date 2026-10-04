"""tools/take_profile.py: key-change detection by chroma transposition, and key naming.

Run with the project venv: .venv/bin/python -m pytest tests -q
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import take_profile  # noqa: E402

# a C-major-ish pitch-class profile (C E G strong, scale tones medium)
C_MAJOR = np.array([1.0, .1, .5, .1, .8, .5, .1, .9, .1, .5, .1, .4])


def test_transposition_finds_a_key_change_up():
    shift, gain = take_profile.transposition(C_MAJOR, np.roll(C_MAJOR, 2))
    assert shift == 2 and gain > 0.3


def test_transposition_down_is_negative_and_same_key_is_zero():
    assert take_profile.transposition(C_MAJOR, np.roll(C_MAJOR, -1))[0] == -1
    shift, gain = take_profile.transposition(C_MAJOR, C_MAJOR)
    assert shift == 0 and gain == 0


def test_key_name():
    assert take_profile.key_name(C_MAJOR) == "C major"
    assert take_profile.key_name(np.roll(C_MAJOR, 3)) == "D# major"
