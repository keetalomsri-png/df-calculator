# DF Calculator

Radiologist monthly-DF calculator. Runs entirely in the browser; optional
cross-device sync via a Cloudflare Worker + KV.

## Repo layout
- `index.html` — the built, self-contained app (this is what Vercel serves).
- `deploy/worker.js` — Cloudflare Worker (sync API).
- `deploy/wrangler.toml` — Worker config (KV namespace id).
- `deploy/DEPLOY.md` — full setup guide.
- `.github/workflows/deploy-worker.yml` — auto-deploys the Worker on push.

## Deploy via GitHub (recommended)

### App on Vercel
1. Push this repo to GitHub.
2. vercel.com → Add New → Project → import this repo → Deploy.
   Vercel serves `index.html` at the root. Every push auto-deploys.

### Worker on Cloudflare (auto-deploy)
One-time setup so pushes redeploy the Worker:
1. Create the KV namespace and paste its id into `deploy/wrangler.toml`:
   `wrangler kv namespace create DF_KV`
2. Set the runtime secret once (not stored in the repo):
   `cd deploy && wrangler secret put SYNC_SECRET`
3. In GitHub → repo Settings → Secrets and variables → Actions, add:
   - `CLOUDFLARE_API_TOKEN` (create at Cloudflare → My Profile → API Tokens →
     "Edit Cloudflare Workers" template)
   - `CLOUDFLARE_ACCOUNT_ID` (Cloudflare dashboard → Workers → Account ID)
4. Push. The `Deploy Worker` action deploys `deploy/worker.js` automatically.

## Updating the app
`index.html` is a built file. When the app changes, regenerate it (ask in the
design tool for a fresh standalone build), replace `index.html`, commit, push —
Vercel redeploys. Worker changes: edit `deploy/worker.js`, push — the action
redeploys.
