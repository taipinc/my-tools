import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseHDR, downscale, loadLDR } from "./hdr-loader.js";
import { usePresentation, showAt } from "./presentation.jsx";

const SHUTTER = ["1s","1/1.3","1/1.6","1/2","1/2.5","1/3","1/4","1/5","1/6","1/8","1/10","1/13","1/15","1/20","1/25","1/30","1/40","1/50","1/60","1/80","1/100","1/125","1/160","1/200","1/250","1/320","1/400","1/500","1/640","1/800","1/1000","1/1250","1/1600","1/2000","1/2500","1/3200","1/4000"];
const APERTURE = ["1.4","1.6","1.8","2","2.2","2.5","2.8","3.2","3.5","4","4.5","5","5.6","6.3","7.1","8","9","10","11","13","14","16","18","20","22"];
const ISO = ["100","125","160","200","250","320","400","500","640","800","1000","1250","1600","2000","2500","3200","4000","5000","6400"];

const DEFAULT_HDR = `${import.meta.env.BASE_URL}hdr/monkstown_castle_1k.hdr`;
const MONO = "var(--font-mono, ui-monospace, monospace)";
const INK = "var(--color-ink, #1c2840)";
const INK_SOFT = "var(--color-ink-soft, #4d5b75)";
const SELECTOR = "#FC4B5A";

// "1/125" → "125" for the scale ticks only; 1s has no fraction to drop.
const tickLabel = (v) => v.replace(/^1\//, "");

const GRAIN =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27140%27%20height=%27140%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.85%27%20numOctaves=%272%27/%3E%3C/filter%3E%3Crect%20width=%27140%27%20height=%27140%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E)";

