"""Regression test: tools/vocal_qa.py's Demucs stem cache must be keyed by the audio's CONTENT, not its file name.

Bug (30 Sep 2026): the cache was STEMS/htdemucs/<file stem>/vocals.wav, so re-rendering a sketch under the same name
(audio/sketches/r3/C_chorus.mp3) silently reused the FIRST render's vocals; QA kept "hearing" a word the new render
never sang. Run with the project venv: .venv/bin/python -m pytest tests/test_vocal_qa_cache.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import vocal_qa  # noqa: E402


def _fake_demucs(monkeypatch):
    """Stand in for the Demucs subprocess: write vocals.wav where Demucs would, for whatever input it was given."""
    def run(cmd, check, capture_output):
        out_root, audio = Path(cmd[cmd.index("-o") + 1]), Path(cmd[-1])
        d = out_root / "htdemucs" / audio.stem
        d.mkdir(parents=True, exist_ok=True)
        (d / "vocals.wav").write_bytes(audio.read_bytes())  # "vocals" = a copy of the input, so we can tell them apart
    monkeypatch.setattr(vocal_qa.subprocess, "run", run)


def test_same_name_different_audio_gets_different_stems(tmp_path, monkeypatch):
    monkeypatch.setattr(vocal_qa, "STEMS", tmp_path / "stems")
    _fake_demucs(monkeypatch)
    first, second = tmp_path / "a" / "C_chorus.mp3", tmp_path / "b" / "C_chorus.mp3"
    for f, data in ((first, b"render one"), (second, b"render two")):
        f.parent.mkdir(parents=True)
        f.write_bytes(data)
    s1, s2 = vocal_qa.separate(first), vocal_qa.separate(second)
    assert s1 != s2
    assert s2.read_bytes() == b"render two"


def test_same_audio_reuses_its_stem(tmp_path, monkeypatch):
    monkeypatch.setattr(vocal_qa, "STEMS", tmp_path / "stems")
    _fake_demucs(monkeypatch)
    f = tmp_path / "x.mp3"
    f.write_bytes(b"same")
    assert vocal_qa.separate(f) == vocal_qa.separate(f)
