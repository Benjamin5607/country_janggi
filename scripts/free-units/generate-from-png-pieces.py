#!/usr/bin/env python3
"""
Per-piece Hunyuan3D-2 meshes from the same nation PNG (distinct seeds per role).
Output (game loads when present, after team mesh fallback is overridden in loader):

  public/models/rigged/hunyuan/{region}_{team}_{piece}.glb

  npm run free-units:pieces-hunyuan
  python scripts/free-units/generate-from-png-pieces.py --only korea_w --piece n
"""
from __future__ import annotations

import argparse
import hashlib
import shutil
import subprocess
import sys
import time
from pathlib import Path

from hf_env import hf_token, is_zerogpu_quota_error

ROOT = Path(__file__).resolve().parents[2]
UNITS = ROOT / "public" / "textures" / "units"
OUT = ROOT / "public" / "models" / "rigged" / "hunyuan"
CACHE = ROOT / "scripts" / "png-to-rigged" / ".cache"
REGIONS = ["europe", "china", "india", "korea", "japan", "arab"]
TEAMS = ["w", "b"]
PIECES = ["p", "n", "b", "r", "q", "k"]
HF_SPACE = "tencent/Hunyuan3D-2"

PIECE_SEED_OFFSET = {"p": 0, "n": 1111, "b": 2222, "r": 3333, "q": 4444, "k": 5555}


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
    script = ROOT / "scripts" / "free-units" / "bake-unit-texture.mjs"
    r = subprocess.run(
        ["node", str(script), str(glb), str(png)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(r.stderr or r.stdout or "bake-unit-texture failed")


def seed_for(region: str, team: str, piece: str) -> int:
    base = 1234 + PIECE_SEED_OFFSET[piece]
    h = int(hashlib.md5(f"{region}_{team}_{piece}".encode()).hexdigest()[:6], 16) % 9000
    return base + h


def generate_one(client, region: str, team: str, piece: str, *, bake: bool, force: bool) -> Path:
    from gradio_client import handle_file

    key = f"{region}_{team}_{piece}"
    src = UNITS / f"unit_{region}_{team}.png"
    out = OUT / f"{key}.glb"
    if not src.exists():
        raise FileNotFoundError(src)

    if not force and out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        print(f"  skip {out.name} (up to date)")
        return out

    clean = clean_png(region, team)
    seed = seed_for(region, team, piece)
    print(f"  HF Hunyuan3D-2  {key}  seed={seed} ...", flush=True)
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
        seed,
        256,
        True,
        8000,
        True,
        api_name="/shape_generation",
    )

    mesh = gradio_path(result[0])
    if not mesh or not Path(mesh).exists():
        raise RuntimeError(f"No mesh for {key}: {result[0]}")

    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy(mesh, out)
    print(f"    mesh {out.stat().st_size // 1024} KB  ({time.time() - t0:.0f}s)", flush=True)

    if bake:
        bake_texture(out, src)
        print(f"    baked {out.stat().st_size // 1024} KB", flush=True)

    return out


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="region_team e.g. korea_w")
    parser.add_argument("--piece", choices=PIECES, help="single chess piece")
    parser.add_argument("--no-bake", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    try:
        from gradio_client import Client
    except ImportError:
        print("pip install gradio_client pillow")
        return 1

    triples: list[tuple[str, str, str]] = []
    if args.only:
        if "_" not in args.only:
            print("--only must be region_team")
            return 1
        r, t = args.only.split("_", 1)
        pieces = [args.piece] if args.piece else PIECES
        triples = [(r, t, p) for p in pieces]
    else:
        triples = [(r, t, p) for r in REGIONS for t in TEAMS for p in PIECES]

    token = hf_token()
    print("Hunyuan per-piece (nation PNG, different seed per role)\n")
    if token:
        print("  HF_TOKEN found - using authenticated quota\n")
    else:
        print(
            "  No HF_TOKEN in .env — anonymous ZeroGPU quota only.\n"
            "  Add: HF_TOKEN=hf_...  (https://huggingface.co/settings/tokens)\n",
        )

    client = Client(HF_SPACE, token=token)

    ok = 0
    quota_stop = False
    for region, team, piece in triples:
        try:
            generate_one(client, region, team, piece, bake=not args.no_bake, force=args.force)
            ok += 1
        except Exception as e:
            print(f"  FAIL {region}_{team}_{piece}: {e}")
            if is_zerogpu_quota_error(e):
                quota_stop = True
                print("\n  ZeroGPU quota exhausted — stopping batch.")
                print("  Set HF_TOKEN in .env or wait for quota reset, then re-run.")
                break

    print(f"\n{ok}/{len(triples)} written to public/models/rigged/hunyuan/")
    print("Loader prefers hunyuan/* per-piece when present, else team {region}_{team}.glb.")
    return 0 if ok == len(triples) else 2 if quota_stop else 1


if __name__ == "__main__":
    raise SystemExit(main())
