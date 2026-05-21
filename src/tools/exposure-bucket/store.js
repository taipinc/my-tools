import { create } from "zustand";

// Exposure metaphor:
//   rainIntensity     ~ scene luminance (drops/sec falling toward the bucket)
//   apertureOpenness  ~ aperture area, 0..1
//   shutterOpen       ~ curtain open/closed
//   shutterDuration   ~ how long the shutter stays open per shot (seconds)
//   bucketWidth       ~ inverse of ISO (wider bucket = lower ISO = needs more light)
//
// We track _drops (a unit of water "amount") separately from fillLevel
// (the visible water height). This way changing bucketWidth conserves the
// amount of water and the level redistributes — exactly like pouring the
// same water into a wider/narrower glass.
//
// Capacity at a given width: cap = 2.0 * bucketWidth^2  (where fillLevel=2.0
// means bucket completely full / blown highlights, fillLevel=1.0 is correct).

const FILL_MAX = 2.0;
const BASE_FILL_PER_SECOND = 1 / 3; // 3s to "correct" at all defaults

function capacityFor(width) {
  return FILL_MAX * width * width;
}

export const useExposureStore = create((set, get) => ({
  rainIntensity: 1.0,
  apertureOpenness: 1.0, // f/1.4 (max stop)
  shutterOpen: false,
  shutterDuration: 2.0, // 1/125 s
  bucketWidth: 1.131, // ISO 200
  _drops: 0,
  fillLevel: 0,
  _shutterTimeoutId: null,

  setRainIntensity: (v) => set({ rainIntensity: v }),
  setApertureOpenness: (v) => set({ apertureOpenness: v }),
  setShutterOpen: (v) => set({ shutterOpen: v }),
  setShutterDuration: (v) => set({ shutterDuration: v }),

  setBucketWidth: (v) => {
    const s = get();
    // Conserve _drops, but clamp to the new bucket's capacity (water spills if narrower).
    const cap = capacityFor(v);
    const drops = Math.min(s._drops, cap);
    set({ bucketWidth: v, _drops: drops, fillLevel: drops / (v * v) });
  },

  triggerShot: () => {
    const s = get();
    if (s._shutterTimeoutId) clearTimeout(s._shutterTimeoutId);
    set({ _drops: 0, fillLevel: 0, shutterOpen: true });
    const id = setTimeout(() => {
      set({ shutterOpen: false, _shutterTimeoutId: null });
    }, s.shutterDuration * 1000);
    set({ _shutterTimeoutId: id });
  },

  tick: (dt) => {
    const s = get();
    if (!s.shutterOpen) return;
    const cap = capacityFor(s.bucketWidth);
    const dropsPerSec =
      BASE_FILL_PER_SECOND * s.rainIntensity * s.apertureOpenness;
    const drops = Math.min(cap, s._drops + dropsPerSec * dt);
    set({ _drops: drops, fillLevel: drops / (s.bucketWidth * s.bucketWidth) });
  },

  reset: () => {
    const s = get();
    if (s._shutterTimeoutId) clearTimeout(s._shutterTimeoutId);
    set({
      _drops: 0,
      fillLevel: 0,
      _shutterTimeoutId: null,
      shutterOpen: false,
    });
  },
}));
