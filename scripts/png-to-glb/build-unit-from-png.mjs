/**
 * PNG (bg removed) → silhouette extrude + front textured plane → GLB.
 */
import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import { removeBackground } from './remove-background.mjs';
import { buildSilhouetteShape } from './silhouette-shape.mjs';
import { buildGlbDocument } from './write-glb.mjs';

const TEX_W = 512;
const TEX_H = 1024;

/**
 * @param {string} pngPath
 * @param {string} outPath
 */
export async function buildUnitGlbFromPng(pngPath, outPath) {
  const cleaned = await removeBackground(pngPath);

  const texPng = await sharp(cleaned.png)
    .resize(TEX_W, TEX_H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const meta = await sharp(texPng).metadata();
  const imgW = meta.width ?? TEX_W;
  const imgH = meta.height ?? TEX_H;
  const { data: rgba } = await sharp(texPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const shape = buildSilhouetteShape(rgba, imgW, imgH);
  if (!shape) throw new Error(`No silhouette in ${pngPath}`);

  const depth = 0.16;
  const shellGeo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.018,
    bevelSegments: 4,
    bevelOffset: 0,
    curveSegments: 8,
    steps: 1,
  });
  shellGeo.center();
  shellGeo.rotateX(-Math.PI / 2);

  const aspect = imgW / imgH;
  const planeH = 1;
  const planeW = aspect * 0.58;
  const frontGeo = new THREE.PlaneGeometry(planeW, planeH);
  const front = new THREE.Mesh(frontGeo);
  front.position.set(0, 0.5, depth * 0.5 + 0.012);

  const group = new THREE.Group();
  group.add(new THREE.Mesh(shellGeo));
  group.add(front);

  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);
  const h = size.y || 1;
  const s = 1 / h;
  group.scale.setScalar(s);
  const box2 = new THREE.Box3().setFromObject(group);
  group.position.y -= box2.min.y;
  group.updateMatrixWorld(true);

  shellGeo.applyMatrix4(group.children[0].matrixWorld);
  frontGeo.applyMatrix4(front.matrixWorld);

  const doc = buildGlbDocument(shellGeo, frontGeo, texPng);
  const io = new NodeIO();
  await io.write(outPath, doc);

  const tris =
    ((shellGeo.index?.count ?? shellGeo.attributes.position.count) / 3) +
    (frontGeo.index?.count ?? 2);

  shellGeo.dispose();
  frontGeo.dispose();

  const fs = await import('node:fs/promises');
  const stat = await fs.stat(outPath);
  return { bytes: stat.size, tris: tris | 0 };
}
