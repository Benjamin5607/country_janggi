import { Html } from '@react-three/drei';
import { janggiHanja } from '../game/janggiUtils';
import type { JanggiColor, JanggiPieceType } from '../game/janggi/types';

/** DOM 한자 — 외부 woff Suspense 멈춤 방지 (페이지 Noto 폰트 사용). */
export function PieceHanjaLabel({
  type,
  color,
  scale = 1,
}: {
  type: JanggiPieceType;
  color: JanggiColor;
  scale?: number;
}) {
  const hanja = janggiHanja(type, color);
  const px = Math.round((type === 'g' ? 34 : 26) * scale);

  return (
    <Html
      position={[0.5 * scale, type === 'g' ? 1.0 : 0.82, 0]}
      center
      distanceFactor={14}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div
        style={{
          fontFamily: '"Noto Serif SC", "Noto Sans SC", serif',
          fontSize: px,
          fontWeight: 700,
          lineHeight: 1,
          color: color === 'w' ? '#1a1208' : '#f5f0e6',
          textShadow:
            color === 'w'
              ? '0 0 4px rgba(255,255,255,0.9), 1px 1px 0 #c9a227'
              : '0 0 6px rgba(0,0,0,0.85), 1px 1px 0 #3d2010',
        }}
      >
        {hanja}
      </div>
    </Html>
  );
}
