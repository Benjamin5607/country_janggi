import { useMemo } from 'react';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { regionalCostume } from '../theme/regionalCostume';

type Props = {
  region: RegionId;
  team: Color;
  piece: PieceSymbol;
};

function accentMat(region: RegionId, team: Color, metal = false) {
  const rm = regionalCostume[region];
  return new THREE.MeshStandardMaterial({
    color: metal ? rm.hardware : team === 'w' ? '#e8e8ec' : '#1a1a20',
    metalness: metal ? 0.7 : 0.15,
    roughness: metal ? 0.28 : 0.65,
    emissive: rm.trim,
    emissiveIntensity: metal ? 0.08 : 0.02,
  });
}

/**
 * Extra 3D geometry per culture so armies read clearly at board scale.
 */
export function RegionalAccents({ region, team, piece }: Props) {
  const rank = piece === 'k' ? 1.1 : piece === 'q' ? 1.05 : 1;
  const mat = useMemo(() => accentMat(region, team), [region, team]);
  const metal = useMemo(() => accentMat(region, team, true), [region, team]);

  switch (region) {
    case 'europe':
      return (
        <group scale={rank}>
          <mesh material={mat} castShadow position={[0.28, 1.05, 0.08]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.42, 0.52, 0.06]} />
          </mesh>
          <mesh material={metal} castShadow position={[0, 1.42, 0]}>
            <coneGeometry args={[0.14, 0.18, 6]} />
          </mesh>
        </group>
      );
    case 'china':
      return (
        <group scale={rank}>
          <mesh material={mat} castShadow position={[0, 1.48, 0]}>
            <boxGeometry args={[0.38, 0.12, 0.32]} />
          </mesh>
          <mesh material={metal} castShadow position={[-0.12, 1.52, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
          </mesh>
          <mesh material={metal} castShadow position={[0.12, 1.52, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
          </mesh>
        </group>
      );
    case 'india':
      return (
        <group scale={rank}>
          <mesh material={mat} castShadow position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
          </mesh>
          <mesh material={metal} castShadow position={[0.2, 1.15, 0]}>
            <boxGeometry args={[0.05, 0.55, 0.05]} />
          </mesh>
        </group>
      );
    case 'korea':
      return (
        <group scale={rank}>
          <mesh material={mat} castShadow position={[0, 1.52, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 0.1, 12]} />
          </mesh>
          <mesh material={metal} castShadow position={[0, 1.62, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
          </mesh>
        </group>
      );
    case 'japan':
      return (
        <group scale={rank}>
          <mesh material={mat} castShadow position={[0, 1.45, 0]}>
            <coneGeometry args={[0.26, 0.22, 4]} />
          </mesh>
          <mesh material={metal} castShadow position={[0.32, 0.95, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.04, 0.5, 0.04]} />
          </mesh>
        </group>
      );
    case 'arab':
      return (
        <group scale={rank}>
          <mesh material={mat} castShadow position={[0, 1.48, 0]}>
            <sphereGeometry args={[0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={metal} castShadow position={[0.26, 1.0, 0]} rotation={[0.2, 0, -0.6]}>
            <boxGeometry args={[0.04, 0.45, 0.04]} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}
