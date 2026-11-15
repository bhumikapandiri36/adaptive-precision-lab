import { BACKEND_CONFIGURED, API_BASE } from '../lib/api';
import { useLab } from '../context/LabContext.jsx';
import { cx } from './ui.jsx';

export default function EngineSwitch() {
  const { engine, setEngine, backendOnline } = useLab();

  const options = [
    { id: 'browser', label: 'Browser', disabled: false },
    { id: 'backend', label: 'FastAPI', disabled: !BACKEND_CONFIGURED },
  ];

  let statusText = 'Runs in this tab. Quality metrics are exact for each emulated format.';
  let dot = 'bg-sky-400';
  if (engine === 'backend') {
    if (backendOnline === null) {
      statusText = `Checking ${API_BASE}`;
      dot = 'bg-slate-500';
    } else if (backendOnline) {
      statusText = `Connected to ${API_BASE}`;
      dot = 'bg-emerald-400';
    } else {
      statusText = `No answer from ${API_BASE}. Start the server or use the browser engine.`;
      dot = 'bg-rose-400';
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-ink-800/70 p-3">
      <p className="mb-2 text-xs font-medium text-slate-400">Processing engine</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-ink-950 p-1" role="radiogroup" aria-label="Processing engine">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={engine === o.id}
            disabled={o.disabled}
            title={o.disabled ? 'Set VITE_API_BASE_URL in .env to enable the FastAPI engine' : undefined}
            onClick={() => setEngine(o.id)}
            className={cx(
              'rounded-md py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              engine === o.id ? 'bg-brand-blue/20 text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <span className={cx('mt-1 h-2 w-2 shrink-0 rounded-full', dot)} />
        {statusText}
      </p>
    </div>
  );
}
