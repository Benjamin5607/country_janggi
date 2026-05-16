#!/usr/bin/env python3
"""
PNG → AI 3D mesh → biped rig → Idle/Walk GLB (Tripo3D API).

Requires: TRIPO_API_KEY (https://platform.tripo3d.ai/)

  pip install -r scripts/png-to-rigged/requirements.txt
  set TRIPO_API_KEY=tsk_...
  python scripts/png-to-rigged/generate.py
"""
from __future__ import annotations

import asyncio
import os
import shutil
import sys
from pathlib import Path

from preprocess import remove_background

ROOT = Path(__file__).resolve().parents[2]
UNITS_PNG = ROOT / "public" / "textures" / "units"
OUT_DIR = ROOT / "public" / "models" / "rigged"
CACHE_DIR = ROOT / "scripts" / "png-to-rigged" / ".cache"
REGIONS = ["europe", "china", "india", "korea", "japan", "arab"]
TEAMS = ["w", "b"]


async def generate_one(client, region: str, team: str) -> Path:
    from tripo3d import Animation, RigSpec, RigType, TaskStatus, TripoClient

    src = UNITS_PNG / f"unit_{region}_{team}.png"
    out = OUT_DIR / f"{region}_{team}.glb"
    clean = CACHE_DIR / f"unit_{region}_{team}_clean.png"

    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        print(f"  skip {out.name} (up to date)")
        return out

    remove_background(src, clean)
    print(f"  image->model  {region}_{team} ...")

    model_task_id = await client.image_to_model(
        image=str(clean),
        texture=True,
        pbr=True,
        texture_alignment="original_image",
        orientation="align_image",
        texture_quality="detailed",
    )
    model_task = await client.wait_for_task(model_task_id, timeout=900, verbose=True)
    if model_task.status != TaskStatus.SUCCESS:
        raise RuntimeError(f"image_to_model failed: {model_task.error_msg}")

    print(f"  check rig    {region}_{team} ...")
    check_id = await client.check_riggable(model_task_id)
    check_task = await client.wait_for_task(check_id, timeout=120, verbose=True)

    task_for_anim = model_task_id
    if check_task.status == TaskStatus.SUCCESS and check_task.output and check_task.output.riggable:
        print(f"  rig biped    {region}_{team} ...")
        rig_id = await client.rig_model(
            original_model_task_id=model_task_id,
            rig_type=RigType.BIPED,
            spec=RigSpec.MIXAMO,
        )
        rig_task = await client.wait_for_task(rig_id, timeout=600, verbose=True)
        if rig_task.status != TaskStatus.SUCCESS:
            raise RuntimeError(f"rig_model failed: {rig_task.error_msg}")
        task_for_anim = rig_id

        print(f"  animate      {region}_{team} ...")
        anim_id = await client.retarget_animation(
            original_model_task_id=rig_id,
            animation=[Animation.IDLE, Animation.WALK, Animation.HURT],
            out_format="glb",
            bake_animation=True,
        )
        anim_task = await client.wait_for_task(anim_id, timeout=600, verbose=True)
        if anim_task.status == TaskStatus.SUCCESS:
            task_for_anim = anim_id
        else:
            print(f"  warn: animation failed, using rigged mesh only")

    tmp = CACHE_DIR / f"dl_{region}_{team}"
    tmp.mkdir(parents=True, exist_ok=True)
    final_task = await client.get_task(task_for_anim)
    files = await client.download_task_models(final_task, str(tmp))

    glb_src = None
    for key in ("model", "pbr_model", "base_model"):
        p = files.get(key)
        if p and str(p).endswith(".glb"):
            glb_src = Path(p)
            break
    if not glb_src:
        for p in tmp.rglob("*.glb"):
            glb_src = p
            break
    if not glb_src or not glb_src.exists():
        raise RuntimeError("No GLB in Tripo download")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(glb_src, out)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"  OK {out.name}  ({out.stat().st_size // 1024} KB)")
    return out


async def main() -> int:
    key = os.environ.get("TRIPO_API_KEY", "").strip()
    if not key:
        print("ERROR: TRIPO_API_KEY is not set.", file=sys.stderr)
        print("Get a key: https://platform.tripo3d.ai/", file=sys.stderr)
        print("Then:  set TRIPO_API_KEY=tsk_your_key", file=sys.stderr)
        return 1

    try:
        from tripo3d import TripoClient
    except ImportError:
        print("Install: pip install -r scripts/png-to-rigged/requirements.txt", file=sys.stderr)
        return 1

    print("PNG -> rigged GLB (Tripo3D AI)\n")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    async with TripoClient() as client:
        for region in REGIONS:
            for team in TEAMS:
                await generate_one(client, region, team)

    print(f"\nDone — {len(REGIONS) * len(TEAMS)} files in public/models/rigged/")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
