/**
 * CC0 era props (Polygonal Mind / ToxSam) — self-contained GLB only.
 *   npm run free-units:props
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'models', 'props');

const BASE =
  'https://raw.githubusercontent.com/ToxSam/cc0-models-Polygonal-Mind/main/projects';

const PROPS = {
  pawn_lance: `${BASE}/tomb-chaser-1/Lance_Art.glb`,
  knight_horse: `${BASE}/xyz/057_Horsely_Art.glb`,
  rook_cart: `${BASE}/medieval-fair/Cart.glb`,
  king_banner: `${BASE}/lunar-year/Banner.glb`,
  king_flags: `${BASE}/medieval-fair/Fair_Flags_Line.glb`,
  queen_coin: `${BASE}/medieval-fair/Coin_PolygonalMind.glb`,
  bishop_statue: `${BASE}/MomusPark/Statue_greek_01_Art.glb`,
  bishop_tabern: `${BASE}/medieval-fair/Tabern.glb`,
};

async function download(url, name) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const out = path.join(OUT, `${name}.glb`);
  await fs.writeFile(out, Buffer.from(await res.arrayBuffer()));
  const st = await fs.stat(out);
  console.log(`  ${name}.glb  ${(st.size / 1024).toFixed(0)} KB`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  console.log('CC0 props (ToxSam / Polygonal Mind GLB)\n');
  for (const [name, url] of Object.entries(PROPS)) {
    await download(url, name);
  }
  console.log('\nDone → public/models/props/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
