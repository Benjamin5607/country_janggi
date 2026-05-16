import { Html, useProgress } from '@react-three/drei';

/** Must use drei `Html` inside Canvas — not the DOM `Loader` component. */
export function SceneLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          color: '#e8e4dc',
          fontSize: '0.9rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '0.75rem 1rem',
          background: 'rgba(10,12,16,0.85)',
          borderRadius: 8,
          border: '1px solid rgba(201,162,39,0.35)',
        }}
      >
        Loading battlefield… {progress.toFixed(0)}%
      </div>
    </Html>
  );
}
