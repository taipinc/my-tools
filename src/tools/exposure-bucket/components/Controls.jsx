import { useExposureStore } from "../store";
import { usePresentation, showAt } from "../presentation.jsx";

// --- Photographic unit display ---------------------------------------
// These are display-only conversions; the underlying state stays in the
// abstract units the simulation uses.

const ISO_STOPS = [100, 200, 400, 800, 1600];
const F_STOPS = [
  1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8,
];

// bucketWidth → ISO. Wider bucket = lower ISO. Anchor: width 1.6 → ISO 100.
// ISO scales with 1/width² (capacity ∝ width², light sensitivity is inverse).
function formatIso(width) {
  const iso = 100 * Math.pow(1.6 / width, 2);
  let best = ISO_STOPS[0];
  for (const s of ISO_STOPS) {
    if (Math.abs(Math.log2(iso / s)) < Math.abs(Math.log2(iso / best)))
      best = s;
  }
  return `ISO ${best}`;
}

// apertureOpenness (0..1) → f-number. Area ∝ 1/f², openness 1.0 = max area.
// Anchor: openness 1.0 → f/1.4. Snapped to nearest standard stop.
function formatAperture(openness) {
  if (openness < 0.01) return "closed";
  const f = 1.4 / Math.sqrt(openness);
  let best = F_STOPS[0];
  for (const s of F_STOPS) {
    if (Math.abs(Math.log2(f / s)) < Math.abs(Math.log2(f / best))) best = s;
  }
  return `f/${best}`;
}

