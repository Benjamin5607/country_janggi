import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useGame } from '../game/GameContext';
import type { TerrainId } from '../i18n/translations';
import { publicUrl } from '../utils/publicUrl';
import { terrainHeight, terrainSlope } from './terrain/heightfield';
import { TerrainScatter } from './terrain/TerrainScatter';
import { MountainRing } from './terrain/MountainRing';

const tex = (path: string) => publicUrl(path);

const SIZE = 140;
const SEG = 160;

type TerrainMaps = {
  grass: string;
  sand: string;
  dirt: string;
  rock: string;
  grassN: string;
  sandN: string;
};

const MAPS: Record<TerrainId, TerrainMaps> = {
  plains: {
    grass: tex('/textures/terrain/grass_albedo.jpg'),
    sand: tex('/textures/terrain/dirt_albedo.jpg'),
    dirt: tex('/textures/terrain/dirt_albedo.jpg'),
    rock: tex('/textures/terrain/rock_albedo.jpg'),
    grassN: tex('/textures/terrain/grass_normal.jpg'),
    sandN: tex('/textures/terrain/grass_normal.jpg'),
  },
  grassland: {
    grass: tex('/textures/terrain/grass_albedo.jpg'),
    sand: tex('/textures/terrain/dirt_albedo.jpg'),
    dirt: tex('/textures/terrain/dirt_albedo.jpg'),
    rock: tex('/textures/terrain/rock_albedo.jpg'),
    grassN: tex('/textures/terrain/grass_normal.jpg'),
    sandN: tex('/textures/terrain/grass_normal.jpg'),
  },
  desert: {
    grass: tex('/textures/terrain/sand_albedo.jpg'),
    sand: tex('/textures/terrain/sand_albedo.jpg'),
    dirt: tex('/textures/terrain/sand_albedo.jpg'),
    rock: tex('/textures/terrain/rock_albedo.jpg'),
    grassN: tex('/textures/terrain/sand_normal.jpg'),
    sandN: tex('/textures/terrain/sand_normal.jpg'),
  },
  steppe: {
    grass: tex('/textures/terrain/grass_albedo.jpg'),
    sand: tex('/textures/terrain/sand_albedo.jpg'),
    dirt: tex('/textures/terrain/dirt_albedo.jpg'),
    rock: tex('/textures/terrain/rock_albedo.jpg'),
    grassN: tex('/textures/terrain/grass_normal.jpg'),
    sandN: tex('/textures/terrain/sand_normal.jpg'),
  },
  highlands: {
    grass: tex('/textures/terrain/grass_albedo.jpg'),
    sand: tex('/textures/terrain/dirt_albedo.jpg'),
    dirt: tex('/textures/terrain/rock_albedo.jpg'),
    rock: tex('/textures/terrain/rock_albedo.jpg'),
    grassN: tex('/textures/terrain/grass_normal.jpg'),
    sandN: tex('/textures/terrain/grass_normal.jpg'),
  },
};

function configureRepeat(tex: THREE.Texture) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(42, 42);
  tex.anisotropy = 12;
}

export function Terrain() {
  const { terrain } = useGame();
  const paths = MAPS[terrain];
  const maps = useTexture({
    grass: paths.grass,
    sand: paths.sand,
    dirt: paths.dirt,
    rock: paths.rock,
    grassN: paths.grassN,
    sandN: paths.sandN,
  });

  useLayoutEffect(() => {
    Object.values(maps).forEach(configureRepeat);
  }, [maps]);

  const { geometry, material } = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const blendAttr: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z, terrain);
      pos.setY(i, y);

      const slope = terrainSlope(x, z, terrain);
      const dist = Math.hypot(x, z);
      const rockW = THREE.MathUtils.smoothstep(0.35, 0.85, slope);
      const sandW = terrain === 'desert' ? 0.65 : THREE.MathUtils.smoothstep(18, 42, dist) * 0.35;
      const dirtW = THREE.MathUtils.smoothstep(6, 11, dist) * 0.4;

      blendAttr.push(THREE.MathUtils.clamp(rockW + sandW * 0.5 + dirtW * 0.3, 0, 1));

      const grassC = new THREE.Color(terrain === 'desert' ? '#e8d4b0' : '#7faa5a');
      const rockC = new THREE.Color('#6a6864');
      const c = grassC.clone().lerp(rockC, rockW * 0.7 + sandW * 0.2);
      colors.push(c.r, c.g, c.b);
    }

    pos.needsUpdate = true;
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setAttribute('blend', new THREE.Float32BufferAttribute(blendAttr, 1));
    g.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: maps.grass,
      normalMap: maps.grassN,
      vertexColors: true,
      roughness: terrain === 'desert' ? 0.92 : 0.82,
      metalness: 0.02,
      envMapIntensity: 0.45,
    });

    return { geometry: g, material: mat };
  }, [terrain, maps.grass, maps.grassN]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow material={material} />
      <TerrainScatter terrain={terrain} />
      <MountainRing terrain={terrain} />
    </group>
  );
}
