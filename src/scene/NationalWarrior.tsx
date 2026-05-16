import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { PIECE_HEIGHT, unitTextureUrl } from '../units/unitRegistry';
import type { BattleAnim } from './battleAnimTypes';

type Props = {
  region: RegionId;
  team: Color;
  piece: PieceSymbol;
  faceYaw?: number;
  anim?: BattleAnim;
  scaleMul?: number;
  onPointer?: (button: number) => void;
  inputsLocked?: boolean;
};

export function NationalWarrior({
  region,
  team,
  piece,
  faceYaw = 0,
  anim = 'idle',
  scaleMul = 1,
  onPointer,
  inputsLocked,
}: Props) {
  const card = useRef<THREE.Group>(null);
  const url = unitTextureUrl(region, team);
  const tex = useTexture(url);

  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.5,
      roughness: 0.55,
      metalness: 0.06,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    return m;
  }, [tex]);

  const h = PIECE_HEIGHT[piece] * scaleMul;
  const aspect =
    tex.image && 'width' in tex.image && tex.image.width
      ? tex.image.width / (tex.image.height || 1)
      : 0.55;
  const w = h * aspect * 0.55;

  useFrame((state) => {
    const g = card.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    let lean = 0;
    let bob = Math.sin(t * 1.35) * 0.012;
    if (anim === 'strike') {
      lean = Math.sin(t * 18) * 0.22;
      bob = 0;
    } else if (anim === 'stagger') {
      lean = -0.18;
      bob = -0.05;
    }
    g.rotation.x = lean;
    g.position.y = 0.02 + bob;
  });

  const onPick = onPointer
    ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (inputsLocked) return;
        if (e.button === 2) e.nativeEvent.preventDefault();
        onPointer(e.button);
      }
    : undefined;

  return (
    <group rotation={[0, faceYaw, 0]}>
      <mesh position={[0, h * 0.5, 0]} visible={false} onPointerDown={onPick}>
        <cylinderGeometry args={[0.38, 0.38, h, 10]} />
        <meshBasicMaterial />
      </mesh>
      <group ref={card}>
        <mesh castShadow position={[0, h * 0.5, 0]} material={mat}>
          <planeGeometry args={[w, h]} />
        </mesh>
      </group>
    </group>
  );
}
