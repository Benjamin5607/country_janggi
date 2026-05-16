#!/usr/bin/env python3
"""
Optional: PNG -> 3D mesh via FREE Hugging Face TripoSR (no Tripo credits).
Output is mesh only (no skeleton). Use Mesh2Motion.org to rig if needed.

  pip install gradio_client pillow
  python scripts/free-units/hf-mesh-from-png.py europe_w
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
UNITS = ROOT / "public" / "textures" / "units"
OUT = ROOT / "public" / "models" / "mesh_from_png"
CACHE = ROOT / "scripts" / "png-to-rigged" / ".cache"


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python hf-mesh-from-png.py <region>_<team>")
        return 1

    key = sys.argv[1]
    src = UNITS / f"unit_{key}.png"
    if not src.exists():
        print(f"Missing {src}")
        return 1

    try:
        from gradio_client import Client, handle_file
    except ImportError:
        print("pip install gradio_client pillow")
        return 1

    CACHE.mkdir(parents=True, exist_ok=True)
    clean = CACHE / f"unit_{key}_clean.png"
    sys.path.insert(0, str(ROOT / "scripts" / "png-to-rigged"))
    from preprocess import remove_background  # noqa: E402

    remove_background(src, clean)

    print(f"HF TripoSR (free): {key} ...")
    client = Client("stabilityai/TripoSR", verbose=False)
    result = client.predict(
        handle_file(str(clean)),
        True,
        0.9,
        api_name="/check_input_image",
    )
    if result:
        print("  preview ok")

    model_path = client.predict(
        handle_file(str(clean)),
        True,
        0.9,
        api_name="/generate",
    )
    if not model_path:
        print("No model returned")
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{key}.obj"
    shutil.copy(model_path, dest)
    print(f"  saved {dest}")
    print("  Rig for free: https://app.mesh2motion.org/ (upload OBJ -> export GLB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
