import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { TerrainId } from '../i18n/translations';
import { terrainPalette } from '../theme/terrain';

export function FogSync({ terrain }: { terrain: TerrainId }) {
  const { scene } = useThree();
  useEffect(() => {
    const col = terrainPalette[terrain].fog;
    scene.fog = new THREE.FogExp2(col, 0.012);
    scene.background = null;
  }, [scene, terrain]);
  return null;
}
