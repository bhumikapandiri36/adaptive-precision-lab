// In-browser processing engine.
//
// Each precision is emulated with real arithmetic of that format: every multiply and
// add is rounded the way the format would round it. PSNR and SSIM are measured against a
// float64 reference run of the same operation, so the quality numbers are exact for the
// emulated format. Execution time is the measured JavaScript run time (median of REPEATS).
import { PRECISION_BY_ID, roundHalf } from './precision';

const MAX_DIM = 512; // longest image side processed in the browser
const REPEATS = 3;
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// ---------- kernels ----------
function gaussian(sigma) {
  const raw = [];
  for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) raw.push(Math.exp(-(x * x + y * y) / (2 * sigma * sigma)));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum);
}
const SHARP = 0.6;
const KERNELS = {
  blur: gaussian(1),
  sharpen: [0, -SHARP, 0, -SHARP, 1 + 4 * SHARP, -SHARP, 0, -SHARP, 0],
};
const SOBEL_X = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
const SOBEL_Y = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
const GRAY = [0.299, 0.587, 0.114];

// ---------- number formats ----------
// pix: pixel -> internal, wt: fractional weight -> internal, wi: whole-number weight -> internal
// mul/add: arithmetic, norm: divide by weight sum, out: internal -> 0..255, mag: gradient magnitude
function floatFormat(q) {
  return {
    pix: (v) => v,
    wt: (x) => q(x),
    wi: (v) => v,
    mul: (a, b) => q(a * b),
    add: (a, b) => q(a + b),
    norm: (acc) => acc,
    out: (v) => clamp255(Math.round(v)),
    mag: (a, b) => q(Math.sqrt(q(q(a * a) + q(b * b)))),
  };
}

const intFormat = {
  pix: (v) => v,
  wt: (x) => Math.round(x * 16),
  wi: (v) => v,
  mul: (a, b) => a * b,
  add: (a, b) => a + b,
  norm: (acc, wsum) => Math.trunc(acc / wsum),
  out: (v) => clamp255(v),
  mag: (a, b) => Math.abs(a) + Math.abs(b),
};

const fixedFormat = {
  pix: (v) => v * 256,
  wt: (x) => Math.round(x * 256),
  wi: (v) => v * 256,
  mul: (a, b) => Math.floor((a * b) / 256),
  add: (a, b) => a + b,
  norm: (acc) => acc,
  out: (v) => clamp255(Math.floor((v + 128) / 256)),
  mag: (a, b) => Math.floor(Math.sqrt(a * a + b * b)),
};

const FORMATS = {
  reference: floatFormat((x) => x),
  integer: intFormat,
  fixed: fixedFormat,
  fp32: floatFormat(Math.fround),
  fp16: floatFormat(roundHalf),
};

// ---------- core ----------
function convolve(plane, w, h, k, F) {
  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    const r0 = Math.max(y - 1, 0) * w;
    const r1 = y * w;
    const r2 = Math.min(y + 1, h - 1) * w;
    for (let x = 0; x < w; x++) {
      const xl = Math.max(x - 1, 0);
      const xr = Math.min(x + 1, w - 1);
      let acc = F.mul(k[0], plane[r0 + xl]);
      acc = F.add(acc, F.mul(k[1], plane[r0 + x]));
      acc = F.add(acc, F.mul(k[2], plane[r0 + xr]));
      acc = F.add(acc, F.mul(k[3], plane[r1 + xl]));
      acc = F.add(acc, F.mul(k[4], plane[r1 + x]));
      acc = F.add(acc, F.mul(k[5], plane[r1 + xr]));
      acc = F.add(acc, F.mul(k[6], plane[r2 + xl]));
      acc = F.add(acc, F.mul(k[7], plane[r2 + x]));
      acc = F.add(acc, F.mul(k[8], plane[r2 + xr]));
      out[r1 + x] = acc;
    }
  }
  return out;
}

