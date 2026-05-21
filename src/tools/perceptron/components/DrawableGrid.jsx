import { useRef, useCallback } from "react";
import { RETINA_SIZE } from "../perceptron";

const CELL_SIZE = 18;
const GAP = 1;
const GRID_PX = RETINA_SIZE * (CELL_SIZE + GAP) + 7 * GAP;

export default function DrawableGrid({
  retina,
  onRetinaChange,
  tool,
  brushSize,
}) {
  const drawingRef = useRef(false);

  const getRowCol = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / (CELL_SIZE + GAP));
    const row = Math.floor(y / (CELL_SIZE + GAP));
    if (col < 0 || col >= RETINA_SIZE || row < 0 || row >= RETINA_SIZE)
      return null;
    return { row, col };
  }, []);

  const applyBrush = useCallback(
    (retina, row, col, value) => {
      const next = [...retina];
      const radius = Math.floor(brushSize / 2);
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < RETINA_SIZE && c >= 0 && c < RETINA_SIZE) {
            next[r * RETINA_SIZE + c] = value;
          }
        }
      }
      return next;
    },
    [brushSize],
  );

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      drawingRef.current = true;
      const pos = getRowCol(e);
      if (pos) {
        const value = tool === "eraser" ? 0 : 1;
        onRetinaChange(applyBrush(retina, pos.row, pos.col, value));
      }
    },
    [getRowCol, retina, onRetinaChange, tool, applyBrush],
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!drawingRef.current) return;
      const pos = getRowCol(e);
      if (pos) {
        const value = tool === "eraser" ? 0 : 1;
        onRetinaChange(applyBrush(retina, pos.row, pos.col, value));
      }
    },
    [getRowCol, retina, onRetinaChange, tool, applyBrush],
  );

  const handlePointerUp = useCallback(() => {
    drawingRef.current = false;
  }, []);

  return (
    <div
      className="inline-block select-none"
      style={{
        width: GRID_PX,
        height: GRID_PX,
        backgroundColor: "#1a1a1a",
        padding: GAP,
        display: "grid",
        gridTemplateColumns: `repeat(${RETINA_SIZE}, ${CELL_SIZE}px)`,
        gap: GAP,
        cursor: tool === "eraser" ? "cell" : "crosshair",
        borderRadius: 16,
        border: "3px solid #1a1a1a",
        overflow: "hidden",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {retina.map((val, i) => (
        <div
          key={i}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: val ? "#1a1a1a" : "#e8e3db",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
