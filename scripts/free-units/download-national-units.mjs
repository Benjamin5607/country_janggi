/**
 * Optional CC0 piece silhouettes per nation (NOT 72 rigged cultural humans).
 *
 * Honest scope: free GitHub rarely offers nation-themed rigged humanoids for every
 * chess role. This script downloads verified DISTINCT GLBs from CC0 repos into:
 *   public/models/units/{region}/{piece}.glb
 *
 * Gameplay priority (see armyModels.resolveRiggedGlbUrl):
 *   1. public/models/rigged/{region}_{team}_{piece}.glb  (Hunyuan per-piece bake)
 *   2. public/models/units/{region}/{piece}.glb            (this script)
 *   3. public/models/rigged/{region}_{team}.glb          (Hunyuan team mesh)
 *   4. public/models/regions/{region}/{piece}.glb
 *
 * Sources (CC0):
 *   - ToxSam/cc0-models-Polygonal-Mind (Polygonal Mind, CC0)
 *
 * KayKit Adventurers are NOT used (nation stand-ins rejected).
 *
 *   npm run free-units:national
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'models', 'units');

const TOXSAM =
  'https://raw.githubusercontent.com/ToxSam/cc0-models-Polygonal-Mind/main/projects';

/** region → piece → raw GitHub GLB path (under ToxSam repo). */
export const NATIONAL_UNIT_MANIFEST = {
  europe: {
    p: 'medieval-fair/Barrel.glb',
    n: 'xyz/057_Horsely_Art.glb',
    b: 'MomusPark/Statue_greek_01_Art.glb',
    r: 'medieval-fair/Cart.glb',
    q: 'medieval-fair/Coin_PolygonalMind.glb',
    k: 'medieval-fair/Fair_Flags_Line.glb',
  },
  china: {
    p: 'lunar-year/Drum.glb',
    n: 'lunar-year/Dragon.glb',
    b: 'lunar-year/Bell.glb',
    r: 'lunar-year/Column.glb',
    q: 'lunar-year/TigerLogo.glb',
    k: 'lunar-year/MainAltar.glb',
  },
  india: {
    p: 'tomb-chaser-1/Jar01_Art.glb',
    n: 'MomusPark/DeerArmature.glb',
    b: 'tomb-chaser-1/GodAnubis_Art.glb',
    r: 'tomb-chaser-1/Obelisk_Art.glb',
    q: 'tomb-chaser-1/GodBastet_Art.glb',
    k: 'tomb-chaser-1/GodRa_Art.glb',
  },
  korea: {
    p: 'lunar-year/Drum.glb',
    n: 'lunar-year/Dragon.glb',
    b: 'lunar-year/BellStructure.glb',
    r: 'lunar-year/BuildingBase.glb',
    q: 'lunar-year/TigerLogo.glb',
    k: 'lunar-year/MainAltar.glb',
  },
  japan: {
    p: 'cryptoavatars-retro-booth/Japanese_Sign_01.glb',
    n: 'cryptoavatars-retro-booth/Japanese_Arch.glb',
    b: 'cryptoavatars-retro-booth/Japanese_Sign_05.glb',
    r: 'cryptoavatars-retro-booth/Japanese_Roof.glb',
    q: 'cryptoavatars-retro-booth/Orion.glb',
    k: 'cryptoavatars-retro-booth/RetroComputerBooth.glb',
  },
  arab: {
    p: 'tomb-chaser-1/Lance_Art.glb',
    n: 'xyz/057_Horsely_Art.glb',
    b: 'tomb-chaser-1/GodAnubis_Art.glb',
    r: 'tomb-chaser-1/Obelisk_Art.glb',
    q: 'tomb-chaser-1/GodBastet_Art.glb',
    k: 'tomb-chaser-1/GodRa_Art.glb',
  },
};

const REGIONS = Object.keys(NATIONAL_UNIT_MANIFEST);
const PIECES = ['p', 'n', 'b', 'r', 'q', 'k'];

function toxUrl(rel) {
  return `${TOXSAM}/${rel}`;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  const st = await fs.stat(dest);
  return st.size;
}

async function main() {
  console.log('National unit catalog (CC0, team-agnostic silhouettes)\n');
  console.log(
    'Note: 72 unique rigged nation-specific humans are not available free on GitHub.',
  );
  console.log('Prefer Hunyuan: public/models/rigged/{region}_{team}_{piece}.glb\n');

  let ok = 0;
  let fail = 0;

  for (const region of REGIONS) {
    for (const piece of PIECES) {
      const rel = NATIONAL_UNIT_MANIFEST[region][piece];
      const url = toxUrl(rel);
      const dest = path.join(OUT, region, `${piece}.glb`);
      try {
        const bytes = await download(url, dest);
        console.log(`  ok  ${region}/${piece}.glb  ${(bytes / 1024).toFixed(0)} KB  ← ${rel}`);
        ok += 1;
      } catch (e) {
        console.warn(`  FAIL ${region}/${piece}  ${e.message}`);
        fail += 1;
      }
    }
  }

  console.log(`\nDone: ${ok} saved, ${fail} failed → public/models/units/{region}/{piece}.glb`);
  console.log('Repo: https://github.com/ToxSam/cc0-models-Polygonal-Mind');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
