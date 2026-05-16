/**
 * Fallback when TRIPO_API_KEY is missing — copies shared rigged soldier per slot.
 * For real PNG→rigged units use: npm run png-to-rigged (with TRIPO_API_KEY).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'models', 'regions');
const SHARED = path.join(ROOT, 'public', 'models', 'shared', 'soldier.glb');

const REGIONS = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const PIECES = ['p', 'r', 'n', 'b', 'q', 'k'];

async function main() {
  const soldier = await fs.readFile(SHARED);
  for (const region of REGIONS) {
    const dir = path.join(OUT, region);
    await fs.mkdir(dir, { recursive: true });
    for (const piece of PIECES) {
      await fs.writeFile(path.join(dir, `${piece}.glb`), soldier);
    }
    console.log(`  ${region}/* ← soldier.glb (temporary — run png-to-rigged with API key)`);
  }
  console.log('\nFor PNG→AI rigged national units: set TRIPO_API_KEY and run npm run png-to-rigged');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
