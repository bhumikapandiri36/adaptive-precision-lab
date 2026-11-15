import { PRECISIONS } from './precision';

/** Average the metrics of all runs per precision, in PRECISIONS order. Empty precisions are skipped. */
export function averageByPrecision(runs) {
  return PRECISIONS.map((p) => {
    const rs = runs.filter((r) => r.precision === p.id);
    if (!rs.length) return null;
    const mean = (key) => rs.reduce((sum, r) => sum + r[key], 0) / rs.length;
    return {
      precision: p.id,
      count: rs.length,
      timeMs: mean('timeMs'),
      memoryKb: mean('memoryKb'),
      psnr: mean('psnr'),
      ssim: mean('ssim'),
      engine: rs[rs.length - 1].engine,
    };
  }).filter(Boolean);
}
