import { useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import { useExposureStore } from './store';

export default function App() {
  const tick = useExposureStore((s) => s.tick);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Single animation loop — drives store.tick(dt) every frame.
  useEffect(() => {
    const loop = (now) => {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      tick(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [tick]);

  return (
    <div className="exposure-bucket-app">
      <div className="exposure-bucket-stage">
        <Scene />
      </div>
      <div className="exposure-bucket-floating-controls">
        <Controls />
      </div>
    </div>
  );
}
