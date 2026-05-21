import { predict } from '../perceptron';

export default function OutputPanel({ scores, labels, onLabelsChange }) {
  const prediction = scores ? predict(scores) : null;

  const handleLabelChange = (idx, value) => {
    const next = [...labels];
    next[idx] = value;
    onLabelsChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card-label" style={{ marginBottom: 0 }}>Output Layer</div>
      <div className="flex flex-col gap-3">
        {[0, 1].map((idx) => {
          const isWinner = prediction === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl p-4 border-3 transition-all"
              style={{
                border: `3px solid #1a1a1a`,
                backgroundColor: isWinner ? '#1a1a1a' : 'rgba(255,255,255,0.5)',
                color: isWinner ? '#fff' : '#1a1a1a',
              }}
            >
              <input
                type="text"
                value={labels[idx]}
                onChange={(e) => handleLabelChange(idx, e.target.value)}
                className="w-full text-sm font-bold bg-transparent border-none outline-none"
                style={{ color: 'inherit' }}
                spellCheck={false}
              />
              <div className="flex items-baseline justify-between mt-1">
                <span className="mono text-2xl font-bold">
                  {scores ? scores[idx].toFixed(3) : '—'}
                </span>
                {isWinner && (
                  <span className="mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#ef4444', color: '#fff' }}>
                    Predicted
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
