"""tools/build_shootout_page.ascii_safe: non-ASCII becomes a JS escape inside <script> and an HTML entity elsewhere.

Bug (1 Oct 2026): the whole page went through xmlcharrefreplace, so "▶" inside a JS string rendered as the literal
text "&#9654;". Run: .venv/bin/python -m pytest tests -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
from build_shootout_page import ascii_safe  # noqa: E402


def test_script_gets_js_escapes_and_html_gets_entities():
    out = ascii_safe('<p>“hi”</p><script>const a = "▶ A";</script>')
    assert out == '<p>&#8220;hi&#8221;</p><script>const a = "\\u25b6 A";</script>'
    assert out.isascii()


def test_astral_characters_become_surrogate_pairs_in_js():
    assert ascii_safe("<script>x='\U0001f44d'</script>") == "<script>x='\\ud83d\\udc4d'</script>"
