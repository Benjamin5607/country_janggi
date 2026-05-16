import * as THREE from 'three';

const GRID_W = 56;
const GRID_H = 112;
const ALPHA_THRESH = 120;

const geometryCache = new Map<string, THREE.BufferGeometry>();
const baseHeightCache = new Map<string, number>();

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

function buildSilhouetteShape(data: Uint8ClampedArray, imgW: number, imgH: number): THREE.Shape | null {
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];

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

export function buildNationTeamExtrudeGeometry(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
): THREE.BufferGeometry {
  const shape = buildSilhouetteShape(data, imgW, imgH);
  if (!shape) {
    return new THREE.BoxGeometry(0.35, 0.85, 0.14);
  }

  const depth = 0.2;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.022,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 8,
    steps: 1,
  });

  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox!;
  const h = bb.max.y - bb.min.y || 1;
  geometry.translate(0, -bb.min.y, 0);
  const s = 1 / h;
  geometry.scale(s, s, s);
  geometry.computeVertexNormals();

  return geometry;
}

export async function loadNationTeamExtrudeGeometry(url: string): Promise<{
  geometry: THREE.BufferGeometry;
  baseHeight: number;
}> {
  const cached = geometryCache.get(url);
  const cachedH = baseHeightCache.get(url);
  if (cached && cachedH !== undefined) {
    return { geometry: cached.clone(), baseHeight: cachedH };
  }

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

  const geometry = buildNationTeamExtrudeGeometry(imageData.data, canvas.width, canvas.height);
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox!;
  const baseHeight = bb.max.y - bb.min.y || 1;

  geometryCache.set(url, geometry);
  baseHeightCache.set(url, baseHeight);

  return { geometry: geometry.clone(), baseHeight };
}
