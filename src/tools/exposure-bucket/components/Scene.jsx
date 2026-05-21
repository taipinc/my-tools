import { useEffect, useRef, useMemo, useState } from "react";
import rough from "roughjs";
import { useExposureStore } from "../store";
import { usePresentation, showAt } from "../presentation.jsx";

const VIEW_W = 600;
const VIEW_H = 560;
const CX = 300;

// --- Bucket -----------------------------------------------------------
const TOP_Y = 400;
const BOTTOM_Y = 520;
const ELLIPSE_FLATTEN = 0.34;
const BASE_TOP_RX = 65;
const BASE_BOTTOM_RX = 50;
const CORRECT_Y = (TOP_Y + BOTTOM_Y) / 2;

// --- Aperture (larger) ------------------------------------------------
const APERTURE_CY = 320;
const APERTURE_OUTER_RX = 135;
const APERTURE_OUTER_RY = 36;
const APERTURE_MAX_HOLE_RX = 115;
const APERTURE_MAX_HOLE_RY = 28;

// --- Shutter — rectangular plate, drawn isometrically ---------------
// In 3D the shutter is a horizontal rectangle. We project it onto the
// screen using the standard iso axes (both horizontal 3D directions
// project at ±30° from screen-horizontal), so the rectangle shows as a
// parallelogram. The plate splits along its iso-y axis: the back half
// (further from viewer) and the front half (closer). When the shutter
// opens, each half slides further along iso-y — back drifts up-right,
// front drifts down-left.
const SHUTTER_MEET_Y = 175;
const SHUTTER_A = 115; // half-extent along iso-x (in 3D units)
const SHUTTER_B = 80; // half-extent along iso-y (in 3D units)
const SHUTTER_OPEN_OFFSET = 58; // 3D iso-y units each half slides

const ISO_C = Math.cos((30 * Math.PI) / 180); // 0.866
const ISO_S = Math.sin((30 * Math.PI) / 180); // 0.5

// Project a (x,y) point on the iso ground plane to screen-local offset.
// +x goes down-right (+C, +S); +y goes down-left (-C, +S).
function isoXY(x, y) {
  return [ISO_C * (x - y), ISO_S * (x + y)];
}
function shutterPt(x, y) {
  const [sx, sy] = isoXY(x, y);
  return [CX + sx, SHUTTER_MEET_Y + sy];
}
// Screen translation a half experiences when it slides by `dy` in iso-y.
function isoSlide(dy) {
  return [-ISO_C * dy, ISO_S * dy];
}

// --- Rain -------------------------------------------------------------
const RAIN_TILT_DEG = 15;
const RAIN_TRAVEL_PX = 620;
const RAIN_STEPS = 9; // ~10fps stepped motion

function bucketDims(bucketWidth) {
  const topRx = BASE_TOP_RX * bucketWidth;
  const bottomRx = BASE_BOTTOM_RX * bucketWidth;
  return {
    topRx,
    topRy: topRx * ELLIPSE_FLATTEN,
    bottomRx,
    bottomRy: bottomRx * ELLIPSE_FLATTEN,
  };
}

function makeDrops(count, seed = 1) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  // Extend emitter wider than the canvas so diagonal travel still covers
  // the bottom-right. With RAIN_TILT_DEG=15° and RAIN_TRAVEL_PX≈620,
  // horizontal drift ≈ 620 * sin(15°) ≈ 160px, so we push the right edge
  // well past VIEW_W.
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: -80 + rand() * (VIEW_W + 280),
    // Randomize the drop's starting y in DOM space. Combined with each
    // drop's own stepped duration, this breaks the 10fps horizontal
    // banding (drops no longer share the same 9 snap positions).
    y0: -300 + rand() * 280,
    delay: rand() * 1.4,
    duration: 0.95 + rand() * 0.45, // slower
    length: 11 + rand() * 7,
  }));
}

// Water color buckets based on exposure correctness
function waterColors(fillLevel) {
  if (fillLevel < 0.85) {
    return { fill: "#9ed1f0", stroke: "#2a6da6" }; // under: blue
  }
  if (fillLevel <= 1.15) {
    return { fill: "#8fcf86", stroke: "#3a8f33" }; // correct: green
  }
  return { fill: "#f4a83a", stroke: "#a8631b" }; // over: orange
}

