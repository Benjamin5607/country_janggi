/**
 * CC0 KayKit — distinct rigged mesh per chess role (p,n,b,r,q,k) × nation × team.
 *   npm run free-units:pieces
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'models', 'rigged', '_kaykit');

const BASE =
  'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf';

/** Chess role → KayKit silhouette (Idle/Walk rig included). */
const PIECE_CHARACTER = {
  p: 'Barbarian',
  n: 'Rogue',
  b: 'Mage',
  r: 'Knight',
  q: 'Rogue_Hooded',
  k: 'Knight',
};

/** Slight nation flavor — same roles, different body per region where possible. */
const REGION_PIECE = {
  europe: { p: 'Barbarian', n: 'Rogue', b: 'Mage', r: 'Knight', q: 'Rogue_Hooded', k: 'Knight' },
  china: { p: 'Mage', n: 'Rogue', b: 'Mage', r: 'Knight', q: 'Rogue_Hooded', k: 'Knight' },
  india: { p: 'Rogue', n: 'Rogue', b: 'Mage', r: 'Barbarian', q: 'Rogue_Hooded', k: 'Knight' },
  korea: { p: 'Barbarian', n: 'Rogue', b: 'Mage', r: 'Knight', q: 'Knight', k: 'Knight' },
  japan: { p: 'Rogue_Hooded', n: 'Rogue', b: 'Mage', r: 'Knight', q: 'Rogue_Hooded', k: 'Knight' },
  arab: { p: 'Mage', n: 'Rogue', b: 'Mage', r: 'Barbarian', q: 'Rogue_Hooded', k: 'Knight' },
};

const REGIONS = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const TEAMS = ['w', 'b'];
const PIECES = ['p', 'n', 'b', 'r', 'q', 'k'];

const cache = new Map();

async function download(character) {
  if (cache.has(character)) return cache.get(character);
  const url = `${BASE}/${character}.glb`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  cache.set(character, buf);
  return buf;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  console.log('KayKit CC0 — NOT used in-game (quarantined under _kaykit/)\n');

  let n = 0;
  for (const region of REGIONS) {
    for (const team of TEAMS) {
      for (const piece of PIECES) {
        const character = REGION_PIECE[region]?.[piece] ?? PIECE_CHARACTER[piece];
        const buf = await download(character);
        const out = path.join(OUT, `${region}_${team}_${piece}.glb`);
        await fs.writeFile(out, buf);
        n++;
        console.log(`  ${region}_${team}_${piece} <- ${character}`);
      }
    }
  }

  console.log(`\nDone — ${n} GLBs in public/models/rigged/_kaykit/ (not loaded)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
