# ask-LouAI

A small Python service that lets renters ask questions about a specific
listing ("Ask LouAI" on a posting) and get an answer via **semantic
search over that listing's own data** — no external LLM call, no API key
for the chat itself.

## How it works

1. The frontend calls `POST /ask` with a `listing_id` and a `question`.
2. The service fetches that listing row from Supabase (the same project
   the rest of the marketplace app uses) and turns each field into a
   short natural-language fact: title, location, price, pet policy,
   lease term, tags, rating, description, etc. That's the listing's
   "knowledge base."
3. Both the question and every knowledge-base sentence are embedded with
   a local `sentence-transformers` model (Hugging Face, runs on-device,
   no API key).
4. Cosine similarity ranks the sentences against the question; the
   best-matching fact is returned as the answer, along with the runner-up
   matches so the frontend can show alternatives.
5. Each listing's knowledge base is cached in memory for
   `KB_CACHE_TTL_SECONDS` (default 5 minutes) so repeated questions on the
   same posting don't re-embed on every request. Pass `"refresh": true`
   in the request to force a reload (e.g. right after the owner edits the
   listing).

## Setup

```bash
cd ask-LouAI
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

This service reads its config from the **marketplace project's root
`.env`** (`../.env`, see `../.env.example`) instead of its own — it reuses
the same `SUPABASE_URL` / `SUPABASE_SECRET_KEY` the Node API already uses
(see `../server/lib/supabaseAdmin.ts`), read server-side via the
service-role key. If that root `.env` doesn't exist yet, copy
`../.env.example` to `../.env` and fill it in. The optional
`EMBEDDING_MODEL` / `KB_CACHE_TTL_SECONDS` / `MIN_CONFIDENCE` /
`CORS_ORIGINS` vars (also documented in `../.env.example`) can be added to
that same file — see `app/config.py` for their defaults.

## Run

```bash
uvicorn app.main:app --reload --port 8008
```

## Example request

```bash
curl -X POST http://localhost:8008/ask \
  -H "Content-Type: application/json" \
  -d '{"listing_id": "<uuid>", "question": "Are pets allowed?"}'
```

```json
{
  "listing_id": "<uuid>",
  "question": "Are pets allowed?",
  "answer": "Pet policy: Cats and small dogs welcome, $50/mo pet rent.",
  "confident": true,
  "matches": [
    { "field": "pet_policy", "text": "Pet policy: Cats and small dogs welcome, $50/mo pet rent.", "score": 0.71 },
    { "field": "description", "text": "...", "score": 0.22 }
  ]
}
```

## Tests

```bash
pip install -r requirements-dev.txt
pytest
```

The test suite only covers the network-free parts (knowledge-base
construction, answer selection) — it doesn't download the embedding model
or call Supabase.

The "Ask LouAI" button on the listing detail page (`src/components/AskLouAiPanel.tsx`)
calls this service's `/ask` endpoint directly from the browser, via
`VITE_ASK_LOUAI_URL` (see `../.env.example`).

## Deploying

This is a standalone process (not a Vercel serverless function like
`api/`) — it needs a host that runs a long-lived container, since it
keeps each listing's embeddings cached in memory. A `Dockerfile` is
included so it can run on Render, Railway, Fly.io, or any other
container host. Steps for Render (similar on Railway):

1. Push this repo to GitHub (already done if you're reading this from
   the deployed checkout).
2. Render dashboard → **New → Web Service** → connect the repo.
3. Set **Root Directory** to `marketplace/ask-LouAI` (Render builds the
   `Dockerfile` it finds there automatically — no separate build/start
   command needed).
4. Add environment variables in the Render dashboard (these are real
   process env vars, not a `.env` file, and take priority over
   `app/config.py`'s `.env` lookup — see `app/config.py`):
   - `SUPABASE_URL`, `SUPABASE_SECRET_KEY` — same values as the Node API.
   - `CORS_ORIGINS` — your deployed frontend's origin(s), e.g.
     `https://your-app.vercel.app`. Without this, the browser call from
     the deployed frontend will be blocked by CORS.
   - Optionally `EMBEDDING_MODEL`, `KB_CACHE_TTL_SECONDS`, `MIN_CONFIDENCE`.
5. Deploy. Render gives you a public URL, e.g.
   `https://ask-louai.onrender.com`.
6. Set `VITE_ASK_LOUAI_URL` to that URL in the **frontend's** deploy
   (Vercel project settings) and redeploy the frontend — it's a
   `VITE_`-prefixed var baked in at build time, so a redeploy is
   required for the change to take effect.
7. Verify: `curl https://ask-louai.onrender.com/health`.

Free/hobby tiers on these platforms spin the container down when idle,
so the first request after a while will be slow (~30-60s cold start).
That's a platform limitation, not something to fix in this service.
