import { useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { cx } from './ui.jsx';

export default function ImageCompare({ original, processed }) {
  const [mode, setMode] = useState('slider');
  const [pos, setPos] = useState(50);

  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg bg-ink-950 p-1" role="radiogroup" aria-label="Comparison view">
        {[
          ['slider', 'Slider'],
          ['side', 'Side by side'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            onClick={() => setMode(id)}
            className={cx('rounded-md px-3 py-1 text-xs font-semibold', mode === id ? 'bg-brand-blue/20 text-white' : 'text-slate-400 hover:text-slate-200')}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'slider' ? (
        <div className="relative select-none overflow-hidden rounded-xl bg-ink-900">
          <img src={processed} alt="Processed result" className="block h-auto w-full" draggable={false} />
          <img
            src={original}
            alt="Original upload"
            className="absolute inset-0 h-full w-full object-fill"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            draggable={false}
          />
          <span className="absolute left-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 text-xs font-semibold text-white">Original</span>
          <span className="absolute right-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 text-xs font-semibold text-white">Processed</span>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/80" style={{ left: `${pos}%` }}>
            <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-900">
              <ChevronsLeftRight size={18} />
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Reveal the original image"
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Original', original],
            ['Processed', processed],
          ].map(([label, src]) => (
            <figure key={label} className="overflow-hidden rounded-xl bg-ink-900">
              <img src={src} alt={label} className="block h-auto w-full" />
              <figcaption className="px-3 py-2 text-xs font-semibold text-slate-300">{label}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
