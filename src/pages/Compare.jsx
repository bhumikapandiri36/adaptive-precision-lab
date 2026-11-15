import { Link } from 'react-router-dom';
import { GitCompareArrows, Loader2 } from 'lucide-react';
import { useLab } from '../context/LabContext.jsx';
import { Badge, Button, EmptyState, PageHeader, Panel } from '../components/ui.jsx';
import OperationPicker from '../components/OperationPicker.jsx';
import Recommendation from '../components/Recommendation.jsx';
import { MetricBarChart } from '../components/charts.jsx';
import { OPERATION_BY_ID, PRECISION_BY_ID } from '../lib/precision';
import { fmtMem, fmtPsnr, fmtSsim, fmtTime } from '../lib/format';

function delta(value, base, lowerIsBetter = true) {
  if (!base || value === base) return { text: '—', tone: 'text-slate-500' };
  const change = (value - base) / base;
  const better = lowerIsBetter ? change < 0 : change > 0;
  return { text: `${change > 0 ? '+' : '−'}${Math.abs(change * 100).toFixed(0)}%`, tone: better ? 'text-emerald-300' : 'text-rose-300' };
}

export default function Compare() {
  const { image, operation, setOperation, batch, runAll, status } = useLab();
  const running = status.state === 'running';
  const runs = batch?.runs ?? [];
  const base = runs.find((r) => r.precision === 'fp32');

  const series = (key) => runs.map((r) => ({ name: PRECISION_BY_ID[r.precision].label, value: r[key], color: PRECISION_BY_ID[r.precision].color }));

  const charts = [
    { title: 'Execution time', key: 'timeMs', unit: 'ms', decimals: 2, note: 'Lower is faster' },
    { title: 'Memory usage', key: 'memoryKb', unit: 'KB', decimals: 1, note: 'Lower uses less memory' },
    { title: 'PSNR', key: 'psnr', unit: 'dB', decimals: 2, note: 'Higher is closer to the reference' },
    { title: 'SSIM', key: 'ssim', unit: '', decimals: 4, note: 'Closer to 1 is more similar', domain: [0, 1] },
  ];

  return (
    <>
      <PageHeader
        title="Precision comparison"
        description="Run one image through all four precisions and compare the outputs, the cost and the error side by side."
        actions={
          <Button onClick={runAll} disabled={!image || running}>
            {running ? <Loader2 size={17} className="animate-spin" /> : <GitCompareArrows size={17} />}
            {running ? status.label : 'Run all precisions'}
          </Button>
        }
      />

      <Panel title="Operation" description="Applied to the image from the lab.">
        <OperationPicker value={operation} onChange={setOperation} compact />
      </Panel>

      {status.state === 'error' && (
        <p className="mt-6 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200" role="alert">
          {status.error}
        </p>
      )}

      {!batch ? (
        <div className="mt-6">
          <EmptyState
            icon={GitCompareArrows}
            title={image ? 'No comparison yet' : 'Upload an image first'}
            description={image ? 'Select Run all precisions to process the image with Integer, Fixed point, FP32 and FP16.' : 'The comparison needs an image. Upload one in the processing lab.'}
            action={!image && <Button as={Link} to="/lab">Go to the lab</Button>}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <Panel
            title="Outputs"
            description={`${batch.fileName} · ${OPERATION_BY_ID[batch.operation].label}`}
            action={batch.operation !== operation && <Badge>Showing {OPERATION_BY_ID[batch.operation].label}. Run again to update.</Badge>}
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <figure className="overflow-hidden rounded-xl bg-ink-900">
                <img src={image?.url} alt="Original" className="aspect-square w-full object-cover" />
                <figcaption className="p-3 text-sm font-semibold text-white">Original</figcaption>
              </figure>
              {runs.map((r) => {
                const p = PRECISION_BY_ID[r.precision];
                return (
                  <figure key={r.id} className="overflow-hidden rounded-xl bg-ink-900" style={{ borderBottom: `2px solid ${p.color}` }}>
                    <img src={r.image} alt={`${p.label} result`} className="aspect-square w-full object-cover" />
                    <figcaption className="p-3">
                      <span className="block text-sm font-semibold text-white">{p.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        PSNR {fmtPsnr(r.psnr)} · SSIM {fmtSsim(r.ssim)}
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            {charts.map((c) => (
              <Panel key={c.key} title={c.title} description={c.note}>
                <MetricBarChart data={series(c.key)} unit={c.unit} decimals={c.decimals} domain={c.domain} />
              </Panel>
            ))}
          </div>

          <Panel title="Measured values" description="Changes are relative to FP32, with green marking an improvement." padded={false}>
            <div className="overflow-x-auto p-5 pt-3">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b border-white/[0.06]">
                    {['Precision', 'Time', 'vs FP32', 'Memory', 'vs FP32', 'PSNR', 'SSIM'].map((h, i) => (
                      <th key={h + i} className="px-3 py-2.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const p = PRECISION_BY_ID[r.precision];
                    const dt = delta(r.timeMs, base?.timeMs);
                    const dm = delta(r.memoryKb, base?.memoryKb);
                    return (
                      <tr key={r.id} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-2 font-semibold text-white">
                            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                            {p.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">{fmtTime(r.timeMs)}</td>
                        <td className={`px-3 py-2.5 tabular-nums ${dt.tone}`}>{dt.text}</td>
                        <td className="px-3 py-2.5 tabular-nums">{fmtMem(r.memoryKb)}</td>
                        <td className={`px-3 py-2.5 tabular-nums ${dm.tone}`}>{dm.text}</td>
                        <td className="px-3 py-2.5 tabular-nums">{fmtPsnr(r.psnr)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{fmtSsim(r.ssim)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Recommendation results={runs} scope={`this ${OPERATION_BY_ID[batch.operation].label.toLowerCase()} comparison`} />
        </div>
      )}
    </>
  );
}
