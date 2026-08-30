import { useEffect, useMemo, useRef, useState } from "react";
import { FORMATS, area, cropFactor, mm } from "./formats.js";

const INK = "var(--color-ink, #1c2840)";
const INK_SOFT = "var(--color-ink-soft, #4d5b75)";
const RULE = "var(--color-rule, #c8d2e0)";
const MONO = "var(--font-mono, ui-monospace, monospace)";

// Room around the drawing for the label chips and the scale bar.
const PAD_X = 44;
const PAD_TOP = 28;
const PAD_BOTTOM = 64;

const LABEL_GAP = 19; // minimum vertical distance between two chips

// Close enough to the rendered width of a chip to place it and to spot two
// that would land on top of each other — the chips are one line of text at a
// fixed size, so a per-character estimate does the job without measuring.
const chipWidth = (f, compact) =>
  34 +
  f.name.length * 6.1 +
  (compact ? 0 : `${mm(f.w)} × ${mm(f.h)} mm`.length * 5.8);

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

  // On a narrow stage the chips drop their measurements and carry the name
  // alone — the panel on the right still has the numbers.
  const compact = size.w > 0 && size.w < 640;

  // Rectangles are concentric, so every chip wants the same corner region.
  // Walk them big → small, hang each off its frame's left edge, and push one
  // down whenever it would land on a chip already placed.
  const placed = useMemo(() => {
    const done = [];
    const floor = size.h - PAD_BOTTOM + 22;

    for (const f of shown) {
      const w = f.w * scale;
      const h = f.h * scale;
      const left = cx - w / 2;
      const top = cy - h / 2;

      // Chips hang off the left edge so they never sit on top of the frame
      // they name — the small sensors are only a few pixels wide. A frame with
      // no room to its left gets its chip inside instead.
      const chipW = chipWidth(f, compact);
      const outside = left - 6 - chipW >= 2;
      // Outside chips are right-aligned to the frame's edge by the browser
      // (translateX(-100%)), so their placement needs no width estimate — only
      // the overlap test below works off one.
      const labelX = outside ? left - 6 : left + 7;
      const x0 = outside ? labelX - chipW : labelX;

      let labelY = top + 6;
      for (let pass = 0; pass < 40; pass++) {
        const hit = done.find(
          (q) =>
            x0 < q.x0 + q.chipW &&
            q.x0 < x0 + chipW &&
            Math.abs(labelY - q.labelY) < LABEL_GAP - 0.5,
        );
        if (!hit) break;
        // Only ever downwards: a chip parked exactly one gap below its
        // neighbour must not read as a collision again (floating-point
        // distances land a hair under the gap), or it would bounce in place
        // until the passes run out and land on top of the next chip.
        labelY = Math.max(labelY, hit.labelY + LABEL_GAP);
      }
      labelY = Math.min(labelY, floor);

      done.push({ format: f, w, h, left, top, labelX, labelY, x0, chipW, outside });
    }

    return done;
  }, [shown, scale, cx, cy, compact, size.h]);

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
        {placed.map(({ format: f, w, h, left, top }, i) => {
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

        {placed.map(({ format: f, top, left, labelY, outside }) => {
          // A chip that had to be pushed clear of its neighbour gets a hairline
          // back up to the corner of the frame it belongs to.
          const drop = labelY + 9 - top;
          if (!outside || drop < 14) return null;
          return (
            <div
              key={`leader-${f.id}`}
              className="image-formats-leader"
              style={{
                left: left - 4,
                top,
                height: drop,
                background: f.color,
                opacity: hovered === f.id ? 0.9 : 0.35,
                transition: `left 320ms ${ease}, top 320ms ${ease}, height 320ms ${ease}, opacity 120ms linear`,
              }}
            />
          );
        })}

        {placed.map(({ format: f, labelX, labelY, outside }, i) => {
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
                transform: outside ? "translateX(-100%)" : "none",
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
              {!compact && (
                <span className="image-formats-chip-dims">
                  {mm(f.w)} × {mm(f.h)} mm
                </span>
              )}
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

          <div className="image-formats-foot">
            × = crop factor, next to full frame
          </div>
        </div>
      </aside>
    </div>
  );
}
