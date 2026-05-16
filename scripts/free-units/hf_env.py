"""Load HF_TOKEN from project .env for Hunyuan gradio_client."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#") or "=" not in t:
            continue
        k, _, v = t.partition("=")
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


def hf_token() -> str | None:
    load_dotenv()
    return os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")


def is_zerogpu_quota_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "zerogpu quota" in msg or "exceeded your zerogpu" in msg
