import { useExposureStore } from "../store";
import { usePresentation, showAt } from "../presentation.jsx";

const ISO_STOPS_DISPLAY = [100, 200, 400, 800, 1600];
const F_STOPS_DISPLAY = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
const SHUTTER_STOPS = [8.333, 5.556, 4.167, 2.778, 2.0, 1.25, 1.0, 0.714, 0.5];

function snapShutter(val) {
  return SHUTTER_STOPS.reduce((best, s) =>
    Math.abs(Math.log2(s / val)) < Math.abs(Math.log2(best / val)) ? s : best,
  );
}
function formatShutter(toolSeconds) {
  const denom = Math.max(1, Math.round(250 / toolSeconds));
  return `1/${denom}\u00a0s`;
}
function formatAperture(openness) {
  if (openness < 0.01) return "closed";
  const f = 1.4 / Math.sqrt(openness);
  let best = F_STOPS_DISPLAY[0];
  for (const s of F_STOPS_DISPLAY)
    if (Math.abs(Math.log2(f / s)) < Math.abs(Math.log2(f / best))) best = s;
  return `f/${best}`;
}
function formatIso(width) {
  const iso = 100 * Math.pow(1.6 / width, 2);
  let best = ISO_STOPS_DISPLAY[0];
  for (const s of ISO_STOPS_DISPLAY)
    if (Math.abs(Math.log2(iso / s)) < Math.abs(Math.log2(iso / best))) best = s;
  return `ISO\u00a0${best}`;
}

export default function ExpoIndicator() {
  const presentation = usePresentation();
  const show = showAt(presentation, 1, { requireRevealed: true });

  const shutterDuration = useExposureStore((s) => s.shutterDuration);
  const apertureOpenness = useExposureStore((s) => s.apertureOpenness);
  const bucketWidth = useExposureStore((s) => s.bucketWidth);

  if (!show) return null;

  return (
    <div className="exposure-bucket-expo-indicator">
      <span>{formatShutter(snapShutter(shutterDuration))}</span>
      <span>{formatAperture(apertureOpenness)}</span>
      <span>{formatIso(bucketWidth)}</span>
    </div>
  );
}
