import { Contrast, Droplet, Focus, Scan } from 'lucide-react';
import { OPERATIONS } from '../lib/precision';
import { cx } from './ui.jsx';

const ICONS = { grayscale: Contrast, blur: Droplet, sharpen: Focus, edge: Scan };

export default function OperationPicker({ value, onChange, compact = false }) {
  return (
    <div className={cx('grid gap-2', compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2')} role="radiogroup" aria-label="Processing operation">
      {OPERATIONS.map((op) => {
        const Icon = ICONS[op.id];
        const active = value === op.id;
        return (
          <button
            key={op.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(op.id)}
            className={cx(
              'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
              active ? 'border-brand-blue/70 bg-brand-blue/10' : 'border-white/[0.07] bg-ink-900/50 hover:border-white/20'
            )}
          >
            <Icon size={18} className={cx('mt-0.5 shrink-0', active ? 'text-brand-blue' : 'text-slate-500')} />
            <span>
              <span className="block text-sm font-semibold text-white">{op.label}</span>
              {!compact && <span className="mt-0.5 block text-xs text-slate-400">{op.detail}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
