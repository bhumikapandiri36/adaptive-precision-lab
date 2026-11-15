import { Cpu, Layers, MemoryStick, Ruler, Server } from 'lucide-react';
import { PageHeader, Panel } from '../components/ui.jsx';
import { PRECISIONS } from '../lib/precision';

// Add your team members here, for example: ['Full name', 'Role'].
const TEAM_MEMBERS = [];

const CONCEPTS = [
  [Cpu, 'Integer ALU and FPU', 'Integer and fixed-point maths run on the integer ALU. FP32 and FP16 need a floating-point unit, which costs more silicon and energy.'],
  [Layers, 'Datapath width', 'Narrower operands move through registers, caches and buses in fewer bits, so more pixels fit in each transfer.'],
  [MemoryStick, 'Memory footprint', 'Buffer size scales with bytes per element: 1 for Integer, 2 for Q8.8 and FP16, and 4 for FP32.'],
  [Ruler, 'Quantisation error', 'Fewer bits means coarser weights and more rounding per operation. PSNR and SSIM show when that error becomes visible.'],
];

const CONTRACT = `GET  /api/health
     -> 200 OK

POST /api/process            (multipart/form-data)
     file:       image file
     operation:  grayscale | blur | sharpen | edge
     precision:  integer | fixed | fp32 | fp16

     -> 200 application/json
     {
       "processed_image":   "data:image/png;base64,...",
       "execution_time_ms": 12.4,
       "memory_kb":         768.0,
       "psnr":              48.21,
       "ssim":              0.9987,
       "width":             512,
       "height":            384
     }`;

export default function About() {
  return (
    <>
      <PageHeader title="About the project" description="Adaptive Precision Image Processing Optimization, a Computer Organization and Architecture project by Zen Coders." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="The question">
          <p className="leading-relaxed text-slate-300">
            Image filters are multiply-accumulate loops, and the number format decides how wide each operand is, which execution unit runs it and how much memory the buffers need. This project runs the same operations in four formats and measures what each choice costs and what it preserves, so the format can be chosen for the image and the task instead of by habit.
          </p>
        </Panel>
        <Panel title="Computer organization concepts">
          <ul className="space-y-4">
            {CONCEPTS.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-brand-blue" />
                <p className="text-sm leading-relaxed text-slate-400">
                  <span className="font-semibold text-white">{title}. </span>
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="How results are measured" className="lg:col-span-2">
          <dl className="grid gap-x-8 gap-y-5 text-sm md:grid-cols-2">
            {[
              ['Reference', 'Every operation is also run in float64. All quality metrics compare a precision’s output with this reference, after both are rounded to 8-bit pixels.'],
              ['PSNR', '10 · log10(255² / MSE) over the RGB channels. A perfect match is shown as ∞.'],
              ['SSIM', 'Mean structural similarity over 8×8 blocks of luminance, using the standard constants C1 = (0.01·255)² and C2 = (0.03·255)².'],
              ['Execution time', 'Median of three timed runs of the operation, excluding image decoding and encoding.'],
              ['Memory usage', 'Browser engine: input plus output buffer size at the width of the format. FastAPI engine: whatever the backend reports.'],
              ['Browser limits', 'JavaScript has no integer, fixed or half-precision hardware paths, so the browser engine emulates each format’s rounding exactly but its timings do not reflect real hardware. Images are scaled to 512 px on the long side.'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold text-white">{k}</dt>
                <dd className="mt-1 leading-relaxed text-slate-400">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Precision formats">
          <ul className="space-y-3 text-sm">
            {PRECISIONS.map((p) => (
              <li key={p.id} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                <p className="leading-relaxed text-slate-400">
                  <span className="font-semibold text-white">{p.label} ({p.width}). </span>
                  {p.detail}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="FastAPI contract"
          description="Set VITE_API_BASE_URL and the FastAPI engine becomes available in the sidebar."
          action={<Server size={18} className="text-slate-500" />}
        >
          <pre className="mt-1 overflow-x-auto rounded-xl bg-ink-950 p-4 font-mono text-xs leading-relaxed text-slate-300">{CONTRACT}</pre>
        </Panel>

        <Panel title="Team Zen Coders" className="lg:col-span-2">
          {TEAM_MEMBERS.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM_MEMBERS.map(([name, role]) => (
                <li key={name} className="rounded-xl bg-ink-900/70 p-4">
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-sm text-slate-400">{role}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Built with React, Vite, Tailwind CSS, Lucide icons and Recharts.</p>
          )}
        </Panel>
      </div>
    </>
  );
}
