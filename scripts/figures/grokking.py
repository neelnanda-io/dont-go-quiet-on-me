"""Grokking on modular addition (mod 113), small-scale reproduction of
Nanda, Chan, Lieberum, Smith & Steinhardt 2023, "Progress measures for grokking
via mechanistic interpretability" (arXiv 2301.05217).

Setup follows the paper's main run:
  * input "a b =" (3 tokens; '=' is token 113), predict (a + b) mod 113 at '='
  * 1-layer transformer, d_model 128, 4 heads (d_head 32), d_mlp 512, ReLU,
    no LayerNorm, learned positional embeddings (TransformerLens HookedTransformer)
  * 30% of the 113^2 pairs for training, full-batch AdamW,
    lr 1e-3 (10-step linear warmup), weight_decay 1.0, betas (0.9, 0.98)
  * cross-entropy in float64 on CPU (the paper notes float32 log-softmax
    causes loss spikes once the loss gets tiny)

Outputs data/figures/grokking.json:
  * curves every 100 steps: train/test loss, train/test accuracy, total weight norm
  * Fourier-basis norm of the embedding per frequency (1..56) at checkpoints
  * key frequencies of the final model
  * the embedding projected onto each key frequency's (cos, sin) plane at
    checkpoints (tokens snap onto a circle, ordered by k*a mod 113)

Usage:
  figenv/bin/python scripts/figures/grokking.py            # full run
  figenv/bin/python scripts/figures/grokking.py --bench    # time 200 steps
"""

import argparse
import math
import os
import sys
import time

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import numpy as np
import torch
import torch.nn.functional as F
from transformer_lens import HookedTransformer, HookedTransformerConfig

sys.path.insert(0, os.path.dirname(__file__))
from common import provenance, rnd, write_json  # noqa: E402

P = 113


def make_data(seed: int, frac_train: float, device: str):
    """All (a, b, =) triples, shuffled with `seed`, split into train/test."""
    a = torch.arange(P).repeat_interleave(P)
    b = torch.arange(P).repeat(P)
    eq = torch.full_like(a, P)
    tokens = torch.stack([a, b, eq], dim=1)
    labels = (a + b) % P
    g = torch.Generator().manual_seed(seed)
    perm = torch.randperm(P * P, generator=g)
    n_train = int(frac_train * P * P)
    tr, te = perm[:n_train], perm[n_train:]
    return (tokens[tr].to(device), labels[tr].to(device),
            tokens[te].to(device), labels[te].to(device))


