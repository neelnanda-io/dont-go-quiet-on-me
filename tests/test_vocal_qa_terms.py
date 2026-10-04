"""tools/vocal_qa.py term checks must accept alternative spellings ('|'-separated).

Why: the lyrics are sung from singer respellings ("SON-it", "JAY-lens", "EN-EL-AY") but transcribers write the real word
("Sonnet", "J-Lens", "NLA"), so a single spelling reported every jargon term as unheard (round 3: N-L-A "missed" by both).
Run with the project venv: .venv/bin/python -m pytest tests/test_vocal_qa_terms.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import vocal_qa  # noqa: E402


def test_any_alternative_spelling_counts():
    assert vocal_qa.term_heard("Sonnet|son it", "the tests were clumsy, cartoonish, and Sonnet, you'd guessed")
    assert vocal_qa.term_heard("NLA|n l a|en el ay", "the N-L-A read me what you thought")
    assert vocal_qa.term_heard("J-Lens|jay lens", "the J-Lens caught you thinking fake")


def test_miss_is_still_a_miss():
    assert not vocal_qa.term_heard("Sonnet|son it", "and some it, you'd guessed")


def test_empty_alternative_never_matches():
    assert not vocal_qa.term_heard("Sonnet||", "nothing like it here")
