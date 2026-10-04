"""Shared helpers for the "real data" figure scripts.

Every figure script writes one compact JSON file to data/figures/ with a
`provenance` block, so anything shown on screen can be traced back to the exact
model, training run, seed, script and library versions that produced it.
"""

import datetime
import json
import os
import platform
import subprocess
import sys

from dotenv import load_dotenv, find_dotenv

# No secrets are needed here, but keep the project-wide convention.
load_dotenv(find_dotenv())

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(PROJECT_ROOT, "data", "figures")


def git_commit() -> str:
    """Short hash of the project's HEAD commit (scripts may be uncommitted)."""
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], cwd=PROJECT_ROOT, text=True
        ).strip()
    except Exception:
        return "unknown"


def provenance(script_file: str, **extra) -> dict:
    """Build the provenance block shared by every output file."""
    import numpy
    import torch

    block = {
        "script": os.path.relpath(os.path.abspath(script_file), PROJECT_ROOT),
        "generated_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        "project_git_head": git_commit(),
        "python": sys.version.split()[0],
        "torch": torch.__version__,
        "numpy": numpy.__version__,
        "machine": f"{platform.system()} {platform.machine()}",
    }
    try:
        import transformer_lens  # noqa: F401
        from importlib.metadata import version

        block["transformer_lens"] = version("transformer_lens")
    except Exception:
        pass
    block.update(extra)
    return block


def rnd(x, nd: int = 4):
    """Recursively round floats (and numpy / torch arrays) for compact JSON."""
    try:
        import numpy as np
        import torch

        if isinstance(x, torch.Tensor):
            x = x.detach().cpu().numpy()
        if isinstance(x, np.ndarray):
            x = x.tolist()
        if isinstance(x, (np.floating,)):
            x = float(x)
        if isinstance(x, (np.integer,)):
            x = int(x)
    except ImportError:
        pass
    if isinstance(x, float):
        # round to nd significant-ish digits: fixed decimals for normal values,
        # scientific for tiny ones (e.g. test losses of 1e-7 after grokking)
        if x != 0 and abs(x) < 10 ** (-nd + 1):
            return float(f"{x:.{nd - 1}e}")
        return round(x, nd)
    if isinstance(x, dict):
        return {k: rnd(v, nd) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [rnd(v, nd) for v in x]
    return x


def write_json(name: str, obj: dict) -> str:
    """Write compact JSON to data/figures/<name> and report its size."""
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name)
    with open(path, "w") as f:
        json.dump(obj, f, separators=(",", ":"), ensure_ascii=False)
    size_kb = os.path.getsize(path) / 1024
    print(f"wrote {os.path.relpath(path, PROJECT_ROOT)} ({size_kb:.1f} KB)")
    if size_kb > 2048:
        print("WARNING: file is over 2 MB; downsample further")
    return path