def fourier_basis() -> torch.Tensor:
    """(P, P) orthonormal basis: rows are [const, cos1, sin1, cos2, sin2, ...]."""
    x = torch.arange(P, dtype=torch.float64)
    rows = [torch.ones(P, dtype=torch.float64)]
    for k in range(1, P // 2 + 1):
        rows.append(torch.cos(2 * math.pi * k * x / P))
        rows.append(torch.sin(2 * math.pi * k * x / P))
    B = torch.stack(rows)
    return B / B.norm(dim=1, keepdim=True)


def embed_freq_norms(W_E: torch.Tensor, FB: torch.Tensor) -> np.ndarray:
    """Norm of the number-token embedding along each frequency k = 1..56.

    FB @ W_E[:P] gives the embedding's component along each Fourier basis
    vector (a (P, d_model) matrix); frequency k's norm combines its cos and sin
    rows.  Returns an array of length 56 (index 0 = frequency 1).
    """
    comp = FB @ W_E[:P].double().cpu()  # (P, d_model)
    row_norms = comp.norm(dim=1)
    cos_n = row_norms[1::2]
    sin_n = row_norms[2::2]
    return torch.sqrt(cos_n ** 2 + sin_n ** 2).numpy()


def loss_acc(model, tokens, labels):
    logits = model(tokens)[:, -1].double()
    loss = F.cross_entropy(logits, labels)
    acc = (logits.argmax(-1) == labels).double().mean()
    return loss, acc


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--data-seed", type=int, default=0)
    ap.add_argument("--max-steps", type=int, default=25000)
    ap.add_argument("--post-grok-steps", type=int, default=6000,
                    help="keep training this long after test acc first hits 99%%")
    ap.add_argument("--log-every", type=int, default=100)
    ap.add_argument("--fourier-every", type=int, default=250)
    ap.add_argument("--circle-every", type=int, default=250)
    ap.add_argument("--device", default="cpu")
    ap.add_argument("--bench", action="store_true")
    args = ap.parse_args()

    torch.manual_seed(args.seed)
    device = args.device
    cfg = HookedTransformerConfig(
        n_layers=1, n_heads=4, d_model=128, d_head=32, d_mlp=512,
        act_fn="relu", normalization_type=None, d_vocab=P + 1, d_vocab_out=P,
        n_ctx=3, init_weights=True, device=device, seed=args.seed,
    )
    model = HookedTransformer(cfg)
    opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1.0, betas=(0.9, 0.98))
    sched = torch.optim.lr_scheduler.LambdaLR(opt, lambda s: min(s / 10, 1.0))
    xtr, ytr, xte, yte = make_data(args.data_seed, 0.3, device)
    FB = fourier_basis()

    if args.bench:
        t0 = time.time()
        for _ in range(200):
            loss, _ = loss_acc(model, xtr, ytr)
            loss.backward(); opt.step(); sched.step(); opt.zero_grad()
        dt = (time.time() - t0) / 200
        print(f"{device}: {dt * 1000:.1f} ms/step -> {dt * 25000 / 60:.1f} min for 25k steps")
        return

    curves = {k: [] for k in ["step", "train_loss", "test_loss", "train_acc", "test_acc", "weight_norm"]}
    fourier_ckpts = []   # {step, norms[56]}
    W_E_snaps = {}       # step -> W_E[:P] copy, projected onto circles at the end
    first_cross = {}     # test-acc threshold -> first logged step
    stop_at = args.max_steps
    t0 = time.time()

    for step in range(args.max_steps + 1):
        train_loss, train_acc = loss_acc(model, xtr, ytr)

        if step % args.log_every == 0:
            with torch.no_grad():
                test_loss, test_acc = loss_acc(model, xte, yte)
                wn = math.sqrt(sum((p.double() ** 2).sum().item() for p in model.parameters()))
            curves["step"].append(step)
            curves["train_loss"].append(train_loss.item())
            curves["test_loss"].append(test_loss.item())
            curves["train_acc"].append(train_acc.item())
            curves["test_acc"].append(test_acc.item())
            curves["weight_norm"].append(wn)
            for thr in (0.5, 0.9, 0.99):
                if thr not in first_cross and test_acc.item() >= thr:
                    first_cross[thr] = step
                    if thr == 0.99:
                        stop_at = min(args.max_steps, step + args.post_grok_steps)
            if step % 1000 == 0:
                print(f"step {step:6d}  train {train_loss.item():.3e} ({train_acc.item():.3f})  "
                      f"test {test_loss.item():.3e} ({test_acc.item():.3f})  |W| {wn:.1f}  "
                      f"{time.time() - t0:.0f}s", flush=True)

        if step % args.fourier_every == 0 or step == stop_at:
            W_E = model.W_E.detach()
            fourier_ckpts.append({"step": step, "norms": embed_freq_norms(W_E, FB)})
            if step % args.circle_every == 0 or step == stop_at:
                W_E_snaps[step] = W_E[:P].double().cpu().clone()

        if step == stop_at:
            break
        train_loss.backward()
        opt.step(); sched.step(); opt.zero_grad()

    final_step = step
    elapsed = time.time() - t0

    # ---- key frequencies of the final embedding ----
    # Key frequencies = the frequencies above the largest multiplicative gap in
    # the sorted norms (looking at the top 12).  "Minor" = anything else above 4x
    # the median (small but non-noise components that do NOT form clean circles).
    final_norms = fourier_ckpts[-1]["norms"]
    order = np.argsort(-final_norms)
    top_sorted = final_norms[order[:12]]
    n_key = int(np.argmax(top_sorted[:-1] / top_sorted[1:])) + 1
    key_freqs = sorted(int(k + 1) for k in order[:n_key])
    med = float(np.median(final_norms))
    minor_freqs = sorted(int(k + 1) for k in order[n_key:] if final_norms[k] > 4 * med)
    frac_in_key = float((final_norms[[k - 1 for k in key_freqs]] ** 2).sum() / (final_norms ** 2).sum())
    print(f"key frequencies: {key_freqs} ({frac_in_key:.1%} of embedding norm^2); minor: {minor_freqs}; "
          f"sorted top norms {np.round(top_sorted[:8], 2).tolist()}")

    # fraction of embedding norm^2 in the (final) key freqs, over training: a
    # progress measure that should rise as the Fourier circuit forms
    for ck in fourier_ckpts:
        n2 = ck["norms"] ** 2
        ck["frac_norm2_in_key_freqs"] = float(n2[[k - 1 for k in key_freqs]].sum() / n2.sum())

    # ---- embedding circles: project each checkpoint's embedding onto the final
    # model's (cos_k, sin_k) plane for each key frequency ----
    W_final = W_E_snaps[final_step]
    circles = []
    for k in key_freqs:
        u_c = FB[2 * k - 1] @ W_final   # direction in d_model that encodes cos(2pi k a / P)
        u_s = FB[2 * k] @ W_final
        Q, _ = torch.linalg.qr(torch.stack([u_c, u_s], dim=1))  # (d_model, 2) orthonormal
        # orient so token 0 is at angle 0 and positive direction = increasing k*a
        pts_final = (W_final - W_final.mean(0)) @ Q
        ang = torch.atan2(pts_final[:, 1], pts_final[:, 0])
        rot = -ang[0].item()
        R = torch.tensor([[math.cos(rot), -math.sin(rot)], [math.sin(rot), math.cos(rot)]], dtype=torch.float64)
        # flip if the cycle runs clockwise
        pts_rot = pts_final @ R.T
        a1 = torch.atan2(pts_rot[1, 1], pts_rot[1, 0]).item()
        expected = 2 * math.pi * k / P
        expected = math.atan2(math.sin(expected), math.cos(expected))
        flip = 1.0 if (a1 * expected) >= 0 else -1.0
        frames = []
        for s, W in sorted(W_E_snaps.items()):
            pts = ((W - W.mean(0)) @ Q) @ R.T
            pts[:, 1] *= flip
            frames.append({"step": s, "xy": pts.numpy()})
        circles.append({"freq": k, "frames": frames})

    out = {
        "provenance": provenance(
            __file__,
            what="1-layer transformer trained from scratch on (a + b) mod 113 until it grokked",
            reproduces="Nanda et al. 2023, Progress measures for grokking via mechanistic interpretability (arXiv 2301.05217), Fig. 1/2 at small scale",
            model="HookedTransformer: 1 layer, d_model 128, 4 heads x d_head 32, d_mlp 512, ReLU, no LayerNorm, learned pos-emb, n_ctx 3, d_vocab 114 in / 113 out",
            training=("full-batch AdamW lr 1e-3 (10-step linear warmup), weight_decay 1.0, betas (0.9, 0.98); "
                      "30% of 113^2 = 3830 pairs train / 8939 test; loss = cross-entropy at the '=' position (float64)"),
            seed=args.seed, data_seed=args.data_seed, device=device,
            steps_trained=final_step, wall_clock_seconds=round(elapsed, 1),
        ),
        "p": P,
        "n_train": int(len(ytr)), "n_test": int(len(yte)),
        "summary": {
            "test_acc_first_ge_50pct_step": first_cross.get(0.5),
            "test_acc_first_ge_90pct_step": first_cross.get(0.9),
            "test_acc_first_ge_99pct_step": first_cross.get(0.99),
            "train_acc_first_100pct_step": next((s for s, a in zip(curves["step"], curves["train_acc"]) if a >= 1.0), None),
            "final": {k: curves[k][-1] for k in curves},
            "key_frequencies": key_freqs,
            "key_freq_rule": "frequencies above the largest ratio gap in the sorted final embedding Fourier norms",
            "minor_frequencies": minor_freqs,
            "minor_freq_rule": "other frequencies with norm > 4x the median; small, and they do not form clean circles",
            "final_norms_by_freq_sorted": [[int(k + 1), float(final_norms[k])] for k in order[:10]],
            "frac_embedding_norm2_in_key_freqs_final": frac_in_key,
        },
        "curves": curves,
        "curves_note": "logged every 100 steps; losses are natural-log cross-entropy; weight_norm = L2 norm of all parameters",
        "embedding_fourier": {
            "note": ("norms[i] = norm of the embedding (W_E rows for tokens 0..112) along frequency i+1, "
                     "i.e. sqrt(|cos_k component|^2 + |sin_k component|^2), k = 1..56. Sparse spikes = key frequencies."),
            "freqs": list(range(1, P // 2 + 1)),
            "checkpoints": fourier_ckpts,
        },
        "embedding_circles": {
            "note": ("For each key frequency k: token embeddings (centered) projected onto the final model's 2-D plane "
                     "spanned by its cos_k and sin_k directions, rotated so token 0 sits at angle 0. In the final model "
                     "token a sits near angle 2*pi*k*a/113; earlier frames are the SAME plane applied to earlier "
                     "embeddings, so you see a blob organise into a circle. xy[a] = [x, y] for token a = 0..112."),
            "circles": circles,
        },
    }
    write_json("grokking.json", rnd(out, 4))
    ckpt_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "figures", "checkpoints")
    os.makedirs(ckpt_dir, exist_ok=True)
    ckpt = os.path.join(ckpt_dir, f"grokking_mod{P}_seed{args.seed}_step{final_step}.pt")
    torch.save({"state_dict": model.state_dict(), "cfg": cfg.to_dict(), "train_idx_seed": args.data_seed}, ckpt)
    print("saved", os.path.relpath(ckpt))


if __name__ == "__main__":
    main()
