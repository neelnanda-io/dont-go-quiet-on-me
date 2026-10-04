# Real data for the redrawn interp figures

Data behind the video's hand-drawn versions of five well-known interpretability figures. Every number here comes from a model that was actually trained or run, not traced from a published plot. Each JSON file has a `provenance` block: model, training, seed, date, script, library versions.

- [Summary](#summary)
- [Rebuilding](#rebuilding)
- [grokking.json](#grokkingjson)
- [superposition.json](#superpositionjson)
- [induction.json](#inductionjson)
- [refusal.json](#refusaljson)
- [logit_lens.json](#logit_lensjson)
- [What can honestly go on screen](#what-can-honestly-go-on-screen)

---

## Summary

| File | Source | Headline numbers | Size |
|---|---|---|---|
| `grokking.json` | 1-layer transformer we trained, (a+b) mod 113, seed 0 | train acc 100% by step 200; test acc 23% at step 5k → 99% at step 6,900; key frequencies **1, 21, 42, 49** (causally checked) | ~0.4 MB |
| `superposition.json` | Toy model we trained, 5 features in 2 dims, seeds 0–5 | pentagon on 12/12 sparse runs; 2 orthogonal features on 6/6 dense runs (paper importance) | ~0.6 MB |
| `induction.json` | Pretrained GPT-2 small, repeated random tokens | top induction head **L5H5** (score 0.93); previous-token head **L4H11** (0.99); loss 13.7 → 0.74 nats on the second copy | ~0.07 MB |
| `refusal.json` | Real Qwen2.5-1.5B-Instruct activations, copied from an earlier project, `video-scratch` (not in this repo) | ablating the direction: refusals 91% → 3%; adding it: 9% → 97% (held-out prompts) | ~0.04 MB |
| `logit_lens.json` | Pretrained GPT-2 small, IOI sentence | " Mary" becomes the top guess after layer 9 (p = 0.998); final output p = 0.68 | ~0.01 MB |

## Rebuilding

Environment: `figenv/` (uv venv, Python 3.12, torch 2.14, **transformer_lens 2.18**, numpy 1.26). TransformerLens 4.0 removed `HookedTransformer`, so the venv pins 2.x:

```bash
uv venv figenv --python 3.12
uv pip install --python figenv/bin/python torch numpy "transformer_lens<3" einops python-dotenv
figenv/bin/python scripts/figures/grokking.py            # ~7 min on CPU (M4 Pro)
figenv/bin/python scripts/figures/grokking_ablation.py   # adds the key-frequency causal check
figenv/bin/python scripts/figures/superposition.py   # ~1 min
figenv/bin/python scripts/figures/induction.py       # <1 min (+ GPT-2 download the first time)
figenv/bin/python scripts/figures/logit_lens.py      # <1 min
figenv/bin/python scripts/figures/refusal.py         # instant (copies existing data)
```

Scripts are in `scripts/figures/`, with shared helpers (provenance, rounding, JSON writing) in `scripts/figures/common.py`. Run logs are in `logs/figures/`. Floats are rounded to 4 decimals (attention patterns to 3).

## grokking.json

**What it is.** A small-scale reproduction of Nanda et al. 2023 ("Progress measures for grokking via mechanistic interpretability"). A 1-layer transformer (d_model 128, 4 heads, d_mlp 512, ReLU, no LayerNorm) trained on `a b =` → `(a + b) mod 113`, on 30% of all 113² pairs, with full-batch AdamW (lr 1e-3, weight decay 1.0, betas 0.9/0.98). Loss is computed in float64 on CPU. Seed 0 for both the model init and the train/test split.

**What happened (seed 0, 12,900 steps, 7 min on CPU).**
- **Memorisation**: train accuracy hits 100% by step 200. Test loss rises from 4.7 to ~27 nats by step 2k.
- **Circuit formation**: test accuracy creeps from ~4% (step 1k) to 23% (step 5k) while the embedding concentrates on a few frequencies. The share of embedding norm² in the final key frequencies goes from 8% at init to 30% by step 5k.
- **Grokking**: test accuracy is 50% at step 5,800, 90% at 6,500 and **99% at 6,900**. Test loss falls from 11 nats (step 5k) to 1e-5 (step 7.5k). The weight norm falls from 59 (step 1k) to 30.
- **Cleanup**: we ran 6,000 steps past the 99% point. Test loss settles at 1.4e-7, and the key-frequency share reaches 98.8%.
- **Key frequencies: 1, 21, 42, 49.** Their final embedding norms are 7.3, 5.5, 3.2 and 6.9. The next biggest are 2 (0.85) and 15 (0.65), then noise at ~0.2. These differ from the paper's (14, 35, 41, 42, 52) because key frequencies depend on the seed.
- **Causal check** (`scripts/figures/grokking_ablation.py`, stored under `embedding_ablation`): keep only the constant term plus the 4 key frequencies in the number embeddings, zeroing the other 52, and test accuracy stays at **100%**. Remove just those 4 and it drops to **0.96%**, which is chance (1/113). This is an embedding-only version of the paper's restricted/excluded loss.

Our run grokked sooner than the paper's main run (~7k vs ~10k steps). We trained one seed only, so we can't say how typical that is. The phase boundaries above are our reading of the curves; we did not compute the paper's progress measures exactly.

**Keys.**
- `summary`: grokking steps, final metrics, `key_frequencies`, `minor_frequencies`, the top-10 frequencies by final norm.
- `curves`: every 100 steps. `step`, `train_loss`, `test_loss` (natural-log cross-entropy; use a log y-axis), `train_acc`, `test_acc`, `weight_norm` (L2 norm of all parameters; it falls during the circuit-formation and cleanup phases).
- `embedding_fourier.checkpoints`: every 250 steps. `norms[i]` = the norm of the number embeddings along frequency `i+1` (cos and sin combined), for k = 1..56. This is the "key frequencies emerge" bar chart: roughly flat at step 0, sparse spikes at the end. `frac_norm2_in_key_freqs` is the share of embedding norm² in the final key frequencies. It rises from 8% at init to 98.8%.
- `embedding_circles.circles`: one entry per key frequency k. `frames` (every 250 steps) give `xy[a]` for tokens a = 0..112: the embeddings projected onto the final model's cos_k/sin_k plane. In the final frame, token a sits at angle 2πka/113 on a clean circle (mean angle error 0.5–1.0° for k = 1, 21, 49 and 1.6° for k = 42). Earlier frames use the same plane, so you see a noisy blob turn into a circle. For **k = 1** the circle has the numbers in order, like a clock face.

A checkpoint of the final model is at `data/figures/checkpoints/` (`grokking_mod113_seed0_step*.pt`, a TransformerLens state dict plus config), in case we want neuron-level plots later.

## superposition.json

**What it is.** The ReLU-output toy model from Elhage et al. 2022 ("Toy Models of Superposition"): `x' = ReLU(WᵀWx + b)`, where W is 2×5. Each feature is present with probability p, with a value drawn from U[0,1]. Trained as in the paper's colab: AdamW lr 1e-3, batch 1024, 10k steps. There are 4 regimes × 6 seeds:

| Regime | p | Importance | Result |
|---|---|---|---|
| `sparse_p0.05_equal_importance` | 0.05 | all 1 | **pentagon** on 6/6 seeds (all norms ≈ 1.13, 72° apart) |
| `dense_p1.0_equal_importance` | 1.0 | all 1 | **messy**: 2–3 strong features plus 2–3 half-represented ones |
| `sparse_p0.05_importance_0.9^i` | 0.05 | 0.9^i (paper) | **pentagon** on 6/6 seeds |
| `dense_p1.0_importance_0.9^i` | 1.0 | 0.9^i (paper) | **two orthogonal unit features** (the two most important), others → 0, on 6/6 seeds |

**Why the dense equal-importance case is messy.** When every feature is always on and all features matter equally, every 2-D subspace reconstructs equally well (loss ≈ 3 × Var(U[0,1]) = 0.25). Nothing then pushes the model toward a clean axis-aligned answer. The paper breaks this tie with decaying importance. **For the "pentagon vs two orthogonal directions" contrast, use the matched `_importance_0.9^i` pair.** The only difference between those two runs is sparsity. The equal-importance sparse pentagon is equally clean if you prefer it.

**Keys.** `runs[]` has one entry per (regime, seed). Each entry has `frames[]` with `step`, `W_cols` (5 × [x, y]: draw feature i as an arrow from the origin) and `b`. Frames are every 10 steps up to 500, then every 100 up to 10,000 (146 frames). Each entry also has `final` (norms, angles, gaps, shape label) and `loss_every_100`. `summary[regime].settle_step_by_seed` gives when the shape stops changing: ~1k–2.6k steps for the sparse pentagons, ~5–7k for the dense runs, where the unimportant features die slowly.

## induction.json

**What it is.** Pretrained GPT-2 small (TransformerLens) on BOS + 30 random tokens + the same 30 tokens again. Scores are averaged over 32 random sequences (seed 0). The saved patterns are from sequence 0.

- **Top induction heads**: L5H5 (0.926), L6H9 (0.891), L7H10 (0.890), L5H1 (0.887), L7H2 (0.803). These match the heads reported in the literature. Score = mean attention from each second-copy position q to key q−29 (the token after the previous occurrence).
- **Top previous-token head**: L4H11 (0.989 mean attention to q−1). The next is L3H7 at 0.54.
- **Loss**: mean 13.7 nats on the first copy (random tokens; worse than the uniform 10.8 because the model makes confident wrong guesses), then **0.74 nats on the second copy**. Per position it drops from ~11 to 3.1 to 0.9 over the first three tokens of the repeat, then stays at ~0.1–0.5.

**Keys.** `induction_head.pattern` is the 60×60 pattern with the BOS row and column dropped. Row i is the query and column j the key, so it is lower-triangular. The induction stripe is the off-diagonal at j = i − 29 in the lower-left block. `pattern_with_bos` is the full 61×61 softmax. `attn_to_bos` is what was removed (L5H5 sends ~48% of its attention to BOS on average, mostly in the first half where there is nothing to copy). `previous_token_head` has the same layout for L4H11 (a sharp sub-diagonal). `scores.*_grid` are 12×12 [layer][head] heatmaps. `loss.example` and `loss.batch_mean` are per-position losses (index t predicts token t+1). `example_token_strs` gives the actual random tokens (odd fragments like " sexes", " spit", " McF". **Check any on-screen token text first**).

## refusal.json

**What it is.** Copied without recomputation from `video-scratch/data/activations_2d.json` (an earlier project, not in this repo; `scripts/figures/refusal.py` reads it from `REFUSAL_ACTIVATIONS`, default `../video-scratch/` next to this repo) (written 2026-09-29 by `video-scratch/data_pipeline/compute_refusal_direction.py`, forward passes only). That project reproduced Arditi et al. 2024 ("Refusal in Language Models Is Mediated by a Single Direction") on **Qwen2.5-1.5B-Instruct**. The activations are residual-stream inputs to layer 17 of 28, at the last prompt token, for 128 harmful + 128 harmless instructions from the paper's own dataset splits (plus 32 + 32 held out).

- x = projection onto the refusal direction r̂ (difference in means, harmful − harmless). y = top principal component orthogonal to r̂. Both axes are in raw residual units, so the geometry is faithful. The class means sit at x = ±10.18 (|r| = 20.36).
- `ablation_target_x` = −10.71. Directional ablation moves every point horizontally to this x (y unchanged), which lands them on the harmless cluster. Adding r moves points right by |r|.
- `causal_check_held_out`: ablation takes harmful prompts from 91% to 3% refusing. Addition takes harmless prompts from 9% to 97%. KL on harmless prompts under ablation is 0.08. "Refusing" means the next-token refusal metric is > 0, measured from forward passes, not generated text.
- `per_layer_cos`: cosine with r̂ at each of the 28 layers. The classes separate in the middle layers.
- `points.*.text` holds the instructions. **The harmful ones are real harmful requests from public benchmarks. Don't put them on screen without review.** The dots alone are safe.

## logit_lens.json

**What it is.** Pretrained GPT-2 small on "When Mary and John went to the store, John gave a drink to" (the IOI task). The residual stream after 0..12 layers is decoded with the model's own final LayerNorm + unembedding (logit lens). The last row equals the model's real output (asserted in the script).

At the final position the top guess moves through generic verbs (" get", " make"), then " drink"/" accompany" (layers 3–6), " the" (7) and " them" (8). **" Mary" first becomes the top guess after layer 9, at p = 0.998** (logit diff Mary − John = 14.0). After that it **falls** to 0.97 (layer 10) and **0.68 at the output** (logit diff 3.4). That drop fits the IOI paper's negative name-mover heads in layers 10–11. So the guess sharpens to " Mary" and then partly softens: it does not rise steadily all the way. Layer 0 (raw embeddings) decodes to junk fragments (" destro"). That is normal for the logit lens on GPT-2, but you may want to start the animation at layer 1.

**Keys.** `final_position[d]` has the top-5 tokens with probabilities, plus the prob, rank and logit of " Mary" and " John", and the logit difference. `grid.top1_token[d][t]` and `grid.top1_prob[d][t]` give the classic full logit-lens grid over all 15 positions × 13 depths.

## What can honestly go on screen

| Figure | OK to say | Don't say |
|---|---|---|
| Grokking | "Real data: a 1-layer transformer we trained on addition mod 113 (seed 0)"; "it memorised the training set by step 200; test accuracy jumped from ~20% to 100% between steps 5,000 and 7,000"; "key frequencies 1, 21, 42, 49" (for *this* run) | That these are the paper's key frequencies (the paper's run had 14, 35, 41, 42, 52; frequencies are seed-dependent); that it is the paper's exact run |
| Superposition | "Real data: a toy model we trained; 5 features, 2 dimensions"; "sparse features → pentagon; dense → 2 orthogonal features" (using the matched 0.9^i pair) | That it is Anthropic's model; that equal-importance dense training gives a clean 2-feature picture (it doesn't) |
| Induction | "Real attention pattern from GPT-2 small, head L5H5"; "previous-token head L4H11"; "loss drops from ~14 to ~0.7 nats on the repeat" | That L5H5 is *the* only induction head (L6H9, L7H10, L5H1 are close behind) |
| Refusal | "Real activations from Qwen2.5-1.5B-Instruct, layer 17"; "removing this one direction: refusals 91% → 3%" | That it is Llama/Gemma or the paper's own plot; showing harmful prompt text unreviewed |
| Logit lens | "Real GPT-2 small, layer by layer"; "by layer 9 it's sure it's Mary" | That confidence rises steadily to the end (it peaks at layer 9) |
