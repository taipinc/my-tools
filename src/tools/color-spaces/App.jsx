import { useEffect, useMemo, useRef, useState } from 'react';
import { LOCUS, SPACES, isVisible, sampleSpace, xyToDisplayRgb } from './color.js';

const DENSITIES = [4, 6, 8, 12, 16, 24, 32];
const SPACE_ORDER = ['aces', 'srgb', 'adobe'];
const OUTLINE_STYLES = {
  aces: { color: '#7653a3', dash: '9 4' },
  srgb: { color: '#244e85', dash: 'none' },
  adobe: { color: '#a34c25', dash: '3 3' },
};
const WIDTH = 800, HEIGHT = 850, SCALE = 640;
const px = x => 86 + (x + 0.08) * SCALE;
const py = y => 50 + (1.04 - y) * SCALE;
const locusPath = LOCUS.map(([, x, y], i) => `${i ? 'L' : 'M'}${px(x)},${py(y)}`).join(' ') + 'Z';
const TICKS = Array.from({ length: 11 }, (_, i) => i / 10);
const WAVELENGTHS = [460, 480, 490, 500, 510, 520, 540, 560, 580, 600, 620];

function Chart({ space, points, chartColors, outlines }) {
  const backgroundRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    const ctx = backgroundRef.current.getContext('2d');
    const image = ctx.createImageData(WIDTH, HEIGHT);
    for (let row = 0; row < HEIGHT; row++) for (let col = 0; col < WIDTH; col++) {
      const x = (col - 86) / SCALE - 0.08, y = 1.04 - (row - 50) / SCALE;
      if (!isVisible(x, y)) continue;
      const offset = (row * WIDTH + col) * 4;
      const rgb = xyToDisplayRgb(x, y);
      image.data.set([...rgb, 255], offset);
    }
    ctx.putImageData(image, 0, 0);
  }, []);

  useEffect(() => {
    const canvas = dotsRef.current;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WIDTH * ratio;
    canvas.height = HEIGHT * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    // Draw nonphysical coordinates in neutral ink, independent of display RGB.
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(px(point.x), py(point.y), points.length > 15000 ? 1.35 : 2.15, 0, 2 * Math.PI);
      if (point.visible) {
        ctx.fillStyle = `rgba(${point.color.join(',')},0.85)`;
        ctx.fill();
        if (points.length < 2500) {
          ctx.strokeStyle = 'rgba(28,40,64,0.25)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = 'rgba(77,91,117,0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }, [points]);

  return (
    <div className="cs-chart" role="img" aria-label={`CIE 1931 xy chromaticity diagram${space ? `, ${space.name}, ${points.length.toLocaleString()} RGB samples` : ', no color space selected'}${outlines.length ? `; gamut outlines: ${outlines.map(key => SPACES[key].name).join(', ')}` : ''}`}>
      <canvas ref={backgroundRef} width={WIDTH} height={HEIGHT} className="cs-background" style={{ opacity: chartColors ? 0.22 : 0 }} aria-hidden="true" />
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
        <g className="cs-grid">
          {TICKS.map(t => <path key={t} d={`M${px(-0.04)},${py(t)}H${px(0.8)}`} />)}
          {TICKS.filter(t => t <= 0.8).map(t => <path key={t} d={`M${px(t)},${py(-0.09)}V${py(1.02)}`} />)}
        </g>
        <path className="cs-axis" d={`M${px(0)},${py(1.02)}V${py(-0.09)}M${px(-0.04)},${py(0)}H${px(0.82)}`} />
        <g className="cs-ticks">
          {TICKS.filter(t => t <= 0.8).map(t => <text key={t} x={px(t)} y={py(0) + 24} textAnchor="middle">{t.toFixed(1)}</text>)}
          {TICKS.filter(t => t > 0).map(t => <text key={t} x={px(0) - 14} y={py(t) + 5} textAnchor="end">{t.toFixed(1)}</text>)}
          <text x={px(0.84)} y={py(0) + 5} className="cs-axis-label">x</text>
          <text x={px(0) - 5} y={py(1.04) - 12} className="cs-axis-label">y</text>
        </g>
        <path d={locusPath} className="cs-locus" />
        <g className="cs-wavelengths">
          {WAVELENGTHS.map(w => {
            const [, x, y] = LOCUS.find(([nm]) => nm === w);
            const right = w >= 540;
            return <text key={w} x={px(x) + (right ? 12 : -12)} y={py(y) + (w === 520 ? -10 : 4)} textAnchor={right ? 'start' : 'end'}>{w}</text>;
          })}
        </g>
      </svg>
      <canvas ref={dotsRef} width={WIDTH} height={HEIGHT} aria-hidden="true" />
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
        {outlines.map(key => <polygon key={key}
          points={SPACES[key].primaries.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}
          className="cs-gamut" style={{ stroke: OUTLINE_STYLES[key].color, strokeDasharray: OUTLINE_STYLES[key].dash }} />)}
        {space && outlines.some(key => SPACES[key] === space) && <>
          {space.primaries.map(([x, y], i) => <g key={i}>
            <circle cx={px(x)} cy={py(y)} r="5" className="cs-primary" />
            <text x={px(x) + 10} y={py(y) - 10} className="cs-primary-label">{'RGB'[i]}</text>
          </g>)}
          <path d={`M${px(space.white[0]) - 6},${py(space.white[1])}h12M${px(space.white[0])},${py(space.white[1]) - 6}v12`} className="cs-white" />
          <text x={px(space.white[0]) + 10} y={py(space.white[1]) - 10} className="cs-white-label">{space.whiteName}</text>
        </>}
      </svg>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState('none');
  const [density, setDensity] = useState(3);
  const [chartColors, setChartColors] = useState(true);
  const [outline, setOutline] = useState(true);
  const [outlines, setOutlines] = useState([]);
  const visibleOutlines = SPACE_ORDER.filter(key => key === selected ? outline : outlines.includes(key));
  const space = SPACES[selected];
  const levels = DENSITIES[density];
  const points = useMemo(() => space ? sampleSpace(space, levels) : [], [space, levels]);
  const outside = useMemo(() => points.filter(p => !p.visible).length, [points]);

  return (
    <div className="cs-workspace">
      <section className="cs-plot-panel" aria-label="Chromaticity chart">
        <div className="cs-plot-heading"><h2>CIE 1931</h2></div>
        <div className="cs-chart-area"><Chart {...{ space, points, chartColors }} outlines={visibleOutlines} /></div>
      </section>
      <aside className="cs-controls" aria-label="Chart controls">
        <fieldset className="cs-card cs-spaces">
          <legend>Color space</legend>
          {[['none', 'None'], ...SPACE_ORDER.map(key => [key, SPACES[key].name])].map(([key, name]) => (
            <div key={key} className={`cs-space-row${selected === key ? ' cs-selected' : ''}`}>
              <label>
                <input type="radio" name="cie-color-space" value={key} checked={selected === key} onChange={() => setSelected(key)} />
                <span>{name}</span>
              </label>
              {key !== 'none' && <svg className="cs-outline-key" viewBox="0 0 20 10" aria-hidden="true">
                <path d="M0 5H20" stroke={OUTLINE_STYLES[key].color} strokeWidth="2" strokeDasharray={OUTLINE_STYLES[key].dash} />
              </svg>}
              {key !== 'none' && <input type="checkbox"
                aria-label={`Show ${name} comparison outline`} title={`${name} comparison outline`}
                checked={outlines.includes(key)}
                style={{ accentColor: OUTLINE_STYLES[key].color }}
                onChange={e => {
                  const checked = e.target.checked;
                  setOutlines(current => checked ? [...current, key] : current.filter(value => value !== key));
                }} />}
            </div>
          ))}
        </fieldset>
        <fieldset className="cs-card cs-sampling" disabled={!space}>
          <legend>Sampling</legend>
          <label htmlFor="cs-density">Levels per channel <output htmlFor="cs-density">{levels}</output></label>
          <input id="cs-density" type="range" min="0" max={DENSITIES.length - 1} step="1" value={density} onChange={e => setDensity(Number(e.target.value))} aria-valuetext={`${levels} levels per channel, ${(levels ** 3 - 1).toLocaleString()} samples`} />
          <div className="cs-range-labels"><span>Sparse</span><span>Dense</span></div>
          <dl aria-live="polite">
            <div><dt>RGB samples</dt><dd>{points.length.toLocaleString()}</dd></div>
            <div><dt>Channel range</dt><dd>{space ? selected === 'aces' ? '0–1 · linear' : '0–255 · encoded' : '—'}</dd></div>
          </dl>
        </fieldset>
        <fieldset className="cs-card cs-options">
          <legend>Display</legend>
          <label><input type="checkbox" checked={outline} onChange={e => setOutline(e.target.checked)} />Gamut outline</label>
          <label><input type="checkbox" checked={chartColors} onChange={e => setChartColors(e.target.checked)} />Chart colors</label>
        </fieldset>
        {outside > 0 && <div className="cs-outside"><span aria-hidden="true" />Outside visible locus <strong>{outside.toLocaleString()}</strong></div>}
      </aside>
    </div>
  );
}