// shutterDuration (seconds, in tool time) → real photographic fraction.
// Anchor: 1/500s in real life ≈ 0.5s in tool time → scale factor 250.
// So tool 8.33s ≈ 1/30s in real life.
function formatShutter(toolSeconds) {
  const denom = Math.max(1, Math.round(250 / toolSeconds));
  return `1/${denom}s`;
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <label className="exposure-bucket-slider">
      <div className="exposure-bucket-slider-row">
        <span className="exposure-bucket-slider-label">{label}</span>
        <span className="exposure-bucket-slider-value">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

// Stepped slider that snaps between a discrete list of stops.
// `stops` is an array of underlying (store-space) values; the slider
// itself runs over integer indices, so each stop is evenly spaced on
// the track. Tick marks above the track show every stop position.
function SteppedSlider({
  label,
  value,
  stops,
  onChange,
  format,
  tickLabel,
  isFullStop,
}) {
  // Snap current store value to nearest stop in log-space (matches how
  // photographic stops are perceived).
  const idx = stops.reduce((best, s, i) => {
    const d = Math.abs(Math.log2(s / value));
    const bd = Math.abs(Math.log2(stops[best] / value));
    return d < bd ? i : best;
  }, 0);
  const display = format ? format(stops[idx]) : stops[idx].toFixed(2);
  const lastIdx = stops.length - 1;

  return (
    <label className="exposure-bucket-slider">
      <div className="exposure-bucket-slider-row">
        <span className="exposure-bucket-slider-label">{label}</span>
        <span className="exposure-bucket-slider-value">{display}</span>
      </div>
      <div className="exposure-bucket-stepped">
        <div className="exposure-bucket-tick-row">
          {stops.map((s, i) => (
            <span
              key={i}
              className={`exposure-bucket-tick ${i === idx ? "is-active" : ""} ${isFullStop && isFullStop(stops[i]) ? "is-full-stop" : ""}`}
              style={{ left: `${(i / lastIdx) * 100}%` }}
            >
              {tickLabel ? (
                <span className="exposure-bucket-tick-label">
                  {tickLabel(s)}
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={lastIdx}
          step={1}
          value={idx}
          onChange={(e) => onChange(stops[parseInt(e.target.value, 10)])}
        />
      </div>
    </label>
  );
}

// --- Stop tables -----------------------------------------------------
// Each entry is the underlying store-space value at that stop.

// 1/3-stop steps from 1/30 to 1/500. tool_seconds = 250 / denom.
const SHUTTER_STOPS = [
  8.333, 6.25, 5.0, 4.167, 3.125, 2.5, 2.0, 1.5625, 1.25, 1.0, 0.781, 0.625,
  0.5,
];
// Aperture: openness = (1.4 / f)². 1/3-stop steps from f/1.4 to f/8.
const APERTURE_STOPS = [
  1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8,
].map((f) => Math.pow(1.4 / f, 2));
// ISO via bucket width = 1.6 / sqrt(iso/100). From ISO 100 to ISO 1600.
const ISO_STOPS_WIDTHS = [1.6, 1.131, 0.8, 0.566, 0.4];

export default function Controls() {
  const rainIntensity = useExposureStore((s) => s.rainIntensity);
  const apertureOpenness = useExposureStore((s) => s.apertureOpenness);
  const shutterDuration = useExposureStore((s) => s.shutterDuration);
  const bucketWidth = useExposureStore((s) => s.bucketWidth);
  const fillLevel = useExposureStore((s) => s.fillLevel);
  const shutterOpen = useExposureStore((s) => s.shutterOpen);

  const setRainIntensity = useExposureStore((s) => s.setRainIntensity);
  const setApertureOpenness = useExposureStore((s) => s.setApertureOpenness);
  const setShutterDuration = useExposureStore((s) => s.setShutterDuration);
  const setBucketWidth = useExposureStore((s) => s.setBucketWidth);
  const setShutterOpen = useExposureStore((s) => s.setShutterOpen);
  const triggerShot = useExposureStore((s) => s.triggerShot);
  const reset = useExposureStore((s) => s.reset);

  const presentation = usePresentation();
  const showRain = showAt(presentation, 4);
  const showShutterCtrl = showAt(presentation, 2);
  const showApertureCtrl = showAt(presentation, 3);
  const showBucketWidthCtrl = showAt(presentation, 5);
  const showReadout = showAt(presentation, 1, { requireRevealed: true });

  const expoLabel =
    fillLevel < 0.85
      ? "underexposed"
      : fillLevel <= 1.15
        ? "correct exposure"
        : "overexposed";

  // Y-positions are tied to the Scene.jsx subjects, computed as a fraction
  // of the SVG viewBox height (560). The SVG uses preserveAspectRatio meet
  // and fills the stage container vertically, so percentages map cleanly
  // onto the floating controls column (which shares the same height).
  //   rain   → top of scene
  //   shutter→ SHUTTER_MEET_Y (175) ≈ 31%
  //   aperture → APERTURE_CY  (320) ≈ 57%
  //   bucket  → bucket center (460) ≈ 82%
  return (
    <div className="exposure-bucket-controls">
      {showRain && (
        <div className="exposure-bucket-floating-group is-top">
          <Slider
            label="rain (brightness)"
            value={rainIntensity}
            min={0}
            max={6}
            step={0.05}
            onChange={setRainIntensity}
          />
        </div>
      )}

      {showShutterCtrl && (
        <div className="exposure-bucket-floating-group" style={{ top: "31%" }}>
          <SteppedSlider
            label="(speed) shutter"
            value={shutterDuration}
            stops={SHUTTER_STOPS}
            onChange={setShutterDuration}
            format={formatShutter}
            isFullStop={(v) =>
              [8.333, 4.167, 2.0, 1.0, 0.5].some((s) => Math.abs(v - s) < 0.001)
            }
          />
          <button
            className="exposure-bucket-btn exposure-bucket-btn-secondary"
            onClick={() => setShutterOpen(!shutterOpen)}
            style={{ width: "100%" }}
          >
            {shutterOpen ? "close shutter" : "open shutter"}
          </button>
          {showReadout && (
            <button
              className="exposure-bucket-btn exposure-bucket-btn-primary"
              onClick={triggerShot}
              style={{ width: "100%", marginTop: "6px" }}
            >
              take shot
            </button>
          )}
        </div>
      )}

      {showApertureCtrl && (
        <div className="exposure-bucket-floating-group" style={{ top: "57%" }}>
          <SteppedSlider
            label="aperture (opening)"
            value={apertureOpenness}
            stops={APERTURE_STOPS}
            onChange={setApertureOpenness}
            format={formatAperture}
            isFullStop={(v) =>
              [1.4, 2, 2.8, 4, 5.6, 8].some(
                (f) => Math.abs(v - Math.pow(1.4 / f, 2)) < 0.001,
              )
            }
          />
        </div>
      )}

      {showBucketWidthCtrl && (
        <div className="exposure-bucket-floating-group" style={{ top: "82%" }}>
          <SteppedSlider
            label="sensitivity (bucket width)"
            value={bucketWidth}
            stops={ISO_STOPS_WIDTHS}
            onChange={setBucketWidth}
            format={formatIso}
          />
        </div>
      )}

      {showReadout && (
        <div className="exposure-bucket-floating-group is-bottom">
          <div className="exposure-bucket-readout">
            <div>
              fill: <strong>{(fillLevel * 100).toFixed(0)}%</strong>
            </div>
            <div className="exposure-bucket-readout-hint">{expoLabel}</div>
          </div>
          <div className="exposure-bucket-button-row">
            <button
              className="exposure-bucket-btn exposure-bucket-btn-secondary"
              onClick={reset}
            >
              reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
