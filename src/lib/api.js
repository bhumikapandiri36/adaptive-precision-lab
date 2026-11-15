// API layer. The FastAPI contract is documented on the About page and in README.md.
import { processLocal } from './engine';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const API_BASE = BASE;
export const BACKEND_CONFIGURED = Boolean(BASE);

/** GET /api/health -> true when the FastAPI server answers. */
export async function checkHealth() {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** POST /api/process (multipart/form-data: file, operation, precision) */
async function processRemote(file, operation, precision) {
  const form = new FormData();
  form.append('file', file);
  form.append('operation', operation);
  form.append('precision', precision);

  const res = await fetch(`${BASE}/api/process`, { method: 'POST', body: form });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body.detail ? ` – ${typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)}` : '';
    } catch {
      /* ignore body parse errors */
    }
    throw new Error(`The backend answered with status ${res.status}${detail}`);
  }
  const d = await res.json();
  const image = d.processed_image || '';
  return {
    image: image.startsWith('data:') ? image : `data:image/png;base64,${image}`,
    timeMs: Number(d.execution_time_ms),
    memoryKb: Number(d.memory_kb),
    psnr: Number(d.psnr),
    ssim: Number(d.ssim),
    width: d.width,
    height: d.height,
    engine: 'fastapi',
  };
}

export async function processImage({ file, operation, precision, engine }) {
  if (engine === 'backend') {
    try {
      return await processRemote(file, operation, precision);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(`Could not reach the FastAPI server at ${BASE}. Start it, or switch to the browser engine.`);
      }
      throw err;
    }
  }
  return processLocal(file, operation, precision);
}
