import { PRECISION_BY_ID } from '../lib/precision';
import { fmtError } from '../lib/format';
import { cx } from './ui.jsx';

const TONES = {
  val: 'bg-sky-400/15 text-sky-300',
  int: 'bg-blue-400/15 text-blue-300',
  frac: 'bg-indigo-400/15 text-indigo-300',
  sign: 'bg-rose-400/15 text-rose-300',
  exp: 'bg-violet-400/15 text-violet-300',
  mant: 'bg-blue-400/15 text-blue-200',
};

/** Shows the bit fields of one value in all four formats. rows come from describeNumber(). */
export default function BitLayout({ rows }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const p = PRECISION_BY_ID[row.id];
        return (
          <div key={row.id} className="rounded-xl bg-ink-900/70 p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                {p.label}
                <span className="font-normal text-slate-500">{row.note}</span>
              </span>
              <span className="font-mono text-slate-200">{row.stored.toPrecision(6)}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-2 font-mono text-[13px] leading-none">
              {row.fields.map((f) => (
                <span key={f.name} className="flex flex-col items-start gap-1">
                  <span className={cx('rounded px-1.5 py-1 tracking-[0.12em]', TONES[f.tone])}>{f.bits}</span>
                  <span className="px-0.5 font-sans text-[10px] text-slate-500">
                    {f.name} · {f.bits.length}
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Rounding error <span className="font-mono text-slate-300">{fmtError(row.error)}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
