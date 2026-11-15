# Adaptive Precision Image Processing Optimization (Zen Coders)

React + Vite + Tailwind CSS frontend for a Computer Organization and Architecture project.

## Run

    npm install
    npm run dev          # http://localhost:5173
    npm run build        # production build in dist/

## Engines

* **Browser** (default): emulates Integer, Q8.8 fixed point, FP32 and FP16 arithmetic and measures PSNR/SSIM against a float64 reference.
* **FastAPI**: copy `.env.example` to `.env`, set `VITE_API_BASE_URL=http://localhost:8000`, restart `npm run dev`.

## FastAPI contract

    GET  /api/health
    POST /api/process   multipart: file, operation (grayscale|blur|sharpen|edge), precision (integer|fixed|fp32|fp16)
    -> { processed_image (data URL or base64 PNG), execution_time_ms, memory_kb, psnr, ssim, width, height }

Enable CORS for the Vite origin:

    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])
