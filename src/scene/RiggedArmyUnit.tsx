import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import {
  getCatalogRevision,
  hasCustomModel,
  resolveModelUrl,
  subscribeModelCatalog,
} from '../assets/modelCatalog';
import { resolveRiggedGlbUrl, riggedTeamGlbUrl } from '../models/armyModels';
import { PIECE_ROLE } from '../models/pieceRoleVisual';
import type { BattleAnim } from './battleAnimTypes';
import { applyTeamTint } from './applyTeamTint';
import { centerUnitXZ, computeFootLift } from './unitGrounding';

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

function pickClip(actions: Record<string, THREE.AnimationAction | null | undefined>, names: string[]) {
  for (const n of names) {
    const hit = actions[n] ?? actions[n.toLowerCase()] ?? actions[n.toUpperCase()];
    if (hit) return hit;
  }
  const keys = Object.keys(actions);
  for (const k of keys) {
    const low = k.toLowerCase();
    if (names.some((n) => low.includes(n.toLowerCase()))) return actions[k];
  }
  return null;
}

/** Nation PNG→3D mesh + subtle per-piece scale (same art, different rank size). */
export function RiggedArmyUnit({
  region,
  team,
  piece,
  anim = 'idle',
  faceYaw = 0,
  scaleMul = 1,
  onPointer,
  inputsLocked,
}: UnitProps) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const animRoot = useRef<THREE.Group>(null);
  const footLift = useRef(0);
  const [catalogRev, setCatalogRev] = useState(getCatalogRevision());
  const [riggedUrl, setRiggedUrl] = useState<string>(() => riggedTeamGlbUrl(region, team));

  useEffect(() => subscribeModelCatalog(() => setCatalogRev(getCatalogRevision())), []);

  const custom = hasCustomModel(region, piece);

  useEffect(() => {
    if (custom) return;
    const teamUrl = riggedTeamGlbUrl(region, team);
    setRiggedUrl(teamUrl);
    let alive = true;
    resolveRiggedGlbUrl(region, team, piece).then((url) => {
      if (alive && url !== teamUrl) setRiggedUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [region, team, piece, custom, catalogRev]);

  const modelUrl = custom
    ? resolveModelUrl(region, team, piece, 'rigged')
    : riggedUrl || riggedTeamGlbUrl(region, team);

  const gltf = useGLTF(modelUrl);
  const { scene, animations } = gltf;

  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    applyTeamTint(c, team);
    centerUnitXZ(c);
    footLift.current = computeFootLift(c, 0.08);
    return c;
  }, [scene, catalogRev, modelUrl, team]);

  const { actions } = useAnimations(animations, animRoot);
  const role = PIECE_ROLE[piece];
  const scale = role.scale * scaleMul;
  const pickH = 1.05 * scale * role.height;
  const hasSkelAnim = animations.length > 0 && Object.keys(actions).length > 0;

  useEffect(() => {
    if (!hasSkelAnim) return;
    Object.values(actions).forEach((a) => a?.stop());

    const idle = pickClip(actions, ['Idle', 'idle', 'preset:idle', 'mixamo.com']);
    const walk = pickClip(actions, ['Walk', 'walk', 'preset:walk', 'Run', 'run']);
    const hurt = pickClip(actions, ['Hurt', 'hurt', 'preset:hurt']);

    if (anim === 'strike') {
      const atk = pickClip(actions, ['Slash', 'slash', 'Attack', 'strike']) ?? idle;
      atk?.reset().setEffectiveTimeScale(1.1).fadeIn(0.08).play();
      return () => {
        atk?.fadeOut(0.12);
      };
    }
    if (anim === 'stagger') {
      const w = hurt ?? walk ?? idle;
      w?.reset().setEffectiveTimeScale(-0.85).fadeIn(0.1).play();
      return () => {
        w?.fadeOut(0.12);
      };
    }
    idle?.reset().setEffectiveTimeScale(0.9).fadeIn(0.15).play();
    return () => {
      idle?.fadeOut(0.15);
    };
  }, [anim, actions, modelUrl, hasSkelAnim]);

  useFrame((state) => {
    if (!rig.current || !animRoot.current) return;
    const t = state.clock.elapsedTime;
    const m = animRoot.current;
    const lift = footLift.current;

    if (!hasSkelAnim) {
      m.rotation.set(0, 0, 0);
      m.position.set(0, lift, 0);
      m.scale.set(1, 1, 1);
      if (anim === 'strike') {
        const p = (t * 4) % 1;
        m.rotation.x = -0.35 * Math.sin(p * Math.PI);
        m.position.z = 0.06 * Math.sin(p * Math.PI);
      } else if (anim === 'stagger') {
        m.rotation.x = 0.22;
        m.position.y = lift + 0.03;
      } else {
        m.position.y = lift + Math.sin(t * 1.35) * 0.018;
        m.rotation.y = Math.sin(t * 0.7) * 0.04;
      }
      body.current?.position.set(0, 0, 0);
      return;
    }

    body.current?.position.set(0, lift, 0);
    if (anim !== 'idle') return;
    m.position.y = Math.sin(t * 1.35) * 0.012;
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
    <group
      ref={rig}
      rotation={[0, faceYaw, 0]}
      position={[0, role.yBias, 0]}
      scale={[scale, scale * role.height, scale]}
    >
      <mesh position={[0, pickH * 0.45, 0]} visible={false} onPointerDown={onPick}>
        <cylinderGeometry args={[0.4, 0.4, pickH, 10]} />
        <meshBasicMaterial />
      </mesh>
      <group ref={body}>
        <group ref={animRoot}>
          <primitive object={clone} />
        </group>
      </group>
    </group>
  );
}
