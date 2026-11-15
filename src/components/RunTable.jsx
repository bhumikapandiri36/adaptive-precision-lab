import { OPERATION_BY_ID, PRECISION_BY_ID } from '../lib/precision';
import { fmtMem, fmtPsnr, fmtSsim, fmtTime } from '../lib/format';

export default function RunTable({ runs }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs text-slate-500">
          <tr className="border-b border-white/[0.06]">
            {['Image', 'Operation', 'Precision', 'Time', 'Memory', 'PSNR', 'SSIM', 'Engine'].map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...runs].reverse().map((r) => (
            <tr key={r.id} className="border-b border-white/[0.04] last:border-0">
              <td className="max-w-[180px] truncate px-3 py-2.5 text-slate-300">{r.fileName}</td>
              <td className="px-3 py-2.5">{OPERATION_BY_ID[r.operation].label}</td>
              <td className="px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: PRECISION_BY_ID[r.precision].color }} />
                  {PRECISION_BY_ID[r.precision].label}
                </span>
              </td>
              <td className="px-3 py-2.5 tabular-nums">{fmtTime(r.timeMs)}</td>
              <td className="px-3 py-2.5 tabular-nums">{fmtMem(r.memoryKb)}</td>
              <td className="px-3 py-2.5 tabular-nums">{fmtPsnr(r.psnr)}</td>
              <td className="px-3 py-2.5 tabular-nums">{fmtSsim(r.ssim)}</td>
              <td className="px-3 py-2.5 text-slate-400">{r.engine === 'browser' ? 'Browser' : 'FastAPI'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
