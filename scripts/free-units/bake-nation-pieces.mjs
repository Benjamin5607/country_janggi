/**
 * Nation × role units (FREE):
 *   - KayKit mesh per chess piece (p/n/b/r/q/k) → role silhouette + rig
 *   - unit_{region}_{team}.png baked as albedo → nation costume from your art
 *
 *   npm run free-units
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import { removeBackground } from '../png-to-glb/remove-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const UNITS = path.join(ROOT, 'public', 'textures', 'units');
const OUT = path.join(ROOT, 'public', 'models', 'rigged', '_kaykit');
const CACHE = path.join(__dirname, '.cache', 'kaykit');

const BASE =
  'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf';

const REGIONS = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const TEAMS = ['w', 'b'];
const PIECES = ['p', 'n', 'b', 'r', 'q', 'k'];

/** Chess role → rigged body shape */
const PIECE_CHARACTER = {
  p: 'Barbarian',
  n: 'Rogue',
  b: 'Mage',
  r: 'Knight',
  q: 'Rogue_Hooded',
  k: 'Knight',
};

const kaykitBuf = new Map();

async function kaykitPath(character) {
  if (kaykitBuf.has(character)) return kaykitBuf.get(character);
  await fs.mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, `${character}.glb`);
  try {
    await fs.access(file);
  } catch {
    const url = `${BASE}/${character}.glb`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`  cached ${character}.glb`);
  }
  kaykitBuf.set(character, file);
  return file;
}

async function nationTexture(region, team) {
  const png = path.join(UNITS, `unit_${region}_${team}.png`);
  const cleaned = await removeBackground(png);
  return sharp(cleaned.png)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function bakeOne(io, region, team, piece) {
  const character = PIECE_CHARACTER[piece];
  const src = await kaykitPath(character);
  const doc = await io.read(src);
  const root = doc.getRoot();
  const texBytes = await nationTexture(region, team);
  const tex = doc
    .createTexture(`nation_${region}_${team}`)
    .setMimeType('image/png')
    .setImage(texBytes);

  for (const mat of root.listMaterials()) {
    mat.setBaseColorTexture(tex);
    mat.setBaseColorFactor([1, 1, 1, 1]);
    mat.setMetallicFactor(0.06);
    mat.setRoughnessFactor(0.55);
  }

  const out = path.join(OUT, `${region}_${team}_${piece}.glb`);
  await io.write(out, doc);
  const stat = await fs.stat(out);
  return { out, bytes: stat.size, character };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const io = new NodeIO();

  console.log('Nation × role units — KayKit rig + your unit PNG art\n');
  console.log('  PNG: public/textures/units/unit_{region}_{team}.png');
  console.log('  out: public/models/rigged/{region}_{team}_{piece}.glb\n');

  let n = 0;
  for (const region of REGIONS) {
    for (const team of TEAMS) {
      for (const piece of PIECES) {
        const { out, bytes, character } = await bakeOne(io, region, team, piece);
        n++;
        console.log(
          `  ${region}_${team}_${piece}  ${character.padEnd(14)} ${(bytes / 1024).toFixed(0)} KB`,
        );
      }
    }
  }

  console.log(`\nDone — ${n} rigged GLBs (6 roles × 6 nations × 2 teams)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
