import type { JanggiColor, JanggiPiece, JanggiSquare } from './types';

export const FILES = 'abcdefghi';
export const RANKS = '0123456789';

export function gridToSquare(file: number, rank: number): JanggiSquare {
  return `${FILES[file]}${RANKS[rank]}` as JanggiSquare;
}

export function squareToGrid(sq: JanggiSquare): [file: number, rank: number] {
  return [FILES.indexOf(sq[0]), Number(sq[1])];
}

export function inBounds(file: number, rank: number): boolean {
  return file >= 0 && file < 9 && rank >= 0 && rank < 10;
}

/** Cho (w) palace: ranks 7–9, files d–f. Han (b) palace: ranks 0–2. */
export function inPalace(file: number, rank: number, color: JanggiColor): boolean {
  if (file < 3 || file > 5) return false;
  return color === 'w' ? rank >= 7 && rank <= 9 : rank >= 0 && rank <= 2;
}

export function crossedRiver(rank: number, color: JanggiColor): boolean {
  return color === 'w' ? rank <= 4 : rank >= 5;
}

export function forwardRankDelta(color: JanggiColor): number {
  return color === 'w' ? -1 : 1;
}

export function createInitialBoard(): (JanggiPiece | null)[][] {
  const board: (JanggiPiece | null)[][] = Array.from({ length: 10 }, () =>
    Array(9).fill(null),
  );

  const placeBackRank = (rank: number, color: JanggiColor) => {
    const types = ['r', 'h', 'e', 'a', 'g', 'a', 'e', 'h', 'r'] as const;
    for (let f = 0; f < 9; f++) {
      board[rank][f] = { type: types[f], color };
    }
  };

  placeBackRank(0, 'b');
  placeBackRank(9, 'w');
  board[2][1] = { type: 'n', color: 'b' };
  board[2][7] = { type: 'n', color: 'b' };
  board[7][1] = { type: 'n', color: 'w' };
  board[7][7] = { type: 'n', color: 'w' };
  for (const f of [0, 2, 4, 6, 8]) {
    board[3][f] = { type: 's', color: 'b' };
    board[6][f] = { type: 's', color: 'w' };
  }

  return board;
}
