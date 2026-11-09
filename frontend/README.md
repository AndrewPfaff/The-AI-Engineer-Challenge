# Steady — the chat UI for your mental coach

This is the Next.js App Router frontend for the FastAPI coach in `/api`. Warm paper background, high-contrast ink, Stripe-ish purple send button. It talks to **`POST /api/chat`** and nothing else.

Locally it proxies `/api/*` to `http://localhost:8000`. On Vercel, those same URLs hit `api/index.py`.

## Run it locally (two terminals)

You need Node.js 20+ and the backend from the repo root.

**Terminal 1 — FastAPI**

```bash
cd /path/to/The-AI-Engineer-Challenge
uv sync
export OPENAI_API_KEY=sk-your-key-here
uv run uvicorn api.index:app --reload
```

Backend lives at [http://localhost:8000](http://localhost:8000).

**Terminal 2 — Next.js**

```bash
cd /path/to/The-AI-Engineer-Challenge/frontend
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**. Type a message, hit Enter (Shift+Enter for a new line), and the coach should answer.

If the UI loads but replies fail, the backend is usually down or `OPENAI_API_KEY` is missing.

## Deploy with the backend on Vercel

From the **repository root** (not `frontend/`), so Vercel can see both Next.js and `api/index.py`:

```bash
npm install -g vercel
cd /path/to/The-AI-Engineer-Challenge
vercel
```

Add `OPENAI_API_KEY` in the Vercel project settings. `vercel.json` sends `/api/*` to FastAPI and everything else to this Next app.

## Useful scripts

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```
