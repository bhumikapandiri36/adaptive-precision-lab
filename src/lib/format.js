export function timeParts(ms) {
  if (!Number.isFinite(ms)) return { value: '—', unit: '' };
  if (ms >= 1000) return { value: (ms / 1000).toFixed(2), unit: 's' };
  return { value: ms.toFixed(ms < 10 ? 2 : 1), unit: 'ms' };
}

export function memParts(kb) {
  if (!Number.isFinite(kb)) return { value: '—', unit: '' };
  if (kb >= 1024) return { value: (kb / 1024).toFixed(2), unit: 'MB' };
  return { value: kb.toFixed(1), unit: 'KB' };
}

const join = ({ value, unit }) => (unit ? `${value} ${unit}` : value);
export const fmtTime = (ms) => join(timeParts(ms));
export const fmtMem = (kb) => join(memParts(kb));
export const fmtPsnr = (db) => (!Number.isFinite(db) ? '—' : db >= 99 ? '∞' : `${db.toFixed(2)} dB`);
export const fmtSsim = (s) => (Number.isFinite(s) ? s.toFixed(4) : '—');

export function psnrQuality(db) {
  if (db >= 99) return 'Identical to the reference';
  if (db >= 40) return 'Visually lossless';
  if (db >= 35) return 'High quality';
  if (db >= 30) return 'Acceptable quality';
  return 'Visible degradation';
}

export function ssimQuality(s) {
  if (s >= 0.99) return 'Structure preserved';
  if (s >= 0.95) return 'Very close to the reference';
  if (s >= 0.9) return 'Slight structural differences';
  return 'Noticeable structural differences';
}

export const fmtError = (e) => (e === 0 ? '0' : e.toExponential(2));
