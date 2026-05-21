import { useState } from 'react';
import DrawableGrid from './DrawableGrid';
import { NUM_PIXELS } from '../perceptron';

function BrushControls({ tool, onToolChange, brushSize, onBrushSizeChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 rounded-full border-2 border-[#1a1a1a] overflow-hidden">
        <button
          onClick={() => onToolChange('brush')}
          className={`text-xs font-semibold px-4 py-1.5 transition-colors cursor-pointer ${
            tool === 'brush'
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-transparent text-[#1a1a1a] hover:bg-[#1a1a1a1a]'
          }`}
        >
          Brush
        </button>
        <button
          onClick={() => onToolChange('eraser')}
          className={`text-xs font-semibold px-4 py-1.5 transition-colors cursor-pointer ${
            tool === 'eraser'
              ? 'bg-[#1a1a1a] text-white'
              : 'bg-transparent text-[#1a1a1a] hover:bg-[#1a1a1a1a]'
          }`}
        >
          Eraser
        </button>
      </div>
      <div className="flex items-center gap-1">
        <span className="mono text-[10px] uppercase tracking-wider mr-1" style={{ opacity: 0.5 }}>Size</span>
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => onBrushSizeChange(s)}
            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-colors border-2 border-[#1a1a1a] ${
              brushSize === s
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-transparent text-[#1a1a1a]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RetinaInput({ retina, onRetinaChange }) {
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(1);

  const clearRetina = () => onRetinaChange(new Array(NUM_PIXELS).fill(0));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="card-label" style={{ marginBottom: 0 }}>Retina Input (20x20)</div>
        <button
          onClick={clearRetina}
          className="mono text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-full border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer font-bold"
        >
          Clear
        </button>
      </div>

      <BrushControls
        tool={tool}
        onToolChange={setTool}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
      />

      <DrawableGrid retina={retina} onRetinaChange={onRetinaChange} tool={tool} brushSize={brushSize} />
    </div>
  );
}
