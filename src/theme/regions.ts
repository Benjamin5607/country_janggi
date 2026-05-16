import * as THREE from 'three';
import type { RegionId } from '../i18n/translations';

/** Palette hint for procedural “army” materials per region */
export const regionTheme: Record<
  RegionId,
  { primary: string; accent: string; metal: string; banner: string }
> = {
  europe: { primary: '#2a3a6e', accent: '#c9a227', metal: '#b8c4d8', banner: '#7a0c0c' },
  china: { primary: '#6b1c1c', accent: '#d4af37', metal: '#8a9096', banner: '#f5e6c8' },
  india: { primary: '#4a1e5c', accent: '#e8a735', metal: '#c0a878', banner: '#ff6b2c' },
  korea: { primary: '#1e3d2f', accent: '#c41e3a', metal: '#9eadb8', banner: '#f0e6d4' },
  japan: { primary: '#2c1810', accent: '#c9b8a3', metal: '#6d4c41', banner: '#d4c4a8' },
  arab: { primary: '#1a4d3a', accent: '#d4af6a', metal: '#cfc6a8', banner: '#0f3550' },
};

export function hexColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}
