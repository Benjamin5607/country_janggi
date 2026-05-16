/** Janggi piece types (internal). */
export type JanggiPieceType = 'g' | 'a' | 'e' | 'h' | 'r' | 'n' | 's';

export type JanggiColor = 'w' | 'b';

export type JanggiSquare = `${'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i'}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export type JanggiPiece = {
  type: JanggiPieceType;
  color: JanggiColor;
};

export type JanggiMove = {
  from: JanggiSquare;
  to: JanggiSquare;
  piece: JanggiPiece;
  captured: JanggiPiece | null;
};
