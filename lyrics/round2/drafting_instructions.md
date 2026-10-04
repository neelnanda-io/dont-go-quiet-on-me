# Drafting instructions for round-2 variations (for each drafting agent)

You are writing some of the 34 round-2 lyric variations. Read, in this order:
1. `lyrics/round2/feedback_neel.md` (Neel's verdict, verbatim: the most important input)
2. `lyrics/round2/variation_briefs.md` (the shared rules and your briefs)
3. `lyrics/finalists/read_your_mind/v9.lyr` (B, the backbone) and `lyrics/round2/anchors.md` (D's verse 3 + chorus, E's final chorus)
4. `lyrics/round2/drafts/01_b_cons.lyr` (the conservative control: a format exemplar, NOT a template to copy)
5. `refs/ledger_digest.md` and every file in `refs/round2/` (the verified facts; the ONLY facts you may use)

For each brief assigned to you:
- Write `lyrics/round2/drafts/NN_slug.lyr` and `lyrics/round2/drafts/NN_slug.concept.md` (format in variation_briefs.md).
- Validate: `.venv/bin/python tools/lyricfmt.py lyrics/round2/drafts/NN_slug.lyr` (must print "ok") and check length with
  `.venv/bin/python -c "import sys; sys.path.insert(0,'tools'); from lyricfmt import parse; from syllables import line_syl, bar_estimate, fmt; from pathlib import Path; s=parse(Path('lyrics/round2/drafts/NN_slug.lyr')); L=[l for x in s['sections'] for l in x['lines']]; print(len(L), sum(line_syl(l['sung']) for l in L), fmt(bar_estimate(s,(),145)))"`

Self-check every draft before you finish:
- [ ] Storyline and flow first: read it top to bottom as a story. Any line that only exists to name a paper? Give it a story job or cut it. (Neel on draft A: "shoehorned a bunch of papers into lines and smushed them together".)
- [ ] The arc: early mech interp → SAE/dictionary era → the pragmatic turn (own verse, after SAEs) → short eval-awareness beat (Wood Labs / Sonnet looking perfectly aligned / obvious test cues) → J-Lens, activation oracles and their issues, NLAs, the dream of meta-models (models doing interp for us) → GPT-6 Astra's hard-to-monitor chain of thought and a darker ending (need for interp; wry job security). Deviations only where your brief says so.
- [ ] No tuned lens. NLAs feature. Real J-Lens and emotions-paper content (not "functional emotions" as the hook).
- [ ] Every factual line has `## refs:` and a `## note:` naming the verified source; quote marks only around verbatim text from the ledger or refs/round2; no invented quotes, numbers or outputs; nothing from digest section 11; Astra's architecture never stated as fact.
- [ ] Singable: mostly 6–12 syllables, jargon at stressed line ends, acronyms respelled via `|| sung:`, real rhymes.
- [ ] 44–56 sung lines unless the brief says otherwise (#32 is short).
- [ ] Genuinely different from the other drafts and from the control: commit to your brief's idea.

Do not call any LLM judges, do not commit to git, and do not edit files other than your own drafts. When done, reply with one line per draft: file, line count, the hook, and the one line you're proudest of.
