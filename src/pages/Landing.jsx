import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Gauge, MemoryStick, Timer } from 'lucide-react';
import { Brand, Button, Panel } from '../components/ui.jsx';
import BitLayout from '../components/BitLayout.jsx';
import { PRECISIONS, describeNumber } from '../lib/precision';

const PRESETS = [
  ['0.299', 'Red weight'],
  ['0.587', 'Green weight'],
  ['0.114', 'Blue weight'],
  ['0.124', 'Blur edge weight'],
];

const STEPS = [
  ['Upload an image', 'Drop in any PNG, JPEG or WebP.'],
  ['Pick an operation', 'Grayscale, Gaussian blur, sharpen or Sobel edges.'],
  ['Choose a precision', 'Integer, Fixed point, FP32 or FP16.'],
  ['Read the trade-off', 'Compare output, cost and error, then follow the recommendation.'],
];

const MEASURES = [
  [Timer, 'Execution time', 'How long the operation takes at this precision.'],
  [MemoryStick, 'Memory usage', 'Buffer size, set by the width of the number format.'],
  [Gauge, 'PSNR', 'Pixel error against a float64 reference, in decibels.'],
  [Activity, 'SSIM', 'Structural similarity to the reference, from 0 to 1.'],
];

export default function Landing() {
  const [value, setValue] = useState(0.299);
  const rows = useMemo(() => describeNumber(value), [value]);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Brand />
        <nav className="flex items-center gap-2">
          <Button as={Link} to="/about" variant="ghost" size="sm">
            About
          </Button>
          <Button as={Link} to="/dashboard" variant="secondary" size="sm">
            Open dashboard
          </Button>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="bit-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_72%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
              Computer Organization and Architecture project by Zen Coders
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Pick the number format your pixels actually need.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Adaptive Precision Image Processing runs the same filter in Integer, Fixed point, FP32 and FP16, then measures time, memory, PSNR and SSIM so you can see what every bit costs and what it buys.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button as={Link} to="/lab" size="lg">
                Open the lab <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/about" variant="secondary" size="lg">
                Read the method
              </Button>
            </div>
          </div>

          <Panel
            title="One number, four encodings"
            description="Choose a value and see how each format stores it. These bits are computed live in your browser."
          >
            <div className="mb-4">
              <div className="flex items-baseline justify-between">
                <label htmlFor="value" className="text-sm font-medium text-slate-200">
                  Value to store
                </label>
                <output className="font-mono text-lg font-semibold text-white">{value.toFixed(3)}</output>
              </div>
              <input
                id="value"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="mt-3 w-full accent-brand-violet"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESETS.map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue(Number(v))}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/[0.06]"
                  >
                    {label} <span className="font-mono text-slate-500">{v}</span>
                  </button>
                ))}
              </div>
            </div>
            <BitLayout rows={rows} />
          </Panel>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Four formats, four different datapaths</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          The same convolution kernel behaves differently depending on how its weights and pixels are represented in hardware.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRECISIONS.map((p) => (
            <article key={p.id} className="rounded-2xl border border-white/[0.07] bg-ink-800/70 p-5" style={{ borderTop: `2px solid ${p.color}` }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{p.label}</h3>
                <span className="font-mono text-xs text-slate-400">{p.width}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{p.detail}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{p.tradeoff}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-ink-900/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">How a run works</h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brand-violet/50 font-mono text-sm text-brand-violet">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-slate-400">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">What gets measured</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {MEASURES.map(([Icon, name, text]) => (
                <div key={name} className="rounded-xl border border-white/[0.07] bg-ink-800/60 p-4">
                  <dt className="flex items-center gap-2 font-semibold text-white">
                    <Icon size={16} className="text-brand-blue" />
                    {name}
                  </dt>
                  <dd className="mt-1.5 text-sm text-slate-400">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <span>Adaptive Precision Image Processing Optimization</span>
        <span>Built by Zen Coders for Computer Organization and Architecture</span>
      </footer>
    </div>
  );
}
