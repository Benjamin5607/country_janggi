import * as THREE from 'three';
import type { RegionId } from '../i18n/translations';

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

const REGIONS: RegionId[] = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];

export function garmentTextureUrl(region: RegionId, team: 'w' | 'b'): string {
  return `/textures/garments/garment_${region}_${team}.png`;
}

/** Photoreal garment PNG from `public/textures/garments/`. */
export function getGarmentTexture(region: RegionId, team: 'w' | 'b'): THREE.Texture {
  const key = `${region}_${team}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const tex = loader.load(garmentTextureUrl(region, team));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

export function preloadGarmentTextures(): void {
  for (const region of REGIONS) {
    getGarmentTexture(region, 'w');
    getGarmentTexture(region, 'b');
  }
}

/** Multiply tint — keep white so PNG colors show as authored. */
export const TEAM_UNIFORM = {
  w: new THREE.Color('#ffffff'),
  b: new THREE.Color('#ffffff'),
} as const;
