export function channelMax(bitDepth = 8) {
  return 2 ** bitDepth - 1;
}

export function convertRgbDepth(rgb, fromDepth, toDepth) {
  return Object.fromEntries(Object.entries(rgb).map(([key, value]) => [
    key, Math.round(value / channelMax(fromDepth) * channelMax(toDepth)),
  ]));
}

export function hsvToRgb({ h, s, v }, bitDepth = 8) {
  const max = channelMax(bitDepth);
  const hue = ((h % 360) + 360) % 360;
  const saturation = s / 100;
  const value = v / 100;
  const chroma = value * saturation;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const offset = value - chroma;
  const pairs = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ];
  const [r, g, b] = pairs[Math.floor(segment)];
  return {
    r: Math.round((r + offset) * max),
    g: Math.round((g + offset) * max),
    b: Math.round((b + offset) * max),
  };
}

export function rgbToHsv({ r, g, b }, previousHue = 0, bitDepth = 8) {
  const channelRange = channelMax(bitDepth);
  const red = r / channelRange;
  const green = g / channelRange;
  const blue = b / channelRange;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const chroma = max - min;
  let h = previousHue;

  // Hue is undefined for a neutral color; retain the last useful hue so
  // raising saturation again starts from the color the student was exploring.
  if (chroma !== 0) {
    if (max === red) h = ((green - blue) / chroma) % 6;
    else if (max === green) h = (blue - red) / chroma + 2;
    else h = (red - green) / chroma + 4;
    h = (h * 60 + 360) % 360;
  }

  return {
    h,
    s: max === 0 ? 0 : (chroma / max) * 100,
    v: max * 100,
  };
}

export function rgbToHex(rgb, bitDepth = 8) {
  const { r, g, b } = convertRgbDepth(rgb, bitDepth, 8);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function channelToBits(value, bitDepth = 8) {
  return value.toString(2).padStart(bitDepth, "0");
}

export function setChannelBit(value, position, bit, bitDepth = 8) {
  const mask = 1 << (bitDepth - 1 - position);
  return bit === 1 ? value | mask : value & ~mask;
}

// D65 matrices and Adobe RGB (1998) transfer function from CSS Color 4:
// https://www.w3.org/TR/css-color-4/#color-conversion-code
const ADOBE_RGB_TO_XYZ = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388],
];
const XYZ_TO_RGB = {
  srgb: [
    [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
    [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
    [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
  ],
  p3: [
    [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
    [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
    [0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
  ],
  rec2020: [
    [1.716651187971268, -0.355670783776392, -0.253366281373660],
    [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
    [0.017639857445311, -0.042770613257809, 0.942103121235474],
  ],
};

function multiply(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, coefficient, index) => sum + coefficient * vector[index], 0));
}

function adobeRgbToLinear(rgb, gamut, bitDepth = 8) {
  const linear = [rgb.r, rgb.g, rgb.b].map((channel) => (channel / channelMax(bitDepth)) ** (563 / 256));
  return multiply(XYZ_TO_RGB[gamut], multiply(ADOBE_RGB_TO_XYZ, linear));
}

export function isAdobeRgbInGamut(rgb, gamut = "srgb", bitDepth = 8) {
  // Check before clipping, allowing only floating-point error at the boundaries.
  return adobeRgbToLinear(rgb, gamut, bitDepth).every((channel) => channel >= -1e-7 && channel <= 1 + 1e-7);
}

export function adobeRgbToSrgbHex(rgb, bitDepth = 8) {
  const channels = adobeRgbToLinear(rgb, "srgb", bitDepth).map((channel) => {
    const clipped = Math.min(1, Math.max(0, channel));
    const encoded = clipped <= 0.0031308 ? 12.92 * clipped : 1.055 * clipped ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255);
  });
  return rgbToHex({ r: channels[0], g: channels[1], b: channels[2] });
}

export function adobeRgbCss({ r, g, b }, bitDepth = 8) {
  const max = channelMax(bitDepth);
  return `color(a98-rgb ${r / max} ${g / max} ${b / max})`;
}

export function srgbCss({ r, g, b }, bitDepth = 8) {
  const max = channelMax(bitDepth);
  return `rgb(${r / max * 100}% ${g / max * 100}% ${b / max * 100}%)`;
}
