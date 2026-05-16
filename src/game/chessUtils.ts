import { Chess, type Move, type PieceSymbol, type Square, type Color } from 'chess.js';
import { BOARD_CELL } from './boardConstants';

export interface CombatEvent {
  attackerSquare: Square;
  /** Square where the captured piece sits before removal (handles en passant). */
  victimSquare: Square;
  attackerType: PieceSymbol;
  victimType: PieceSymbol;
  winner: Color;
}

const files = 'abcdefgh';
const ranks = '87654321';

export function squareToGrid(sq: Square): [number, number] {
  const file = files.indexOf(sq[0]);
  const rank = ranks.indexOf(sq[1]);
  return [file, rank];
}

export function gridToSquare(file: number, rank: number): Square {
  return `${files[file]}${ranks[rank]}` as Square;
}

/** Board square where the defender model should stand (en passant is not on `move.to`). */
export function victimDisplaySquare(move: Move): Square {
  if (move.isEnPassant()) {
    return `${move.to[0]}${move.from[1]}` as Square;
  }
  return move.to;
}

export function combatFromMove(move: Move): CombatEvent | null {
  if (!move.isCapture() && !move.isEnPassant()) return null;
  const vt = move.captured ?? ('p' as PieceSymbol);
  return {
    attackerSquare: move.from,
    victimSquare: victimDisplaySquare(move),
    attackerType: move.piece,
    victimType: vt,
    winner: move.color,
  };
}

export function isPromotionTarget(fen: string, from: Square, to: Square): boolean {
  const c = new Chess(fen);
  const piece = c.get(from);
  if (!piece || piece.type !== 'p') return false;
  const promoRank = piece.color === 'w' ? '8' : '1';
  if (to[1] !== promoRank) return false;
  return c.moves({ verbose: true }).some((m) => m.from === from && m.to === to && m.promotion);
}

/** Y rotation (rad) so the Three.js soldier mesh (default forward −Z) faces a world target on XZ. */
export function yawFaceTarget(fromX: number, fromZ: number, toX: number, toZ: number): number {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  return Math.atan2(dx, dz) + Math.PI;
}

export function pieceFaceYaw(color: import('chess.js').Color, pieceX: number, pieceZ: number): number {
  const goalZ = color === 'w' ? 3.6 : -3.6;
  // Hunyuan/PNG meshes face −Z at yaw 0; +π so both teams face the center line.
  return yawFaceTarget(pieceX, pieceZ, 0, goalZ) + Math.PI;
}

/** World XZ on the board plane (center of square). */
export function squareToBoardXZ(sq: Square): [number, number] {
  const [f, r] = squareToGrid(sq);
  return [(f - 3.5) * BOARD_CELL, (3.5 - r) * BOARD_CELL];
}

/** Green destinations (empty / non-capture landings) and red victim squares for captures. */
export function legalMoveHighlights(
  chess: Chess,
  from: Square | null,
): { moveSquares: Set<Square>; captureSquares: Set<Square> } | null {
  if (!from) return null;
  const piece = chess.get(from);
  if (!piece || piece.color !== chess.turn()) return null;

  const moves = chess.moves({ square: from, verbose: true });
  const moveSquares = new Set<Square>();
  const captureSquares = new Set<Square>();

  for (const m of moves) {
    if (m.isCapture() || m.isEnPassant()) {
      captureSquares.add(victimDisplaySquare(m));
      if (m.isEnPassant()) {
        moveSquares.add(m.to);
      }
    } else {
      moveSquares.add(m.to);
    }
  }

  return { moveSquares, captureSquares };
}
