import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { BOARD_CELL, BOARD_FILES, BOARD_RANKS, BOARD_TILE_HEIGHT } from '../game/boardConstants';
import type { JanggiSquare } from '../game/janggi/types';
import { gridToSquare, squareToBoardXZ } from '../game/janggiUtils';
import { useGame } from '../game/GameContext';

const WOOD = '#c4a574';
const LINE = '#2a1810';
const FRAME = '#3d2e22';

function palaceLines(zMin: number, zMax: number): [number, number, number][][] {
  const x0 = -BOARD_CELL;
  const x1 = BOARD_CELL;
  const z0 = zMin;
  const z2 = zMax;
  return [
    [
      [x0, 0.02, z0],
      [x1, 0.02, z2],
    ],
    [
      [x1, 0.02, z0],
      [x0, 0.02, z2],
    ],
  ];
}

export function JanggiBoard() {
  const { selected, handlePointer, clearSelection, inputsLocked } = useGame();

  const points = useMemo(() => {
    const out: { sq: JanggiSquare; x: number; z: number }[] = [];
    for (let rank = 0; rank < BOARD_RANKS; rank++) {
      for (let file = 0; file < BOARD_FILES; file++) {
        const sq = gridToSquare(file, rank);
        const [x, z] = squareToBoardXZ(sq);
        out.push({ sq, x, z });
      }
    }
    return out;
  }, []);

  const selectionRing = useMemo(() => {
    if (!selected) return null;
    const [x, z] = squareToBoardXZ(selected);
    return { x, z };
  }, [selected]);

  const boardW = (BOARD_FILES - 1) * BOARD_CELL;
  const boardD = (BOARD_RANKS - 1) * BOARD_CELL;
  const halfW = boardW / 2;
  const halfD = boardD / 2;

  const choPalaceZ = squareToBoardXZ(gridToSquare(3, 8))[1];
  const hanPalaceZ = squareToBoardXZ(gridToSquare(3, 1))[1];
  const palaceDiagCho = palaceLines(choPalaceZ - BOARD_CELL, choPalaceZ + BOARD_CELL);
  const palaceDiagHan = palaceLines(hanPalaceZ - BOARD_CELL, hanPalaceZ + BOARD_CELL);

  const gridLines = useMemo(() => {
    const segs: THREE.Vector3[][] = [];
    for (let f = 0; f < BOARD_FILES; f++) {
      const x = (f - 4) * BOARD_CELL;
      segs.push([
        new THREE.Vector3(x, 0.02, halfD),
        new THREE.Vector3(x, 0.02, -halfD),
      ]);
    }
    for (let r = 0; r < BOARD_RANKS; r++) {
      const z = (4.5 - r) * BOARD_CELL;
      segs.push([
        new THREE.Vector3(-halfW, 0.02, z),
        new THREE.Vector3(halfW, 0.02, z),
      ]);
    }
    return segs;
  }, [halfW, halfD]);

  const tileSize = BOARD_CELL * 0.94;

  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[boardW + 1.2, 0.08, boardD + 1.2]} />
        <meshStandardMaterial color={WOOD} roughness={0.82} metalness={0.04} />
      </mesh>

      {gridLines.map((pts, i) => (
        <Line key={`grid-${i}`} points={pts} color={LINE} lineWidth={1.2} />
      ))}

      {palaceDiagCho.map((pts, i) => (
        <Line key={`cho-p-${i}`} points={pts} color={LINE} lineWidth={1.2} />
      ))}
      {palaceDiagHan.map((pts, i) => (
        <Line key={`han-p-${i}`} points={pts} color={LINE} lineWidth={1.2} />
      ))}

      <mesh position={[0, -0.018, -halfD - 0.1]} receiveShadow castShadow>
        <boxGeometry args={[boardW + 0.4, 0.04, 0.12]} />
        <meshStandardMaterial color={FRAME} roughness={0.88} />
      </mesh>
      <mesh position={[0, -0.018, halfD + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[boardW + 0.4, 0.04, 0.12]} />
        <meshStandardMaterial color={FRAME} roughness={0.88} />
      </mesh>
      <mesh position={[-halfW - 0.1, -0.018, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.12, 0.04, boardD + 0.4]} />
        <meshStandardMaterial color={FRAME} roughness={0.88} />
      </mesh>
      <mesh position={[halfW + 0.1, -0.018, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.12, 0.04, boardD + 0.4]} />
        <meshStandardMaterial color={FRAME} roughness={0.88} />
      </mesh>

      {points.map(({ sq, x, z }) => (
        <mesh
          key={sq}
          position={[x, BOARD_TILE_HEIGHT / 2, z]}
          receiveShadow
          onPointerDown={(e) => {
            e.stopPropagation();
            if (inputsLocked) return;
            if (e.button === 2) {
              e.nativeEvent.preventDefault();
              clearSelection();
              return;
            }
            if (e.button === 0) handlePointer(sq, 0);
          }}
        >
          <cylinderGeometry args={[tileSize * 0.22, tileSize * 0.22, BOARD_TILE_HEIGHT, 12]} />
          <meshStandardMaterial
            color="#e8dcc8"
            roughness={0.45}
            metalness={0.02}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}

      {selectionRing ? (
        <mesh
          position={[selectionRing.x, BOARD_TILE_HEIGHT + 0.01, selectionRing.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.18, 0.32, 32]} />
          <meshStandardMaterial color="#ffe566" emissive="#d4af37" emissiveIntensity={0.9} />
        </mesh>
      ) : null}
    </group>
  );
}
