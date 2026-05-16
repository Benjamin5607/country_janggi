import * as THREE from 'three';

const _box = new THREE.Box3();

/** World-space bounds from mesh geometry only (ignores empty root nodes). */
export function measureUnitBounds(root: THREE.Object3D): THREE.Box3 {
  _box.makeEmpty();
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.SkinnedMesh) {
      _box.expandByObject(o);
    }
  });
  return _box;
}

/** Y offset so the lowest mesh point sits on y=0 (apply on a parent group, not in useFrame resets). */
export function computeFootLift(root: THREE.Object3D, clearance = 0.06): number {
  const box = measureUnitBounds(root);
  if (box.isEmpty()) return clearance;
  return -box.min.y + clearance;
}

/** Sit mesh on local y=0 (for carts / horses on the tile). */
export function groundUnitRoot(root: THREE.Object3D, clearance = 0): void {
  const box = measureUnitBounds(root);
  if (box.isEmpty()) return;
  root.position.y -= box.min.y - clearance;
}

/** Center unit on XZ at origin (mutates root position once at load). */
export function centerUnitXZ(root: THREE.Object3D): void {
  const box = measureUnitBounds(root);
  if (box.isEmpty()) return;
  const center = new THREE.Vector3();
  box.getCenter(center);
  root.position.x -= center.x;
  root.position.z -= center.z;
}
