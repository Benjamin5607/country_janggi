import { useMemo } from 'react';
import * as THREE from 'three';
import type { TerrainId } from '../../i18n/translations';

type Props = { terrain: TerrainId };

export function MountainRing({ terrain }: Props) {
  const geometry = useMemo(() => {
    const segments = 72;
    const inner = 48;
    const outer = 62;
    const verts: number[] = [];
    const colors: number[] = [];

    const pal =
      terrain === 'desert'
        ? [new THREE.Color('#c4a878'), new THREE.Color('#8a7050')]
        : terrain === 'highlands'
          ? [new THREE.Color('#6a7478'), new THREE.Color('#3a4248')]
          : [new THREE.Color('#5a6a5a'), new THREE.Color('#2a3830')];

    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const h0 = 4 + Math.sin(i * 0.7) * 2.2 + Math.cos(i * 0.23) * 1.4;
      const h1 = 4 + Math.sin((i + 1) * 0.7) * 2.2 + Math.cos((i + 1) * 0.23) * 1.4;

      const push = (r: number, y: number, a: number, c: THREE.Color) => {
        verts.push(Math.cos(a) * r, y, Math.sin(a) * r);
        colors.push(c.r, c.g, c.b);
      };

      push(inner, -0.5, a0, pal[1]);
      push(outer, h0, a0, pal[0]);
      push(inner, -0.5, a1, pal[1]);

      push(inner, -0.5, a1, pal[1]);
      push(outer, h0, a0, pal[0]);
      push(outer, h1, a1, pal[0]);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [terrain]);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.94} metalness={0.01} flatShading />
    </mesh>
  );
}
