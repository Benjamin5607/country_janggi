import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Color } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { riggedTeamGlbUrl } from '../models/armyModels';
import { applyTeamTint } from './applyTeamTint';
import { centerUnitXZ, computeFootLift } from './unitGrounding';
import { autoScaleUnitToBoard } from './unitAutoScale';
import type { BattleAnim } from './battleAnimTypes';

type Props = {
  region: RegionId;
  team: Color;
  faceYaw?: number;
  anim?: BattleAnim;
  scaleMul?: number;
  onPointer?: (button: number) => void;
  inputsLocked?: boolean;
};

/**
 * Nation team Hunyuan GLB only — no PNG extrude slab, no KayKit.
 */
export function HunyuanUnit({
  region,
  team,
  faceYaw = 0,
  anim = 'idle',
  scaleMul = 1,
  onPointer,
  inputsLocked,
}: Props) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const footLift = useRef(0.06);
  const url = riggedTeamGlbUrl(region, team);

  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.SkinnedMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    applyTeamTint(root, team);
    centerUnitXZ(root);
    autoScaleUnitToBoard(root, 1.12 * scaleMul);
    footLift.current = computeFootLift(root, 0.05);
    return root;
  }, [scene, team, scaleMul]);

  useFrame((state) => {
    const m = body.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.position.y = footLift.current + Math.sin(t * 1.35) * 0.012;
    if (anim === 'strike') {
      m.rotation.x = -0.28 * Math.sin((t * 4) % (Math.PI * 2));
    } else if (anim === 'stagger') {
      m.rotation.x = 0.18;
    } else {
      m.rotation.x = 0;
      m.rotation.y = Math.sin(t * 0.7) * 0.03;
    }
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
    <group ref={rig} rotation={[0, faceYaw, 0]}>
      <mesh position={[0, 0.55, 0]} visible={false} onPointerDown={onPick}>
        <cylinderGeometry args={[0.35, 0.35, 1.1, 10]} />
        <meshBasicMaterial />
      </mesh>
      <group ref={body}>
        <primitive object={model} />
      </group>
    </group>
  );
}
