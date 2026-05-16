import type { PieceSymbol } from 'chess.js';

/** Hunyuan nation mesh on 9×10 janggi board (was ~0.42 for 8×8 chess — too small). */
export const PIECE_ROLE: Record<
  PieceSymbol,
  { scale: number; height: number; yBias: number }
> = {
  p: { scale: 0.88, height: 1.0, yBias: 0 },
  n: { scale: 0.94, height: 1.02, yBias: 0.01 },
  b: { scale: 0.92, height: 1.02, yBias: 0.012 },
  r: { scale: 0.98, height: 1.04, yBias: 0.015 },
  q: { scale: 1.0, height: 1.05, yBias: 0.018 },
  k: { scale: 1.02, height: 1.06, yBias: 0.02 },
};
