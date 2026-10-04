"""Toy model of superposition, 5 features in 2 dimensions.

Reproduces the basic ReLU-output toy model of Elhage et al. 2022,
"Toy Models of Superposition" (transformer-circuits.pub/2022/toy_model):

    h  = W x                (W is 2 x 5: squeeze 5 features into 2 dims)
    x' = ReLU(W^T h + b)    (reconstruct all 5 from the 2-D hidden vector)

Each feature is independently present with probability p (value ~ U[0, 1]),
otherwise 0.  Loss = mean over batch of sum_i I_i (x_i - x'_i)^2.

Regimes (see REGIMES), several seeds each:
  * p = 0.05 (95% sparse): all 5 features are stored, as a pentagon (superposition)
  * p = 1.0  (dense):      only 2 features are stored, orthogonally; the rest -> 0
    (clean only with the paper's decaying importance 0.9**i; with equal
    importance the optimum is degenerate)

Training as in the paper's colab: AdamW lr 1e-3 (default weight decay 0.01),
batch 1024, 10k steps, xavier-normal init, b = 0.

Outputs data/figures/superposition.json with W's 5 column vectors (the 2-D
direction of each feature) and b over training, for animation.
"""

import math
import os
import sys
import time

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import numpy as np
import torch

sys.path.insert(0, os.path.dirname(__file__))
from common import provenance, rnd, write_json  # noqa: E402

N_FEAT, N_HID = 5, 2
STEPS, BATCH, LR = 10_000, 1024, 1e-3
# (name, feature probability p, importance decay r: I_i = r**i)
# decay 0.9 is the Elhage et al. colab setting; with equal importance the dense
# case is degenerate (any 2-D subspace is equally good), so the clean
# "two orthogonal features" picture needs the decaying importance.
REGIMES = [
    ("sparse_p0.05_equal_importance", 0.05, 1.0),
    ("dense_p1.0_equal_importance", 1.0, 1.0),
    ("sparse_p0.05_importance_0.9^i", 0.05, 0.9),
    ("dense_p1.0_importance_0.9^i", 1.0, 0.9),
]
SEEDS = list(range(6))
# dense early (the geometry moves fast at first), then every 100 steps
SNAP_STEPS = sorted(set(list(range(0, 501, 10)) + list(range(600, STEPS + 1, 100))))


def train_one(prob: float, decay: float, seed: int):
    torch.manual_seed(seed)
    W = torch.nn.Parameter(torch.empty(N_HID, N_FEAT))
    torch.nn.init.xavier_normal_(W)
    b = torch.nn.Parameter(torch.zeros(N_FEAT))
    opt = torch.optim.AdamW([W, b], lr=LR)
    imp = decay ** torch.arange(N_FEAT, dtype=torch.float32)
    snaps, losses = [], []
    snap_set = set(SNAP_STEPS)
    for step in range(STEPS + 1):
        x = torch.rand(BATCH, N_FEAT) * (torch.rand(BATCH, N_FEAT) < prob)
        out = torch.relu(x @ W.T @ W + b)
        loss = ((out - x) ** 2 * imp).sum(-1).mean()
        if step in snap_set:
            snaps.append({"step": step, "W_cols": W.detach().T.clone().numpy(), "b": b.detach().clone().numpy()})
        if step % 100 == 0:
            losses.append([step, loss.item()])
        if step == STEPS:
            break
        opt.zero_grad(); loss.backward(); opt.step()
    return snaps, losses


