import locus from './locus.json' with { type: 'json' };

// CIE 2019, CIE 1931 spectral locus, 2° observer, sampled every 5 nm.
// https://doi.org/10.25039/CIE.DS.mifmy4x4
export const LOCUS = locus;
export const SPACES = {
  srgb: {
    name: 'sRGB', white: [0.3127, 0.329], whiteName: 'D65',
    primaries: [[0.64, 0.33], [0.30, 0.60], [0.15, 0.06]],
    matrix: [[0.4123907993, 0.3575843394, 0.1804807884], [0.2126390059, 0.7151686788, 0.0721923154], [0.0193308187, 0.1191947798, 0.9505321522]],
    decode: v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  },
  adobe: {
    // Adobe RGB (1998) specification: https://www.color.org/adobergb.pdf
    name: 'Adobe RGB (1998)', white: [0.3127, 0.329], whiteName: 'D65',
    primaries: [[0.64, 0.33], [0.21, 0.71], [0.15, 0.06]],
    matrix: [[0.5766690430, 0.1855582379, 0.1882286462], [0.2973449753, 0.6273635663, 0.0752914585], [0.0270313614, 0.0706888525, 0.9913375368]],
    decode: v => v ** (563 / 256),
  },
  aces: {
    // https://docs.acescentral.com/encodings/aces2065-1/
    name: 'ACES2065-1 (AP0)', white: [0.32168, 0.33767], whiteName: 'ACES',
    primaries: [[0.7347, 0.2653], [0, 1], [0.0001, -0.077]],
    matrix: [[0.9525523959, 0, 0.0000936786], [0.3439664498, 0.7281660966, -0.0721325464], [0, 0, 1.0088251844]],
    decode: v => v,
  },
};

export function rgbToXyz(rgb, space) {
  const linear = rgb.map(space.decode);
  return space.matrix.map(row => row.reduce((sum, value, i) => sum + value * linear[i], 0));
}

export function xyzToXy([X, Y, Z]) {
  const total = X + Y + Z;
  return total > 0 ? [X / total, Y / total] : null;
}

export function isVisible(x, y) {
  let inside = false;
  for (let i = 0, j = LOCUS.length - 1; i < LOCUS.length; j = i++) {
    const [, xi, yi] = LOCUS[i];
    const [, xj, yj] = LOCUS[j];
    // Include the boundary, including the straight line of purples.
    const dx = xj - xi, dy = yj - yi;
    const length = dx * dx + dy * dy;
    if (length > 0) {
      const t = Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / length));
      if ((x - xi - t * dx) ** 2 + (y - yi - t * dy) ** 2 < 1e-12) return true;
    }
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Chromaticity-only sRGB preview: clip negative components and normalize.
// These display colors are illustrative; positions retain the actual xy values.
export function xyToDisplayRgb(x, y) {
  const z = 1 - x - y;
  const rgb = [3.2404542*x - 1.5371385*y - 0.4985314*z,
    -0.969266*x + 1.8760108*y + 0.041556*z,
    0.0556434*x - 0.2040259*y + 1.0572252*z].map(v => Math.max(0, v));
  const max = Math.max(...rgb, 1e-10);
  return rgb.map(v => {
    v /= max;
    return Math.round(255 * (v <= 0.0031308 ? 12.92*v : 1.055*v ** (1/2.4) - 0.055));
  });
}

export function sampleSpace(space, levels) {
  // Uniform code-value lattice, including both endpoints. ACES is linear;
  // sRGB and Adobe RGB use samples from their 8-bit encoded channel range.
  const values = Array.from({ length: levels }, (_, i) => space === SPACES.aces
    ? i / (levels - 1) : Math.round(i * 255 / (levels - 1)) / 255);
  const points = [];
  for (const r of values) for (const g of values) for (const b of values) {
    const xy = xyzToXy(rgbToXyz([r, g, b], space));
    if (!xy) continue; // Black has no defined chromaticity.
    const [x, y] = xy;
    points.push({ x, y, visible: isVisible(x, y), color: xyToDisplayRgb(x, y) });
  }
  return points;
}