function Scale({ label, value, labels, index, onChange }) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const n = labels.length;

  const setFromX = useCallback(
    (clientX) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      onChange(Math.round(t * (n - 1)));
    },
    [n, onChange],
  );

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      setFromX(e.clientX);
    };
    const up = () => { dragging.current = false; };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [setFromX]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 4px" }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600 }}>{value}</span>
      </div>
      <div
        ref={ref}
        tabIndex={0}
        data-exposure-scale=""
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          e.currentTarget.focus();
          setFromX(e.clientX);
        }}
        onKeyDown={(e) => {
          const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
          if (!d) return;
          e.preventDefault();
          onChange(Math.min(n - 1, Math.max(0, index + d)));
        }}
        style={{ position: "relative", height: 96, margin: "0 26px", touchAction: "none", cursor: "ew-resize", outline: "none" }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 42, height: 2, background: INK }} />
        {labels.map((l, i) => {
          const full = i % 3 === 0;
          return (
            <div key={i} style={{ position: "absolute", top: 0, bottom: 0, width: 0, left: `${(i / (n - 1)) * 100}%` }}>
              <div style={{ position: "absolute", left: -1, bottom: 42, width: 2, height: full ? 14 : 7, background: full ? INK : "#93a1b8" }} />
              {full && (
                <div style={{ position: "absolute", top: 64, left: 0, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 15, color: INK_SOFT, whiteSpace: "nowrap" }}>{l}</div>
              )}
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 0, bottom: 0, width: 0, left: `${(index / (n - 1)) * 100}%` }}>
          <div style={{ position: "absolute", bottom: 31, left: 0, width: 22, height: 22, marginLeft: -11, borderRadius: "50%", background: SELECTOR, border: `2.5px solid ${INK}`, boxShadow: "0 1px 3px rgba(28,40,64,0.18)" }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const pres = usePresentation();
  const [s, setS] = useState(21);
  const [a, setA] = useState(15);
  const [i, setI] = useState(0);
  const [refEv, setRefEv] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(true);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const img = useRef(null);
  const norm = useRef(1);

  const lut = useMemo(() => {
    const t = new Float32Array(1025);
    for (let k = 0; k <= 1024; k++) {
      const c = k / 1024;
      t[k] = 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
    }
    return t;
  }, []);

  const ingest = useCallback((decoded) => {
    let sum = 0;
    const d = decoded.data;
    for (let p = 0; p < d.length; p += 3) sum += 0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2];
    norm.current = 0.18 / (sum / (d.length / 3) || 1);
    img.current = decoded;
    setLoaded(true);
    setBusy(false);
  }, []);

  const load = useCallback(
    async (file) => {
      if (!file) return;
      setBusy(true);
      try {
        const decoded = /\.(hdr|pic)$/i.test(file.name)
          ? downscale(parseHDR(await file.arrayBuffer()), 900)
          : await loadLDR(file, 900);
        ingest(decoded);
      } catch {
        img.current = null;
        setLoaded(false);
        setBusy(false);
      }
    },
    [ingest],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(DEFAULT_HDR);
        if (!res.ok) throw new Error(String(res.status));
        const decoded = downscale(parseHDR(await res.arrayBuffer()), 900);
        if (!cancelled) ingest(decoded);
      } catch {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ingest]);

  const ev = 1 + a / 3 + s / 3 - i / 3;
  const sceneEv = refEv ?? 13;
  const gain = Math.pow(2, sceneEv - ev);

  useEffect(() => {
    const cv = canvasRef.current;
    const src = img.current;
    if (!cv || !src) return;
    const { width: w, height: h, data: d } = src;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const ctx = cv.getContext("2d");
    const out = ctx.createImageData(w, h);
    const o = out.data;
    const g = gain * norm.current;
    for (let p = 0, q = 0; p < d.length; p += 3, q += 4) {
      const r = d[p] * g, gg = d[p + 1] * g, b = d[p + 2] * g;
      o[q] = lut[r >= 1 ? 1024 : (r * 1024) | 0];
      o[q + 1] = lut[gg >= 1 ? 1024 : (gg * 1024) | 0];
      o[q + 2] = lut[b >= 1 ? 1024 : (b * 1024) | 0];
      o[q + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [gain, loaded, lut]);

  const card = {
    background: "#fff",
    border: `2px solid ${INK}`,
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };
  const btn = {
    padding: "7px 12px",
    borderRadius: 12,
    border: `2px solid ${INK}`,
    background: "#fff",
    color: INK,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 720, display: "flex", alignItems: "stretch", overflow: "auto", color: INK, userSelect: "none", WebkitUserSelect: "none" }}>
      <div style={{ flex: 1, padding: "34px 32px 28px", display: "flex", flexDirection: "column", minWidth: 520 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
          {showAt(pres, 1) && (
            <Scale label="shutter (time)" value={SHUTTER[s]} labels={SHUTTER.map(tickLabel)} index={s} onChange={setS} />
          )}
          {showAt(pres, 2) && (
            <Scale label="aperture (opening)" value={`f/${APERTURE[a]}`} labels={APERTURE.map((v) => `f/${v}`)} index={a} onChange={setA} />
          )}
          {showAt(pres, 3) && (
            <Scale label="ISO (sensitivity)" value={`ISO ${ISO[i]}`} labels={ISO} index={i} onChange={setI} />
          )}
        </div>
      </div>

      <div style={{ flex: "0 1 44%", minWidth: 340, maxWidth: 640, padding: "34px 28px 28px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...card, padding: "14px 18px", gap: 2, fontFamily: MONO, fontWeight: 600, fontSize: 15, lineHeight: 1.7 }}>
          {showAt(pres, 1) && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>shutter</span><span>{SHUTTER[s]}</span></div>
          )}
          {showAt(pres, 2) && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>aperture</span><span>f/{APERTURE[a]}</span></div>
          )}
          {showAt(pres, 3) && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>ISO</span><span>ISO {ISO[i]}</span></div>
          )}
        </div>

        <div style={card}>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); load(e.dataTransfer.files?.[0]); }}
            style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", borderRadius: 6, overflow: "hidden", background: "var(--color-paper-2, #dfe6ef)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: loaded ? "block" : "none" }} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "overlay", opacity: Math.min(0.5, Math.max(0, (i / 3) * 0.055)), backgroundImage: GRAIN }} />
            {!loaded && (
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK_SOFT }}>
                  {busy ? "decoding…" : "drop a photo or a .hdr file here"}
                </div>
                <button style={btn} onClick={() => fileRef.current?.click()}>choose a file</button>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".hdr,.pic,image/*" onChange={(e) => load(e.target.files?.[0])} style={{ display: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ ...btn, flex: 1 }} onClick={() => setRefEv(ev)}>reset exposure</button>
            <button style={{ ...btn, border: "2px solid var(--color-rule, #c8d2e0)", color: INK_SOFT }} onClick={() => fileRef.current?.click()}>replace image</button>
          </div>
        </div>
      </div>
    </div>
  );
}
