import { useMemo, useState } from 'react';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import { Panel, cx } from './ui.jsx';
import { PRECISION_BY_ID, QUALITY_FLOOR_DB, SSIM_FLOOR } from '../lib/precision';
import { PRIORITIES, recommend } from '../lib/recommend';
import { fmtMem, fmtPsnr, fmtSsim, fmtTime } from '../lib/format';

const pct = (v) => `${Math.abs(Math.round(v * 100))}%`;

/** results: one measured entry per precision { precision, timeMs, memoryKb, psnr, ssim, engine } */
export default function Recommendation({ results, scope }) {
  const [priority, setPriority] = useState('memory');
  const rec = useMemo(() => recommend(results, priority), [results, priority]);
  if (!rec) return null;

  const { pick, baseline, meetsFloor } = rec;
  const p = PRECISION_BY_ID[pick.precision];
  const lines = [];
  if (baseline && pick.precision !== 'fp32') {
    const mem = 1 - pick.memoryKb / baseline.memoryKb;
    lines.push(mem >= 0 ? `${pct(mem)} less buffer memory than FP32` : `${pct(mem)} more buffer memory than FP32`);
    const time = 1 - pick.timeMs / baseline.timeMs;
    lines.push(time >= 0 ? `${pct(time)} faster than FP32` : `${pct(time)} slower than FP32`);
  }
  lines.push(`PSNR ${fmtPsnr(pick.psnr)} and SSIM ${fmtSsim(pick.ssim)} against the float64 reference`);

  return (
    <Panel
      title="Recommendation"
      description={`Based on ${scope}. Only formats with PSNR of at least ${QUALITY_FLOOR_DB} dB and SSIM of at least ${SSIM_FLOOR} are considered.`}
      action={
        <div className="inline-flex rounded-lg bg-ink-950 p-1" role="radiogroup" aria-label="Optimise for">
          {PRIORITIES.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={priority === o.id}
              onClick={() => setPriority(o.id)}
              className={cx('rounded-md px-3 py-1 text-xs font-semibold', priority === o.id ? 'bg-brand-blue/20 text-white' : 'text-slate-400 hover:text-slate-200')}
            >
              {o.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0 rounded-xl border p-4 sm:w-52" style={{ borderColor: p.color }}>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <Lightbulb size={14} /> Recommended for {PRIORITIES.find((o) => o.id === priority).label.toLowerCase()}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{p.label}</p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {p.width} · {p.code}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <ul className="space-y-1.5 text-sm text-slate-300">
            {lines.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-violet" />
                {l}
              </li>
            ))}
            <li className="flex gap-2 text-slate-400">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
              Time {fmtTime(pick.timeMs)}, memory {fmtMem(pick.memoryKb)}
            </li>
          </ul>
          {!meetsFloor && (
            <p className="mt-4 flex items-start gap-2 text-sm text-amber-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              No format reached the quality floor for this input, so the most accurate one is shown.
            </p>
          )}
          {pick.engine === 'browser' && priority === 'speed' && (
            <p className="mt-4 text-xs text-slate-500">
              Browser timings measure JavaScript emulation, which does not follow hardware speed. Use the FastAPI engine for timings that reflect real integer and floating-point units.
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}
