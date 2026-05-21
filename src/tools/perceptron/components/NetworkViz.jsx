import { useMemo, useRef, useEffect, useState } from "react";
import { RETINA_SIZE, NUM_ASSOCIATION } from "../perceptron";

// Layout constants
const LAYER_GAP = 80;
const RETINA_VIZ_SIZE = 200;
const ASSOC_VIZ_W = 180;
const ASSOC_VIZ_H = 320;
const WEIGHT_VIZ_W = 140;
const WEIGHT_VIZ_H = 320;
const OUTPUT_VIZ_H = 200;
const OUTPUT_VIZ_W = 90;
const TOP_PAD = 60;
const BORDER = 3;

const MAX_RETINA_ASSOC_LINES = NUM_ASSOCIATION;
const MAX_ASSOC_OUTPUT_LINES = NUM_ASSOCIATION;

const INACTIVE_COLOR = "#8a8078";
const INACTIVE_DOT = "#b0a898";
const DARK = "#1a1a1a";

// Layer panel colors
const RETINA_BG = "#bdd7f5";
const ASSOC_BG = "#c8e6c0";
const WEIGHT_BG = "#f5e6a3";
const OUTPUT_BG = "#f5c4b8";

function weightToSvgColor(w) {
  if (w > 0) {
    const intensity = Math.min(w * 3, 1);
    const g = Math.round(100 + 155 * intensity);
    return `rgb(60, ${g}, 60)`;
  } else if (w < 0) {
    const intensity = Math.min(-w * 3, 1);
    const r = Math.round(100 + 155 * intensity);
    return `rgb(${r}, 60, 60)`;
  }
  return "#c8c0b4";
}

function RetinaLayer({ retina, x, y }) {
  const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;
  const clipId = "retina-clip";
  const inset = BORDER / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={inset}
            y={inset}
            width={RETINA_VIZ_SIZE - BORDER}
            height={RETINA_VIZ_SIZE - BORDER}
            rx={16}
          />
        </clipPath>
      </defs>
      <rect
        width={RETINA_VIZ_SIZE}
        height={RETINA_VIZ_SIZE}
        rx={18}
        fill={RETINA_BG}
        stroke={DARK}
        strokeWidth={BORDER}
      />
      <g clipPath={`url(#${clipId})`}>
        {retina.map((val, i) => {
          const row = Math.floor(i / RETINA_SIZE);
          const col = i % RETINA_SIZE;
          return (
            <rect
              key={i}
              x={col * cellSize + 0.5}
              y={row * cellSize + 0.5}
              width={cellSize - 1}
              height={cellSize - 1}
              fill={val ? DARK : "#e8e3db"}
              rx={1}
            />
          );
        })}
      </g>
      <text
        x={RETINA_VIZ_SIZE / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        RETINA 20x20
      </text>
    </g>
  );
}

function AssociationLayerViz({ activations, x, y }) {
  const cols = 8;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const dotSize = Math.min(
    (ASSOC_VIZ_W - 16) / cols,
    (ASSOC_VIZ_H - 16) / rows,
  );
  const padX = (ASSOC_VIZ_W - cols * dotSize) / 2;
  const padY = (ASSOC_VIZ_H - rows * dotSize) / 2;
  const numActive = activations ? activations.reduce((s, v) => s + v, 0) : 0;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: NUM_ASSOCIATION }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const active = activations && activations[i] > 0;
        return (
          <circle
            key={i}
            cx={padX + col * dotSize + dotSize / 2}
            cy={padY + row * dotSize + dotSize / 2}
            r={dotSize * 0.35}
            fill={active ? "#3b82f6" : INACTIVE_DOT}
            stroke={active ? DARK : "none"}
            strokeWidth={active ? 0.5 : 0}
          />
        );
      })}
      <text
        x={ASSOC_VIZ_W / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        ASSOCIATION
      </text>
      <text
        x={ASSOC_VIZ_W / 2}
        y={ASSOC_VIZ_H + 18}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={10}
        fill={DARK}
        opacity={0.5}
      >
        {numActive}/512 active
      </text>
    </g>
  );
}

