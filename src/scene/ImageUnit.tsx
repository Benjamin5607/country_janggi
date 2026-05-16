import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { loadImageUnitGeometry, unitMeshHeight } from '../units/imageUnitMesh';
import { PIECE_HEIGHT, unitTextureUrl } from '../units/unitRegistry';
import type { BattleAnim } from './battleAnimTypes';

type Props = {
  region: RegionId;
  team: Color;
  piece: PieceSymbol;
  anim?: BattleAnim;
  faceYaw?: number;
  scaleMul?: number;
  onPointer?: (button: number) => void;
  inputsLocked?: boolean;
};

/** True 3D mesh carved from unit reference PNG (voxel shell). */
export function ImageUnit({
  region,
  team,
  piece,
  anim = 'idle',
  faceYaw = 0,
  scaleMul = 1,
  onPointer,
  inputsLocked,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const url = unitTextureUrl(region, team);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let alive = true;
    loadImageUnitGeometry(url).then((g) => {
      if (alive) setGeometry(g);
    });
    return () => {
      alive = false;
    };
  }, [url]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.62,
        metalness: 0.08,
      }),
    [],
  );

  const scale = useMemo(() => {
    const target = PIECE_HEIGHT[piece] * scaleMul;
    return target / unitMeshHeight();
  }, [piece, scaleMul]);

  const pickH = PIECE_HEIGHT[piece] * scaleMul;

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    let lean = 0;
    let bob = Math.sin(t * 1.35) * 0.012;
    if (anim === 'strike') {
      lean = Math.sin(t * 18) * 0.2;
      bob = 0;
    } else if (anim === 'stagger') {
      lean = -0.16;
      bob = -0.04;
    }
    g.rotation.x = lean;
    g.position.y = bob;
  });

  const onPick = onPointer
    ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (inputsLocked) return;
        if (e.button === 2) e.nativeEvent.preventDefault();
        onPointer(e.button);
      }
    : undefined;

  if (!geometry) {
    return (
      <mesh position={[0, pickH * 0.5, 0]}>
        <capsuleGeometry args={[0.12, pickH * 0.5, 6, 12]} />
        <meshStandardMaterial color="#555" wireframe />
      </mesh>
    );
  }

  return (
    <group ref={root} rotation={[0, faceYaw, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, pickH / scale / 2, 0]} visible={false} onPointerDown={onPick}>
        <cylinderGeometry args={[0.36, 0.36, pickH / scale, 10]} />
        <meshBasicMaterial />
      </mesh>
      <mesh geometry={geometry} castShadow receiveShadow material={material} />
    </group>
  );
}
