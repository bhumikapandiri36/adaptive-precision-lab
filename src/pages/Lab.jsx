import { AlertCircle, FlaskConical, GitCompareArrows, Loader2, Play, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext.jsx';
import { Badge, Button, EmptyState, PageHeader, Panel } from '../components/ui.jsx';
import Dropzone from '../components/Dropzone.jsx';
import OperationPicker from '../components/OperationPicker.jsx';
import PrecisionPicker from '../components/PrecisionPicker.jsx';
import ImageCompare from '../components/ImageCompare.jsx';
import ResultCards from '../components/ResultCards.jsx';
import { OPERATION_BY_ID, PRECISION_BY_ID } from '../lib/precision';

export default function Lab() {
  const { image, loadFile, loadError, operation, setOperation, precision, setPrecision, engine, lastRun, runSingle, runAll, status } = useLab();
  const navigate = useNavigate();
  const running = status.state === 'running';

  const compareAll = async () => {
    if (await runAll()) navigate('/compare');
  };

  return (
    <>
      <PageHeader title="Image processing lab" description="Upload an image, choose an operation and a precision, then inspect the processed result and its measured cost." />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Panel title="Image">
            <Dropzone image={image} onFile={loadFile} error={loadError} />
          </Panel>
          <Panel title="Operation">
            <OperationPicker value={operation} onChange={setOperation} />
          </Panel>
          <Panel title="Precision">
            <PrecisionPicker value={precision} onChange={setPrecision} />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{PRECISION_BY_ID[precision].tradeoff}</p>
          </Panel>
          <div className="grid gap-3">
            <Button size="lg" onClick={runSingle} disabled={!image || running}>
              {running ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              Process image
            </Button>
            <Button variant="secondary" size="lg" onClick={compareAll} disabled={!image || running}>
              <GitCompareArrows size={18} />
              Compare all precisions
            </Button>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel
            title="Output"
            description={image ? `${OPERATION_BY_ID[operation].label} at ${PRECISION_BY_ID[precision].label}` : undefined}
            action={lastRun && <Badge color={PRECISION_BY_ID[lastRun.precision].color}>{PRECISION_BY_ID[lastRun.precision].label} · {lastRun.engine === 'browser' ? 'Browser' : 'FastAPI'}</Badge>}
          >
            <div className="mt-4 relative">
              {!image && (
                <EmptyState
                  icon={Upload}
                  title="No image yet"
                  description="Upload an image on the left to preview it here and run an operation."
                />
              )}
              {image && lastRun && <ImageCompare original={image.url} processed={lastRun.image} />}
              {image && !lastRun && (
                <div className="relative overflow-hidden rounded-xl bg-ink-900">
                  <img src={image.url} alt="Original upload" className="block max-h-[520px] w-full object-contain" />
                  <span className="absolute left-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 text-xs font-semibold text-white">Original</span>
                  {!running && (
                    <p className="absolute inset-x-0 bottom-0 bg-ink-950/80 px-4 py-3 text-sm text-slate-300">
                      Ready. Select Process image to see the result next to the original.
                    </p>
                  )}
                </div>
              )}
              {running && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-ink-950/75" role="status">
                  <p className="flex items-center gap-3 text-sm font-medium text-white">
                    <Loader2 size={18} className="animate-spin text-brand-violet" />
                    {status.label}
                  </p>
                </div>
              )}
            </div>
            {status.state === 'error' && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {status.error}
              </p>
            )}
          </Panel>

          <ResultCards run={lastRun} />

          {lastRun && (
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <FlaskConical size={14} className="mt-0.5 shrink-0" />
              {lastRun.engine === 'browser'
                ? `Processed at ${lastRun.width} × ${lastRun.height} px in your browser. PSNR and SSIM compare against a float64 run of the same operation. Timing reflects JavaScript, not dedicated hardware.`
                : `Processed by the FastAPI backend at ${lastRun.width} × ${lastRun.height} px.`}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
