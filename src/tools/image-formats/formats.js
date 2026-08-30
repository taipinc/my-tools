// Still-image capture formats, measured as the image area on film / the
// sensor's active area, in millimetres. Everything is listed landscape.
//
// Sizes are the nominal figures manufacturers and film specs quote — sheet
// film is the nominal cut size, "type" sensor names ("1 inch", "1/2.3 inch")
// are an old vidicon-tube convention and have nothing to do with any real
// measurement on the chip, which is why they are listed with their actual mm.

export const FORMATS = [
  {
    id: "8x10",
    name: '8×10"',
    w: 254,
    h: 203.2,
    color: "#b8551e",
  },
  {
    id: "4x5",
    name: '4×5"',
    w: 127,
    h: 101.6,
    color: "#c98b1f",
  },
  {
    id: "6x7",
    name: "6×7",
    w: 70,
    h: 56,
    color: "#6f8f2e",
  },
  {
    id: "mf-full",
    name: "Medium format (FF)",
    w: 53.4,
    h: 40,
    color: "#2e8b74",
  },
  {
    id: "mf-44x33",
    name: "Medium format (44×33)",
    w: 43.8,
    h: 32.9,
    color: "#2f7fb8",
  },
  {
    id: "ff35",
    name: "35mm (FF)",
    w: 36,
    h: 24,
    color: "#1c2840",
  },
  {
    id: "apsc",
    name: "APS-C",
    w: 23.6,
    h: 15.7,
    color: "#6b4fa8",
  },
  {
    id: "m43",
    name: "Micro 4/3",
    w: 17.3,
    h: 13,
    color: "#a8407a",
  },
  {
    id: "type-1",
    name: '1"',
    w: 13.2,
    h: 8.8,
    color: "#b03030",
  },
  {
    id: "type-1-1.4",
    name: '1/1.4"',
    w: 9.8,
    h: 7.3,
    color: "#8a6a3f",
  },
  {
    id: "type-1-2.3",
    name: '1/2.3"',
    w: 6.17,
    h: 4.55,
    color: "#5b7083",
  },
];

// Full frame is the reference every "crop factor" is quoted against.
const FF_DIAGONAL = Math.hypot(36, 24);

export const diagonal = (f) => Math.hypot(f.w, f.h);
export const cropFactor = (f) => FF_DIAGONAL / diagonal(f);
export const area = (f) => f.w * f.h;


// 203.2 → "203.2", 13 → "13", 6.17 → "6.17"
export const mm = (v) => String(+v.toFixed(2));