function WeightLayerViz({ weights, labels, x, y }) {
  const cols = 16;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const cellSize = Math.min(
    (WEIGHT_VIZ_W - 8) / cols,
    (WEIGHT_VIZ_H - 40) / 2 / rows,
  );
  const gridH = rows * cellSize;
  const totalH = gridH * 2 + 24;
  const startY = (WEIGHT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {[0, 1].map((oIdx) => {
        const gy = startY + oIdx * (gridH + 24);
        const padX = (WEIGHT_VIZ_W - cols * cellSize) / 2;
        return (
          <g key={oIdx} transform={`translate(0, ${gy})`}>
            <text
              x={WEIGHT_VIZ_W / 2}
              y={-3}
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize={8}
              fontWeight={700}
              fill={DARK}
            >
              {labels[oIdx]}
            </text>
            {weights &&
              Array.from({ length: NUM_ASSOCIATION }, (_, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                return (
                  <rect
                    key={i}
                    x={padX + col * cellSize}
                    y={row * cellSize}
                    width={cellSize - 0.5}
                    height={cellSize - 0.5}
                    fill={weightToSvgColor(weights[oIdx][i])}
                    rx={0.5}
                  />
                );
              })}
          </g>
        );
      })}
      <text
        x={WEIGHT_VIZ_W / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        WEIGHTS
      </text>
    </g>
  );
}

function OutputLayerViz({ scores, labels, prediction, x, y }) {
  const unitH = 70;
  const unitW = OUTPUT_VIZ_W;
  const gap = 20;
  const totalH = unitH * 2 + gap;
  const startY = (OUTPUT_VIZ_H - totalH) / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={OUTPUT_VIZ_W}
        height={OUTPUT_VIZ_H}
        rx={18}
        fill={OUTPUT_BG}
        stroke={DARK}
        strokeWidth={BORDER}
      />
      {[0, 1].map((idx) => {
        const isWinner = prediction === idx;
        return (
          <g
            key={idx}
            transform={`translate(0, ${startY + idx * (unitH + gap)})`}
          >
            <rect
              x={10}
              y={0}
              width={unitW - 20}
              height={unitH}
              rx={unitH / 2}
              fill={isWinner ? DARK : "rgba(255,255,255,0.6)"}
              stroke={DARK}
              strokeWidth={2.5}
            />
            <text
              x={unitW / 2}
              y={26}
              textAnchor="middle"
              fontFamily="'Helvetica Neue', Helvetica, sans-serif"
              fontSize={11}
              fontWeight={700}
              fill={isWinner ? "#fff" : DARK}
            >
              {labels[idx]}
            </text>
            <text
              x={unitW / 2}
              y={46}
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize={13}
              fontWeight={700}
              fill={isWinner ? "#fff" : DARK}
            >
              {scores ? scores[idx].toFixed(2) : "—"}
            </text>
            {isWinner && (
              <text
                x={unitW / 2}
                y={60}
                textAnchor="middle"
                fontFamily="'Space Mono', monospace"
                fontSize={7}
                fontWeight={700}
                fill="#ef4444"
              >
                PREDICTED
              </text>
            )}
          </g>
        );
      })}
      <text
        x={OUTPUT_VIZ_W / 2}
        y={-14}
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize={11}
        fontWeight={700}
        fill={DARK}
      >
        OUTPUT
      </text>
    </g>
  );
}

// Pre-compute stable sampled indices once (not on every render)
const STABLE_RETINA_ASSOC_INDICES = (() => {
  const indices = [];
  // Use a simple deterministic spread: pick evenly spaced indices
  const step = NUM_ASSOCIATION / MAX_RETINA_ASSOC_LINES;
  for (let i = 0; i < MAX_RETINA_ASSOC_LINES; i++) {
    indices.push(Math.floor(i * step));
  }
  return indices;
})();

const STABLE_ASSOC_OUTPUT_INDICES = (() => {
  const indices = [];
  const step = NUM_ASSOCIATION / MAX_ASSOC_OUTPUT_LINES;
  for (let i = 0; i < MAX_ASSOC_OUTPUT_LINES; i++) {
    indices.push(Math.floor(i * step));
  }
  return indices;
})();

function getAssocDotLayout() {
  const cols = 8;
  const rows = Math.ceil(NUM_ASSOCIATION / cols);
  const dotSize = Math.min(
    (ASSOC_VIZ_W - 16) / cols,
    (ASSOC_VIZ_H - 16) / rows,
  );
  const padX = (ASSOC_VIZ_W - cols * dotSize) / 2;
  const padY = (ASSOC_VIZ_H - rows * dotSize) / 2;
  return { cols, dotSize, padX, padY };
}

