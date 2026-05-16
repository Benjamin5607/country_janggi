#!/usr/bin/env node
/**
 * GLB Forge — bake nation+team rigged armies from soldier.glb + unit PNGs.
 *
 *   npm run glb-forge          # bake all 12 armies
 *   npm run glb-forge -- inspect
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { bakeAllArmies } from './bake-army.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const PUBLIC = path.join(ROOT, 'public');
const SOLDIER = path.join(PUBLIC, 'models/shared/soldier.glb');

async function inspect() {
  const io = new NodeIO();
  const doc = await io.read(SOLDIER);
  const root = doc.getRoot();
  console.log('GLB Forge — inspect soldier.glb\n');
  console.log('Materials:');
  for (const m of root.listMaterials()) {
    console.log(`  - ${m.getName() || '(unnamed)'}`);
  }
  console.log('\nMeshes:');
  for (const mesh of root.listMeshes()) {
    console.log(`  - ${mesh.getName() || '(unnamed)'}`);
  }
  console.log('\nAnimations:');
  for (const a of root.listAnimations()) {
    console.log(`  - ${a.getName() || '(unnamed)'}`);
  }
}

async function bake() {
  console.log('GLB Forge — baking 12 armies (region × team)\n');
  console.log(`  rig:  ${path.relative(ROOT, SOLDIER)}`);
  console.log(`  out:  public/models/armies/{region}_{team}.glb\n`);

  const results = await bakeAllArmies(PUBLIC, SOLDIER);
  for (const { region, team, outFile, bytes } of results) {
    const rel = path.relative(ROOT, outFile);
    console.log(`  ✓ ${rel}  (${(bytes / 1024).toFixed(0)} KB)`);
  }
  console.log(`\nDone — ${results.length} army GLBs ready for the game.`);
}

const cmd = process.argv[2] || 'bake';

if (cmd === 'inspect') {
  inspect().catch(fail);
} else if (cmd === 'bake') {
  bake().catch(fail);
} else {
  console.error(`Unknown command: ${cmd}\nUsage: node scripts/glb-forge/index.mjs [bake|inspect]`);
  process.exit(1);
}

function fail(err) {
  console.error(err);
  process.exit(1);
}
