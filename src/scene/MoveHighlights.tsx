import { useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { legalMoveHighlights, squareToBoardXZ } from '../game/janggiUtils';

export function MoveHighlights() {
  const { game, selected, inputsLocked } = useGame();

  const sets = useMemo(() => {
    if (inputsLocked) return null;
    return legalMoveHighlights(game, selected);
  }, [game, selected, inputsLocked]);

  if (!sets) return null;

  const { moveSquares, captureSquares } = sets;
  const walkOnly = [...moveSquares].filter((sq) => !captureSquares.has(sq));

  return (
    <group position={[0, 0.155, 0]}>
      {walkOnly.map((sq) => {
        const [x, z] = squareToBoardXZ(sq);
        return (
          <mesh key={`go-${sq}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]} renderOrder={4}>
            <ringGeometry args={[0.2, 0.34, 40]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#15803d"
              emissiveIntensity={0.95}
              roughness={0.4}
              metalness={0.08}
              transparent
              opacity={0.88}
              depthWrite={false}
            />
          </mesh>
        );
      })}
      {[...captureSquares].map((sq) => {
        const [x, z] = squareToBoardXZ(sq);
        return (
          <mesh key={`atk-${sq}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]} renderOrder={5}>
            <ringGeometry args={[0.24, 0.4, 40]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#991b1b"
              emissiveIntensity={1.25}
              roughness={0.35}
              metalness={0.1}
              transparent
              opacity={0.92}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
