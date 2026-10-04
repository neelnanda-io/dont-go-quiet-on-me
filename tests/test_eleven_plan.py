"""tools/eleven_plan.py: ElevenLabs sections are cut from the exact text Suno gets, spoken asides become their own section.

Run with the project venv: .venv/bin/python -m pytest tests/test_eleven_plan.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import eleven_plan  # noqa: E402

SUNO_TEXT = """[Intro | whispered, then the beat drops]
Don't go quiet on me now

[Verse 3 | half-rapped, confident, a spoken aside]
Then a plain old probe hit point-nine-nine-nine
so I put the hammer down, just do what works this time
[Spoken]
Is it mech interp? Wrong question!
[Verse 3]
I don't need your every thought, just the ones that could do harm
so a probe sits by the door, and it rings a quiet alarm

[End]
"""


def test_spoken_aside_splits_the_section():
    chunks = eleven_plan.chunks_from_suno(SUNO_TEXT, ["pop"], ["mumbled vocals"], bpm=120)
    heads = [c["text"].splitlines()[0] for c in chunks]
    assert heads == ["[Intro]", "[Verse 3]", "[Spoken]", "[Verse 3]"]
    assert chunks[2]["text"].splitlines()[1] == "Is it mech interp? Wrong question!"
    assert any("spoken" in s for s in chunks[2]["positive_styles"])
    # the continuation keeps its section's cue; nothing after [End] leaks in; no tag line is ever sung
    assert "half-rapped, confident, a spoken aside" in chunks[3]["positive_styles"]
    assert all(not ln.startswith("[") for c in chunks for ln in c["text"].splitlines()[1:])


def test_sizes_are_whole_two_bar_phrases():
    chunks = eleven_plan.chunks_from_suno(SUNO_TEXT, ["pop"], [], bpm=120)  # 1 bar = 2 s at 120 BPM
    assert chunks[0]["duration_ms"] == 8000          # intro: always 4 bars
    assert chunks[1]["duration_ms"] == 8000          # two half-rapped lines = 1.5 + 1.5 = 3 bars, rounded up to 4
    assert chunks[2]["duration_ms"] == 4000          # a spoken aside: one 2-bar phrase


def test_arc_tags_stay_out_of_every_section():
    tags = eleven_plan.style_tags("dgq", "broadway")
    assert "a big finale" not in tags and "tempo and key changes" not in tags
    assert "full pit orchestra" in tags


def test_dance_break_cue_gets_room():
    text = "[Bridge | dance break with handclaps]\nyou cut a corner once\n[End]"
    assert eleven_plan.chunks_from_suno(text, [], [], bpm=120)[0]["_bars"] == 2 + 4


def test_solo_accompaniment_is_not_a_break():
    text = "[Verse 1 | solo piano and voice]\nyou never used to talk to me\n[Chorus | a violin solo, then the hook]\nla\n[End]"
    bars = [c["_bars"] for c in eleven_plan.chunks_from_suno(text, [], [], bpm=120)]
    assert bars == [2, 2 + 4]
