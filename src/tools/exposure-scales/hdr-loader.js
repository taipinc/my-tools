// Radiance (.hdr / .pic) RGBE decoder + helpers for linear-light pixel buffers.
// Returns { width, height, data: Float32Array } with 3 linear-light floats per pixel.

export function parseHDR(buffer) {
  const bytes = new Uint8Array(buffer);
  let pos = 0;
  const readLine = () => {
    let s = '';
    while (pos < bytes.length) {
      const c = bytes[pos++];
      if (c === 10) break;
      s += String.fromCharCode(c);
    }
    return s;
  };

  let line = readLine();
  if (!/^#\?(RADIANCE|RGBE)/.test(line)) throw new Error('Not a Radiance HDR file');
  while (pos < bytes.length) {
    line = readLine();
    if (line === '') break;
  }
  const res = readLine().match(/^\s*-Y\s+(\d+)\s+\+X\s+(\d+)/);
  if (!res) throw new Error('Unsupported HDR orientation');
  const height = parseInt(res[1], 10);
  const width = parseInt(res[2], 10);

  const data = new Float32Array(width * height * 3);
  const row = new Uint8Array(width * 4);

  for (let y = 0; y < height; y++) {
    if (pos + 4 > bytes.length) break;
    const b0 = bytes[pos], b1 = bytes[pos + 1], b2 = bytes[pos + 2], b3 = bytes[pos + 3];
    const rle = b0 === 2 && b1 === 2 && ((b2 << 8) | b3) === width && width >= 8 && width < 32768;
    if (rle) {
      pos += 4;
      for (let ch = 0; ch < 4; ch++) {
        let x = 0;
        while (x < width) {
          let count = bytes[pos++];
          if (count > 128) {
            count -= 128;
            const v = bytes[pos++];
            for (let k = 0; k < count; k++) row[(x++) * 4 + ch] = v;
          } else {
            for (let k = 0; k < count; k++) row[(x++) * 4 + ch] = bytes[pos++];
          }
        }
      }
    } else {
      for (let x = 0; x < width; x++) {
        row[x * 4] = bytes[pos++];
        row[x * 4 + 1] = bytes[pos++];
        row[x * 4 + 2] = bytes[pos++];
        row[x * 4 + 3] = bytes[pos++];
      }
    }
    for (let x = 0; x < width; x++) {
      const e = row[x * 4 + 3];
      const f = e === 0 ? 0 : Math.pow(2, e - 136);
      const o = (y * width + x) * 3;
      data[o] = row[x * 4] * f;
      data[o + 1] = row[x * 4 + 1] * f;
      data[o + 2] = row[x * 4 + 2] * f;
    }
  }
  return { width, height, data };
}

// Box-average downscale of a linear RGB float buffer to at most maxW wide.
export function downscale(img, maxW) {
  if (img.width <= maxW) return img;
  const scale = img.width / maxW;
  const w = Math.max(1, Math.round(img.width / scale));
  const h = Math.max(1, Math.round(img.height / scale));
  const out = new Float32Array(w * h * 3);
  const step = Math.max(1, Math.floor(scale));
  for (let y = 0; y < h; y++) {
    const sy0 = Math.floor(y * scale);
    for (let x = 0; x < w; x++) {
      const sx0 = Math.floor(x * scale);
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = 0; dy < step; dy++) {
        const sy = Math.min(img.height - 1, sy0 + dy);
        for (let dx = 0; dx < step; dx++) {
          const sx = Math.min(img.width - 1, sx0 + dx);
          const o = (sy * img.width + sx) * 3;
          r += img.data[o]; g += img.data[o + 1]; b += img.data[o + 2]; n++;
        }
      }
      const q = (y * w + x) * 3;
      out[q] = r / n; out[q + 1] = g / n; out[q + 2] = b / n;
    }
  }
  return { width: w, height: h, data: out };
}

// Decode an ordinary 8-bit image (JPEG/PNG) into the same linear float buffer.
export async function loadLDR(file, maxW) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bmp.width);
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const data = new Float32Array(w * h * 3);
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    lut[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  for (let p = 0, q = 0; q < data.length; p += 4, q += 3) {
    data[q] = lut[px[p]]; data[q + 1] = lut[px[p + 1]]; data[q + 2] = lut[px[p + 2]];
  }
  return { width: w, height: h, data, ldr: true };
}
