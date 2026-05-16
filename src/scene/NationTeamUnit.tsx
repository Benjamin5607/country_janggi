import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { loadNationTeamExtrudeGeometry } from '../units/nationTeamExtrude';
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

/**
 * Distinct army per (region, team) — smooth extruded silhouette from reference PNG.
 * Not a shared rig; not voxel bricks.
 */
export function NationTeamUnit({
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
  const tex = useTexture(url);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [baseHeight, setBaseHeight] = useState(1);

  useEffect(() => {
    let alive = true;
    loadNationTeamExtrudeGeometry(url).then(({ geometry: g, baseHeight: h }) => {
      if (alive) {
        setGeometry(g);
        setBaseHeight(h);
      }
    });
    return () => {
      alive = false;
    };
  }, [url]);

  const material = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.48,
      metalness: 0.06,
      side: THREE.DoubleSide,
    });
  }, [tex]);

  const targetH = PIECE_HEIGHT[piece] * scaleMul;
  const scale = targetH / baseHeight;
  const pickH = targetH;

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    let lean = 0;
    let bob = Math.sin(t * 1.35) * 0.01;
    if (anim === 'strike') {
      lean = Math.sin(t * 18) * 0.18;
      bob = 0;
    } else if (anim === 'stagger') {
      lean = -0.14;
      bob = -0.03;
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
        <capsuleGeometry args={[0.14, pickH * 0.45, 6, 12]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
    );
  }

  const aspect =
    tex.image && 'width' in tex.image && tex.image.width
      ? tex.image.width / (tex.image.height || 1)
      : 0.55;

  return (
    <group ref={root} rotation={[0, faceYaw, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.5, 0]} visible={false} onPointerDown={onPick}>
        <cylinderGeometry args={[0.34, 0.34, 1, 10]} />
        <meshBasicMaterial />
      </mesh>
      <mesh geometry={geometry} castShadow receiveShadow material={material} />
      <mesh position={[0, 0.52, 0.07]} castShadow receiveShadow>
        <planeGeometry args={[aspect * 0.52, 0.92]} />
        <meshStandardMaterial
          map={tex}
          transparent
          alphaTest={0.45}
          roughness={0.5}
          metalness={0.04}
          side={THREE.DoubleSide}
          depthWrite
        />
      </mesh>
    </group>
  );
}
