import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { PIECE_HEIGHT } from '../units/unitRegistry';
import { regionalCostume } from '../theme/regionalCostume';

type Props = {
  region: RegionId;
  team: Color;
  piece: PieceSymbol;
  faceYaw?: number;
};

/** Shown when unit PNG fails to load — keeps the game playable. */
export function PlaceholderWarrior({ region, team, piece, faceYaw = 0 }: Props) {
  const g = useRef<THREE.Group>(null);
  const h = PIECE_HEIGHT[piece];
  const cloth = team === 'w' ? '#f4f4f8' : '#18181c';
  const trim = regionalCostume[region].trim;

  useFrame((state) => {
    if (!g.current) return;
    g.current.position.y = 0.02 + Math.sin(state.clock.elapsedTime * 1.3) * 0.01;
  });

  return (
    <group ref={g} rotation={[0, faceYaw, 0]}>
      <mesh castShadow position={[0, h * 0.45, 0]}>
        <capsuleGeometry args={[0.22, h * 0.55, 8, 16]} />
        <meshStandardMaterial color={cloth} roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, h * 0.88, 0]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color="#bc8f78" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, h * 0.92, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.1, 12]} />
        <meshStandardMaterial color={trim} roughness={0.5} />
      </mesh>
    </group>
  );
}
