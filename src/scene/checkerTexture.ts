import * as THREE from 'three';

let cached: THREE.CanvasTexture | null = null;

/** Procedural 8×8 board — always visible even if PNG missing. */
export function getCheckerTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const size = 512;
  const cells = 8;
  const cell = size / cells;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const light = (x + y) % 2 === 0;
      ctx.fillStyle = light ? '#e8e4dc' : '#6b5a48';
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = 8;
  cached = tex;
  return tex;
}
