import { RETINA_SIZE } from '../perceptron';

function makePattern(drawFn) {
  const grid = new Array(RETINA_SIZE * RETINA_SIZE).fill(0);
  drawFn(grid);
  return grid;
}

function setPixel(grid, r, c) {
  if (r >= 0 && r < RETINA_SIZE && c >= 0 && c < RETINA_SIZE) {
    grid[r * RETINA_SIZE + c] = 1;
  }
}

const SHAPES = [
  {
    name: 'Circle',
    pattern: makePattern((g) => {
      const cx = 9.5, cy = 9.5, r = 7;
      for (let row = 0; row < RETINA_SIZE; row++) {
        for (let col = 0; col < RETINA_SIZE; col++) {
          const dist = Math.sqrt((row - cy) ** 2 + (col - cx) ** 2);
          if (dist >= r - 1 && dist <= r + 1) setPixel(g, row, col);
        }
      }
    }),
  },
  {
    name: 'Square',
    pattern: makePattern((g) => {
      for (let i = 3; i <= 16; i++) {
        setPixel(g, 3, i);
        setPixel(g, 16, i);
        setPixel(g, i, 3);
        setPixel(g, i, 16);
      }
    }),
  },
  {
    name: 'Triangle',
    pattern: makePattern((g) => {
      // bottom edge
      for (let c = 3; c <= 16; c++) setPixel(g, 16, c);
      // left and right edges
      for (let r = 4; r <= 16; r++) {
        const span = ((r - 4) / 12) * 6.5;
        setPixel(g, r, Math.round(10 - span));
        setPixel(g, r, Math.round(9 + span));
      }
    }),
  },
  {
    name: 'Cross',
    pattern: makePattern((g) => {
      for (let i = 3; i <= 16; i++) {
        setPixel(g, i, 9);
        setPixel(g, i, 10);
        setPixel(g, 9, i);
        setPixel(g, 10, i);
      }
    }),
  },
  {
    name: 'Line /',
    pattern: makePattern((g) => {
      for (let i = 0; i < RETINA_SIZE; i++) {
        setPixel(g, RETINA_SIZE - 1 - i, i);
      }
    }),
  },
  {
    name: 'Line \\',
    pattern: makePattern((g) => {
      for (let i = 0; i < RETINA_SIZE; i++) {
        setPixel(g, i, i);
      }
    }),
  },
];

const THUMB_SIZE = 60;
const THUMB_CELL = THUMB_SIZE / RETINA_SIZE;

function ShapeCard({ shape, onClick }) {
  return (
    <button
      onClick={() => onClick(shape.pattern)}
      className="flex flex-col items-center gap-1 p-2 rounded border border-gray-300 bg-white hover:border-gray-500 transition-colors cursor-pointer"
    >
      <svg width={THUMB_SIZE} height={THUMB_SIZE} viewBox={`0 0 ${THUMB_SIZE} ${THUMB_SIZE}`}>
        {shape.pattern.map((val, i) => {
          if (!val) return null;
          const row = Math.floor(i / RETINA_SIZE);
          const col = i % RETINA_SIZE;
          return (
            <rect
              key={i}
              x={col * THUMB_CELL}
              y={row * THUMB_CELL}
              width={THUMB_CELL}
              height={THUMB_CELL}
              fill="#1a1a1a"
            />
          );
        })}
      </svg>
      <span className="text-xs text-gray-600">{shape.name}</span>
    </button>
  );
}

export default function PredefinedImages({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SHAPES.map((shape) => (
        <ShapeCard key={shape.name} shape={shape} onClick={onSelect} />
      ))}
    </div>
  );
}
