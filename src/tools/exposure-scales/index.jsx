import { useCallback, useEffect, useState } from "react";
import "./tool.css";
import App from "./App.jsx";
import { PresentationProvider } from "./presentation.jsx";

const FIRST_STAGE = 1; // shutter only
const LAST_STAGE = 3; // shutter + aperture + ISO

export default function ExposureScales() {
  const [mode, setMode] = useState("normal"); // 'normal' | 'presentation'
  const [stage, setStage] = useState(FIRST_STAGE);

  const isPresenting = mode === "presentation";
  const atFinal = stage >= LAST_STAGE;

  const handleNext = useCallback(() => {
    setStage((prev) => Math.min(LAST_STAGE, prev + 1));
  }, []);

  function enterPresentation() {
    setStage(FIRST_STAGE);
    setMode("presentation");
  }

  function exitPresentation() {
    setMode("normal");
    setStage(FIRST_STAGE);
  }

  // ArrowRight / Space advance the deck — but not while a scale or a button
  // has focus, where those keys already mean something else.
  useEffect(() => {
    if (!isPresenting) return;
    function onKey(e) {
      if (e.key !== "ArrowRight" && e.key !== " ") return;
      const target = e.target;
      if (target && typeof target.closest === "function") {
        if (target.closest("[data-exposure-scale], button, input, textarea")) return;
      }
      e.preventDefault();
      handleNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenting, handleNext]);

  return (
    <div className="exposure-scales-root" style={{ width: "100%", height: "100%" }}>
      <PresentationProvider value={isPresenting ? { stage } : null}>
        <App />
      </PresentationProvider>

      {!isPresenting ? (
        <button
          className="exposure-scales-mode-toggle"
          onClick={enterPresentation}
          title="Reveal the three scales one at a time"
        >
          presentation mode
        </button>
      ) : (
        <div className="exposure-scales-presentation-nav">
          {!atFinal ? (
            <button
              className="exposure-scales-nav-btn exposure-scales-nav-btn-primary"
              onClick={handleNext}
            >
              next →
            </button>
          ) : (
            <button
              className="exposure-scales-nav-btn exposure-scales-nav-btn-primary"
              onClick={() => setStage(FIRST_STAGE)}
            >
              ↻ restart
            </button>
          )}
          <button
            className="exposure-scales-nav-btn exposure-scales-nav-btn-ghost"
            onClick={exitPresentation}
            title="Exit presentation mode"
          >
            exit
          </button>
        </div>
      )}
    </div>
  );
}
