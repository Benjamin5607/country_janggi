import type { TerrainId } from '../../i18n/translations';

/** Fractal height for natural rolling ground. */
export function terrainHeight(x: number, z: number, kind: TerrainId): number {
  const seed = kind.charCodeAt(0) * 0.17;
  const fbm = (ox: number, oz: number, octaves: number, freq: number, amp: number) => {
    let h = 0;
    let a = amp;
    let f = freq;
    for (let i = 0; i < octaves; i++) {
      h +=
        a *
        (Math.sin(ox * f + seed) * Math.cos(oz * f * 1.07 + seed * 2) +
          Math.sin(oz * f * 0.83 + ox * 0.11 + seed * 3) * 0.5);
      f *= 2.05;
      a *= 0.52;
    }
    return h;
  };

  const boardDist = Math.max(Math.abs(x), Math.abs(z));
  const boardBlend = smoothstep(4.2, 8.5, boardDist);

  let h: number;
  switch (kind) {
    case 'desert':
      h = fbm(x, z, 4, 0.035, 0.22) + fbm(x, z, 2, 0.12, 0.08);
      break;
    case 'highlands':
      h = fbm(x, z, 5, 0.04, 0.55) + fbm(x, z, 3, 0.09, 0.2);
      break;
    case 'steppe':
      h = fbm(x, z, 4, 0.045, 0.35) + fbm(x, z, 2, 0.15, 0.06);
      break;
    case 'grassland':
      h = fbm(x, z, 4, 0.05, 0.32) + fbm(x, z, 3, 0.11, 0.1);
      break;
    default:
      h = fbm(x, z, 4, 0.048, 0.28) + fbm(x, z, 2, 0.14, 0.07);
  }

  if (boardDist < 5.2) {
    const crater = -1.15 - (5.2 - boardDist) * 0.12;
    h = crater * (1 - boardBlend) + h * boardBlend;
  }

  return h;
}

export function terrainSlope(x: number, z: number, kind: TerrainId): number {
  const e = 0.35;
  const hx = terrainHeight(x + e, z, kind) - terrainHeight(x - e, z, kind);
  const hz = terrainHeight(x, z + e, kind) - terrainHeight(x, z - e, kind);
  return Math.sqrt(hx * hx + hz * hz) / (2 * e);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
