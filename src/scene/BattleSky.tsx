import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../game/GameContext';
import { terrainPalette } from '../theme/terrain';

export function BattleSky() {
  const { terrain } = useGame();
  const palette = terrainPalette[terrain];
  const clouds = useRef<THREE.Mesh>(null);

  const skyUniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color(palette.skyTop) },
      bottomColor: { value: new THREE.Color(palette.skyBottom) },
      sunColor: { value: new THREE.Color('#fff4d8') },
    }),
    [palette.skyTop, palette.skyBottom],
  );

  const cloudUniforms = useMemo(
    () => ({
      time: { value: 0 },
      tint: { value: new THREE.Color('#ffffff') },
    }),
    [],
  );

  useFrame((st) => {
    if (clouds.current) {
      (clouds.current.material as THREE.ShaderMaterial).uniforms.time.value =
        st.clock.elapsedTime * 0.04;
    }
  });

  return (
    <>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[130, 40, 32]} />
        <shaderMaterial
          key={`sky-${terrain}`}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={skyUniforms}
          vertexShader={`
            varying vec3 vWorld;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorld = wp.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform vec3 sunColor;
            varying vec3 vWorld;
            void main() {
              vec3 dir = normalize(vWorld);
              float h = dir.y * 0.5 + 0.5;
              vec3 col = mix(bottomColor, topColor, pow(h, 0.85));
              float sun = pow(max(dot(dir, normalize(vec3(0.45, 0.35, 0.82))), 0.0), 48.0);
              col += sunColor * sun * 0.55;
              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>

      <mesh ref={clouds} position={[0, 22, -20]} rotation={[-0.2, 0, 0]} renderOrder={-9}>
        <planeGeometry args={[180, 50, 1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={cloudUniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform vec3 tint;
            varying vec2 vUv;
            float hash(vec2 p) {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              vec2 u = f * f * (3.0 - 2.0 * f);
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            void main() {
              vec2 uv = vUv * vec2(3.5, 1.2) + vec2(time, time * 0.2);
              float n = noise(uv) * 0.55 + noise(uv * 2.3) * 0.3 + noise(uv * 4.7) * 0.15;
              float a = smoothstep(0.42, 0.78, n) * 0.55;
              gl_FragColor = vec4(tint, a);
            }
          `}
        />
      </mesh>
    </>
  );
}
