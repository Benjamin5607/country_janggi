import type { PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { publicUrl } from '../utils/publicUrl';

/** Fallback rig for optional GLB workshop uploads only (not default gameplay). */
export const SHARED_SOLDIER_GLB = publicUrl('/models/shared/soldier.glb');

/** Rigged soldier GLB — ~85% of board cell. */
export const PIECE_SCALE: Record<PieceSymbol, number> = {
  p: 0.5,
  n: 0.54,
  b: 0.52,
  r: 0.56,
  q: 0.6,
  k: 0.58,
};

/** Optional override path — drop `public/models/regions/{region}/{piece}.glb` to replace the shared rig. */
export function pieceModelUrl(region: RegionId, type: PieceSymbol): string {
  return publicUrl(`/models/regions/${region}/${type}.glb`);
}
