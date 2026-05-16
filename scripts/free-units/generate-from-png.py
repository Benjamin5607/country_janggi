#!/usr/bin/env python3
"""
FREE: unit PNG -> 3D GLB via Hugging Face Hunyuan3D-2 (no API key, no credits).
Uses your nation reference art — not generic KayKit knights/mages.

  pip install gradio_client pillow
  python scripts/free-units/generate-from-png.py
  python scripts/free-units/generate-from-png.py --only korea_w
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import time
from pathlib import Path

from hf_env import hf_token, is_zerogpu_quota_error

ROOT = Path(__file__).resolve().parents[2]
UNITS = ROOT / "public" / "textures" / "units"
OUT = ROOT / "public" / "models" / "rigged"
CACHE = ROOT / "scripts" / "png-to-rigged" / ".cache"
REGIONS = ["europe", "china", "india", "korea", "japan", "arab"]
TEAMS = ["w", "b"]
HF_SPACE = "tencent/Hunyuan3D-2"


def gradio_path(result) -> str | None:
    if result is None:
        return None
    if isinstance(result, dict) and "value" in result:
        return result["value"]
    if isinstance(result, str):
        return result
    return None


def clean_png(region: str, team: str) -> Path:
    sys.path.insert(0, str(ROOT / "scripts" / "png-to-rigged"))
    from preprocess import remove_background  # noqa: E402

    src = UNITS / f"unit_{region}_{team}.png"
    dest = CACHE / f"unit_{region}_{team}_clean.png"
    remove_background(src, dest)
    return dest


def bake_texture(glb: Path, png: Path) -> None:
    node = "node"
    script = ROOT / "scripts" / "free-units" / "bake-unit-texture.mjs"
    r = subprocess.run(
        [node, str(script), str(glb), str(png)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        print(r.stderr or r.stdout)
        raise RuntimeError(f"bake-unit-texture failed for {glb.name}")


def generate_one(client, region: str, team: str, *, bake: bool, force: bool) -> Path:
    from gradio_client import handle_file

    key = f"{region}_{team}"
    src = UNITS / f"unit_{key}.png"
    out = OUT / f"{key}.glb"
    if not src.exists():
        raise FileNotFoundError(src)

    if not force and out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        print(f"  skip {out.name} (up to date)")
        return out

    clean = clean_png(region, team)
    print(f"  HF Hunyuan3D-2  {key} ...", flush=True)
    t0 = time.time()

    result = client.predict(
        None,
        handle_file(str(clean)),
        None,
        None,
        None,
        None,
        30,
        5.0,
        1234,
        256,
        True,
        8000,
        True,
        api_name="/shape_generation",
    )

    mesh = gradio_path(result[0])
    if not mesh or not Path(mesh).exists():
        raise RuntimeError(f"No mesh returned for {key}: {result[0]}")

    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy(mesh, out)
    print(f"    mesh {out.stat().st_size // 1024} KB  ({time.time() - t0:.0f}s)", flush=True)

    if bake:
        print(f"    bake texture from PNG ...", flush=True)
        bake_texture(out, src)
        print(f"    done {out.stat().st_size // 1024} KB", flush=True)

    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="region_team e.g. korea_w")
    parser.add_argument("--no-bake", action="store_true", help="skip PNG albedo bake")
    parser.add_argument("--force", action="store_true", help="regenerate even if GLB exists")
    args = parser.parse_args()

    try:
        from gradio_client import Client
    except ImportError:
        print("pip install gradio_client pillow")
        return 1

    pairs: list[tuple[str, str]] = []
    if args.only:
        if "_" not in args.only:
            print("--only must be region_team")
            return 1
        r, t = args.only.split("_", 1)
        pairs = [(r, t)]
    else:
        pairs = [(r, t) for r in REGIONS for t in TEAMS]

    token = hf_token()
    print("FREE PNG -> 3D (Hugging Face Hunyuan3D-2, nation art as input)\n")
    if token:
        print("  HF_TOKEN found - using authenticated quota\n")
    else:
        print(
            "  No HF_TOKEN in .env — anonymous ZeroGPU quota only.\n"
            "  Add: HF_TOKEN=hf_...  (https://huggingface.co/settings/tokens)\n",
        )
    client = Client(HF_SPACE, token=token)

    ok = 0
    for region, team in pairs:
        try:
            generate_one(client, region, team, bake=not args.no_bake, force=args.force)
            ok += 1
        except Exception as e:
            print(f"  FAIL {region}_{team}: {e}")
            if is_zerogpu_quota_error(e):
                print("\n  ZeroGPU quota exhausted — stopping batch.")
                break

    print(f"\n{ok}/{len(pairs)} written to public/models/rigged/")
    print("Restart dev server + hard refresh. Mesh-only GLBs use procedural idle/walk.")
    return 0 if ok == len(pairs) else 1


if __name__ == "__main__":
    raise SystemExit(main())
