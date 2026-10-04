# Manim gotchas and fixes (Manim Community 0.21)

Every one of these cost real time on the refusal-direction video (September 2026). The fixes lived in that project's scene-helper module (`common.py` in SKILL.md's component table), which is not included in this repo; each fix is described below in enough detail to rebuild it.

## Contents
- [Text](#text)
- [Layout and animation](#layout-and-animation)
- [3D](#3d)
- [Rendering](#rendering)
- [Setup (macOS)](#setup-macos)
- [Shell and tooling traps](#shell-and-tooling-traps)

---

## Text
- **Kerning.** Plain `Text` lays text out at `font_size / 4.8` pt, so size 24 becomes a 5 pt font, and Pango snaps each glyph to a whole SVG unit. As a result, letter gaps are off by up to 7 px at 1080p and whole strings by up to 9% ("Describetwo", "checkp oint").
  - Fix: create text at 40× the size and scale it by 1/40.
  - **Also** set `config.pixel_width` and `config.pixel_height` huge while constructing it. Pango wraps lines at the canvas width in points, so enlarged text silently wraps otherwise.
  - This is `make_text()`; write a regression test that measures rendered letter gaps to verify it.
- **Text hidden behind its own box.** Animating a panel via `LaggedStart` / `.animate` re-adds it at the top of the draw order. Fix: give all text and MathTex `z_index=1` (the `txt` and `mtex` helpers do this).
- `Text("")` has no points, so it breaks `arrange()`. Never use one as a spacer.
- Combining characters render (e.g. "r̂"), but sit oddly. Prefer MathTex `\hat{\mathbf{r}}` in anything prominent.
- To colour parts of an equation separately, pass several strings: `MathTex(r"\mathbf{r}", "=", r"\mu")`, then colour `tex[0]`, `tex[2]`.
- Check which fonts the machine actually has before choosing one (Pango silently falls back). On the macOS machine used, Avenir Next, Helvetica Neue, Menlo, Futura and Gill Sans were available; Inter, Roboto, SF Pro and Fira Code were not.

## Layout and animation
- `group.set_opacity(1)` forces every fill opaque, so pill backgrounds covered their own label. To dim, use `.fade(0.6)`; to restore, use `save_state()` then `Restore` / `Transform(m, m.saved_state)`.
- Attributes that aren't submobjects (e.g. `panel.bar_to`) don't move when the parent is arranged. Re-anchor them after layout.
- Sync to narration with `self.renderer.time`. `beat()` records each beat's start; `wait_until(frac, d)` waits until that fraction of the clip has played.
- Keep animations under the clip length. `beat()` warns "`[narration] … overran the audio`" when they aren't.
- Check the right edge (x ≈ 7.1) on every contact sheet; long labels are the usual overflow. Use `wrap_text(s, max_width)`, which wraps using real rendered widths.

## 3D
- Use `NarratedThreeDScene`.
  - Fixed-in-frame text: `self.add_fixed_in_frame_mobjects(m)`, then `self.remove(m)`, then `FadeIn(m)` later.
  - Labels that always face the camera: `add_fixed_orientation_mobjects`.
- `Arrow3D` surfaces are rebuilt every frame under `begin_ambient_camera_rotation`, which renders at about 1 fps at 480p. Use `resolution=12` and keep 3D beats short. The 3D scene is the long pole of the whole build.
- Frame the shot with `set_camera_orientation(phi=64*DEGREES, theta=-52*DEGREES, zoom=1.2, frame_center=[0, 0, 0.35])`. Check it with a still before rendering: `manim -ql -s -n 0,3 file.py Scene`.

## Rendering
- **Parallel renders race on the shared `media/texts/<hash>_.svg` temp files**, and a scene dies with `FileNotFoundError`. Fix: give each process its own `text_dir` / `tex_dir` via `--config_file` (the `render()` function in `build.py` did this). The original `preview.py` didn't, so previews had to run one at a time.
- `-r 1920,1080 --fps 30` writes to a `1080p30/` folder; `-ql` writes to `480p15/`.
- Pad each scene's audio to its exact video length before concatenating, otherwise small drifts accumulate. Normalise loudness to -16 LUFS on the joined file.
- Add subtitles as a soft `mov_text` track plus an `.srt` file. Homebrew ffmpeg has no libass, so it can't burn them in.
- Build contact sheets from the beat logs (frames at each beat's middle and end). Always also look at full-resolution crops of body text.

## Setup (macOS)
- `brew install pkgconf pango` first: `pycairo` / `manimpango` fail to build without pkg-config. Then run `uv venv .venv --python 3.12 && uv pip install --python .venv/bin/python manim openai python-dotenv`.
- TinyTeX is a user install, no sudo:
  - Install: `curl -sL https://yihui.org/tinytex/install-bin-unix.sh | sh`.
  - Put it on PATH: `~/Library/TinyTeX/bin/universal-darwin` (or have your build scripts add it themselves).
  - Then: `tlmgr install standalone preview doublestroke setspace rsfs relsize ragged2e fundus-calligra microtype wasysym physics dvisvgm jknapltx wasy cm-super babel-english gnu-freefont mathastext cbfonts-fd`.
  - `bm` isn't a separate package: it comes with `tools`.

## Shell and tooling traps
- zsh doesn't word-split `$var`. `for p in "a b" ...; set -- $p` silently breaks. Use `${=var}`, or `for s in A:a B:b; do x=${s%%:*}; y=${s##*:}`.
- macOS has no `timeout` command. For servers use a background task (`run_in_background`) and `pkill -f` when done.
- `load_dotenv(find_dotenv())` raises an AssertionError in a script piped through stdin. Run a real file, or pass the explicit path (`load_dotenv("/path/to/.env")`).
- Playwright MCP blocks `file://`. Serve with `python3 -m http.server 8765` as a background task, and save screenshots under the project directory.
- An HTML page served without a charset shows `·` as `Â·`. Write non-ASCII as entities (`s.encode("ascii", "xmlcharrefreplace")`).
