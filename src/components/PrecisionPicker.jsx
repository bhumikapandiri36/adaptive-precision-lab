import { PRECISIONS } from '../lib/precision';
import { cx } from './ui.jsx';

export default function PrecisionPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Precision">
      {PRECISIONS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.id)}
            className={cx(
              'rounded-xl border p-3 text-left transition-colors',
              active ? 'bg-white/[0.05]' : 'border-white/[0.07] bg-ink-900/50 hover:border-white/20'
            )}
            style={active ? { borderColor: p.color } : undefined}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              {p.label}
            </span>
            <span className="mt-1 block font-mono text-xs text-slate-400">
              {p.width} · {p.code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