function applyOperation(rgba, w, h, op, F) {
  const n = w * h;
  const out = new Uint8ClampedArray(n * 4);
  const planes = [0, 1, 2].map((c) => {
    const p = new Float64Array(n);
    for (let i = 0; i < n; i++) p[i] = F.pix(rgba[i * 4 + c]);
    return p;
  });
  const write = (i, r, g, b) => {
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = 255;
  };

  if (op === 'grayscale' || op === 'edge') {
    const [wr, wg, wb] = GRAY.map((x) => F.wt(x));
    const wsum = wr + wg + wb;
    const gray = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const acc = F.add(F.add(F.mul(wr, planes[0][i]), F.mul(wg, planes[1][i])), F.mul(wb, planes[2][i]));
      gray[i] = F.norm(acc, wsum);
    }
    if (op === 'grayscale') {
      for (let i = 0; i < n; i++) {
        const v = F.out(gray[i]);
        write(i, v, v, v);
      }
      return out;
    }
    const gx = convolve(gray, w, h, SOBEL_X.map((v) => F.wi(v)), F);
    const gy = convolve(gray, w, h, SOBEL_Y.map((v) => F.wi(v)), F);
    for (let i = 0; i < n; i++) {
      const v = F.out(F.mag(gx[i], gy[i]));
      write(i, v, v, v);
    }
    return out;
  }

  const k = KERNELS[op].map((x) => F.wt(x));
  const wsum = k.reduce((a, b) => a + b, 0);
  const res = planes.map((p) => {
    const c = convolve(p, w, h, k, F);
    for (let i = 0; i < n; i++) c[i] = F.out(F.norm(c[i], wsum));
    return c;
  });
  for (let i = 0; i < n; i++) write(i, res[0][i], res[1][i], res[2][i]);
  return out;
}

// ---------- metrics ----------
function psnr(a, b) {
  let se = 0;
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (i % 4 === 3) continue;
    const d = a[i] - b[i];
    se += d * d;
    count++;
  }
  const mse = se / count;
  return mse === 0 ? 99 : Math.min(99, 10 * Math.log10((255 * 255) / mse));
}

// Mean SSIM over non-overlapping 8x8 luminance blocks.
function ssim(a, b, w, h) {
  const lum = (d) => {
    const l = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) l[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    return l;
  };
  const A = lum(a);
  const B = lum(b);
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  const S = 8;
  const N = S * S;
  let total = 0;
  let count = 0;
  for (let by = 0; by + S <= h; by += S) {
    for (let bx = 0; bx + S <= w; bx += S) {
      let sa = 0;
      let sb = 0;
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const i = (by + y) * w + bx + x;
          sa += A[i];
          sb += B[i];
        }
      }
      const ma = sa / N;
      const mb = sb / N;
      let va = 0;
      let vb = 0;
      let cov = 0;
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const i = (by + y) * w + bx + x;
          const da = A[i] - ma;
          const db = B[i] - mb;
          va += da * da;
          vb += db * db;
          cov += da * db;
        }
      }
      va /= N - 1;
      vb /= N - 1;
      cov /= N - 1;
      total += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      count++;
    }
  }
  return count ? total / count : 1;
}

// ---------- image helpers ----------
async function decode(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return ctx.getImageData(0, 0, width, height);
}

function toDataUrl(rgba, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').putImageData(new ImageData(rgba, w, h), 0, 0);
  return canvas.toDataURL('image/png');
}

/** Process a file locally. Resolves to the same shape the FastAPI client returns. */
export async function processLocal(file, operation, precision) {
  const { data, width, height } = await decode(file);
  await tick();

  const reference = applyOperation(data, width, height, operation, FORMATS.reference);
  const F = FORMATS[precision];
  const times = [];
  let output;
  for (let i = 0; i < REPEATS; i++) {
    const t0 = performance.now();
    output = applyOperation(data, width, height, operation, F);
    times.push(performance.now() - t0);
    await tick();
  }
  times.sort((a, b) => a - b);

  const bytes = PRECISION_BY_ID[precision].bytes;
  return {
    image: toDataUrl(output, width, height),
    timeMs: times[Math.floor(times.length / 2)],
    memoryKb: (width * height * 3 * bytes * 2) / 1024, // input + output buffers at this format width
    psnr: psnr(reference, output),
    ssim: ssim(reference, output, width, height),
    width,
    height,
    engine: 'browser',
  };
}
