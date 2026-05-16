/**
 * Apply nation unit PNG as baseColor on all materials in a mesh GLB.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import { removeBackground } from '../png-to-glb/remove-background.mjs';

const [glbPath, pngPath] = process.argv.slice(2);
if (!glbPath || !pngPath) {
  console.error('Usage: node bake-unit-texture.mjs <model.glb> <unit.png>');
  process.exit(1);
}

const cleaned = await removeBackground(pngPath);
const texBytes = await sharp(cleaned.png)
  .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

const io = new NodeIO();
const doc = await io.read(glbPath);
const root = doc.getRoot();
const tex = doc.createTexture(path.basename(pngPath)).setMimeType('image/png').setImage(texBytes);

for (const mat of root.listMaterials()) {
  mat.setBaseColorTexture(tex);
  mat.setBaseColorFactor([1, 1, 1, 1]);
  mat.setMetallicFactor(0.05);
  mat.setRoughnessFactor(0.55);
}

await io.write(glbPath, doc);
console.log(`baked texture -> ${path.basename(glbPath)}`);
