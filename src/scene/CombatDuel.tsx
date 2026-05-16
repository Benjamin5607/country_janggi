import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../game/GameContext';
import { BOARD_PIECE_Y } from '../game/boardConstants';
import { squareToBoardXZ, yawFaceTarget } from '../game/janggiUtils';
import { HunyuanUnit } from './HunyuanUnit';

const DUEL_MS = 1750;

export function CombatDuel() {
  const { pendingCombat, resolvePendingCombat, whiteRegion, blackRegion } = useGame();
  const atkGroup = useRef<THREE.Group>(null);
  const vicGroup = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);

  const duel = useMemo(() => {
    if (!pendingCombat) return null;
    return pendingCombat.combat;
  }, [pendingCombat]);

  useEffect(() => {
    t0.current = null;
    if (!pendingCombat) return;
    const id = window.setTimeout(resolvePendingCombat, DUEL_MS);
    return () => window.clearTimeout(id);
  }, [pendingCombat, resolvePendingCombat]);

  useFrame((st) => {
    if (!duel) return;
    if (t0.current === null) t0.current = st.clock.elapsedTime;
    const t = st.clock.elapsedTime - t0.current;

    const [ax, az] = squareToBoardXZ(duel.attackerSquare);
    const [vx, vz] = squareToBoardXZ(duel.victimSquare);
    const dirX = vx - ax;
    const dirZ = vz - az;
    const len = Math.hypot(dirX, dirZ) || 1;
    const nx = dirX / len;
    const nz = dirZ / len;

    let lunge = 0;
    if (t < 0.19) {
      lunge = Math.sin((t / 0.19) * (Math.PI / 2)) * 0.52;
    } else if (t < 0.48) {
      const u = (t - 0.19) / 0.29;
      lunge = 0.52 * (1 - u * u);
    }

    const mx = ax + nx * lunge;
    const mz = az + nz * lunge;

    if (atkGroup.current) {
      atkGroup.current.position.set(mx, BOARD_PIECE_Y, mz);
    }
    if (vicGroup.current) {
      const stagger = t > 0.22 ? Math.min(1, (t - 0.22) * 3) : 0;
      const s = 1 - stagger * 0.88;
      vicGroup.current.scale.setScalar(Math.max(0.06, s));
    }
  });

  if (!duel || !pendingCombat) return null;

  const winner = duel.winner;
  const loser: 'w' | 'b' = winner === 'w' ? 'b' : 'w';
  const atkReg = winner === 'w' ? whiteRegion : blackRegion;
  const vicReg = loser === 'w' ? whiteRegion : blackRegion;

  const [ax, az] = squareToBoardXZ(duel.attackerSquare);
  const [vx, vz] = squareToBoardXZ(duel.victimSquare);
  const faceAtk = yawFaceTarget(ax, az, vx, vz) + Math.PI;
  const faceVic = yawFaceTarget(vx, vz, ax, az) + Math.PI;

  return (
    <group>
      <group ref={atkGroup} position={[ax, BOARD_PIECE_Y, az]}>
        <HunyuanUnit
          region={atkReg}
          team={winner}
          anim="strike"
          faceYaw={faceAtk}
          scaleMul={1.05}
        />
      </group>
      <group ref={vicGroup} position={[vx, BOARD_PIECE_Y, vz]}>
        <HunyuanUnit
          region={vicReg}
          team={loser}
          anim="stagger"
          faceYaw={faceVic}
          scaleMul={1.02}
        />
      </group>
    </group>
  );
}
