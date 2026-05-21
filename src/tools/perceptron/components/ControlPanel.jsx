export default function ControlPanel({
  labels,
  learningRate,
  onLearningRateChange,
  onLearn,
  onReset,
  hasInput,
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="card-label" style={{ marginBottom: 0 }}>
        Controls
      </div>

      {/* Learn buttons */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Teach correct class:</span>
        <div className="flex gap-2">
          {labels.map((label, idx) => (
            <button
              key={idx}
              onClick={() => onLearn(idx)}
              disabled={!hasInput}
              className={`flex-1 py-3 px-3 rounded-full text-sm font-bold transition-all cursor-pointer border-3 ${
                hasInput
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-95"
                  : "border-[#c0b8a8] bg-transparent text-[#c0b8a8] cursor-not-allowed"
              }`}
              style={{ borderWidth: 3 }}
            >
              {label}
            </button>
          ))}
        </div>
        {!hasInput && (
          <span className="mono text-[10px]" style={{ opacity: 0.4 }}>
            Draw an input first
          </span>
        )}
      </div>

      {/* Learning rate */}
      <label className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Learning rate</span>
          <span className="mono text-sm font-bold">
            {learningRate.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0.01}
          max={1.0}
          step={0.01}
          value={learningRate}
          onChange={(e) => onLearningRateChange(Number(e.target.value))}
          className="w-full accent-[#1a1a1a]"
        />
      </label>

      {/* Reset */}
      <button
        onClick={onReset}
        className="py-2.5 px-4 rounded-full text-sm font-bold border-2 border-[#1a1a1a] bg-transparent hover:bg-[#1a1a1a] hover:text-white transition-all cursor-pointer active:scale-95"
      >
        Reset Weights
      </button>
    </div>
  );
}
