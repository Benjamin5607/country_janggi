/**
 * Procedural PBR-style terrain atlases (albedo + normal).
 * Run: npm run generate:terrain
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'textures', 'terrain');

const SIZE = 512;

function noise2(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x, y, seed, oct = 5) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise2(x * f, y * f, seed + i * 17);
    f *= 2.1;
    a *= 0.5;
  }
  return v;
}

async function writeJpeg(name, rgba, w, h) {
  await sharp(Buffer.from(rgba), { raw: { width: w, height: h, channels: 4 } })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, name));
}

async function makeAlbedo(name, baseRgb, accentRgb, seed, blade = false) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      const n = fbm(u * 8, v * 8, seed);
      const n2 = fbm(u * 24, v * 24, seed + 40);
      let r = baseRgb[0] + (accentRgb[0] - baseRgb[0]) * n;
      let g = baseRgb[1] + (accentRgb[1] - baseRgb[1]) * n;
      let b = baseRgb[2] + (accentRgb[2] - baseRgb[2]) * n;
      if (blade) {
        const bladeLine = Math.sin((u * 90 + v * 30) + n2 * 6) > 0.92 ? 0.14 : 0;
        g += bladeLine * 35;
        r -= bladeLine * 10;
      }
      const speck = n2 > 0.88 ? 18 : 0;
      const i = (y * SIZE + x) * 4;
      rgba[i] = Math.min(255, r + speck);
      rgba[i + 1] = Math.min(255, g + speck * 0.8);
      rgba[i + 2] = Math.min(255, b + speck * 0.5);
      rgba[i + 3] = 255;
    }
  }
  await writeJpeg(name, rgba, SIZE, SIZE);
}

async function makeNormalFromHeight(heightFn, name) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  const h = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      h[y * SIZE + x] = heightFn(x / SIZE, y / SIZE);
    }
  }
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const l = h[y * SIZE + Math.max(0, x - 1)];
      const r = h[y * SIZE + Math.min(SIZE - 1, x + 1)];
      const d = h[Math.max(0, y - 1) * SIZE + x];
      const u = h[Math.min(SIZE - 1, y + 1) * SIZE + x];
      const nx = (l - r) * 2.5;
      const ny = (d - u) * 2.5;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * SIZE + x) * 4;
      rgba[i] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
      rgba[i + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
      rgba[i + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
      rgba[i + 3] = 255;
    }
  }
  await writeJpeg(name, rgba, SIZE, SIZE);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await makeAlbedo('grass_albedo.jpg', [72, 98, 48], [118, 148, 72], 1, true);
  await makeAlbedo('sand_albedo.jpg', [196, 168, 118], [230, 210, 170], 2);
  await makeAlbedo('dirt_albedo.jpg', [92, 68, 48], [130, 98, 68], 3);
  await makeAlbedo('rock_albedo.jpg', [88, 86, 82], [128, 124, 118], 4);
  await makeNormalFromHeight((u, v) => fbm(u * 10, v * 10, 9), 'grass_normal.jpg');
  await makeNormalFromHeight((u, v) => fbm(u * 12, v * 12, 19), 'sand_normal.jpg');
  console.log('Terrain textures written to public/textures/terrain/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
