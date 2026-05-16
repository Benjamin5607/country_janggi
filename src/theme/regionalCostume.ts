import * as THREE from 'three';
import type { RegionId } from '../i18n/translations';
export type RegionalCostume = {
  trim: THREE.Color;
  hardware: THREE.Color;
};

function c(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export const regionalCostume: Record<RegionId, RegionalCostume> = {
  europe: { trim: c('#8b1c1c'), hardware: c('#c9a227') },
  china: { trim: c('#b8860b'), hardware: c('#d4af37') },
  india: { trim: c('#e8a735'), hardware: c('#ff6b2c') },
  korea: { trim: c('#c41e3a'), hardware: c('#f0e6d4') },
  japan: { trim: c('#6b1810'), hardware: c('#c9b8a3') },
  arab: { trim: c('#2a8f6f'), hardware: c('#d4af6a') },
};

/** Fallback tint when PNG not ready — textures carry team color. */
export function regionalClothColor(_region: RegionId, team: 'w' | 'b'): THREE.Color {
  return team === 'w' ? new THREE.Color('#f8f8f8') : new THREE.Color('#101010');
}

export function regionalClothSecondary(region: RegionId, team: 'w' | 'b'): THREE.Color {
  return regionalClothColor(region, team).clone().lerp(regionalCostume[region].trim, 0.12);
}

export function regionalWeaponTint(region: RegionId): THREE.Color {
  const rm = regionalCostume[region];
  return new THREE.Color('#5a6068').lerp(rm.hardware, 0.5);
}
