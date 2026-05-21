import { NUM_ASSOCIATION } from '../perceptron';

const VIZ_COLS = 32;
const CELL = 6;
const GAP = 1;

function weightToColor(w) {
  if (w > 0) {
    const intensity = Math.min(w * 3, 1);
    const g = Math.round(100 + 155 * intensity);
    return `rgb(60, ${g}, 60)`;
  } else if (w < 0) {
    const intensity = Math.min(-w * 3, 1);
    const r = Math.round(100 + 155 * intensity);
    return `rgb(${r}, 60, 60)`;
  }
  return '#c8c0b4';
}

function WeightGrid({ weights, label }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold">{label}</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VIZ_COLS}, ${CELL}px)`,
          gap: GAP,
          padding: GAP,
          backgroundColor: '#1a1a1a',
          width: 'fit-content',
          borderRadius: 10,
          border: '2px solid #1a1a1a',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: NUM_ASSOCIATION }, (_, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              backgroundColor: weights ? weightToColor(weights[i]) : '#c8c0b4',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function WeightViz({ weights, labels }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="card-label" style={{ marginBottom: 0 }}>Weights</div>
      <div className="flex items-center gap-4 mono text-[10px] uppercase tracking-wider" style={{ opacity: 0.5 }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-[#1a1a1a]" style={{ backgroundColor: 'rgb(60, 255, 60)' }} />
          Pos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-[#1a1a1a]" style={{ backgroundColor: 'rgb(255, 60, 60)' }} />
          Neg
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1].map((idx) => (
          <WeightGrid
            key={idx}
            weights={weights ? weights[idx] : null}
            label={labels[idx]}
          />
        ))}
      </div>
    </div>
  );
}
