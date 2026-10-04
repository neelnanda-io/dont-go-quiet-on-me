"""Thin OpenRouter client for the lyric judges (and any other LLM calls).

Cost rules (measured on OpenRouter, 2026-09-13):
  * Anthropic models: big shared context goes in ONE content block marked
    cache_control (ttl 1h), provider pinned to "anthropic" so repeat calls hit
    the same cache. Later calls must keep that prefix byte-identical.
  * GPT-6 Astra: route to OpenAI's half-price flex tier ("openai/flex").
  * Log provider, cached tokens and cost of every call (logs/llm_calls.jsonl).
  * Stop (don't retry) on classifier refusals: finish_reason content_filter /
    native_finish_reason refusal.
"""
import json
import os
import time
import datetime as dt
from pathlib import Path

import requests
from dotenv import load_dotenv, find_dotenv

# This searches up the directory tree until it finds a .env file
load_dotenv(find_dotenv(usecwd=True))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # also the repo root .env, wherever you run from

ROOT = Path(__file__).resolve().parent.parent
LOG = ROOT / "logs" / "llm_calls.jsonl"
URL = "https://openrouter.ai/api/v1/chat/completions"

JUDGES = {
    "opus": "anthropic/claude-opus-5.5",
    "astra": "openai/gpt-6-astra",
    "fable": "anthropic/claude-fable-5.1",
}


class Refusal(Exception):
    pass


def _provider_for(model: str) -> dict:
    if model.startswith("anthropic/"):
        return {"order": ["anthropic"], "allow_fallbacks": False}
    if model.startswith("openai/gpt-6-astra"):
        return {"order": ["openai/flex"], "allow_fallbacks": False}
    return {}


def call(model: str, user: str, *, system: str = "", cached_context: str = "",
         effort: str = "medium", max_tokens: int = 16000, tag: str = "",
         temperature: float | None = None, retries: int = 4) -> dict:
    """One chat completion. Returns {"text", "usage", "provider", "raw"}.

    cached_context is placed first in the user message as its own block; for
    Anthropic it carries a 1h cache_control marker. Keep it byte-identical
    across calls that should share the cache.
    """
    key = os.environ["OPENROUTER_API_KEY"]
    content = []
    if cached_context:
        block = {"type": "text", "text": cached_context}
        if model.startswith("anthropic/"):
            block["cache_control"] = {"type": "ephemeral", "ttl": "1h"}
        content.append(block)
    content.append({"type": "text", "text": user})
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": content})
    body = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "reasoning": {"effort": effort},
        "usage": {"include": True},
    }
    prov = _provider_for(model)
    if prov:
        body["provider"] = prov
    if temperature is not None:
        body["temperature"] = temperature

    last_err = None
    for attempt in range(retries):
        t0 = time.time()
        try:
            r = requests.post(URL, headers={"Authorization": f"Bearer {key}",
                                            "Content-Type": "application/json"},
                              json=body, timeout=900)
        except requests.RequestException as e:
            last_err = e
            time.sleep(5 * (attempt + 1))
            continue
        if r.status_code in (429, 500, 502, 503, 504, 529):
            last_err = f"HTTP {r.status_code}: {r.text[:300]}"
            time.sleep(10 * (attempt + 1))
            continue
        if r.status_code != 200:
            raise RuntimeError(f"HTTP {r.status_code}: {r.text[:1000]}")
        d = r.json()
        if "error" in d:
            last_err = d["error"]
            time.sleep(10 * (attempt + 1))
            continue
        ch = d["choices"][0]
        u = d.get("usage", {}) or {}
        ptd = u.get("prompt_tokens_details", {}) or {}
        rec = {
            "ts": dt.datetime.now().isoformat(timespec="seconds"),
            "tag": tag, "model": model, "provider": d.get("provider"),
            "prompt_tokens": u.get("prompt_tokens"),
            "completion_tokens": u.get("completion_tokens"),
            "reasoning_tokens": (u.get("completion_tokens_details") or {}).get("reasoning_tokens"),
            "cached_tokens": ptd.get("cached_tokens"),
            "cache_write_tokens": ptd.get("cache_write_tokens"),
            "cost": u.get("cost"),
            "finish_reason": ch.get("finish_reason"),
            "native_finish_reason": ch.get("native_finish_reason"),
            "secs": round(time.time() - t0, 1),
        }
        LOG.parent.mkdir(exist_ok=True)
        with open(LOG, "a") as f:
            f.write(json.dumps(rec) + "\n")
        if ch.get("finish_reason") == "content_filter" or ch.get("native_finish_reason") == "refusal":
            raise Refusal(json.dumps(rec))
        text = (ch.get("message") or {}).get("content") or ""
        return {"text": text, "usage": rec, "provider": d.get("provider"), "raw": d}
    raise RuntimeError(f"failed after {retries} attempts: {last_err}")


def parse_json(text: str):
    """Pull the first JSON object/array out of a model reply (fenced or bare)."""
    import re
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    s = m.group(1) if m else text
    s = s.strip()
    start = min([i for i in (s.find("{"), s.find("[")) if i >= 0], default=-1)
    if start < 0:
        raise ValueError("no JSON found")
    # find matching end by trying progressively shorter suffixes
    for end in range(len(s), start, -1):
        if s[end - 1] in "}]":
            try:
                return json.loads(s[start:end])
            except json.JSONDecodeError:
                continue
    raise ValueError("unparseable JSON")


def spend(tag_prefix: str = "") -> float:
    """Total logged cost (USD) for calls whose tag starts with tag_prefix."""
    if not LOG.exists():
        return 0.0
    tot = 0.0
    for line in open(LOG):
        r = json.loads(line)
        if r.get("tag", "").startswith(tag_prefix) and r.get("cost"):
            tot += r["cost"]
    return tot


if __name__ == "__main__":
    # smoke test: one tiny call per judge
    for name, model in JUDGES.items():
        out = call(model, "Reply with exactly: OK " + name, effort="low",
                   max_tokens=2000, tag="smoke")
        print(name, repr(out["text"][:40]), out["usage"])
    print("total smoke spend $", round(spend("smoke"), 4))
