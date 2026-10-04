# Suno create page: what's there (driven in a logged-in desktop Chrome; first checked 2026-09-30, corrected 2026-10-01 after the dgq run)

## Fields
- Mode tabs: Simple / **Advanced** / Sounds. Model dropdown shows **v6** (keep v6, not v6-wild / v6-mini, for finals).
- Advanced form: Lyrics box (**5,000** chars), **Styles** (**1,000** chars), **Exclude styles**, Song Title,
  **More Options** expander with **Weirdness**, **Style Influence**, **Variety** sliders, **Vocal Gender** (Male / Female),
  **Personalize: My Taste**, **Max Mode**, **Duration**.
- **Personalize: My Taste** (under More Options) is the real taste toggle. Keep it **Off** (it was Off on 2026-10-01).
- **Never click the magic-wand button under Styles** ("Personalize style prompt to match your taste"). It is NOT a
  toggle: each click WRITES a new style prompt into the Styles box (one click on 2026-10-01 produced a garage-rock
  prompt, which had to be overwritten). The 2026-09-30 version of these notes wrongly called it an on/off switch.
- Max Mode Off; Duration Auto (full songs came back at 3:30-4:30 for a 682-syllable lyric).
- Vocal Gender is a stronger signal than a Styles word; Exclude also covers it.

## Filling the form from JS (javascript_tool), verified on the dgq run
- **Lyrics** is a Lexical contenteditable, `[aria-label="Lyrics editor"]`.
  - `document.execCommand('insertText')` drops the newlines, so everything lands on one line. Use a synthetic paste instead:
    `ed.focus(); const dt = new DataTransfer(); dt.setData('text/plain', text);
     ed.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true}))`.
  - `execCommand('selectAll'/'delete')` does not clear it. Clear with REAL keys: focus the editor, then `cmd+a`, `BackSpace`
    (computer tool). Refuse to paste unless the editor is empty, or the old lyrics stay above the new ones.
  - Verify after pasting: paragraph count, first/last line, `[End]` present.
- **Styles** is a textarea (placeholder starts "polish"); **Exclude** is an input (placeholder "Exclude styles");
  **Title** is an input ("Song Title (Optional)"). React ignores `el.value = x`; use the native setter, then fire `input`:
  `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, x);
   el.dispatchEvent(new Event('input', {bubbles: true}))` (HTMLInputElement.prototype for inputs).
- **Sliders** are `role=slider` with `aria-valuenow` (Weirdness 0-100, Style Influence 0-100, Variety 0-4).
  Set them by focusing and pressing arrow keys (step 1); read back `aria-valuenow`.
- **Vocal Gender**: the selected button carries the standalone class `text-foreground-primary`. Check it with
  `btn.classList.contains('text-foreground-primary')`. `className.includes(...)` is WRONG: it also matches the unselected
  button's `hover:text-foreground-primary`, which once left Female selected for a male style (caught before Create).
- **Create**: `aria-label="Create song"`. Each click is one generation = **2 takes**. Click with the mouse (not JS) and
  wait ~6 s between clicks.

## Workspace list
- Rows are links `a[href^="/song/<uuid>"]`; new generations appear at the top with a spinner, title as typed.
- The list is virtualized and the "Unlock Your Sound" onboarding panel covers its bottom; a DOM count can be stale.
  Confirm with a screenshot after scrolling the list to the top.

- **Thumbs**: each row's "Like clip" button carries the class `hxc-btn-variant-primary` when liked
  (`hxc-btn-variant-standard-legacy` when not); the dislike button works the same way. Likes made on another device
  only show after a page reload. This is how Neel's listening verdicts are read (he thumbs takes in Suno).

## Budget hygiene
- Downloads are limited by the Suno plan: screen takes by duration and listening-free checks
  in the workspace list first, download only survivors, and log every download in `audio/suno/<slug>/takes.json`.
- Never grab stream URLs to dodge the download counter.

## Tooling gotcha
- browser_batch `wait` is capped at 10 s per action; a longer wait fails the batch at that step (the clicks before it
  still happened). Chain two waits instead.

## Replace Section (verified 2026-10-03, the Astra re-sing)
- The Create-page "Replace section" (song menu, Edit, Replace Section) IGNORES its lyrics box: two runs (synthetic paste, then
  real typing) came back with stored lyrics = the song up to the section and nothing for it, i.e. an instrumental section.
- What works: song menu, Edit, Open in Editor, then the "Legacy Editor" link (suno.com/edit-legacy/<id>). Type the times in
  the two inputs (end first), edit the section's lines IN PLACE in the full-song lyrics (one Lexical contenteditable; select a
  line's text node with a DOM Range, then type over it with real keys), check the gear: Keep Duration on, Instrumental off.
  "Generate Replacements" makes 2. Verify: the replacement's song page lyrics contain the new lines.
- The new Song Editor snaps selections to bars (hold cmd to disable), so exact times are easier in the Legacy Editor.
- Replacements are listed in the editor's EDITS panel (Replacement #n), and in the workspace as SECTION clips.
