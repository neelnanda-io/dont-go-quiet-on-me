"""tools/suno_prep.py build(): a style's spoken-aside tag replaces every bare "[Spoken]".

Bug (1 Oct 2026): the new parameter was named `spoken`, and the loop's `lines, spoken = suno_lines(...)` overwrote it
with a bool, so the comic styles silently kept a bare "[Spoken]". Run: .venv/bin/python -m pytest tests -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import suno_prep  # noqa: E402


def test_style_spoken_tag_replaces_every_bare_spoken():
    ly, _ = suno_prep.build("dgq", "v9", True, None, "Spoken | deadpan")
    tags = [ln for ln in ly.splitlines() if ln.startswith("[Spoken")]
    assert tags == ["[Spoken | deadpan]", "[Spoken | deadpan]"]   # the mech-interp aside and the job-security aside


def test_no_tag_keeps_plain_spoken():
    ly, _ = suno_prep.build("dgq", "v9", True, None)
    assert [ln for ln in ly.splitlines() if ln.startswith("[Spoken")] == ["[Spoken]", "[Spoken]"]
