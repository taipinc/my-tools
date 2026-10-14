import assert from "node:assert/strict";
import test from "node:test";
import { adobeRgbCss, adobeRgbToSrgbHex, channelToBits, convertRgbDepth, hsvToRgb, isAdobeRgbInGamut, rgbToHsv, setChannelBit, srgbCss } from "./color.js";

test("each bit changes only its own weight and survives RGB/HSB synchronization", () => {
  for (let value = 0; value <= 255; value++) {
    assert.equal(channelToBits(value).length, 8);
    assert.equal(parseInt(channelToBits(value), 2), value);
    for (let position = 0; position < 8; position++) {
      const weight = 2 ** (7 - position);
      for (const bit of [0, 1]) {
        const next = setChannelBit(value, position, bit);
        assert.equal(channelToBits(next)[position], String(bit));
        assert.equal(next, value + (bit - Number(channelToBits(value)[position])) * weight);
        for (const key of ["r", "g", "b"]) {
          const rgb = { r: 75, g: 147, b: 219, [key]: next };
          assert.deepEqual(hsvToRgb(rgbToHsv(rgb)), rgb);
        }
      }
    }
  }
});

test("neutral colors remain in all supported display gamuts, including boundaries", () => {
  for (const gamut of ["srgb", "p3", "rec2020"]) {
    for (let value = 0; value <= 255; value++) {
      assert.equal(isAdobeRgbInGamut({ r: value, g: value, b: value }, gamut), true);
    }
  }
  assert.equal(adobeRgbToSrgbHex({ r: 0, g: 0, b: 0 }), "#000000");
  assert.equal(adobeRgbToSrgbHex({ r: 255, g: 255, b: 255 }), "#FFFFFF");
  assert.equal(adobeRgbToSrgbHex({ r: 128, g: 128, b: 128 }), "#818181");
});

test("gamut warnings distinguish sRGB, P3 and Rec. 2020 before clipping", () => {
  const blue = { r: 75, g: 147, b: 219 };
  const green = { r: 0, g: 255, b: 0 };
  assert.equal(isAdobeRgbInGamut(blue, "srgb"), false);
  assert.equal(isAdobeRgbInGamut(blue, "p3"), true);
  assert.equal(isAdobeRgbInGamut(green, "p3"), false);
  assert.equal(isAdobeRgbInGamut(green, "rec2020"), true);
  assert.equal(adobeRgbToSrgbHex(blue), "#0094DE");
});

test("native Adobe RGB CSS reinterprets the original channel values", () => {
  assert.equal(adobeRgbCss({ r: 255, g: 0, b: 255 }), "color(a98-rgb 1 0 1)");
});

test("16-bit values survive HSB round trips without losing the low byte", () => {
  for (let value = 0; value <= 65535; value++) {
    const rgb = { r: value, g: 32769, b: 65432 };
    assert.deepEqual(hsvToRgb(rgbToHsv(rgb, 210, 16), 16), rgb);
  }
  for (const key of ["r", "g", "b"]) {
    for (let position = 0; position < 16; position++) {
      const weight = 2 ** (15 - position);
      const value = setChannelBit(0, position, 1, 16);
      assert.equal(value, weight);
      assert.equal(channelToBits(value, 16).length, 16);
      assert.equal(channelToBits(value, 16)[position], "1");
      const rgb = { r: 12345, g: 32769, b: 65432, [key]: value };
      assert.deepEqual(hsvToRgb(rgbToHsv(rgb, 210, 16), 16), rgb);
      assert.equal(setChannelBit(value, position, 0, 16), 0);
    }
  }
});

test("switching depth preserves normalized color and preview interpretation", () => {
  for (let value = 0; value <= 255; value++) {
    const rgb8 = { r: value, g: 147, b: 219 };
    const rgb16 = convertRgbDepth(rgb8, 8, 16);
    assert.equal(rgb16.r, value * 257);
    assert.deepEqual(convertRgbDepth(rgb16, 16, 8), rgb8);
    assert.equal(srgbCss(rgb16, 16), srgbCss(rgb8));
    assert.equal(adobeRgbCss(rgb16, 16), adobeRgbCss(rgb8));
    assert.equal(adobeRgbToSrgbHex(rgb16, 16), adobeRgbToSrgbHex(rgb8));
    for (const gamut of ["srgb", "p3", "rec2020"]) {
      assert.equal(isAdobeRgbInGamut(rgb16, gamut, 16), isAdobeRgbInGamut(rgb8, gamut));
    }
  }
  assert.deepEqual(convertRgbDepth({ r: 65535, g: 0, b: 32768 }, 16, 8), { r: 255, g: 0, b: 128 });
});
