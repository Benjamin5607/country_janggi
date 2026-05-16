import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Thin rotating ring under the active team's units (whose turn it is). */
export function TurnAura({ visible, y = 0.004 }: { visible: boolean; y?: number }) {
  const g = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!g.current || !visible) return;
    g.current.rotation.y += dt * 2.6;
  });

  if (!visible) return null;

  return (
    <group ref={g} position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <torusGeometry args={[0.52, 0.028, 10, 48]} />
        <meshStandardMaterial
          color="#1cff61"
          emissive="#16d655"
          emissiveIntensity={1.15}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <torusGeometry args={[0.48, 0.014, 8, 40]} />
        <meshBasicMaterial color="#9effb8" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}
