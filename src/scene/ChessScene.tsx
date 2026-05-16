import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneLoader } from './SceneLoader';
import * as THREE from 'three';
import { useGame } from '../game/GameContext';
import { BattleSky } from './BattleSky';
import { CombatBurst } from './CombatBurst';
import { CombatDuel } from './CombatDuel';
import { FogSync } from './FogSync';
import { JanggiBoard } from './JanggiBoard';
import { MoveHighlights } from './MoveHighlights';
import { ArmyPreload } from './ArmyPreload';
import { PiecesLayer } from './PiecesLayer';
import { Terrain } from './Terrain';

export function ChessScene() {
  const { terrain } = useGame();

  return (
    <Canvas
      className="canvas-wrap"
      shadows
      camera={{ position: [0, 18, 20.5], fov: 42, near: 0.1, far: 260 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.background = new THREE.Color('#1a2238');
      }}
    >
      <ambientLight intensity={0.42} />
      <hemisphereLight intensity={0.28} color="#c8d8ff" groundColor="#4a5038" />
      <JanggiBoard />
      <MoveHighlights />
      <OrbitControls
        enablePan
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={14}
        maxDistance={50}
        target={[0, 0.4, 0]}
      />
      <Suspense fallback={<SceneLoader />}>
        <ArmyPreload />
        <FogSync terrain={terrain} />
        <directionalLight
          castShadow
          position={[14, 24, 8]}
          intensity={1.55}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={70}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
        />
        <directionalLight position={[-10, 12, -8]} intensity={0.35} color="#b8c8f0" />
        <BattleSky />
        <Terrain key={terrain} />
        <PiecesLayer />
        <CombatDuel />
        <CombatBurst />
      </Suspense>
    </Canvas>
  );
}
