import * as THREE from 'three';
import type { Color } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import { TEAM_UNIFORM } from '../theme/garmentTextures';
import { regionalClothSecondary, regionalCostume, regionalWeaponTint } from '../theme/regionalCostume';

const SKIN = new THREE.Color('#bc8f78');

function cloneMats(mesh: THREE.Mesh): THREE.MeshStandardMaterial[] {
  const src = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return src.map((m) => {
    const c = m.clone();
    return c instanceof THREE.MeshStandardMaterial ? c : new THREE.MeshStandardMaterial();
  });
}

function meshName(mesh: THREE.Mesh): string {
  return (mesh.name || mesh.parent?.name || '').toLowerCase();
}

/** Nation unit PNG on rigged mesh (runtime fallback). */
export function paintSoldierOutfit(
  root: THREE.Object3D,
  region: RegionId,
  team: Color,
  garment: THREE.Texture,
) {
  const teamTint = TEAM_UNIFORM[team].clone();
  if (team === 'b') teamTint.multiplyScalar(0.78);
  const trim = regionalClothSecondary(region, team);
  const hardware = regionalCostume[region].hardware;
  const metal = regionalWeaponTint(region);

  garment.colorSpace = THREE.SRGBColorSpace;
  garment.anisotropy = 8;

  root.traverse((o) => {
    if (!(o instanceof THREE.SkinnedMesh) && !(o instanceof THREE.Mesh)) return;
    const name = meshName(o);
    const mats = cloneMats(o);

    for (const mat of mats) {
      if (/head|face|skin|hand/i.test(name)) {
        mat.map = null;
        mat.transparent = false;
        mat.color.copy(SKIN);
        mat.metalness = 0.05;
        mat.roughness = 0.58;
      } else if (/body|vanguard|cloth|coat|armor|tunic|visor|helmet/i.test(name)) {
        mat.map = garment;
        mat.color.copy(teamTint);
        mat.transparent = /visor|helmet/i.test(name);
        mat.alphaTest = /visor|helmet/i.test(name) ? 0.38 : 0;
        mat.metalness = 0.08;
        mat.roughness = 0.46;
        mat.emissive.copy(trim).multiplyScalar(0.04);
      } else if (/weapon|rifle|gun|sword|metal/i.test(name)) {
        mat.map = null;
        mat.transparent = false;
        mat.color.copy(hardware);
        mat.metalness = 0.65;
        mat.roughness = 0.32;
      } else {
        mat.map = null;
        mat.transparent = false;
        mat.color.copy(metal);
        mat.metalness = 0.4;
        mat.roughness = 0.45;
      }
      mat.needsUpdate = true;
    }

    o.material = mats.length === 1 ? mats[0] : mats;
  });
}
