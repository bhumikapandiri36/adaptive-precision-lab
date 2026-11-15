import { Link } from 'react-router-dom';
import { Cpu, FlaskConical, Gauge, Layers, MemoryStick, Timer } from 'lucide-react';
import { useLab } from '../context/LabContext.jsx';
import { Badge, Button, EmptyState, Metric, PageHeader, Panel } from '../components/ui.jsx';
import ImageCompare from '../components/ImageCompare.jsx';
import ResultCards from '../components/ResultCards.jsx';
import RunTable from '../components/RunTable.jsx';
import { OPERATION_BY_ID, PRECISION_BY_ID } from '../lib/precision';
import { averageByPrecision } from '../lib/stats';

export default function Dashboard() {
  const { image, operation, precision, engine, runs, lastRun } = useLab();
  const avg = averageByPrecision(runs);
  const best = (key, dir) => (avg.length ? [...avg].sort((a, b) => dir * (a[key] - b[key]))[0] : null);
  const fastest = best('timeMs', 1);
  const accurate = best('psnr', -1);
  const leanest = best('memoryKb', 1);
  const label = (r) => (r ? PRECISION_BY_ID[r.precision].label : '—');

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A summary of every run in this session. Results are kept in memory and clear when you reload the page."
        actions={
          <Button as={Link} to="/lab">
            <FlaskConical size={17} /> Open the lab
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Layers} tone="blue" label="Runs this session" value={runs.length} hint={runs.length ? `${avg.length} of 4 precisions tested` : 'No runs yet'} />
        <Metric icon={Timer} tone="violet" label="Fastest on average" value={label(fastest)} hint={fastest ? `${fastest.timeMs.toFixed(2)} ms mean` : 'Needs at least one run'} />
        <Metric icon={Gauge} tone="sky" label="Most accurate" value={label(accurate)} hint={accurate ? (accurate.psnr >= 99 ? 'Identical to the reference' : `${accurate.psnr.toFixed(2)} dB mean PSNR`) : 'Needs at least one run'} />
        <Metric icon={MemoryStick} tone="fuchsia" label="Lowest memory" value={label(leanest)} hint={leanest ? `${leanest.memoryKb.toFixed(1)} KB mean` : 'Needs at least one run'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel title="Latest result" description={lastRun ? `${lastRun.fileName} · ${OPERATION_BY_ID[lastRun.operation].label}` : undefined}>
          <div className="mt-4">
            {lastRun && image ? (
              <ImageCompare original={image.url} processed={lastRun.image} />
            ) : (
              <EmptyState
                icon={FlaskConical}
                title="Nothing processed yet"
                description="Upload an image in the lab and process it. The result appears here with the original for comparison."
                action={<Button as={Link} to="/lab" variant="secondary">Go to the lab</Button>}
              />
            )}
          </div>
        </Panel>

        <Panel title="Current setup">
          <dl className="space-y-4 text-sm">
            {[
              ['Image', image ? image.name : 'None selected'],
              ['Operation', OPERATION_BY_ID[operation].label],
              ['Precision', PRECISION_BY_ID[precision].label],
              ['Engine', engine === 'browser' ? 'Browser emulation' : 'FastAPI backend'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="truncate text-right font-medium text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 flex items-start gap-2 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-slate-500">
            <Cpu size={14} className="mt-0.5 shrink-0" />
            Change these in the lab. The engine can be switched from the sidebar.
          </p>
        </Panel>
      </div>

      <div className="mt-6">
        <ResultCards run={lastRun} />
      </div>

      <Panel
        className="mt-6"
        title="Recent runs"
        action={runs.length > 0 && <Badge>{runs.length} total</Badge>}
        padded={false}
      >
        <div className="p-5 pt-3">
          {runs.length ? (
            <RunTable runs={runs.slice(-8)} />
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">Runs will be listed here as you process images.</p>
          )}
        </div>
      </Panel>
    </>
  );
}
