import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const GRID_W = 52;
const GRID_H = 104;
const DEPTH = 16;
const VOXEL = 0.0175;

const geometryCache = new Map<string, THREE.BufferGeometry>();

function sampleAlpha(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  gx: number,
  gy: number,
): number {
  const ix = THREE.MathUtils.clamp(Math.floor((gx / GRID_W) * imgW), 0, imgW - 1);
  const iy = THREE.MathUtils.clamp(Math.floor((1 - gy / GRID_H) * imgH), 0, imgH - 1);
  return data[(iy * imgW + ix) * 4 + 3];
}

function sampleColor(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  gx: number,
  gy: number,
): [number, number, number] {
  const ix = THREE.MathUtils.clamp(Math.floor((gx / GRID_W) * imgW), 0, imgW - 1);
  const iy = THREE.MathUtils.clamp(Math.floor((1 - gy / GRID_H) * imgH), 0, imgH - 1);
  const i = (iy * imgW + ix) * 4;
  return [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
}

/** Build a solid 3D volume from reference PNG alpha (voxel shell). */
export function buildImageUnitMeshFromPixels(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
): THREE.BufferGeometry {
  const boxes: THREE.BufferGeometry[] = [];
  const tmp = new THREE.Object3D();
  const filled = new Uint8Array(GRID_W * GRID_H * DEPTH);
  const idx = (x: number, y: number, z: number) => x + y * GRID_W + z * GRID_W * GRID_H;

  for (let z = 0; z < DEPTH; z++) {
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        if (sampleAlpha(data, imgW, imgH, x, y) < 90) continue;
        const t = z / (DEPTH - 1);
        const keep = t < 0.62 || (t < 0.92 && ((x + y + z) % 3 !== 0));
        if (keep) filled[idx(x, y, z)] = 1;
      }
    }
  }

  const isEmpty = (x: number, y: number, z: number) => {
    if (x < 0 || y < 0 || z < 0 || x >= GRID_W || y >= GRID_H || z >= DEPTH) return true;
    return !filled[idx(x, y, z)];
  };

  for (let z = 0; z < DEPTH; z++) {
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        if (isEmpty(x, y, z)) continue;
        const surface =
          isEmpty(x + 1, y, z) ||
          isEmpty(x - 1, y, z) ||
          isEmpty(x, y + 1, z) ||
          isEmpty(x, y - 1, z) ||
          isEmpty(x, y, z + 1) ||
          isEmpty(x, y, z - 1);
        if (!surface) continue;

        const box = new THREE.BoxGeometry(VOXEL, VOXEL, VOXEL);
        tmp.position.set((x - GRID_W / 2) * VOXEL, y * VOXEL, (z - DEPTH / 2) * VOXEL * 0.9);
        tmp.updateMatrix();
        box.applyMatrix4(tmp.matrix);
        boxes.push(box);
      }
    }
  }

  if (boxes.length === 0) {
    return new THREE.BoxGeometry(0.3, 0.9, 0.12);
  }

  const merged = mergeGeometries(boxes)!;
  boxes.forEach((b) => b.dispose());

  const pos = merged.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const gx = Math.floor(pos.getX(i) / VOXEL + GRID_W / 2);
    const gy = Math.floor(pos.getY(i) / VOXEL);
    const [r, g, b] = sampleColor(data, imgW, imgH, gx, gy);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.computeVertexNormals();

  merged.computeBoundingBox();
  const bb = merged.boundingBox!;
  merged.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);

  return merged;
}

export async function loadImageUnitGeometry(url: string): Promise<THREE.BufferGeometry> {
  const hit = geometryCache.get(url);
  if (hit) return hit.clone();

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const geometry = buildImageUnitMeshFromPixels(imageData.data, canvas.width, canvas.height);
  geometryCache.set(url, geometry);
  return geometry.clone();
}

export function unitMeshHeight(): number {
  return GRID_H * VOXEL;
}
