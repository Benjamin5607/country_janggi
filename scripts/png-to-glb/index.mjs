#!/usr/bin/env node
/**
 * PNG → GLB
 * 1. Remove studio background
 * 2. Extrude character silhouette (3D body)
 * 3. Front face = textured cutout (unit only)
 *
 *   npm run png-to-glb
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildUnitGlbFromPng } from './build-unit-from-png.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const UNITS_PNG = path.join(ROOT, 'public', 'textures', 'units');
const OUT_DIR = path.join(ROOT, 'public', 'models', 'units');

const REGIONS = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const TEAMS = ['w', 'b'];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('PNG → GLB — background removal + silhouette extrude\n');
  console.log('  in:  public/textures/units/unit_*.png');
  console.log('  out: public/models/units/{region}_{team}.glb\n');

  for (const region of REGIONS) {
    for (const team of TEAMS) {
      const png = path.join(UNITS_PNG, `unit_${region}_${team}.png`);
      const out = path.join(OUT_DIR, `${region}_${team}.glb`);
      const { bytes, tris } = await buildUnitGlbFromPng(png, out);
      console.log(`  ✓ ${region}_${team}.glb  ${(bytes / 1024).toFixed(0)} KB  (~${tris} tris)`);
    }
  }

  console.log(`\nDone — ${REGIONS.length * TEAMS.length} unit GLBs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
