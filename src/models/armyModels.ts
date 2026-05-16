import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { publicUrl } from '../utils/publicUrl';
import { pieceModelUrl } from './registry';

const REGIONS: RegionId[] = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
/**
 * Nation unit from PNG → 3D (Hunyuan). Primary in-game mesh.
 *   public/models/rigged/{region}_{team}.glb
 */
export function riggedTeamGlbUrl(region: RegionId, team: Color): string {
  return publicUrl(`/models/rigged/${region}_${team}.glb`);
}

/** Hunyuan per-piece (only when generated into hunyuan/). KayKit _kaykit/ is never loaded. */
export function hunyuanPieceGlbUrl(region: RegionId, team: Color, piece: PieceSymbol): string {
  return publicUrl(`/models/rigged/hunyuan/${region}_${team}_${piece}.glb`);
}

export function riggedUnitGlbUrl(region: RegionId, team: Color): string {
  return riggedTeamGlbUrl(region, team);
}

export function regionPieceGlbUrl(region: RegionId, piece: PieceSymbol): string {
  return pieceModelUrl(region, piece);
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Hunyuan team mesh (nation PNG art) → optional Hunyuan per-piece → regional GLB.
 * KayKit and prop catalogs are never loaded.
 */
/** Per-piece Hunyuan only when present; else always nation team GLB (no HEAD on team — Vite can fail HEAD). */
export async function resolveRiggedGlbUrl(
  region: RegionId,
  team: Color,
  piece: PieceSymbol,
): Promise<string> {
  const perPiece = hunyuanPieceGlbUrl(region, team, piece);
  if (await urlExists(perPiece)) return perPiece;
  return riggedTeamGlbUrl(region, team);
}

export function preloadRiggedUnits(whiteRegion: RegionId, blackRegion: RegionId): void {
  const urls = new Set<string>();
  for (const [region, team] of [
    [whiteRegion, 'w'],
    [blackRegion, 'b'],
  ] as [RegionId, Color][]) {
    urls.add(riggedTeamGlbUrl(region, team));
  }

  for (const url of urls) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
}

export function preloadAllRiggedUnits(): void {
  for (const region of REGIONS) {
    for (const team of ['w', 'b'] as Color[]) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = riggedTeamGlbUrl(region, team);
      document.head.appendChild(link);
    }
  }
}