export default function Scene() {
  const svgRef = useRef(null);
  const bucketStructureRef = useRef(null);
  const bucketRimRef = useRef(null);
  const correctMarkRef = useRef(null);
  const waterBodyRef = useRef(null);
  const waterSurfaceRef = useRef(null);
  const apertureRef = useRef(null);
  const shutterTopRef = useRef(null);
  const shutterBottomRef = useRef(null);

  // Tick counter that drives the water-surface jitter. The interval
  // below bumps it at a rate set by aperture openness.
  const [surfaceSeed, setSurfaceSeed] = useState(0);

  const presentation = usePresentation();
  const showBucket = showAt(presentation, 1);
  const showShutter = showAt(presentation, 2);
  const showAperture = showAt(presentation, 3);
  const hide = (v) => (v ? undefined : { display: "none" });

  const bucketWidth = useExposureStore((s) => s.bucketWidth);
  const fillLevel = useExposureStore((s) => s.fillLevel);
  const rainIntensity = useExposureStore((s) => s.rainIntensity);
  const apertureOpenness = useExposureStore((s) => s.apertureOpenness);
  const shutterOpen = useExposureStore((s) => s.shutterOpen);

  // --- Bucket structure: solid rim + sides + bottom arc ----------------
  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    const { topRx, topRy, bottomRx, bottomRy } = bucketDims(bucketWidth);
    const g = bucketStructureRef.current;
    while (g.firstChild) g.removeChild(g.firstChild);

    const ink = "#1a1a1a";
    const opts = { stroke: ink, strokeWidth: 2.6, roughness: 1.4, bowing: 1.2 };

    // Rim is drawn separately into bucketRimRef so it always stays on top.
    // Bottom front arc only.
    g.appendChild(
      rc.path(
        `M ${CX - bottomRx} ${BOTTOM_Y} A ${bottomRx} ${bottomRy} 0 0 0 ${CX + bottomRx} ${BOTTOM_Y}`,
        opts,
      ),
    );
    // Side walls
    g.appendChild(rc.line(CX - topRx, TOP_Y, CX - bottomRx, BOTTOM_Y, opts));
    g.appendChild(rc.line(CX + topRx, TOP_Y, CX + bottomRx, BOTTOM_Y, opts));

    // Rim — kept in a separate top-most group; redraw it here too so
    // dimensions stay in sync with bucketWidth changes.
    const rim = bucketRimRef.current;
    while (rim.firstChild) rim.removeChild(rim.firstChild);
    rim.appendChild(rc.ellipse(CX, TOP_Y, topRx * 2, topRy * 2, opts));
  }, [bucketWidth]);

  // --- Correct-exposure dashed ellipse at vertical center --------------
  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    const g = correctMarkRef.current;
    while (g.firstChild) g.removeChild(g.firstChild);

    const { topRx, topRy, bottomRx, bottomRy } = bucketDims(bucketWidth);
    // Radii at vertical center = midpoint between top and bottom rim radii.
    const rx = (topRx + bottomRx) / 2;
    const ry = (topRy + bottomRy) / 2;
    g.appendChild(
      rc.ellipse(CX, CORRECT_Y, rx * 2, ry * 2, {
        stroke: "#c0392b",
        strokeWidth: 1.8,
        strokeLineDash: [5, 4],
        roughness: 1.0,
      }),
    );
  }, [bucketWidth]);

  // --- Water body — plain SVG path, never roughened -------------------
  // The "body" is the volume of water below the surface. It only re-
  // renders when fillLevel/bucketWidth change, and uses a plain SVG path
  // (no rough.js) so it doesn't jitter at all.
  useEffect(() => {
    const g = waterBodyRef.current;
    if (!g) return;
    while (g.firstChild) g.removeChild(g.firstChild);
    if (fillLevel <= 0.005) return;

    const { topRx, topRy, bottomRx, bottomRy } = bucketDims(bucketWidth);
    const t = Math.min(fillLevel, 2.0) / 2.0;
    const waterY = BOTTOM_Y - t * (BOTTOM_Y - TOP_Y);
    const inset = 0.94;
    const waterRx = (bottomRx + (topRx - bottomRx) * t) * inset;
    const waterRy = (bottomRy + (topRy - bottomRy) * t) * inset;
    const { fill } = waterColors(fillLevel);

    const d = [
      `M ${CX - waterRx} ${waterY}`,
      `A ${waterRx} ${waterRy} 0 0 0 ${CX + waterRx} ${waterY}`,
      `L ${CX + bottomRx} ${BOTTOM_Y}`,
      `A ${bottomRx} ${bottomRy} 0 0 1 ${CX - bottomRx} ${BOTTOM_Y}`,
      `Z`,
    ].join(" ");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", fill);
    path.setAttribute("stroke", "none");
    g.appendChild(path);
  }, [fillLevel, bucketWidth]);

  // --- Water surface — roughened ellipse, jitter tied to aperture ----
  // Both wobble speed and amplitude scale with apertureOpenness: f/1.4
  // = fast & big wobble, f/16 = slow & tiny wobble. The jitter pauses
  // when the shutter is closed (no flow → calm surface).
  useEffect(() => {
    if (!shutterOpen || apertureOpenness < 0.01 || rainIntensity < 0.001)
      return;
    // Log-scaled period so each f-stop step roughly multiplies the
    // interval by 1.5: f/1.4 ≈ 60ms, f/16 ≈ ~1s.
    // Rain acts as a speed multiplier: rain=0 stops jitter, rain=1 no
    // change, rain=2 doubles speed (halves the period), etc.
    const stops = -Math.log2(Math.max(apertureOpenness, 0.005));
    const period = (60 * Math.pow(1.5, stops)) / rainIntensity;
    const id = setInterval(() => setSurfaceSeed((s) => s + 1), period);
    return () => clearInterval(id);
  }, [shutterOpen, apertureOpenness, rainIntensity]);

  useEffect(() => {
    if (!svgRef.current || !waterSurfaceRef.current) return;
    const rc = rough.svg(svgRef.current);
    const g = waterSurfaceRef.current;
    while (g.firstChild) g.removeChild(g.firstChild);
    if (fillLevel <= 0.005) return;

    const { topRx, topRy, bottomRx, bottomRy } = bucketDims(bucketWidth);
    const t = Math.min(fillLevel, 2.0) / 2.0;
    const waterY = BOTTOM_Y - t * (BOTTOM_Y - TOP_Y);
    const inset = 0.94;
    const waterRx = (bottomRx + (topRx - bottomRx) * t) * inset * 1.1;
    const waterRy = (bottomRy + (topRy - bottomRy) * t) * inset;
    const { fill, stroke } = waterColors(fillLevel);

    // Roughness (wobble amplitude) is fixed — only speed is affected by aperture/rain.
    const roughness = 1.5;

    g.appendChild(
      rc.ellipse(CX, waterY, waterRx * 2, waterRy * 2, {
        stroke,
        strokeWidth: 1.6,
        fill,
        fillStyle: "solid",
        roughness,
        // Force a new random seed each tick so the stroke re-roughens.
        seed: surfaceSeed + 1,
      }),
    );
  }, [surfaceSeed, fillLevel, bucketWidth, apertureOpenness]);

  // --- Aperture --------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current || !apertureRef.current) return;
    const rc = rough.svg(svgRef.current);
    const g = apertureRef.current;
    while (g.firstChild) g.removeChild(g.firstChild);

    const ink = "#1a1a1a";
    g.appendChild(
      rc.ellipse(
        CX,
        APERTURE_CY,
        APERTURE_OUTER_RX * 2,
        APERTURE_OUTER_RY * 2,
        {
          stroke: ink,
          strokeWidth: 2.6,
          fill: ink,
          fillStyle: "hachure",
          hachureGap: 5,
          hachureAngle: -45,
          roughness: 1.4,
        },
      ),
    );

    const holeRx = Math.max(2, APERTURE_MAX_HOLE_RX * apertureOpenness);
    const holeRy = Math.max(1, APERTURE_MAX_HOLE_RY * apertureOpenness);
    if (apertureOpenness > 0.02) {
      g.appendChild(
        rc.ellipse(CX, APERTURE_CY, holeRx * 2, holeRy * 2, {
          stroke: ink,
          strokeWidth: 2.2,
          fill: "#fafaf7",
          fillStyle: "solid",
          roughness: 1.1,
        }),
      );
    } else {
      g.appendChild(
        rc.line(CX - 28, APERTURE_CY, CX + 28, APERTURE_CY, {
          stroke: ink,
          strokeWidth: 2.4,
          roughness: 1.2,
        }),
      );
    }
  }, [apertureOpenness]);

  // --- Shutter — two rectangular halves of an iso-projected plate -----
  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    const top = shutterTopRef.current;
    const bot = shutterBottomRef.current;
    while (top.firstChild) top.removeChild(top.firstChild);
    while (bot.firstChild) bot.removeChild(bot.firstChild);

    const ink = "#1a1a1a";
    const plateOpts = {
      stroke: ink,
      strokeWidth: 2.4,
      fill: ink,
      fillStyle: "hachure",
      hachureGap: 5,
      hachureAngle: 30, // aligned with iso-y axis
      roughness: 1.3,
    };

    // Back half (y from -B to 0)
    const backPoly = [
      shutterPt(-SHUTTER_A, -SHUTTER_B),
      shutterPt(+SHUTTER_A, -SHUTTER_B),
      shutterPt(+SHUTTER_A, 0),
      shutterPt(-SHUTTER_A, 0),
    ];
    // Front half (y from 0 to +B)
    const frontPoly = [
      shutterPt(-SHUTTER_A, 0),
      shutterPt(+SHUTTER_A, 0),
      shutterPt(+SHUTTER_A, +SHUTTER_B),
      shutterPt(-SHUTTER_A, +SHUTTER_B),
    ];

    top.appendChild(rc.polygon(backPoly, plateOpts));
    bot.appendChild(rc.polygon(frontPoly, plateOpts));
  }, []);

  const drops = useMemo(() => {
    const n = Math.round(rainIntensity * 46);
    return makeDrops(n);
  }, [rainIntensity]);

  const { topRx } = bucketDims(bucketWidth);

  return (
    <div className="exposure-bucket-scene-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="exposure-bucket-svg"
      >
        {/* Rain */}
        <g className="exposure-bucket-rain">
          {drops.map((d) => (
            <line
              key={d.id}
              x1={d.x}
              y1={d.y0 - d.length}
              x2={d.x}
              y2={d.y0}
              stroke="#0a0a0a"
              strokeWidth="2.2"
              strokeOpacity="0.5"
              strokeLinecap="round"
              style={{
                animationDelay: `-${d.delay}s`,
                animationDuration: `${d.duration}s`,
                animationTimingFunction: `steps(${RAIN_STEPS}, end)`,
                ["--drop-travel"]: `${RAIN_TRAVEL_PX}px`,
                ["--drop-tilt"]: `${RAIN_TILT_DEG}deg`,
              }}
            />
          ))}
        </g>

        {/* Aperture */}
        <g ref={apertureRef} style={hide(showAperture)} />

        {/* Water body — plain SVG, never jitters. Drawn under the bucket
            structure so side walls/front-arc overdraw its edges. */}
        <g ref={waterBodyRef} style={hide(showBucket)} />

        {/* Bucket structure */}
        <g ref={bucketStructureRef} style={hide(showBucket)} />

        {/* Water surface — roughened, jitter rate set by aperture.
            Drawn above the bucket walls so the surface ellipse can
            wobble visibly across the front edge. */}
        <g ref={waterSurfaceRef} style={hide(showBucket)} />

        {/* Correct-exposure dashed ellipse on top, so the marker stays
            visible across the water line. */}
        <g ref={correctMarkRef} style={hide(showBucket)} />

        {/* Bucket rim — always on top so it draws over water, rain, everything. */}
        <g ref={bucketRimRef} style={hide(showBucket)} />

        {/* Shutter — drawn above rim so it fully occludes the bucket opening
            when closed. Each half translates along the iso-y axis by
            SHUTTER_OPEN_OFFSET in 3D — (−C·dy, +S·dy) / (+C·dy, −S·dy) on screen. */}
        <g
          ref={shutterTopRef}
          className={`exposure-bucket-shutter-top ${
            shutterOpen ? "is-open" : "is-closed"
          }`}
          style={{
            ["--shutter-dx"]: `${isoSlide(-SHUTTER_OPEN_OFFSET)[0]}px`,
            ["--shutter-dy"]: `${isoSlide(-SHUTTER_OPEN_OFFSET)[1]}px`,
            ...(showShutter ? null : { display: "none" }),
          }}
        />
        <g
          ref={shutterBottomRef}
          className={`exposure-bucket-shutter-bottom ${
            shutterOpen ? "is-open" : "is-closed"
          }`}
          style={{
            ["--shutter-dx"]: `${isoSlide(+SHUTTER_OPEN_OFFSET)[0]}px`,
            ["--shutter-dy"]: `${isoSlide(+SHUTTER_OPEN_OFFSET)[1]}px`,
            ...(showShutter ? null : { display: "none" }),
          }}
        />

        {/* "correct exposure" side label */}
        <g className="exposure-bucket-target-label" style={hide(showBucket)}>
          <line
            x1={CX + topRx + 8}
            y1={CORRECT_Y}
            x2={CX + topRx + 26}
            y2={CORRECT_Y}
            stroke="#c0392b"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <text
            x={CX + topRx + 32}
            y={CORRECT_Y + 4}
            fontSize="11"
            fill="#c0392b"
            fontFamily="var(--font-mono, monospace)"
          >
            correct exposure
          </text>
        </g>
      </svg>
    </div>
  );
}
