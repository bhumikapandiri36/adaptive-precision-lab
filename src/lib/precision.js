// Shared constants and bit-level helpers for the four precision formats.

export const PRECISIONS = [
  {
    id: 'integer',
    label: 'Integer',
    code: 'INT8',
    bits: 8,
    bytes: 1,
    color: '#38BDF8',
    width: '8-bit',
    detail: 'Whole-number multiply-accumulate. Kernel weights are scaled by 16 and divided back at the end.',
    tradeoff: 'Smallest and simplest datapath, but coarse weights add rounding error.',
  },
  {
    id: 'fixed',
    label: 'Fixed point',
    code: 'Q8.8',
    bits: 16,
    bytes: 2,
    color: '#6C8CFF',
    width: '16-bit',
    detail: 'Fractions stored as integers with 8 fractional bits, so the step size is 1/256.',
    tradeoff: 'Integer ALU operations with finer weights, but the range and step size are fixed.',
  },
  {
    id: 'fp32',
    label: 'FP32',
    code: 'IEEE 754',
    bits: 32,
    bytes: 4,
    color: '#8B6CFF',
    width: '32-bit',
    detail: '1 sign bit, 8 exponent bits and 23 mantissa bits.',
    tradeoff: 'Close to the reference result, with the widest datapath and the largest buffers.',
  },
  {
    id: 'fp16',
    label: 'FP16',
    code: 'IEEE 754',
    bits: 16,
    bytes: 2,
    color: '#D18BFF',
    width: '16-bit',
    detail: '1 sign bit, 5 exponent bits and 10 mantissa bits. Largest finite value is 65 504.',
    tradeoff: 'Half the memory of FP32, with a limited range and about three decimal digits.',
  },
];

export const PRECISION_BY_ID = Object.fromEntries(PRECISIONS.map((p) => [p.id, p]));

export const OPERATIONS = [
  { id: 'grayscale', label: 'Grayscale conversion', detail: 'Weighted sum of the R, G and B channels.' },
  { id: 'blur', label: 'Gaussian blur', detail: '3×3 kernel with σ = 1.' },
  { id: 'sharpen', label: 'Sharpen', detail: '3×3 kernel with negative neighbour weights.' },
  { id: 'edge', label: 'Sobel edge detection', detail: 'Two 3×3 gradients and a magnitude step.' },
];

export const OPERATION_BY_ID = Object.fromEntries(OPERATIONS.map((o) => [o.id, o]));

// Quality floor used by the recommendation logic.
export const QUALITY_FLOOR_DB = 35;
export const SSIM_FLOOR = 0.95;

// ---------- bit-level helpers ----------
const bin = (n, len) => (n >>> 0).toString(2).padStart(len, '0');
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);

/** Float -> 16-bit half-precision bit pattern (round to nearest even). */
export function toHalfBits(value) {
  f32[0] = value;
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  const rawExp = (x >>> 23) & 0xff;
  let mant = x & 0x7fffff;
  if (rawExp === 0xff) return sign | 0x7c00 | (mant ? 0x200 : 0);
  const exp = rawExp - 127 + 15;
  if (exp >= 31) return sign | 0x7c00;
  if (exp <= 0) {
    if (exp < -10) return sign;
    mant |= 0x800000;
    const shift = 14 - exp;
    let half = mant >>> shift;
    const rem = mant & ((1 << shift) - 1);
    const halfway = 1 << (shift - 1);
    if (rem > halfway || (rem === halfway && (half & 1))) half += 1;
    return sign | half;
  }
  let half = sign | (exp << 10) | (mant >>> 13);
  const rem = mant & 0x1fff;
  if (rem > 0x1000 || (rem === 0x1000 && (half & 1))) half += 1;
  return half;
}

/** 16-bit half-precision bit pattern -> number. */
export function fromHalfBits(h) {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 0x1f;
  const m = h & 0x3ff;
  if (e === 0) return s * m * 2 ** -24;
  if (e === 31) return m ? NaN : s * Infinity;
  return s * (1 + m / 1024) * 2 ** (e - 15);
}

/** Round a number to the nearest FP16 value (used by the emulation engine). */
export function roundHalf(x) {
  if (x === 0) return 0;
  const a = Math.abs(x);
  if (a >= 65520) return x > 0 ? Infinity : -Infinity;
  let e = Math.floor(Math.log2(a));
  if (e < -14) e = -14;
  const q = 2 ** (e - 10);
  const r = a / q;
  const f = Math.floor(r);
  const d = r - f;
  const n = d > 0.5 || (d === 0.5 && f % 2 === 1) ? f + 1 : f;
  return x < 0 ? -n * q : n * q;
}

/** Describe how a value in [0, 1] is stored in each of the four formats. */
export function describeNumber(v) {
  const intRaw = clamp(Math.round(v * 16), 0, 255);
  const fixRaw = clamp(Math.round(v * 256), 0, 65535);

  f32[0] = v;
  const n = u32[0];
  const h = toHalfBits(v);

  const rows = [
    {
      id: 'integer',
      note: '8-bit, weight × 16',
      fields: [{ name: 'value', bits: bin(intRaw, 8), tone: 'val' }],
      stored: intRaw / 16,
    },
    {
      id: 'fixed',
      note: 'Q8.8',
      fields: [
        { name: 'integer', bits: bin(fixRaw >> 8, 8), tone: 'int' },
        { name: 'fraction', bits: bin(fixRaw & 255, 8), tone: 'frac' },
      ],
      stored: fixRaw / 256,
    },
    {
      id: 'fp32',
      note: 'IEEE 754 single',
      fields: [
        { name: 'sign', bits: bin(n >>> 31, 1), tone: 'sign' },
        { name: 'exponent', bits: bin((n >>> 23) & 0xff, 8), tone: 'exp' },
        { name: 'mantissa', bits: bin(n & 0x7fffff, 23), tone: 'mant' },
      ],
      stored: Math.fround(v),
    },
    {
      id: 'fp16',
      note: 'IEEE 754 half',
      fields: [
        { name: 'sign', bits: bin(h >> 15, 1), tone: 'sign' },
        { name: 'exponent', bits: bin((h >> 10) & 0x1f, 5), tone: 'exp' },
        { name: 'mantissa', bits: bin(h & 0x3ff, 10), tone: 'mant' },
      ],
      stored: fromHalfBits(h),
    },
  ];
  return rows.map((r) => ({ ...r, error: Math.abs(r.stored - v) }));
}
