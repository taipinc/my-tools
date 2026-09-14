import { useState } from "react";
import { hsvToRgb, rgbToHex, rgbToHsv } from "./color.js";

const RGB_CHANNELS = [
  { key: "r", label: "Red", short: "R", max: 255 },
  { key: "g", label: "Green", short: "G", max: 255 },
  { key: "b", label: "Blue", short: "B", max: 255 },
];
const HSB_CHANNELS = [
  { key: "h", label: "Hue", short: "H", max: 360, unit: "°" },
  { key: "s", label: "Saturation", short: "S", max: 100, unit: "%" },
  { key: "v", label: "Brightness", short: "B", max: 100, unit: "%" },
];

function Channel({ channel, value, gradient, coloredSliders, onChange }) {
  const { label, short, max, unit = "" } = channel;
  return (
    <label className="color-models-channel">
      <span className="color-models-channel-name"><strong>{short}</strong>{label}</span>
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--track-gradient": coloredSliders ? gradient : "#d8e0ea" }}
        aria-label={`${label} (${max === 255 ? "RGB" : "HSB"})`}
      />
      <output className="color-models-channel-value">{value}{unit}</output>
    </label>
  );
}

function Selector({ title, subtitle, channels, values, gradients, coloredSliders, onChange }) {
  return (
    <details className="color-models-selector" open>
      <summary>
        <span className="color-models-selector-heading">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <span className="color-models-chevron" aria-hidden="true" />
      </summary>
      <div className="color-models-selector-body">
        {channels.map((channel) => (
          <Channel
            key={channel.key}
            channel={channel}
            value={values[channel.key]}
            gradient={gradients[channel.key]}
            coloredSliders={coloredSliders}
            onChange={(value) => onChange(channel.key, value)}
          />
        ))}
      </div>
    </details>
  );
}

export default function App() {
  const [hsv, setHsv] = useState({ h: 210, s: 66, v: 86 });
  const [coloredSliders, setColoredSliders] = useState(false);
  const rgb = hsvToRgb(hsv);
  const hex = rgbToHex(rgb);
  const displayedHsv = {
    h: Math.round(hsv.h),
    s: Math.round(hsv.s),
    v: Math.round(hsv.v),
  };

  function changeRgb(channel, value) {
    setHsv((current) => {
      const nextRgb = { ...hsvToRgb(current), [channel]: value };
      return rgbToHsv(nextRgb, current.h);
    });
  }

  function changeHsv(channel, value) {
    setHsv((current) => ({ ...current, [channel]: value }));
  }

  const rgbGradients = Object.fromEntries(RGB_CHANNELS.map(({ key }) => [
    key,
    `linear-gradient(to right, ${rgbToHex({ ...rgb, [key]: 0 })}, ${rgbToHex({ ...rgb, [key]: 255 })})`,
  ]));
  const hueColor = (h) => rgbToHex(hsvToRgb({ h, s: 100, v: 100 }));
  const hsbGradients = {
    h: `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map(hueColor).join(", ")})`,
    s: `linear-gradient(to right, ${rgbToHex(hsvToRgb({ ...hsv, s: 0 }))}, ${rgbToHex(hsvToRgb({ ...hsv, s: 100 }))})`,
    v: `linear-gradient(to right, #000000, ${rgbToHex(hsvToRgb({ ...hsv, v: 100 }))})`,
  };

  return (
    <div className="color-models-workspace">
      <section className="color-models-controls" aria-label="Color controls">
        <Selector
          title="RGB"
          subtitle="Red · Green · Blue"
          channels={RGB_CHANNELS}
          values={rgb}
          gradients={rgbGradients}
          coloredSliders={coloredSliders}
          onChange={changeRgb}
        />
        <Selector
          title="HSB"
          subtitle="Hue · Saturation · Brightness"
          channels={HSB_CHANNELS}
          values={displayedHsv}
          gradients={hsbGradients}
          coloredSliders={coloredSliders}
          onChange={changeHsv}
        />
        <fieldset className="color-models-slider-option">
          <legend>Colored sliders</legend>
          <label>
            <input type="radio" name="colored-sliders" checked={!coloredSliders} onChange={() => setColoredSliders(false)} />
            Off
          </label>
          <label>
            <input type="radio" name="colored-sliders" checked={coloredSliders} onChange={() => setColoredSliders(true)} />
            On
          </label>
        </fieldset>
      </section>

      <section className="color-models-preview" aria-label="Selected color">
        <div className="color-models-preview-card">
          <div className="color-models-swatch" style={{ backgroundColor: hex }} role="img" aria-label={`Selected color ${hex}`} />
          <div className="color-models-preview-footer">
            <div>
              <span className="color-models-preview-label">RGB</span>
              <strong>{rgb.r}, {rgb.g}, {rgb.b}</strong>
            </div>
            <span className="color-models-preview-hex">{hex}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
