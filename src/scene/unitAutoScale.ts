import * as THREE from 'three';

/** Fit nation Hunyuan mesh to one janggi intersection (~1.1m tall). */
export function autoScaleUnitToBoard(
  root: THREE.Object3D,
  targetHeight = 1.15,
): number {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return 1;
  const size = new THREE.Vector3();
  box.getSize(size);
  const h = Math.max(size.y, 0.001);
  const s = targetHeight / h;
  root.scale.setScalar(s);
  return s;
}
