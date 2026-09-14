export function hsvToRgb({ h, s, v }) {
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
    r: Math.round((r + offset) * 255),
    g: Math.round((g + offset) * 255),
    b: Math.round((b + offset) * 255),
  };
}

export function rgbToHsv({ r, g, b }, previousHue = 0) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
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

export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}