def describe(W_cols: np.ndarray, b: np.ndarray) -> dict:
    """Summarise the final geometry: which features are represented and at what angles."""
    norms = np.linalg.norm(W_cols, axis=1)
    represented = [int(i) for i in np.where(norms > 0.5)[0]]
    angles = np.degrees(np.arctan2(W_cols[:, 1], W_cols[:, 0]))
    rep_angles = np.sort(angles[represented]) if represented else np.array([])
    gaps = np.diff(np.concatenate([rep_angles, rep_angles[:1] + 360])) if len(rep_angles) > 1 else np.array([])
    if len(represented) == 5 and np.all(np.abs(gaps - 72) < 12):
        shape = "pentagon"
    elif len(represented) == 2 and abs(min(gaps) - 90) < 10:
        shape = "two orthogonal features"
    else:
        shape = f"{len(represented)} features, gaps {np.round(gaps).tolist()}"
    partial = int(np.sum((norms > 0.2) & (norms <= 0.5)))
    if partial:
        # half-represented features: the picture is not clean (seen with equal importance + dense data)
        shape += f" + {partial} partial feature(s) with 0.2 < |W_i| <= 0.5"
    return {
        "feature_norms": norms, "feature_angles_deg": angles,
        "represented_features": represented, "angular_gaps_deg": gaps, "shape": shape, "bias": b,
    }


def settle_step(run: dict) -> int:
    """First snapshot step after which every feature's norm stays within 10% of its
    final value (or within 0.1 absolute, for features that die) -- a rough "the
    shape has formed" time, useful for pacing an animation."""
    final = np.linalg.norm(run["frames"][-1]["W_cols"], axis=1)
    ok = [np.all(np.abs(np.linalg.norm(f["W_cols"], axis=1) - final) < np.maximum(0.1 * final, 0.1))
          for f in run["frames"]]
    for i in range(len(ok)):
        if all(ok[i:]):
            return run["frames"][i]["step"]
    return run["frames"][-1]["step"]


def main():
    t0 = time.time()
    runs = []
    for name, prob, decay in REGIMES:
        for seed in SEEDS:
            snaps, losses = train_one(prob, decay, seed)
            final = describe(snaps[-1]["W_cols"], snaps[-1]["b"])
            print(f"{name} seed {seed}: loss {losses[-1][1]:.4f}  norms {np.round(final['feature_norms'], 2)}  -> {final['shape']}")
            runs.append({
                "regime": name, "feature_prob": prob, "importance": [decay ** i for i in range(N_FEAT)], "seed": seed,
                "final": final, "loss_every_100": losses,
                "frames": [{"step": s["step"], "W_cols": s["W_cols"], "b": s["b"]} for s in snaps],
            })
    out = {
        "provenance": provenance(
            __file__,
            what="Toy model of superposition trained from scratch: 5 features squeezed into 2 dimensions",
            reproduces="Elhage et al. 2022, Toy Models of Superposition, ReLU-output model (the n=5, m=2 pentagon)",
            model="x' = ReLU(W^T W x + b), W in R^{2x5}, b in R^5",
            data="each feature independently present with prob p, value ~ U[0,1]; importance I_i = 1 (equal) or 0.9**i (paper colab), per regime",
            training=f"AdamW lr {LR} (weight_decay 0.01), batch {BATCH}, {STEPS} steps, xavier-normal init, b=0; loss = mean_batch sum_i I_i (x_i - x'_i)^2",
            seeds=SEEDS, wall_clock_seconds=round(time.time() - t0, 1),
        ),
        "note": ("frames[t].W_cols[i] = [x, y] = the 2-D embedding direction of feature i (column i of W) at that step; "
                 "draw each as an arrow from the origin. frames[t].b = the 5 output biases (negative biases filter interference). "
                 "final.represented_features = features with |W_i| > 0.5."),
        "summary": {
            name: {
                "shapes_by_seed": {r["seed"]: r["final"]["shape"] for r in runs if r["regime"] == name},
                # first snapshot step where all represented-at-the-end features have |W_i| > 0.9 x their final norm
                "settle_step_by_seed": {r["seed"]: settle_step(r) for r in runs if r["regime"] == name},
            }
            for name, _, _ in REGIMES
        },
        "snapshot_steps": SNAP_STEPS,
        "runs": runs,
    }
    write_json("superposition.json", rnd(out, 4))


if __name__ == "__main__":
    main()
