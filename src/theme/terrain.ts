import * as THREE from 'three';
import type { TerrainId } from '../i18n/translations';

export const terrainPalette: Record<
  TerrainId,
  { ground: string; ground2: string; fog: string; skyTop: string; skyBottom: string }
> = {
  plains: {
    ground: '#7d9b5c',
    ground2: '#5c7a42',
    fog: '#c8d4e8',
    skyTop: '#87a8d8',
    skyBottom: '#dde6f2',
  },
  grassland: {
    ground: '#6a8f4a',
    ground2: '#4f6e38',
    fog: '#b8dcc4',
    skyTop: '#6aa89a',
    skyBottom: '#d4ebe0',
  },
  desert: {
    ground: '#d4b896',
    ground2: '#a88458',
    fog: '#e8dcc8',
    skyTop: '#d4a574',
    skyBottom: '#f5e6d4',
  },
  steppe: {
    ground: '#9aa86e',
    ground2: '#6f7a4e',
    fog: '#cfd8bc',
    skyTop: '#8aa0c4',
    skyBottom: '#e2e8dc',
  },
  highlands: {
    ground: '#5c6b5a',
    ground2: '#3d4a40',
    fog: '#a8b4bc',
    skyTop: '#5a6d78',
    skyBottom: '#c5ccd2',
  },
};

export function makeTerrainMaterial(terrain: TerrainId): THREE.MeshStandardMaterial {
  const p = terrainPalette[terrain];
  return new THREE.MeshStandardMaterial({
    color: p.ground,
    roughness: 0.92,
    metalness: 0.02,
  });
}
