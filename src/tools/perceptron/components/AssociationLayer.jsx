import { NUM_ASSOCIATION } from '../perceptron';

const VIZ_COLS = 32;
const CELL = 6;
const GAP = 1;

export default function AssociationLayer({ activations }) {
  const numActive = activations ? activations.reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="card-label" style={{ marginBottom: 0 }}>Association Layer</div>
        <span className="mono text-xs font-bold">
          {numActive} / {NUM_ASSOCIATION}
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VIZ_COLS}, ${CELL}px)`,
          gap: GAP,
          padding: GAP,
          backgroundColor: '#1a1a1a',
          width: 'fit-content',
          borderRadius: 12,
          border: '3px solid #1a1a1a',
        }}
      >
        {Array.from({ length: NUM_ASSOCIATION }, (_, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              backgroundColor: activations && activations[i] > 0 ? '#3b82f6' : '#c8c0b4',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
