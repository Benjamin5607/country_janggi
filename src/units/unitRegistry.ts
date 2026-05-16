import type { PieceSymbol } from 'chess.js';
import { PIECE_SCALE } from '../models/registry';
import type { RegionId } from '../i18n/translations';
import { publicUrl } from '../utils/publicUrl';

export type UnitTeam = 'w' | 'b';

export function unitTextureUrl(region: RegionId, team: UnitTeam): string {
  return publicUrl(`/textures/units/unit_${region}_${team}.png`);
}

export const PIECE_HEIGHT: Record<PieceSymbol, number> = {
  p: PIECE_SCALE.p * 1.75,
  n: PIECE_SCALE.n * 1.75,
  b: PIECE_SCALE.b * 1.75,
  r: PIECE_SCALE.r * 1.75,
  q: PIECE_SCALE.q * 1.75,
  k: PIECE_SCALE.k * 1.75,
};

const REGIONS: RegionId[] = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];

export function preloadUnitTextures(): void {
  for (const region of REGIONS) {
    for (const team of ['w', 'b'] as UnitTeam[]) {
      const img = new Image();
      img.src = unitTextureUrl(region, team);
    }
  }
}

/** Verify all 12 unit PNGs exist (dev console warning only). */
export function assertUnitAssets(): void {
  if (import.meta.env.PROD) return;
  for (const region of REGIONS) {
    for (const team of ['w', 'b'] as UnitTeam[]) {
      fetch(unitTextureUrl(region, team), { method: 'HEAD' }).then((r) => {
        if (!r.ok) {
          console.warn(`[CountryChess] Missing unit asset: ${unitTextureUrl(region, team)}`);
        }
      });
    }
  }
}
