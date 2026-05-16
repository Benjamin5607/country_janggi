/**
 * Bake one army GLB: shared soldier rig + nation/team reference PNG on body.
 * No runtime scale baked in — game applies PIECE_SCALE.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import { removeBackground } from '../png-to-glb/remove-background.mjs';

const REGIONS = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const TEAMS = ['w', 'b'];

/** Body/cloth slots on soldier.glb — do not touch visor (separate mesh). */
function isBodyMaterial(name) {
  const n = (name || '').toLowerCase();
  if (/visor|skin|face|weapon|metal|rifle|gun|sword/i.test(n)) return false;
  return /body|cloth|coat|vest|armor|tunic|uniform|vanguardbody/i.test(n);
}

export async function bakeArmyGlb({ publicDir, region, team, soldierPath }) {
  const io = new NodeIO();
  const unitPng = path.join(publicDir, 'textures/units', `unit_${region}_${team}.png`);
  const outDir = path.join(publicDir, 'models/armies');
  await fs.mkdir(outDir, { recursive: true });

  const doc = await io.read(soldierPath);
  const root = doc.getRoot();
  const cleaned = await removeBackground(unitPng);
  const unitBytes = await sharp(cleaned.png)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const tex = doc
    .createTexture(`army_${region}_${team}`)
    .setMimeType('image/png')
    .setImage(unitBytes);

  const teamDim = team === 'b' ? 0.82 : 1;

  for (const mat of root.listMaterials()) {
    const name = mat.getName() || '';
    if (isBodyMaterial(name)) {
      mat.setBaseColorTexture(tex);
      mat.setBaseColorFactor([teamDim, teamDim, teamDim * 0.98, 1]);
      mat.setMetallicFactor(0.08);
      mat.setRoughnessFactor(0.52);
    } else if (/visor/i.test(name.toLowerCase())) {
      mat.setBaseColorTexture(tex);
      mat.setBaseColorFactor([teamDim, teamDim, teamDim, 1]);
      mat.setAlphaMode('MASK');
      mat.setAlphaCutoff(0.38);
    } else if (/metal|weapon/i.test(name.toLowerCase())) {
      const metalDim = team === 'b' ? 0.72 : 1;
      mat.setBaseColorFactor([metalDim * 0.55, metalDim * 0.58, metalDim * 0.62, 1]);
      mat.setMetallicFactor(0.72);
      mat.setRoughnessFactor(0.28);
    }
  }

  const outFile = path.join(outDir, `${region}_${team}.glb`);
  await io.write(outFile, doc);
  const stat = await fs.stat(outFile);
  return { outFile, bytes: stat.size };
}

export async function bakeAllArmies(publicDir, soldierPath) {
  const results = [];
  for (const region of REGIONS) {
    for (const team of TEAMS) {
      const r = await bakeArmyGlb({ publicDir, region, team, soldierPath });
      results.push({ region, team, ...r });
    }
  }
  return results;
}

export { REGIONS, TEAMS };
