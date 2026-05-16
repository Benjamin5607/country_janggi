import type { PieceSymbol } from 'chess.js';
import { BOARD_CELL } from './boardConstants';
import { gridToSquare, squareToGrid } from './janggi/board';
import type { JanggiColor, JanggiMove, JanggiPieceType, JanggiSquare } from './janggi/types';
import { JanggiGame } from './janggi/JanggiGame';

export type { JanggiSquare, JanggiColor, JanggiMove };
export { gridToSquare, squareToGrid };
export { JanggiGame };

export interface CombatEvent {
  attackerSquare: JanggiSquare;
  victimSquare: JanggiSquare;
  attackerType: JanggiPieceType;
  victimType: JanggiPieceType;
  winner: JanggiColor;
}

/** Map janggi role → army GLB scale slot (chess.js symbols). */
export function janggiToArmyType(type: JanggiPieceType): PieceSymbol {
  switch (type) {
    case 'g':
      return 'k';
    case 'a':
      return 'q';
    case 'e':
      return 'b';
    case 'h':
      return 'n';
    case 'r':
      return 'r';
    case 'n':
      return 'r';
    case 's':
      return 'p';
    default:
      return 'p';
  }
}

/** Cho (w) / Han (b) hanja on the piece. */
export function janggiHanja(type: JanggiPieceType, color: JanggiColor): string {
  const map: Record<JanggiPieceType, string> = {
    g: color === 'w' ? '帥' : '將',
    a: '士',
    e: '象',
    h: '馬',
    r: '車',
    n: '包',
    s: '卒',
  };
  return map[type];
}

export function combatFromMove(move: JanggiMove): CombatEvent | null {
  if (!move.captured) return null;
  return {
    attackerSquare: move.from,
    victimSquare: move.to,
    attackerType: move.piece.type,
    victimType: move.captured.type,
    winner: move.piece.color,
  };
}

export function yawFaceTarget(fromX: number, fromZ: number, toX: number, toZ: number): number {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  return Math.atan2(dx, dz) + Math.PI;
}

export function pieceFaceYaw(color: JanggiColor, pieceX: number, pieceZ: number): number {
  const goalZ = color === 'w' ? 4.2 : -4.2;
  return yawFaceTarget(pieceX, pieceZ, 0, goalZ) + Math.PI;
}

/** World XZ at intersection (9×10 janggi grid). */
export function squareToBoardXZ(sq: JanggiSquare): [number, number] {
  const [f, r] = squareToGrid(sq);
  return [(f - 4) * BOARD_CELL, (4.5 - r) * BOARD_CELL];
}

export function legalMoveHighlights(
  game: JanggiGame,
  from: JanggiSquare | null,
): { moveSquares: Set<JanggiSquare>; captureSquares: Set<JanggiSquare> } | null {
  if (!from) return null;
  const piece = game.get(from);
  if (!piece || piece.color !== game.turn) return null;

  const moves = game.movesFrom(from);
  const moveSquares = new Set<JanggiSquare>();
  const captureSquares = new Set<JanggiSquare>();

  for (const m of moves) {
    if (m.captured) captureSquares.add(m.to);
    else moveSquares.add(m.to);
  }

  return { moveSquares, captureSquares };
}
