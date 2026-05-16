import {
  crossedRiver,
  forwardRankDelta,
  gridToSquare,
  inBounds,
  inPalace,
  squareToGrid,
} from './board';
import type { JanggiColor, JanggiMove, JanggiPiece, JanggiSquare } from './types';

type Board = (JanggiPiece | null)[][];

function get(board: Board, sq: JanggiSquare): JanggiPiece | null {
  const [f, r] = squareToGrid(sq);
  return board[r][f];
}

function set(board: Board, sq: JanggiSquare, piece: JanggiPiece | null) {
  const [f, r] = squareToGrid(sq);
  board[r][f] = piece;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((p) => (p ? { ...p } : null)));
}

function addMove(
  out: JanggiMove[],
  board: Board,
  from: JanggiSquare,
  to: JanggiSquare,
  piece: JanggiPiece,
) {
  const target = get(board, to);
  if (target && target.color === piece.color) return;
  out.push({
    from,
    to,
    piece,
    captured: target,
  });
}

function slideMoves(
  board: Board,
  from: JanggiSquare,
  piece: JanggiPiece,
  dirs: [number, number][],
  out: JanggiMove[],
  captureOnly = false,
) {
  const [ff, fr] = squareToGrid(from);
  for (const [df, dr] of dirs) {
    let f = ff + df;
    let r = fr + dr;
    while (inBounds(f, r)) {
      const to = gridToSquare(f, r);
      const target = board[r][f];
      if (!target) {
        if (!captureOnly) addMove(out, board, from, to, piece);
      } else {
        if (target.color !== piece.color) addMove(out, board, from, to, piece);
        break;
      }
      f += df;
      r += dr;
    }
  }
}

function cannonMoves(board: Board, from: JanggiSquare, piece: JanggiPiece, out: JanggiMove[]) {
  const dirs: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const [ff, fr] = squareToGrid(from);
  for (const [df, dr] of dirs) {
    let f = ff + df;
    let r = fr + dr;
    let jumped = false;
    while (inBounds(f, r)) {
      const occupant = board[r][f];
      if (!jumped) {
        if (occupant) {
          jumped = true;
        } else {
          addMove(out, board, from, gridToSquare(f, r), piece);
        }
      } else if (occupant) {
        if (occupant.color !== piece.color) {
          addMove(out, board, from, gridToSquare(f, r), piece);
        }
        break;
      }
      f += df;
      r += dr;
    }
  }
}

function horseMoves(board: Board, from: JanggiSquare, piece: JanggiPiece, out: JanggiMove[]) {
  const [ff, fr] = squareToGrid(from);
  const legs: [number, number, number, number][] = [
    [1, 0, 1, 1],
    [1, 0, 1, -1],
    [-1, 0, -1, 1],
    [-1, 0, -1, -1],
    [0, 1, 1, 1],
    [0, 1, -1, 1],
    [0, -1, 1, -1],
    [0, -1, -1, -1],
  ];
  for (const [lf, lr, df, dr] of legs) {
    const legF = ff + lf;
    const legR = fr + lr;
    if (!inBounds(legF, legR) || board[legR][legF]) continue;
    const f = ff + df;
    const r = fr + dr;
    if (!inBounds(f, r)) continue;
    addMove(out, board, from, gridToSquare(f, r), piece);
  }
}

function elephantMoves(board: Board, from: JanggiSquare, piece: JanggiPiece, out: JanggiMove[]) {
  const [ff, fr] = squareToGrid(from);
  const steps: [number, number][] = [
    [2, 2],
    [2, -2],
    [-2, 2],
    [-2, -2],
  ];
  for (const [df, dr] of steps) {
    const bf = ff + df / 2;
    const br = fr + dr / 2;
    const f = ff + df;
    const r = fr + dr;
    if (!inBounds(f, r) || !inBounds(bf, br)) continue;
    if (board[br][bf]) continue;
    addMove(out, board, from, gridToSquare(f, r), piece);
  }
}

function soldierMoves(board: Board, from: JanggiSquare, piece: JanggiPiece, out: JanggiMove[]) {
  const [ff, fr] = squareToGrid(from);
  const fwd = forwardRankDelta(piece.color);
  const deltas: [number, number][] = [[0, fwd]];
  if (crossedRiver(fr, piece.color)) {
    deltas.push([1, 0], [-1, 0], [0, -fwd]);
  }
  for (const [df, dr] of deltas) {
    const f = ff + df;
    const r = fr + dr;
    if (!inBounds(f, r)) continue;
    addMove(out, board, from, gridToSquare(f, r), piece);
  }
}

function pseudoLegalMoves(board: Board, from: JanggiSquare): JanggiMove[] {
  const piece = get(board, from);
  if (!piece) return [];
  const [ff, fr] = squareToGrid(from);
  const out: JanggiMove[] = [];

  switch (piece.type) {
    case 'r':
      slideMoves(board, from, piece, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ], out);
      break;
    case 'n':
      cannonMoves(board, from, piece, out);
      break;
    case 'h':
      horseMoves(board, from, piece, out);
      break;
    case 'e':
      elephantMoves(board, from, piece, out);
      break;
    case 'a': {
      const diag: [number, number][] = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [df, dr] of diag) {
        const f = ff + df;
        const r = fr + dr;
        if (!inBounds(f, r) || !inPalace(f, r, piece.color)) continue;
        addMove(out, board, from, gridToSquare(f, r), piece);
      }
      break;
    }
    case 'g': {
      const orth: [number, number][] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [df, dr] of orth) {
        const f = ff + df;
        const r = fr + dr;
        if (!inBounds(f, r) || !inPalace(f, r, piece.color)) continue;
        addMove(out, board, from, gridToSquare(f, r), piece);
      }
      break;
    }
    case 's':
      soldierMoves(board, from, piece, out);
      break;
    default:
      break;
  }

  return out;
}

function findGeneral(board: Board, color: JanggiColor): JanggiSquare | null {
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 9; f++) {
      const p = board[r][f];
      if (p && p.color === color && p.type === 'g') return gridToSquare(f, r);
    }
  }
  return null;
}

function isSquareAttacked(board: Board, sq: JanggiSquare, byColor: JanggiColor): boolean {
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 9; f++) {
      const p = board[r][f];
      if (!p || p.color !== byColor) continue;
      const from = gridToSquare(f, r);
      const moves = pseudoLegalMoves(board, from);
      if (moves.some((m) => m.to === sq)) return true;
    }
  }
  return false;
}

export function legalMoves(board: Board, from: JanggiSquare, turn: JanggiColor): JanggiMove[] {
  const piece = get(board, from);
  if (!piece || piece.color !== turn) return [];
  const pseudo = pseudoLegalMoves(board, from);
  const generalSq = findGeneral(board, turn);
  if (!generalSq) return pseudo;

  return pseudo.filter((m) => {
    const next = cloneBoard(board);
    set(next, m.from, null);
    set(next, m.to, m.piece);
    const gSq = findGeneral(next, turn);
    if (!gSq) return false;
    return !isSquareAttacked(next, gSq, turn === 'w' ? 'b' : 'w');
  });
}

export function allLegalMoves(board: Board, turn: JanggiColor): JanggiMove[] {
  const out: JanggiMove[] = [];
  for (let r = 0; r < 10; r++) {
    for (let f = 0; f < 9; f++) {
      const p = board[r][f];
      if (!p || p.color !== turn) continue;
      out.push(...legalMoves(board, gridToSquare(f, r), turn));
    }
  }
  return out;
}

export function applyMove(board: Board, move: JanggiMove): void {
  set(board, move.from, null);
  set(board, move.to, move.piece);
}
