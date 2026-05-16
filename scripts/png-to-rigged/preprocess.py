"""Remove studio background from unit PNG before image-to-3D."""
from __future__ import annotations

import io
from pathlib import Path

from PIL import Image


def _sample_corners(img: Image.Image) -> tuple[float, float, float]:
    w, h = img.size
    pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]
    rs = gs = bs = 0.0
    for x, y in pts:
        r, g, b, _a = img.getpixel((x, y))
        rs += r
        gs += g
        bs += b
    n = len(pts)
    return rs / n, gs / n, bs / n


def _dist(rgb: tuple[int, int, int], bg: tuple[float, float, float]) -> float:
    return ((rgb[0] - bg[0]) ** 2 + (rgb[1] - bg[1]) ** 2 + (rgb[2] - bg[2]) ** 2) ** 0.5


def remove_background(src: Path, dest: Path) -> Path:
    img = Image.open(src).convert("RGBA")
    bg = _sample_corners(img)
    w, h = img.size
    px = img.load()
    bg_thresh = 48
    white = 246

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= white and g >= white and b >= white:
                px[x, y] = (r, g, b, 0)
                continue
            sat = max(r, g, b) - min(r, g, b)
            if _dist((r, g, b), bg) < bg_thresh or (sat < 32 and _dist((r, g, b), bg) < bg_thresh + 20):
                px[x, y] = (r, g, b, 0)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="PNG", optimize=True)
    return dest


def remove_background_bytes(src: Path) -> bytes:
    buf = io.BytesIO()
    tmp = Path(buf.name) if buf.name else None
    out = Path(src.parent / f".{src.stem}_clean.png")
    remove_background(src, out)
    data = out.read_bytes()
    out.unlink(missing_ok=True)
    return data
