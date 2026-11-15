import { QUALITY_FLOOR_DB, SSIM_FLOOR } from './precision';

export const PRIORITIES = [
  { id: 'speed', label: 'Speed' },
  { id: 'memory', label: 'Memory' },
  { id: 'quality', label: 'Quality' },
];

/**
 * Pick a precision from measured results (one entry per precision).
 * Only precisions that meet the quality floor are considered; if none does,
 * the most accurate one is returned and meetsFloor is false.
 */
export function recommend(results, priority) {
  if (!results.length) return null;
  const eligible = results.filter((r) => r.psnr >= QUALITY_FLOOR_DB && r.ssim >= SSIM_FLOOR);
  const order = {
    speed: (a, b) => a.timeMs - b.timeMs || a.memoryKb - b.memoryKb,
    memory: (a, b) => a.memoryKb - b.memoryKb || a.timeMs - b.timeMs,
    quality: (a, b) => b.psnr - a.psnr || b.ssim - a.ssim || a.memoryKb - b.memoryKb,
  };
  const pool = eligible.length ? eligible : results;
  const rule = eligible.length ? order[priority] : order.quality;
  return {
    pick: [...pool].sort(rule)[0],
    meetsFloor: eligible.length > 0,
    baseline: results.find((r) => r.precision === 'fp32') || null,
  };
}
