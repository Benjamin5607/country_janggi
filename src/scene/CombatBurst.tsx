import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../game/GameContext';
import { squareToBoardXZ } from '../game/janggiUtils';

export function CombatBurst() {
  const { pendingCombat } = useGame();
  const mesh = useRef<THREE.Mesh>(null);
  const t0 = useRef<number | null>(null);

  const pos = useMemo(() => {
    if (!pendingCombat) return [0, 0.2, 0] as [number, number, number];
    const [x, z] = squareToBoardXZ(pendingCombat.combat.victimSquare);
    return [x, 0.35, z] as [number, number, number];
  }, [pendingCombat]);

  useEffect(() => {
    t0.current = null;
  }, [pendingCombat]);

  useFrame((st) => {
    const m = mesh.current;
    if (!m || !pendingCombat) {
      if (m) m.visible = false;
      return;
    }
    if (t0.current === null) t0.current = st.clock.elapsedTime;
    const elapsed = st.clock.elapsedTime - t0.current;
    if (elapsed < 0.38) {
      m.visible = false;
      return;
    }
    const u = (elapsed - 0.38) / 0.75;
    m.visible = true;
    const s = 1.55 * Math.sin(Math.min(1, u) * Math.PI);
    m.scale.setScalar(Math.max(0.05, s));
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - u);
  });

  if (!pendingCombat) return null;

  return (
    <mesh ref={mesh} position={pos}>
      <sphereGeometry args={[0.55, 18, 18]} />
      <meshBasicMaterial
        color="#ffcc66"
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