function ConnectionCanvas({
  retina,
  associationUnits,
  activations,
  weights,
  retinaPos,
  assocPos,
  weightPos,
  outputPos,
  width,
  height,
}) {
  const canvasRef = useRef(null);

  // Pre-compute static line geometry once
  const geometry = useMemo(() => {
    const { cols, dotSize, padX, padY } = getAssocDotLayout();
    const cellSize = RETINA_VIZ_SIZE / RETINA_SIZE;
    const unitH = 70,
      gap = 20;
    const totalH = unitH * 2 + gap;
    const startY = (OUTPUT_VIZ_H - totalH) / 2;

    const raLines = STABLE_RETINA_ASSOC_INDICES.map((aIdx) => {
      const unit = associationUnits[aIdx];
      const pixelIdx = unit.connections[0];
      const pixelRow = Math.floor(pixelIdx / RETINA_SIZE);
      const pixelCol = pixelIdx % RETINA_SIZE;
      const aRow = Math.floor(aIdx / cols);
      const aCol = aIdx % cols;
      return {
        x1: retinaPos.x + pixelCol * cellSize + cellSize / 2,
        y1: retinaPos.y + pixelRow * cellSize + cellSize / 2,
        x2: assocPos.x + padX + aCol * dotSize + dotSize / 2,
        y2: assocPos.y + padY + aRow * dotSize + dotSize / 2,
        aIdx,
        pixelIdx,
      };
    });

    // Compute weight grid layout to connect lines to actual cells
    const wCols = 16;
    const wRows = Math.ceil(NUM_ASSOCIATION / wCols);
    const wCellSize = Math.min(
      (WEIGHT_VIZ_W - 8) / wCols,
      (WEIGHT_VIZ_H - 40) / 2 / wRows,
    );
    const wPadX = (WEIGHT_VIZ_W - wCols * wCellSize) / 2;
    const wGridH = wRows * wCellSize;
    const wTotalH = wGridH * 2 + 24;
    const wStartY = (WEIGHT_VIZ_H - wTotalH) / 2;

    const aoLines = [];
    for (const aIdx of STABLE_ASSOC_OUTPUT_INDICES) {
      const aRow = Math.floor(aIdx / cols);
      const aCol = aIdx % cols;
      const x1 = assocPos.x + padX + aCol * dotSize + dotSize / 2;
      const y1 = assocPos.y + padY + aRow * dotSize + dotSize / 2;

      const wRow = Math.floor(aIdx / wCols);
      const wCol = aIdx % wCols;

      for (let oIdx = 0; oIdx < 2; oIdx++) {
        const wGridY = weightPos.y + wStartY + oIdx * (wGridH + 24);
        const wCellCenterY = wGridY + wRow * wCellSize + wCellSize / 2;
        const wCellLeft = weightPos.x + wPadX + wCol * wCellSize;
        const wCellRight = wCellLeft + wCellSize;

        aoLines.push({
          x1,
          y1,
          x2: outputPos.x,
          y2: outputPos.y + startY + oIdx * (unitH + gap) + unitH / 2,
          wLeft: wCellLeft,
          wRight: wCellRight,
          wY: wCellCenterY,
          aIdx,
          oIdx,
        });
      }
    }

    return { raLines, aoLines };
  }, [associationUnits, retinaPos, assocPos, weightPos, outputPos]);

  // Draw on canvas whenever dynamic data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const { raLines, aoLines } = geometry;

    // Helper: draw a cable-like bezier curve between two points
    // controlBias: 0-1, how far the control points pull horizontally
    function drawCable(ctx, x1, y1, x2, y2, bias) {
      const dx = (x2 - x1) * bias;
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);
    }

    // Draw inactive retina→assoc lines first (batch)
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    for (const l of raLines) {
      const active = activations && activations[l.aIdx] > 0;
      if (!active) drawCable(ctx, l.x1, l.y1, l.x2, l.y2, 0.5);
    }
    ctx.stroke();

    // Draw active retina→assoc lines
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = DARK;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (const l of raLines) {
      const active = activations && activations[l.aIdx] > 0;
      if (active) drawCable(ctx, l.x1, l.y1, l.x2, l.y2, 0.5);
    }
    ctx.stroke();

    // Draw inactive assoc→weight lines (batch)
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (const l of aoLines) {
      const active = activations && activations[l.aIdx] > 0;
      if (!active) drawCable(ctx, l.x1, l.y1, l.wLeft, l.wY, 0.5);
    }
    ctx.stroke();

    // Draw inactive weight→output lines (batch)
    ctx.beginPath();
    for (const l of aoLines) {
      const active = activations && activations[l.aIdx] > 0;
      if (!active) drawCable(ctx, l.wRight, l.wY, l.x2, l.y2, 0.5);
    }
    ctx.stroke();

    // Draw active assoc→weight lines (neutral, like retina→assoc)
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = DARK;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (const l of aoLines) {
      const active = activations && activations[l.aIdx] > 0;
      if (!active) continue;
      drawCable(ctx, l.x1, l.y1, l.wLeft, l.wY, 0.5);
    }
    ctx.stroke();

    // Draw active weight→output lines (colored by weight)
    for (const l of aoLines) {
      const active = activations && activations[l.aIdx] > 0;
      if (!active) continue;
      const w = weights ? weights[l.oIdx][l.aIdx] : 0;
      const absW = Math.abs(w);
      ctx.strokeStyle = w > 0 ? "#16a34a" : w < 0 ? "#dc2626" : "#c8c0b4";
      ctx.lineWidth = Math.max(0.8, absW * 4);
      ctx.globalAlpha = Math.min(0.9, 0.3 + absW * 3);
      ctx.beginPath();
      drawCable(ctx, l.wRight, l.wY, l.x2, l.y2, 0.5);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [geometry, retina, activations, weights, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
      }}
    />
  );
}

