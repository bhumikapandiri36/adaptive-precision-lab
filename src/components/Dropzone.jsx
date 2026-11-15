import { useRef, useState } from 'react';
import { AlertCircle, ImagePlus } from 'lucide-react';
import { cx } from './ui.jsx';

export default function Dropzone({ image, onFile, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const open = () => inputRef.current?.click();
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an image"
        onClick={open}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cx(
          'cursor-pointer rounded-xl border border-dashed transition-colors',
          dragging ? 'border-brand-violet bg-brand-violet/10' : 'border-white/15 bg-ink-900/60 hover:border-brand-blue/60',
          image ? 'p-3' : 'px-4 py-9 text-center'
        )}
      >
        {image ? (
          <div className="flex items-center gap-3">
            <img src={image.url} alt="Original upload" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-white">{image.name}</p>
              <p className="text-xs text-slate-400">
                {image.width} × {image.height} px · {image.sizeKb.toFixed(0)} KB
              </p>
              <p className="mt-0.5 text-xs text-brand-blue">Drop or click to replace</p>
            </div>
          </div>
        ) : (
          <>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <ImagePlus size={21} />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">Drop an image here</p>
            <p className="mt-1 text-xs text-slate-400">or click to browse · PNG, JPEG or WebP up to 15 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ''))} />
      </div>
      {error && (
        <p className="mt-2 flex items-start gap-2 text-xs text-rose-300" role="alert">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
