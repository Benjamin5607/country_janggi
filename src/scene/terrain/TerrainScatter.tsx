import { useMemo } from 'react';
import * as THREE from 'three';
import type { TerrainId } from '../../i18n/translations';
import { terrainHeight } from './heightfield';

const BOARD_R = 6.2;

type Props = { terrain: TerrainId };

function scatterPoints(count: number, minR: number, maxR: number, seed: number): [number, number][] {
  const out: [number, number][] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard++;
    const a = rnd() * Math.PI * 2;
    const r = minR + rnd() * (maxR - minR);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x, z) < BOARD_R) continue;
    out.push([x, z]);
  }
  return out;
}

export function TerrainScatter({ terrain }: Props) {
  const desert = terrain === 'desert';
  const treeCount = desert ? 8 : terrain === 'highlands' ? 55 : 75;
  const rockCount = desert ? 90 : 65;
  const bushCount = desert ? 12 : 110;

  const trees = useMemo(() => scatterPoints(treeCount, 7, 52, 11), [treeCount]);
  const rocks = useMemo(() => scatterPoints(rockCount, 5.5, 58, 23), [rockCount]);
  const bushes = useMemo(() => scatterPoints(bushCount, 6, 48, 37), [bushCount]);

  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.08, 0.12, 0.55, 6), []);
  const crownGeo = useMemo(() => new THREE.ConeGeometry(0.42, 1.1, 8), []);
  const rockGeo = useMemo(() => new THREE.DodecahedronGeometry(0.35, 0), []);
  const bushGeo = useMemo(() => new THREE.IcosahedronGeometry(0.22, 0), []);

  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a3428', roughness: 0.9 }), []);
  const crownMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: desert ? '#8a9a48' : '#3d6b32',
        roughness: 0.88,
      }),
    [desert],
  );
  const rockMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: desert ? '#b8a078' : '#6a6660',
        roughness: 0.95,
      }),
    [desert],
  );
  const bushMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: desert ? '#9aaa58' : '#4a7a3a',
        roughness: 0.9,
      }),
    [desert],
  );

  return (
    <group>
      {trees.map(([x, z], i) => {
        const y = terrainHeight(x, z, terrain);
        const s = 0.75 + (i % 5) * 0.12;
        return (
          <group key={`t${i}`} position={[x, y, z]} scale={[s, s, s]}>
            <mesh geometry={trunkGeo} material={trunkMat} castShadow position={[0, 0.28, 0]} />
            <mesh geometry={crownGeo} material={crownMat} castShadow position={[0, 0.95, 0]} />
          </group>
        );
      })}
      {rocks.map(([x, z], i) => {
        const y = terrainHeight(x, z, terrain);
        const s = 0.5 + (i % 7) * 0.15;
        return (
          <mesh
            key={`r${i}`}
            geometry={rockGeo}
            material={rockMat}
            castShadow
            receiveShadow
            position={[x, y + 0.15 * s, z]}
            rotation={[i * 0.7, i * 1.1, i * 0.4]}
            scale={[s, s * 0.7, s]}
          />
        );
      })}
      {bushes.map(([x, z], i) => {
        const y = terrainHeight(x, z, terrain);
        return (
          <mesh
            key={`b${i}`}
            geometry={bushGeo}
            material={bushMat}
            castShadow
            position={[x, y + 0.12, z]}
            scale={0.85 + (i % 4) * 0.1}
          />
        );
      })}
    </group>
  );
}
