import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BACKEND_CONFIGURED, checkHealth, processImage } from '../lib/api';
import { PRECISIONS, PRECISION_BY_ID } from '../lib/precision';

const LabContext = createContext(null);
const MAX_FILE_MB = 15;
const MAX_HISTORY = 40;

function readDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('This file could not be read as an image.'));
    img.src = url;
  });
}

export function LabProvider({ children }) {
  const [image, setImage] = useState(null); // { file, url, name, sizeKb, width, height }
  const [operation, setOperation] = useState('blur');
  const [precision, setPrecision] = useState('fp32');
  const [engine, setEngine] = useState(BACKEND_CONFIGURED ? 'backend' : 'browser');
  const [backendOnline, setBackendOnline] = useState(null);
  const [runs, setRuns] = useState([]); // session history, newest last
  const [lastRun, setLastRun] = useState(null);
  const [batch, setBatch] = useState(null); // { operation, fileName, runs: [one per precision] }
  const [status, setStatus] = useState({ state: 'idle', label: '', error: '' });
  const [loadError, setLoadError] = useState('');
  const counter = useRef(0);
  const urlRef = useRef(null);

  // Backend health check, only when a backend URL is configured.
  useEffect(() => {
    if (!BACKEND_CONFIGURED) return undefined;
    let active = true;
    const ping = async () => {
      const ok = await checkHealth();
      if (active) setBackendOnline(ok);
    };
    ping();
    const timer = setInterval(ping, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const loadFile = useCallback(async (file) => {
    setLoadError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLoadError('Choose an image file such as PNG, JPEG or WebP.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setLoadError(`Choose an image smaller than ${MAX_FILE_MB} MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await readDimensions(url);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setImage({ file, url, name: file.name, sizeKb: file.size / 1024, width, height });
      setLastRun(null);
      setBatch(null);
      setStatus({ state: 'idle', label: '', error: '' });
    } catch (err) {
      URL.revokeObjectURL(url);
      setLoadError(err.message);
    }
  }, []);

  const execute = useCallback(
    async (prec) => {
      const result = await processImage({ file: image.file, operation, precision: prec, engine });
      counter.current += 1;
      return { ...result, id: counter.current, timestamp: Date.now(), operation, precision: prec, fileName: image.name };
    },
    [image, operation, engine]
  );

  const runSingle = useCallback(async () => {
    if (!image) return false;
    setStatus({ state: 'running', label: `Processing with ${PRECISION_BY_ID[precision].label}`, error: '' });
    try {
      const run = await execute(precision);
      setLastRun(run);
      setRuns((prev) => [...prev, run].slice(-MAX_HISTORY));
      setStatus({ state: 'idle', label: '', error: '' });
      return true;
    } catch (err) {
      setStatus({ state: 'error', label: '', error: err.message });
      return false;
    }
  }, [image, precision, execute]);

  const runAll = useCallback(async () => {
    if (!image) return false;
    const results = [];
    try {
      for (let i = 0; i < PRECISIONS.length; i++) {
        const p = PRECISIONS[i];
        setStatus({ state: 'running', label: `Processing with ${p.label} (${i + 1} of ${PRECISIONS.length})`, error: '' });
        results.push(await execute(p.id));
      }
      setBatch({ operation, fileName: image.name, runs: results });
      setRuns((prev) => [...prev, ...results].slice(-MAX_HISTORY));
      setLastRun(results.find((r) => r.precision === precision) || results[0]);
      setStatus({ state: 'idle', label: '', error: '' });
      return true;
    } catch (err) {
      setStatus({ state: 'error', label: '', error: err.message });
      return false;
    }
  }, [image, operation, precision, execute]);

  const clearRuns = useCallback(() => {
    setRuns([]);
    setLastRun(null);
    setBatch(null);
  }, []);

  const value = useMemo(
    () => ({
      image, loadFile, loadError,
      operation, setOperation,
      precision, setPrecision,
      engine, setEngine, backendOnline,
      runs, lastRun, batch,
      status, runSingle, runAll, clearRuns,
    }),
    [image, loadFile, loadError, operation, precision, engine, backendOnline, runs, lastRun, batch, status, runSingle, runAll, clearRuns]
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used inside <LabProvider>');
  return ctx;
}
