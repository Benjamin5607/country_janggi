import * as THREE from 'three';

const GRID_W = 64;
const GRID_H = 128;
const ALPHA_THRESH = 100;

function sampleAlpha(data, imgW, imgH, gx, gy) {
  const ix = THREE.MathUtils.clamp(Math.floor((gx / GRID_W) * imgW), 0, imgW - 1);
  const iy = THREE.MathUtils.clamp(Math.floor((1 - gy / GRID_H) * imgH), 0, imgH - 1);
  return data[(iy * imgW + ix) * 4 + 3];
}

/**
 * @param {Buffer} rgba
 * @param {number} imgW
 * @param {number} imgH
 * @returns {THREE.Shape | null}
 */
export function buildSilhouetteShape(rgba, imgW, imgH) {
  const data = new Uint8Array(rgba);
  const left = [];
  const right = [];

  for (let gy = 0; gy < GRID_H; gy++) {
    let minX = -1;
    let maxX = -1;
    for (let gx = 0; gx < GRID_W; gx++) {
      if (sampleAlpha(data, imgW, imgH, gx, gy) < ALPHA_THRESH) continue;
      if (minX < 0) minX = gx;
      maxX = gx;
    }
    if (minX < 0) continue;
    const y = gy / GRID_H;
    left.push(new THREE.Vector2((minX - GRID_W / 2) / GRID_W, y));
    right.push(new THREE.Vector2((maxX - GRID_W / 2) / GRID_W, y));
  }

  if (left.length < 4) return null;

  const contour = [...left, ...right.reverse()];
  return new THREE.Shape(contour);
}
