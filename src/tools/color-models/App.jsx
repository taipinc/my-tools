import { useEffect, useId, useState } from "react";
import { adobeRgbCss, adobeRgbToSrgbHex, channelMax, channelToBits, convertRgbDepth, hsvToRgb, isAdobeRgbInGamut, rgbToHex, rgbToHsv, setChannelBit, srgbCss } from "./color.js";

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

function Channel({ channel, value, gradient, coloredSliders, onChange, formatValue }) {
  const { label, short, max, unit = "", step = 1 } = channel;
  return (
    <label className="color-models-channel">
      <span className="color-models-channel-name"><strong>{short}</strong>{label}</span>
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--track-gradient": coloredSliders ? gradient : "#d8e0ea" }}
        aria-label={`${label} (${["r", "g", "b"].includes(channel.key) ? "RGB" : "HSB"})`}
        aria-valuetext={formatValue ? formatValue(value) : `${value}${unit}`}
      />
      <output className="color-models-channel-value">{formatValue ? formatValue(value) : value}{unit}</output>
    </label>
  );
}

function Selector({ title, subtitle, channels, values, gradients, coloredSliders, onChange, formatValue }) {
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
            formatValue={formatValue}
          />
        ))}
      </div>
    </details>
  );
}

function BitSelector({ rgb, bitDepth, onDepthChange, onChange }) {
  const positions = Array.from({ length: bitDepth }, (_, position) => position);
  const groups = bitDepth === 16 ? [positions.slice(0, 8), positions.slice(8)] : [positions];
  return (
    <details className="color-models-selector">
      <summary>
        <span className="color-models-selector-heading">
          <strong>{bitDepth}-bit RGB</strong>
        </span>
        <span className="color-models-chevron" aria-hidden="true" />
      </summary>
      <div className="color-models-bits-body">
        <fieldset className="color-models-depth-switch">
          <legend className="color-models-sr-only">RGB bit depth</legend>
          {[8, 16].map((depth) => (
            <label key={depth}>
              <input type="radio" name="rgb-bit-depth" value={depth} checked={bitDepth === depth} onChange={() => onDepthChange(depth)} />
              <span>{depth}-bit</span>
            </label>
          ))}
        </fieldset>
        {RGB_CHANNELS.map(({ key, label, short }) => (
          <div className="color-models-bit-row" key={key} role="group" aria-label={`${label} binary channel`}>
            <strong className="color-models-bit-channel">{short}</strong>
            <div className="color-models-bit-groups">
              {groups.map((group, groupIndex) => (
                <div className="color-models-bit-byte" key={groupIndex}>
                  <div className="color-models-bit-weights" aria-hidden="true">
                    {group.map((position) => <span key={position} title={`Bit ${bitDepth - 1 - position} · Weight ${2 ** (bitDepth - 1 - position)}`}>{bitDepth === 8 ? 2 ** (7 - position) : bitDepth - 1 - position}</span>)}
                  </div>
                  <div className="color-models-bit-inputs">
                    {group.map((position) => (
              <input
                key={position}
                type="text"
                inputMode="numeric"
                pattern="[01]"
                maxLength={1}
                value={channelToBits(rgb[key], bitDepth)[position]}
                aria-label={`${label} bit ${bitDepth - 1 - position} (value ${2 ** (bitDepth - 1 - position)})`}
                onFocus={(event) => event.currentTarget.select()}
                onClick={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.ctrlKey || event.metaKey || event.altKey) return;
                  if (event.key === "0" || event.key === "1") {
                    event.preventDefault();
                    onChange(key, position, Number(event.key));
                  }
                }}
                onChange={(event) => {
                  if (/^[01]$/.test(event.target.value)) onChange(key, position, Number(event.target.value));
                  event.currentTarget.select();
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  const pasted = event.clipboardData.getData("text").trim();
                  if (/^[01]$/.test(pasted)) onChange(key, position, Number(pasted));
                }}
              />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <output className="color-models-bit-decimal">{rgb[key]}</output>
          </div>
        ))}
      </div>
    </details>
  );
}

function GamutWarning({ message }) {
  const tooltipId = useId();
  return (
    <span className="color-models-warning" tabIndex={0} aria-label="Display gamut warning" aria-describedby={tooltipId}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="color-models-warning-icon" aria-hidden="true">
        <path d="M10.3 3.9 1.8 18.1A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4m0 4h.01" />
      </svg>
      <span id={tooltipId} className="color-models-warning-tooltip" role="tooltip">{message}</span>
    </span>
  );
}

function useDisplayColor() {
  const [display, setDisplay] = useState({ gamut: "srgb", nativeAdobeRgb: false });
  useEffect(() => {
    const queries = ["p3", "rec2020"].map((gamut) => ({ gamut, query: window.matchMedia(`(color-gamut: ${gamut})`) }));
    function update() {
      setDisplay({
        gamut: queries.findLast(({ query }) => query.matches)?.gamut ?? "srgb",
        nativeAdobeRgb: CSS.supports("color", "color(a98-rgb 1 0 0)"),
      });
    }
    update();
    queries.forEach(({ query }) => query.addEventListener("change", update));
    return () => queries.forEach(({ query }) => query.removeEventListener("change", update));
  }, []);
  return display;
}

export default function App() {
  const [{ hsv, bitDepth }, setColor] = useState({ hsv: { h: 210, s: 66, v: 86 }, bitDepth: 8 });
  const [coloredSliders, setColoredSliders] = useState(false);
  const rgb = hsvToRgb(hsv, bitDepth);
  const hex = rgbToHex(rgb, bitDepth);
  const max = channelMax(bitDepth);
  const rgbChannels = RGB_CHANNELS.map((channel) => ({ ...channel, max }));
  const formatChannel = String;
  const rgbText = [rgb.r, rgb.g, rgb.b].map(formatChannel).join(", ");
  const display = useDisplayColor();
  const adobeColor = display.nativeAdobeRgb ? adobeRgbCss(rgb, bitDepth) : adobeRgbToSrgbHex(rgb, bitDepth);
  const adobeWarning = !display.nativeAdobeRgb
    ? "Adobe RGB is unavailable in this browser. Showing an sRGB approximation."
    : !isAdobeRgbInGamut(rgb, display.gamut, bitDepth)
      ? "Outside the estimated display gamut. This preview shows an approximation."
      : null;
  const hsbChannels = HSB_CHANNELS.map((channel) => ({ ...channel, step: bitDepth === 16 ? 0.001 : 1 }));
  const formatHsv = (value) => bitDepth === 16 ? Number(value.toFixed(3)) : Math.round(value);

  function changeRgb(channel, value) {
    setColor((current) => {
      const nextRgb = { ...hsvToRgb(current.hsv, current.bitDepth), [channel]: value };
      return { ...current, hsv: rgbToHsv(nextRgb, current.hsv.h, current.bitDepth) };
    });
  }

  function changeHsv(channel, value) {
    setColor((current) => ({ ...current, hsv: { ...current.hsv, [channel]: value } }));
  }

  function changeBit(channel, position, bit) {
    setColor((current) => {
      const nextRgb = hsvToRgb(current.hsv, current.bitDepth);
      nextRgb[channel] = setChannelBit(nextRgb[channel], position, bit, current.bitDepth);
      return { ...current, hsv: rgbToHsv(nextRgb, current.hsv.h, current.bitDepth) };
    });
  }

  function changeDepth(nextDepth) {
    setColor((current) => {
      const nextRgb = convertRgbDepth(hsvToRgb(current.hsv, current.bitDepth), current.bitDepth, nextDepth);
      return { bitDepth: nextDepth, hsv: rgbToHsv(nextRgb, current.hsv.h, nextDepth) };
    });
  }

  const rgbGradients = Object.fromEntries(RGB_CHANNELS.map(({ key }) => [
    key,
    `linear-gradient(to right, ${srgbCss({ ...rgb, [key]: 0 }, bitDepth)}, ${srgbCss({ ...rgb, [key]: max }, bitDepth)})`,
  ]));
  const hueColor = (h) => rgbToHex(hsvToRgb({ h, s: 100, v: 100 }));
  const hsbGradients = {
    h: `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map(hueColor).join(", ")})`,
    s: `linear-gradient(to right, ${srgbCss(hsvToRgb({ ...hsv, s: 0 }, bitDepth), bitDepth)}, ${srgbCss(hsvToRgb({ ...hsv, s: 100 }, bitDepth), bitDepth)})`,
    v: `linear-gradient(to right, #000000, ${srgbCss(hsvToRgb({ ...hsv, v: 100 }, bitDepth), bitDepth)})`,
  };

  return (
    <div className="color-models-workspace" data-bit-depth={bitDepth}>
      <section className="color-models-controls" aria-label="Color controls">
        <BitSelector rgb={rgb} bitDepth={bitDepth} onDepthChange={changeDepth} onChange={changeBit} />
        <Selector
          title="RGB"
          subtitle="Red · Green · Blue"
          channels={rgbChannels}
          values={rgb}
          gradients={rgbGradients}
          coloredSliders={coloredSliders}
          onChange={changeRgb}
          formatValue={formatChannel}
        />
        <Selector
          title="HSB"
          subtitle="Hue · Saturation · Brightness"
          channels={hsbChannels}
          values={hsv}
          gradients={hsbGradients}
          coloredSliders={coloredSliders}
          onChange={changeHsv}
          formatValue={formatHsv}
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
          <h2 className="color-models-preview-title">sRGB</h2>
          <div className="color-models-swatch" style={{ backgroundColor: srgbCss(rgb, bitDepth) }} role="img" aria-label={`Selected color RGB ${rgbText}`} />
          <div className="color-models-preview-footer">
            <div>
              <span className="color-models-preview-label">RGB</span>
              <strong>{rgbText}</strong>
            </div>
            <span className="color-models-preview-hex">{hex}</span>
          </div>
        </div>
        <details className="color-models-selector color-models-preview-card color-models-adobe-preview">
          <summary>
            <span className="color-models-selector-heading">
              <strong>Adobe RGB (1998)</strong>
            </span>
            <span className="color-models-preview-actions">
              {adobeWarning && <GamutWarning message={adobeWarning} />}
              <span className="color-models-chevron" aria-hidden="true" />
            </span>
          </summary>
          <div className="color-models-swatch" style={{ backgroundColor: adobeColor }} role="img" aria-label={`Adobe RGB color ${rgbText}`} />
          <div className="color-models-preview-footer">
            <div>
              <span className="color-models-preview-label">RGB</span>
              <strong>{rgbText}</strong>
            </div>
          </div>
          <p className="color-models-gamut-note">Display gamut: {({ srgb: "sRGB", p3: "Display P3", rec2020: "Rec. 2020" })[display.gamut]} (browser estimate).</p>
        </details>
      </section>
    </div>
  );
}
