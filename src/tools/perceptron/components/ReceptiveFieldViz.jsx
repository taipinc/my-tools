import { useMemo } from "react";
import { RETINA_SIZE, NUM_PIXELS } from "../perceptron";

const CELL_SIZE = 14;
const GAP = 1;
const GRID_PX = RETINA_SIZE * (CELL_SIZE + GAP) + 7 * GAP;

function valueToColor(val, maxAbs) {
  if (maxAbs === 0) return "#c8c0b4";
  const normalized = val / maxAbs;
  if (normalized > 0) {
    const t = normalized;
    const r = Math.round(240 - 180 * t);
    const g = Math.round(240 - 40 * t);
    const b = Math.round(240 - 180 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = -normalized;
    const r = Math.round(240 - 20 * t);
    const g = Math.round(240 - 180 * t);
    const b = Math.round(240 - 180 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function FieldGrid({ field, label }) {
  const maxAbs = useMemo(() => {
    if (!field) return 0;
    let m = 0;
    for (let i = 0; i < NUM_PIXELS; i++) {
      const a = Math.abs(field[i]);
      if (a > m) m = a;
    }
    return m;
  }, [field]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold">{label}</span>
      <div
        style={{
          width: GRID_PX,
          height: GRID_PX,
          backgroundColor: "#1a1a1a",
          padding: GAP,
          display: "grid",
          gridTemplateColumns: `repeat(${RETINA_SIZE}, ${CELL_SIZE}px)`,
          gap: GAP,
          borderRadius: 14,
          border: "3px solid #1a1a1a",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: NUM_PIXELS }, (_, i) => (
          <div
            key={i}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: field
                ? valueToColor(field[i], maxAbs)
                : "#d8d0c4",
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ReceptiveFieldViz({ receptiveFields, labels }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="card-label" style={{ marginBottom: 4 }}>
          Receptive Fields
        </div>
        <p className="mono text-[10px]" style={{ opacity: 0.4 }}>
          Weights projected back onto the retina — shows what each output "looks
          for"
        </p>
      </div>
      <div
        className="flex items-center gap-4 mono text-[10px] uppercase tracking-wider"
        style={{ opacity: 0.5 }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-[#1a1a1a]"
            style={{ backgroundColor: "rgb(60, 200, 60)" }}
          />
          Excitatory
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-[#1a1a1a]"
            style={{ backgroundColor: "rgb(220, 60, 60)" }}
          />
          Inhibitory
        </span>
      </div>
      <div className="flex gap-8 flex-wrap">
        {[0, 1].map((idx) => (
          <FieldGrid
            key={idx}
            field={receptiveFields ? receptiveFields[idx] : null}
            label={labels[idx]}
          />
        ))}
      </div>
    </div>
  );
}
