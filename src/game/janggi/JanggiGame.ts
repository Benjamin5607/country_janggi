import { createInitialBoard, gridToSquare, squareToGrid } from './board';
import { allLegalMoves, applyMove, legalMoves } from './moves';
import type { JanggiColor, JanggiMove, JanggiPiece, JanggiSquare } from './types';

export class JanggiGame {
  private board = createInitialBoard();
  private _turn: JanggiColor = 'w';
  private _gameOver = false;
  private _winner: JanggiColor | null = null;

  get turn(): JanggiColor {
    return this._turn;
  }

  get gameOver(): boolean {
    return this._gameOver;
  }

  get winner(): JanggiColor | null {
    return this._winner;
  }

  get(sq: JanggiSquare): JanggiPiece | null {
    const [f, r] = squareToGrid(sq);
    return this.board[r][f];
  }

  movesFrom(sq: JanggiSquare): JanggiMove[] {
    if (this._gameOver) return [];
    return legalMoves(this.board, sq, this._turn);
  }

  private finishMove(found: JanggiMove): JanggiMove {
    applyMove(this.board, found);
    if (found.captured?.type === 'g') {
      this._gameOver = true;
      this._winner = found.piece.color;
    } else {
      this._turn = this._turn === 'w' ? 'b' : 'w';
      const nextMoves = allLegalMoves(this.board, this._turn);
      if (nextMoves.length === 0) {
        this._gameOver = true;
        this._winner = found.piece.color;
      }
    }
    return found;
  }

  move(from: JanggiSquare, to: JanggiSquare): JanggiMove | null {
    if (this._gameOver) return null;
    const found = legalMoves(this.board, from, this._turn).find((m) => m.to === to);
    if (!found) return null;
    return this.finishMove(found);
  }

  executeMove(found: JanggiMove): void {
    if (this._gameOver) return;
    this.finishMove(found);
  }

  reset(): void {
    this.board = createInitialBoard();
    this._turn = 'w';
    this._gameOver = false;
    this._winner = null;
  }

  /** Iterate all squares with pieces. */
  pieces(): { square: JanggiSquare; piece: JanggiPiece }[] {
    const out: { square: JanggiSquare; piece: JanggiPiece }[] = [];
    for (let r = 0; r < 10; r++) {
      for (let f = 0; f < 9; f++) {
        const p = this.board[r][f];
        if (p) out.push({ square: gridToSquare(f, r), piece: p });
      }
    }
    return out;
  }

  cloneBoard(): (JanggiPiece | null)[][] {
    return this.board.map((row) => row.map((p) => (p ? { ...p } : null)));
  }
}
