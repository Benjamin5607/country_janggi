#!/usr/bin/env node
/**
 * Full unit pipeline (overcomes PNG-only limits):
 *   1. Strip background from reference PNGs
 *   2. Bake onto rigged soldier → GLB with Idle/Walk
 *   3. Game loads rigged GLBs (real 3D warriors, not extruded blocks)
 *
 *   npm run build-units
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bakeAllArmies } from './glb-forge/bake-army.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SOLDIER = path.join(PUBLIC, 'models/shared/soldier.glb');

console.log('build-units — PNG → rigged GLB armies\n');

const results = await bakeAllArmies(PUBLIC, SOLDIER);
for (const { region, team, outFile, bytes } of results) {
  console.log(`  ✓ ${path.basename(outFile)}  ${(bytes / 1024).toFixed(0)} KB`);
}
console.log(`\nDone — ${results.length} rigged armies in public/models/armies/`);
