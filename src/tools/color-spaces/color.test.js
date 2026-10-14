import assert from 'node:assert/strict';
import test from 'node:test';
import { LOCUS, SPACES, isVisible, rgbToXyz, sampleSpace, xyToDisplayRgb, xyzToXy } from './color.js';

test('RGB transforms reproduce the specified primaries and white points', () => {
  for (const space of Object.values(SPACES)) {
    for (let i = 0; i < 3; i++) {
      const rgb = [0, 0, 0];
      rgb[i] = 1;
      xyzToXy(rgbToXyz(rgb, space)).forEach((v, j) => {
        assert.ok(Math.abs(v - space.primaries[i][j]) < 1e-7, `${space.name} primary ${i}`);
      });
    }
    xyzToXy(rgbToXyz([1, 1, 1], space)).forEach((v, j) => {
      assert.ok(Math.abs(v - space.white[j]) < 1e-7, `${space.name} white`);
    });
  }
});

test('sampling includes endpoints and omits only black, whose xy is undefined', () => {
  assert.equal(xyzToXy([0, 0, 0]), null);
  for (const [key, space] of Object.entries(SPACES)) {
    for (const levels of [4, 12, 32]) {
      const points = sampleSpace(space, levels);
      assert.equal(points.length, levels ** 3 - 1);
      assert.ok(points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
      if (key === 'aces') {
        assert.ok(points.some(p => p.visible) && points.some(p => !p.visible));
      } else {
        assert.ok(points.every(p => p.visible), `${space.name} stays inside visible locus`);
      }
    }
  }
});

test('visible-locus classification includes its boundary and rejects imaginary colors', () => {
  assert.equal(isVisible(0.3127, 0.329), true);
  assert.equal(isVisible(0, 1), false);
  assert.equal(isVisible(0.8, 0.8), false);
  for (const [, x, y] of LOCUS) assert.equal(isVisible(x, y), true);
  assert.ok(xyToDisplayRgb(0.3127, 0.329).every(v => v >= 254 && v <= 255));
});
