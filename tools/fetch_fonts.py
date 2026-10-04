"""Vendor web fonts locally for the animation kit (video/kit/assets/fonts), so renders never hit the network.

Usage: python tools/fetch_fonts.py            (idempotent; re-run after editing FAMILIES)

Google Fonts: asks the CSS2 API with a modern Chrome user agent (so it answers with woff2), keeps only the
`latin` (+ `latin-ext`) unicode-range blocks, downloads each file and writes fonts.css with local @font-face rules.
All families below are SIL Open Font License 1.1 (checked on fonts.google.com); OFL allows bundling in a project
and rendering into video with no attribution requirement, but we credit them in the making-of anyway.
Computer Modern (CMU Serif, OFL) comes from the `computer-modern` npm package on jsdelivr, for arXiv-style paper cards.
"""
import re
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "video/kit/assets/fonts"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")
# CSS2 family specs (see https://developers.google.com/fonts/docs/css2)
FAMILIES = [
    # K-pop / poster display
    "Black+Han+Sans", "Dela+Gothic+One", "Bagel+Fat+One", "Anton", "Archivo+Black",
    "Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900",
    "Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800", "Unbounded:wght@200..900",
    "Big+Shoulders+Display:wght@100..900", "Syne:wght@400..800", "Rubik+Mono+One", "Outfit:wght@100..900",
    # editorial / paper
    "Instrument+Serif:ital@0;1", "Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800",
    "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900",
    # HUD / code / terminal / pixel
    "IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400", "JetBrains+Mono:ital,wght@0,100..800;1,100..800",
    "DotGothic16", "Silkscreen:wght@400;700", "VT323", "Noto+Sans+Math",
    # hand
    "Permanent+Marker", "Caveat:wght@400..700", "Gaegu:wght@300;400;700", "Shantell+Sans:ital,wght@0,300..800;1,300..800",
]
CMU = {  # file in the npm package's fonts/ dir -> (family, weight, style)
    "cmu-serif-500-roman": ("CMU Serif", 400, "normal"), "cmu-serif-700-roman": ("CMU Serif", 700, "normal"),
    "cmu-serif-500-italic": ("CMU Serif", 400, "italic"), "cmu-typewriter-text-500-roman": ("CMU Typewriter", 400, "normal"),
    "cmu-sans-serif-500-roman": ("CMU Sans", 400, "normal"),
}
CMU_BASE = "https://cdn.jsdelivr.net/npm/computer-modern@0.1.3/fonts/{}.woff2"
# Adobe Blank (OFL): every code point is a zero-width glyph. Used ONLY as the fallback in the glyph-coverage check
# (type.js missingGlyphs): a character the real font lacks falls through to it and measures 0 wide.
BLANK = "https://cdn.jsdelivr.net/gh/adobe-fonts/adobe-blank@master/AdobeBlank.otf.woff"


def keep_subsets(fam):
    """latin(+ext) for text faces; Noto Sans Math is the deliberate fallback for arrows and maths (→ ↓ ≈ ×), which the
    display and mono faces lack on Google Fonts, so it keeps its 'math' and 'symbols' subsets too."""
    return {"latin", "latin-ext", "math", "symbols", "all"} if fam.startswith("Noto+Sans+Math") else {"latin", "latin-ext", "all"}


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rules = []
    for fam in FAMILIES:
        css = get(f"https://fonts.googleapis.com/css2?family={fam}&display=block")
        blocks = re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, flags=re.S)
        if not blocks:   # single-file families are served as one unlabelled block
            blocks = [("all", b) for b in re.findall(r"@font-face \{.*?\}", css, flags=re.S)]
        kept = 0
        for subset, block in blocks:
            if subset not in keep_subsets(fam):
                continue
            url = re.search(r"url\((https://[^)]+)\)", block).group(1)
            name = re.sub(r"[^a-zA-Z0-9]+", "_", url.split("/s/")[-1])[-90:]
            f = OUT / name
            if not f.exists():
                f.write_bytes(get(url, binary=True))
            rules.append(block.replace(url, name))
            kept += 1
        print(f"{fam.split(':')[0]:<24} {kept} blocks")
    # Computer Modern (CMU, OFL) for arXiv-style paper cards
    for fn, (fam, wt, st) in CMU.items():
        f = OUT / f"{fn}.woff2"
        if not f.exists():
            f.write_bytes(get(CMU_BASE.format(fn), binary=True))
        rules.append(f"@font-face {{ font-family: '{fam}'; font-style: {st}; font-weight: {wt}; "
                     f"font-display: block; src: url({f.name}) format('woff2'); }}")
        print(f"{fam} {wt} {st}")
    f = OUT / "AdobeBlank.otf.woff"
    if not f.exists():
        f.write_bytes(get(BLANK, binary=True))
    rules.append("@font-face { font-family: 'Adobe Blank'; src: url(AdobeBlank.otf.woff) format('woff'); font-display: block; }")
    (OUT / "fonts.css").write_text("/* generated by tools/fetch_fonts.py (all SIL OFL 1.1) */\n" + "\n".join(rules) + "\n")
    print(f"wrote {OUT/'fonts.css'} ({len(rules)} @font-face rules)")


if __name__ == "__main__":
    main()
