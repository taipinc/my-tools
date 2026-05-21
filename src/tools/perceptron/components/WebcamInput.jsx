import { useRef, useEffect, useCallback, useState } from 'react';
import { RETINA_SIZE, NUM_PIXELS } from '../perceptron';

const PREVIEW_SIZE = 200;

export default function WebcamInput({ onRetinaChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [active, setActive] = useState(false);
  const [threshold, setThreshold] = useState(128);

  const sample = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(sample);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = RETINA_SIZE;
    canvas.height = RETINA_SIZE;

    // Draw video scaled down to 20x20
    ctx.drawImage(video, 0, 0, RETINA_SIZE, RETINA_SIZE);
    const imageData = ctx.getImageData(0, 0, RETINA_SIZE, RETINA_SIZE);
    const pixels = imageData.data;

    const retina = new Array(NUM_PIXELS);
    for (let i = 0; i < NUM_PIXELS; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      retina[i] = gray < threshold ? 1 : 0;
    }
    onRetinaChange(retina);
    rafRef.current = requestAnimationFrame(sample);
  }, [onRetinaChange, threshold]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 320 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
      rafRef.current = requestAnimationFrame(sample);
    } catch (err) {
      console.error('Webcam access denied:', err);
    }
  }, [sample]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {!active ? (
          <button
            onClick={start}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors cursor-pointer text-sm"
          >
            Start Webcam
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 transition-colors cursor-pointer text-sm"
          >
            Stop Webcam
          </button>
        )}
        {active && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Threshold
            <input
              type="range"
              min={32}
              max={224}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24"
            />
            <span className="w-8 text-right">{threshold}</span>
          </label>
        )}
      </div>
      <div className="relative" style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            objectFit: 'cover',
            borderRadius: 8,
            display: active ? 'block' : 'none',
          }}
        />
        {!active && (
          <div
            className="flex items-center justify-center bg-gray-200 rounded text-gray-400 text-sm"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
          >
            Webcam off
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
