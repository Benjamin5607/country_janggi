import { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { getCatalogRevision, resolveModelUrl, subscribeModelCatalog } from '../assets/modelCatalog';
import { PIECE_SCALE } from '../models/registry';
import type { BattleAnim } from './battleAnimTypes';

export type UnitProps = {
  region: RegionId;
  team: Color;
  piece: PieceSymbol;
  anim?: BattleAnim;
  faceYaw?: number;
  scaleMul?: number;
  onPointer?: (button: number) => void;
  inputsLocked?: boolean;
};

/** Unit from PNG → GLB (`npm run png-to-glb`). */
export function PngUnitGlb({
  region,
  team,
  piece,
  anim = 'idle',
  faceYaw = 0,
  scaleMul = 1,
  onPointer,
  inputsLocked,
}: UnitProps) {
  const root = useRef<THREE.Group>(null);
  const [catalogRev, setCatalogRev] = useState(0);

  useEffect(() => subscribeModelCatalog(() => setCatalogRev(getCatalogRevision())), []);

  const modelUrl = resolveModelUrl(region, team, piece);
  const { scene } = useGLTF(modelUrl);

  const model = useMemo(() => {
    const g = scene.clone(true);
    g.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    return g;
  }, [scene, catalogRev, modelUrl]);

  const scale = PIECE_SCALE[piece] * scaleMul;
  const pickH = scale * 1.05;

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    let lean = 0;
    let bob = Math.sin(t * 1.35) * 0.012;
    if (anim === 'strike') {
      lean = Math.sin(t * 18) * 0.14;
      bob = 0;
    } else if (anim === 'stagger') {
      lean = -0.1;
      bob = -0.025;
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

  return (
    <group ref={root} rotation={[0, faceYaw, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, pickH * 0.5, 0]} visible={false} onPointerDown={onPick}>
        <cylinderGeometry args={[0.36, 0.36, pickH, 10]} />
        <meshBasicMaterial />
      </mesh>
      <primitive object={model} />
    </group>
  );
}

