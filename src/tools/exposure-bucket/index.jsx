import { useEffect, useRef, useState } from "react";
import "./tool.css";
import App from "./App.jsx";
import { PresentationProvider } from "./presentation.jsx";
import { useExposureStore } from "./store";

const TOTAL_STAGES = 6; // 0..5

export default function ExposureBucket() {
  const [mode, setMode] = useState("normal"); // 'normal' | 'presentation'
  const [stage, setStage] = useState(0);
  const [controlsRevealed, setControlsRevealed] = useState(false);
  const revealTimerRef = useRef(null);

  const reset = useExposureStore((s) => s.reset);
  const setRainIntensity = useExposureStore((s) => s.setRainIntensity);
  const setApertureOpenness = useExposureStore((s) => s.setApertureOpenness);
  const setShutterDuration = useExposureStore((s) => s.setShutterDuration);
  const setBucketWidth = useExposureStore((s) => s.setBucketWidth);
  const setShutterOpen = useExposureStore((s) => s.setShutterOpen);

  // Restore the simulation to its initial defaults (mirrors store.js defaults).
  function resetToDefaults() {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    reset();
    setRainIntensity(1.0);
    setApertureOpenness(1.0);
    setShutterDuration(2.0);
    setBucketWidth(1.131);
    setShutterOpen(false);
  }

  function enterPresentation() {
    resetToDefaults();
    setShutterOpen(true); // presentation starts with shutter open
    setStage(0);
    setControlsRevealed(false);
    setMode("presentation");
  }

  function exitPresentation() {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setMode("normal");
    setStage(0);
    setControlsRevealed(false);
  }

  function advanceToStage(next) {
    setStage(next);
    if (next >= 1) {
      // First time we reach stage 1: schedule the 1s controls reveal.
      if (!controlsRevealed && !revealTimerRef.current) {
        revealTimerRef.current = setTimeout(() => {
          setControlsRevealed(true);
          revealTimerRef.current = null;
        }, 1000);
      }
    }
  }

  function handleNext() {
    if (stage < TOTAL_STAGES - 1) advanceToStage(stage + 1);
  }

  function handleRestart() {
    resetToDefaults();
    setStage(0);
    setControlsRevealed(false);
  }

  useEffect(
    () => () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    },
    [],
  );

  const isPresenting = mode === "presentation";
  const presentationValue = isPresenting ? { stage, controlsRevealed } : null;
  const atFinal = stage >= TOTAL_STAGES - 1;

  // Keyboard shortcuts in presentation mode: ArrowRight / Space → next.
  useEffect(() => {
    if (!isPresenting) return;
    function onKey(e) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (stage === 0) {
          advanceToStage(1);
        } else if (!atFinal) {
          handleNext();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenting, stage, atFinal]);

  return (
    <div className="exposure-bucket-root">
      <PresentationProvider value={presentationValue}>
        <App />
      </PresentationProvider>

      {!isPresenting && (
        <button
          className="exposure-bucket-mode-toggle"
          onClick={enterPresentation}
          title="Start guided presentation"
        >
          presentation mode
        </button>
      )}

      {isPresenting && (
        <>
          {stage === 0 && (
            <div
              className="exposure-bucket-presentation-intro"
              onClick={() => advanceToStage(1)}
            >
              <h2 className="exposure-bucket-presentation-title">
                Once Upon a Time...
                <br />a Bucket
              </h2>
              <p className="exposure-bucket-presentation-hint">
                click anywhere to begin
              </p>
            </div>
          )}

          {stage > 0 && (
            <div className="exposure-bucket-presentation-nav">
              {!atFinal ? (
                <button
                  className="exposure-bucket-nav-btn exposure-bucket-nav-btn-primary"
                  onClick={handleNext}
                >
                  next →
                </button>
              ) : (
                <button
                  className="exposure-bucket-nav-btn exposure-bucket-nav-btn-primary"
                  onClick={handleRestart}
                >
                  ↻ restart
                </button>
              )}
              <button
                className="exposure-bucket-nav-btn exposure-bucket-nav-btn-ghost"
                onClick={exitPresentation}
                title="Exit presentation mode"
              >
                exit
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
