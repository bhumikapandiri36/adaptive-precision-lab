import { Binary } from 'lucide-react';
import { Link } from 'react-router-dom';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export function Brand({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-violet text-white">
        <Binary size={19} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-bold text-white">Adaptive Precision</span>
          <span className="block text-xs text-slate-400">Zen Coders</span>
        </span>
      )}
    </Link>
  );
}

export function Button({ as: Tag = 'button', variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-[15px]' };
  const variants = {
    primary: 'bg-gradient-to-r from-brand-blue to-brand-violet text-white hover:brightness-110',
    secondary: 'border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.09]',
    ghost: 'text-slate-300 hover:bg-white/[0.06]',
  };
  return <Tag className={cx(base, sizes[size], variants[variant], className)} {...props} />;
}

export function Panel({ title, description, action, children, className = '', padded = true }) {
  return (
    <section className={cx('rounded-2xl border border-white/[0.07] bg-ink-800/70', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 max-w-prose text-sm text-slate-400">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

const TONES = {
  blue: 'bg-brand-blue/10 text-brand-blue',
  violet: 'bg-brand-violet/10 text-brand-violet',
  sky: 'bg-sky-400/10 text-sky-300',
  fuchsia: 'bg-fuchsia-400/10 text-fuchsia-300',
};

export function Metric({ icon: Icon, label, value, unit, hint, tone = 'blue' }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-800/70 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className={cx('grid h-7 w-7 place-items-center rounded-lg', TONES[tone])}>
          <Icon size={15} />
        </span>
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums tracking-tight text-white">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
      {hint && <p className="mt-1.5 min-h-[1rem] text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Badge({ children, color, className = '' }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 text-xs font-medium text-slate-300', className)}>
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.05] text-slate-400">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
