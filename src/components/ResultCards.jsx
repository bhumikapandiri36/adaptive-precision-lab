import { Activity, Gauge, MemoryStick, Timer } from 'lucide-react';
import { Metric } from './ui.jsx';
import { memParts, psnrQuality, ssimQuality, timeParts } from '../lib/format';

export default function ResultCards({ run }) {
  const browser = run?.engine === 'browser';
  const time = run ? timeParts(run.timeMs) : { value: '—', unit: '' };
  const mem = run ? memParts(run.memoryKb) : { value: '—', unit: '' };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric
        icon={Timer}
        tone="blue"
        label="Execution time"
        value={time.value}
        unit={time.unit}
        hint={run ? (browser ? 'Median of 3 runs, JavaScript emulation' : 'Measured by the FastAPI backend') : 'Run an image to measure'}
      />
      <Metric
        icon={MemoryStick}
        tone="violet"
        label="Memory usage"
        value={mem.value}
        unit={mem.unit}
        hint={run ? (browser ? 'Input and output buffers at this format width' : 'Reported by the FastAPI backend') : 'Run an image to measure'}
      />
      <Metric
        icon={Gauge}
        tone="sky"
        label="PSNR"
        value={run ? (run.psnr >= 99 ? '∞' : run.psnr.toFixed(2)) : '—'}
        unit={run && run.psnr < 99 ? 'dB' : ''}
        hint={run ? psnrQuality(run.psnr) : 'Higher is closer to the reference'}
      />
      <Metric
        icon={Activity}
        tone="fuchsia"
        label="SSIM"
        value={run ? run.ssim.toFixed(4) : '—'}
        hint={run ? ssimQuality(run.ssim) : 'Closer to 1 is more similar'}
      />
    </div>
  );
}
