"""Induction heads in GPT-2 small, on a repeated random-token sequence.

Classic setup (Elhage et al. 2021 / Olsson et al. 2022; the ARENA / TransformerLens
demo): BOS + 30 uniformly random tokens + the same 30 tokens again.  On the second
copy, an induction head at position q attends to the token AFTER the previous
occurrence of the current token, i.e. key position q - 29 (with BOS at 0, first
copy at 1..30, second copy at 31..60), and the model's loss collapses because it
can now copy.

Head scores (averaged over a batch of random sequences):
  induction score     = mean attention from q in 31..60 to key q - 29
  previous-token score = mean attention from q in 1..60 to key q - 1

Outputs data/figures/induction.json:
  * 12 x 12 induction and previous-token score grids, top heads
  * the attention pattern of the best induction head and the best previous-token
    head on example sequence 0 (61 x 61 with BOS, and the 60 x 60 without it)
  * per-position next-token loss (example 0 and batch mean)
"""

import os
import sys

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import numpy as np
import torch
from transformer_lens import HookedTransformer

sys.path.insert(0, os.path.dirname(__file__))
from common import provenance, rnd, write_json  # noqa: E402

SEQ_HALF = 30
BATCH = 32
SEED = 0


def main():
    torch.manual_seed(SEED)
    model = HookedTransformer.from_pretrained("gpt2", device="cpu")
    model.eval()
    cfg = model.cfg

    g = torch.Generator().manual_seed(SEED)
    rand = torch.randint(0, cfg.d_vocab, (BATCH, SEQ_HALF), generator=g)
    bos = torch.full((BATCH, 1), model.tokenizer.bos_token_id)
    tokens = torch.cat([bos, rand, rand], dim=1)  # (B, 61)
    T = tokens.shape[1]

    with torch.no_grad():
        loss_per_tok, cache = model.run_with_cache(
            tokens, return_type="loss", loss_per_token=True,
            names_filter=lambda n: n.endswith("hook_pattern"))
    # patterns: (L, B, H, T, T)
    pats = torch.stack([cache["pattern", l] for l in range(cfg.n_layers)])

    q2 = torch.arange(SEQ_HALF + 1, T)           # second-copy query positions 31..60
    ind = pats[:, :, :, q2, q2 - SEQ_HALF + 1]   # attention to token after previous occurrence
    ind_score = ind.mean(dim=(1, 3))             # (L, H)
    q_all = torch.arange(1, T)
    prev = pats[:, :, :, q_all, q_all - 1]
    prev_score = prev.mean(dim=(1, 3))

    def top(score, k=6):
        flat = score.flatten()
        idx = flat.argsort(descending=True)[:k]
        return [{"head": f"L{int(i) // cfg.n_heads}H{int(i) % cfg.n_heads}",
                 "layer": int(i) // cfg.n_heads, "head_index": int(i) % cfg.n_heads,
                 "score": float(flat[i])} for i in idx]

    top_ind, top_prev = top(ind_score), top(prev_score)
    bi, bp = top_ind[0], top_prev[0]
    print("top induction heads:", [(h["head"], round(h["score"], 3)) for h in top_ind])
    print("top previous-token heads:", [(h["head"], round(h["score"], 3)) for h in top_prev])

    def pattern(h, b=0):
        full = pats[h["layer"], b, h["head_index"]].numpy()  # (61, 61)
        return {"head": h["head"], "score": h["score"],
                "pattern_with_bos": np.round(full, 3),
                "pattern": np.round(full[1:, 1:], 3),
                "attn_to_bos": np.round(full[1:, 0], 3)}

    lpt = loss_per_tok.numpy()  # (B, 60): loss at position t predicting token t+1
    half1 = lpt[:, :SEQ_HALF - 1].mean()  # predicting tokens 2..30 (first copy; unpredictable)
    half2 = lpt[:, SEQ_HALF:].mean()      # predicting tokens 31..60's successors (second copy)
    print(f"mean loss first copy {half1:.2f} nats, second copy {half2:.2f} nats")

    ex_tokens = tokens[0].tolist()
    out = {
        "provenance": provenance(
            __file__,
            what="Attention patterns and loss of pretrained GPT-2 small on a repeated random-token sequence",
            model="gpt2 (GPT-2 small, 124M, OpenAI weights) via TransformerLens HookedTransformer.from_pretrained('gpt2') "
                  "(default processing: LayerNorm folded, weights centred; attention patterns are unaffected)",
            input=f"BOS + {SEQ_HALF} random token ids (uniform over the {cfg.d_vocab}-token vocab) + the same {SEQ_HALF} again; "
                  f"batch of {BATCH} such sequences, torch.Generator seed {SEED}; example = sequence 0",
            seed=SEED, device="cpu",
        ),
        "positions_note": ("index 0 = BOS, 1..30 = first copy, 31..60 = second copy (token at q equals token at q-30). "
                           "An induction head at query q (>=31) attends to key q-29. pattern = 60x60 with BOS row/col "
                           "dropped (rows then sum to 1 - attn_to_bos); pattern_with_bos = the full 61x61 softmax. "
                           "pattern[i][j] = attention FROM query i TO key j (lower-triangular)."),
        "example_tokens": ex_tokens,
        "example_token_strs": model.to_str_tokens(tokens[0]),
        "scores": {
            "induction_score_grid": ind_score.numpy(),   # [layer][head]
            "previous_token_score_grid": prev_score.numpy(),
            "induction_score_def": "mean attention from second-copy queries q=31..60 to key q-29, averaged over the batch",
            "previous_token_score_def": "mean attention from q=1..60 to key q-1, averaged over the batch",
            "top_induction_heads": top_ind,
            "top_previous_token_heads": top_prev,
        },
        "induction_head": pattern(bi),
        "previous_token_head": pattern(bp),
        "loss": {
            "note": ("loss[t] = cross-entropy (nats) of predicting token t+1 from positions 0..t; t = 0..59. "
                     "t=0..29 predict the first copy (random, so ~uniform-ish loss), t=30 predicts the first token "
                     "of the second copy (still unpredictable), t>=31 can be copied by induction."),
            "example": lpt[0],
            "batch_mean": lpt.mean(0),
            "mean_first_copy_nats": float(half1),
            "mean_second_copy_nats": float(half2),
            "uniform_baseline_nats": float(np.log(cfg.d_vocab)),
        },
    }
    write_json("induction.json", rnd(out, 4))


if __name__ == "__main__":
    main()
