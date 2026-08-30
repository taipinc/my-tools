import { useEffect, useMemo, useRef, useState } from "react";
import { FORMATS, area, cropFactor, mm } from "./formats.js";

const INK_SOFT = "var(--color-ink-soft, #4d5b75)";
const RULE = "var(--color-rule, #c8d2e0)";

// Room around the drawing for the scale bar.
const PAD_X = 44;
const PAD_TOP = 28;
const PAD_BOTTOM = 64;

const LABEL_GAP = 19; // minimum vertical distance between two chips
const CHIP_H = 20; // rendered height of a chip
const CHIP_INSET = 7; // gap between a chip and the edges of its own frame

// Close enough to the rendered width of a chip to fit it inside its frame and
// to spot two that would land on top of each other — a chip is one line of
// text at a fixed size, so a per-character estimate does the job without
// measuring.
const chipWidth = (f) => 26 + f.name.length * 6.4;

const BAR_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];

const ease = "cubic-bezier(0.22, 0.61, 0.36, 1)";

function useMeasure() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sized against the container, never the window — the tool lives inside
    // a page shell whose height is not the viewport's.
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

export default function App() {
  const [stageRef, size] = useMeasure();
  const [visible, setVisible] = useState(() => FORMATS.map((f) => f.id));
  const [hovered, setHovered] = useState(null);

  const isOn = (id) => visible.includes(id);

  function toggle(id) {
    setVisible((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // Biggest first, so the small formats sit on top of the big ones.
  const shown = useMemo(
    () =>
      FORMATS.filter((f) => visible.includes(f.id)).sort(
        (a, b) => area(b) - area(a),
      ),
    [visible],
  );

  // The whole point of the filter: drop the sheet film and the drawing
  // re-scales so the little sensors are actually readable.
  const scale = useMemo(() => {
    if (!shown.length || !size.w || !size.h) return 0;
    const maxW = Math.max(...shown.map((f) => f.w));
    const maxH = Math.max(...shown.map((f) => f.h));
    const k = Math.min(
      (size.w - PAD_X * 2) / maxW,
      (size.h - PAD_TOP - PAD_BOTTOM) / maxH,
    );
    return Number.isFinite(k) && k > 0 ? k : 0;
  }, [shown, size]);

  const cx = size.w / 2;
  // Top-aligned, so the outermost frame starts level with the card on the
  // right; any spare height is left below the drawing rather than split.
  const tallest = shown.length ? Math.max(...shown.map((f) => f.h)) : 0;
  const cy = PAD_TOP + (tallest * scale) / 2;

  // Chips live inside the frame they name, at its top-left corner, and are
  // pushed down to clear a chip already placed there. One that cannot fit
  // inside its own frame is dropped rather than parked somewhere ambiguous —
  // the card on the right names every format anyway.
  const placed = useMemo(() => {
    const done = [];

    for (const f of shown) {
      const w = f.w * scale;
      const h = f.h * scale;
      const left = cx - w / 2;
      const top = cy - h / 2;

      const chipW = chipWidth(f);
      if (chipW + CHIP_INSET * 2 > w) continue;

      const labelX = left + CHIP_INSET;
      let labelY = top + CHIP_INSET - 1;
      for (let pass = 0; pass < 40; pass++) {
        const hit = done.find(
          (q) =>
            labelX < q.labelX + q.chipW &&
            q.labelX < labelX + chipW &&
            Math.abs(labelY - q.labelY) < LABEL_GAP - 0.5,
        );
        if (!hit) break;
        // Only ever downwards: a chip parked exactly one gap below its
        // neighbour must not read as a collision again (floating-point
        // distances land a hair under the gap), or it would bounce in place
        // until the passes run out and land on top of the next chip.
        labelY = Math.max(labelY, hit.labelY + LABEL_GAP);
      }
      if (labelY + CHIP_H + CHIP_INSET > top + h) continue;

      done.push({ format: f, labelX, labelY, chipW });
    }

    return done;
  }, [shown, scale, cx, cy]);

  const frames = useMemo(
    () =>
      shown.map((f) => ({
        format: f,
        w: f.w * scale,
        h: f.h * scale,
        left: cx - (f.w * scale) / 2,
        top: cy - (f.h * scale) / 2,
      })),
    [shown, scale, cx, cy],
  );

  // A bar of some round number of millimetres, kept in a comfortable range.
  const bar = useMemo(() => {
    if (!scale) return null;
    const target =
      BAR_STEPS.filter((s) => s * scale <= 170).pop() ?? BAR_STEPS[0];
    return { mm: target, px: target * scale };
  }, [scale]);

  return (
    <div className="image-formats-body">
      <div ref={stageRef} className="image-formats-stage">
        {frames.map(({ format: f, w, h, left, top }, i) => {
          const active = hovered === f.id;
          return (
            <div
              key={f.id}
              className="image-formats-rect"
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                left,
                top,
                width: Math.max(w, 1),
                height: Math.max(h, 1),
                borderColor: f.color,
                borderWidth: active ? 3 : 2,
                background: active ? `${f.color}26` : `${f.color}0f`,
                zIndex: 10 + i,
                transition: `left 320ms ${ease}, top 320ms ${ease}, width 320ms ${ease}, height 320ms ${ease}, background-color 120ms linear, border-width 120ms linear`,
              }}
            />
          );
        })}

        {placed.map(({ format: f, labelX, labelY }, i) => {
          const active = hovered === f.id;
          return (
            <div
              key={f.id}
              className="image-formats-chip"
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                left: labelX,
                top: labelY,
                borderColor: active ? f.color : RULE,
                zIndex: active ? 200 : 100 + i,
                transition: `left 320ms ${ease}, top 320ms ${ease}`,
              }}
            >
              <span
                className="image-formats-dot"
                style={{ background: f.color }}
              />
              <span style={{ color: f.color, fontWeight: 700 }}>{f.name}</span>
            </div>
          );
        })}

        {!shown.length && (
          <div className="image-formats-empty">
            Tick a format on the right to start comparing.
          </div>
        )}

        {bar && (
          <div className="image-formats-scalebar">
            <div
              className="image-formats-scalebar-line"
              style={{
                width: bar.px,
                transition: `width 320ms ${ease}`,
              }}
            />
            <span className="image-formats-scalebar-label">{bar.mm} mm</span>
          </div>
        )}
      </div>

      <aside className="image-formats-panel">
        <div className="image-formats-card">
          <div className="image-formats-card-head">
            <span className="image-formats-card-title">formats</span>
            <div className="image-formats-btns">
              <button
                type="button"
                onClick={() => setVisible(FORMATS.map((f) => f.id))}
              >
                all
              </button>
              <button type="button" onClick={() => setVisible([])}>
                none
              </button>
            </div>
          </div>

          <div className="image-formats-list">
            {FORMATS.map((f) => {
              const on = isOn(f.id);
              return (
                <label
                  key={f.id}
                  className={`image-formats-row${on ? " is-on" : ""}`}
                  onMouseEnter={() => setHovered(f.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(f.id)}
                    style={{ accentColor: f.color }}
                  />
                  <span
                    className="image-formats-row-name"
                    style={{ color: on ? f.color : INK_SOFT }}
                  >
                    {f.name}
                  </span>
                  <span className="image-formats-row-dims">
                    {mm(f.w)} × {mm(f.h)} mm
                  </span>
                  <span className="image-formats-row-crop">
                    {cropFactor(f) < 1
                      ? cropFactor(f).toFixed(2)
                      : cropFactor(f).toFixed(1)}
                    ×
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
