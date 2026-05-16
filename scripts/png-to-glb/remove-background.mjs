/**
 * Strip studio gray / white background — keep only the character.
 */
import sharp from 'sharp';

function sample(data, w, x, y) {
  const i = (y * w + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
}

function colorDist(r, g, b, bg) {
  return Math.sqrt((r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2);
}

/**
 * @returns {Promise<{ png: Buffer, width: number, height: number, rgba: Buffer }>}
 */
export async function removeBackground(pngPath) {
  const { data, info } = await sharp(pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  const samples = [];
  const pts = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [w >> 1, 0],
    [w >> 1, h - 1],
    [0, h >> 1],
    [w - 1, h >> 1],
  ];
  for (const [x, y] of pts) samples.push(sample(data, w, x, y));

  const bg = {
    r: samples.reduce((s, p) => s + p.r, 0) / samples.length,
    g: samples.reduce((s, p) => s + p.g, 0) / samples.length,
    b: samples.reduce((s, p) => s + p.b, 0) / samples.length,
  };

  const out = Buffer.alloc(data.length);
  const BG_DIST = 48;
  const WHITE = 246;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let a = data[i + 3];

      const dist = colorDist(r, g, b, bg);
      const maxc = Math.max(r, g, b);
      const minc = Math.min(r, g, b);
      const sat = maxc - minc;
      const isWhite = r >= WHITE && g >= WHITE && b >= WHITE;
      const isGrayBg = sat < 32 && dist < BG_DIST + 20;
      const isBg = dist < BG_DIST || isWhite || isGrayBg;

      if (isBg) a = 0;
      else if (a < 20) a = 0;
      else a = Math.min(255, a);

      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
    }
  }

  const trimmed = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });

  return {
    png: trimmed.data,
    width: trimmed.info.width,
    height: trimmed.info.height,
    rgba: trimmed.data,
  };
}
