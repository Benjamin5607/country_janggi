/**
 * Move KayKit per-piece GLBs out of the game load path.
 * Gameplay uses Hunyuan team meshes: {region}_{team}.glb
 *
 *   npm run free-units:quarantine-kaykit
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RIGGED = path.join(__dirname, '..', '..', 'public', 'models', 'rigged');
const KAYKIT = path.join(RIGGED, '_kaykit');
const PIECES = new Set(['p', 'n', 'b', 'r', 'q', 'k']);

function isKaykitPieceFile(name) {
  const m = /^[a-z]+_[wb]_([a-z])\.glb$/i.exec(name);
  return m && PIECES.has(m[1]);
}

async function main() {
  await fs.mkdir(KAYKIT, { recursive: true });
  const entries = await fs.readdir(RIGGED, { withFileTypes: true });
  let moved = 0;
  for (const ent of entries) {
    if (!ent.isFile() || !ent.name.endsWith('.glb')) continue;
    if (!isKaykitPieceFile(ent.name)) continue;
    const from = path.join(RIGGED, ent.name);
    const to = path.join(KAYKIT, ent.name);
    try {
      await fs.rename(from, to);
    } catch {
      await fs.copyFile(from, to);
      await fs.unlink(from);
    }
    moved++;
    console.log(`  moved ${ent.name} → _kaykit/`);
  }
  console.log(`\n${moved} KayKit per-piece files quarantined (not loaded in-game).`);
  console.log('Nation units: public/models/rigged/{region}_{team}.glb (Hunyuan from PNG)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