export default function NetworkViz({
  retina,
  associationUnits,
  activations,
  weights,
  scores,
  labels,
  prediction,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) =>
      setContainerWidth(entries[0].contentRect.width),
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const positions = useMemo(() => {
    const totalContentW =
      RETINA_VIZ_SIZE +
      ASSOC_VIZ_W +
      WEIGHT_VIZ_W +
      OUTPUT_VIZ_W +
      LAYER_GAP * 3;
    const startX = Math.max(20, (containerWidth - totalContentW) / 2);
    return {
      retina: { x: startX, y: TOP_PAD + (ASSOC_VIZ_H - RETINA_VIZ_SIZE) / 2 },
      assoc: { x: startX + RETINA_VIZ_SIZE + LAYER_GAP, y: TOP_PAD },
      weight: {
        x: startX + RETINA_VIZ_SIZE + ASSOC_VIZ_W + LAYER_GAP * 2,
        y: TOP_PAD,
      },
      output: {
        x:
          startX + RETINA_VIZ_SIZE + ASSOC_VIZ_W + WEIGHT_VIZ_W + LAYER_GAP * 3,
        y: TOP_PAD + (ASSOC_VIZ_H - OUTPUT_VIZ_H) / 2,
      },
    };
  }, [containerWidth]);

  const svgH = TOP_PAD + ASSOC_VIZ_H + 44;

  return (
    <div ref={containerRef} className="w-full" style={{ position: "relative" }}>
      <ConnectionCanvas
        retina={retina}
        associationUnits={associationUnits}
        activations={activations}
        weights={weights}
        retinaPos={positions.retina}
        assocPos={positions.assoc}
        weightPos={positions.weight}
        outputPos={positions.output}
        width={containerWidth}
        height={svgH}
      />
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${containerWidth} ${svgH}`}
        style={{ position: "relative" }}
      >
        <RetinaLayer
          retina={retina}
          x={positions.retina.x}
          y={positions.retina.y}
        />
        <AssociationLayerViz
          activations={activations}
          x={positions.assoc.x}
          y={positions.assoc.y}
        />
        <WeightLayerViz
          weights={weights}
          labels={labels}
          x={positions.weight.x}
          y={positions.weight.y}
        />
        <OutputLayerViz
          scores={scores}
          labels={labels}
          prediction={prediction}
          x={positions.output.x}
          y={positions.output.y}
        />
      </svg>
    </div>
  );
}
