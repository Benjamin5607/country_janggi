import * as THREE from 'three';

const BLACK_GRAY = new THREE.Color(0.4, 0.41, 0.44);

/** Dark gray black side; white side keeps PNG/Hunyuan colors. */
export function applyTeamTint(root: THREE.Object3D, team: 'w' | 'b'): void {
  if (team !== 'b') return;
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh || o instanceof THREE.SkinnedMesh)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m || !('color' in m) || !m.color) continue;
      m.color.multiplyScalar(0.82);
      m.color.lerp(BLACK_GRAY, 0.38);
    }
  });
}
