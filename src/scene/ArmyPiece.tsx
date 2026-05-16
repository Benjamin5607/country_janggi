import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { JanggiColor, JanggiPieceType, JanggiSquare } from '../game/janggi/types';
import { useGame } from '../game/GameContext';
import { BOARD_PIECE_Y } from '../game/boardConstants';
import { janggiToArmyType, pieceFaceYaw, squareToBoardXZ } from '../game/janggiUtils';
import { SafeNationalWarrior } from './SafeNationalWarrior';
import { PieceHanjaLabel } from './PieceHanjaLabel';
import { TurnAura } from './TurnAura';

function squareToWorld(sq: JanggiSquare): [number, number] {
  return squareToBoardXZ(sq);
}

export function ArmyPiece({
  square,
  type,
  color,
  hidden,
  showTurnAura,
}: {
  square: JanggiSquare;
  type: JanggiPieceType;
  color: JanggiColor;
  hidden?: boolean;
  showTurnAura?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const prevSquare = useRef<JanggiSquare>(square);
  const { whiteRegion, blackRegion, handlePointer, inputsLocked } = useGame();
  const region = color === 'w' ? whiteRegion : blackRegion;
  const armyType = janggiToArmyType(type);
  const [tx, tz] = useMemo(() => squareToWorld(square), [square]);

  const faceYaw = useMemo(() => pieceFaceYaw(color, tx, tz), [color, tx, tz]);
  const auraOn = !!showTurnAura && !hidden;

  useFrame((state) => {
    const g = group.current;
    if (!g || hidden) return;
    const t = state.clock.elapsedTime;
    g.position.x = THREE.MathUtils.lerp(g.position.x, tx, 0.16);
    g.position.z = THREE.MathUtils.lerp(g.position.z, tz, 0.16);
    g.position.y = BOARD_PIECE_Y + Math.sin(t * 1.4 + tx * 0.4) * 0.012;
  });

  useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.position.set(tx, BOARD_PIECE_Y, tz);
    prevSquare.current = square;
  }, [square, tx, tz]);

  if (hidden) return null;

  return (
    <group ref={group}>
      <TurnAura visible={auraOn} />
      <group>
        <SafeNationalWarrior
          region={region}
          team={color}
          piece={armyType}
          faceYaw={faceYaw}
          anim="idle"
          inputsLocked={inputsLocked}
          onPointer={(button) => handlePointer(square, button)}
        />
        <PieceHanjaLabel type={type} color={color} scale={armyType === 'k' ? 1.08 : 1} />
      </group>
    </group>
  );
}
