/**
 * Free rigged units (CC0 KayKit Adventurers) — distinct mesh per nation, Idle/Walk included.
 * No API key, no credits.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'models', 'rigged');

const BASE =
  'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf';

/** Nation → KayKit character (different silhouette + rig). */
const REGION_CHARACTER = {
  europe: 'Knight',
  china: 'Mage',
  india: 'Rogue',
  korea: 'Barbarian',
  japan: 'Rogue_Hooded',
  arab: 'Mage',
};

const TEAMS = ['w', 'b'];

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  console.log('Free rigged units — KayKit CC0 (no API)\n');

  for (const [region, character] of Object.entries(REGION_CHARACTER)) {
    const url = `${BASE}/${character}.glb`;
    const buf = await download(url);
    for (const team of TEAMS) {
      const out = path.join(OUT, `${region}_${team}.glb`);
      await fs.writeFile(out, buf);
    }
    console.log(`  ${region} <- ${character}.glb  (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  console.log(`\nDone — 12 rigged GLBs in public/models/rigged/`);
  console.log('(Same mesh per nation for w/b; team color applied in-game.)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
