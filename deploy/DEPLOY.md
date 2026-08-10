# DF Calculator — cloud sync + deploy guide

This gives you **automatic cross-device sync** (Android phone ⇄ Windows PC) with:

- The **app** hosted on **Vercel** (a static site).
- Your **data** stored in **Cloudflare KV**, behind a tiny **Cloudflare Worker** API.
- A single **shared secret** instead of user accounts (fine for one private user).

You do the deploy steps once, on your own accounts. Total time ~15 minutes.

---

## Part A — Cloudflare Worker + KV (the storage)

You need a free Cloudflare account and Node.js installed.

1. **Install Wrangler** (Cloudflare's CLI):
   ```
   npm install -g wrangler
   wrangler login
   ```

2. **Create the KV namespace:**
   ```
   cd deploy
   wrangler kv namespace create DF_KV
   ```
   It prints something like `id = "abc123…"`. Copy that id.

3. **Paste the id** into `wrangler.toml` (replace `PASTE_YOUR_KV_NAMESPACE_ID_HERE`).

4. **Set your secret** (make up a long random password — this is what protects your data):
   ```
   wrangler secret put SYNC_SECRET
   ```
   Paste your secret when prompted. Keep it somewhere safe — you'll type it into the app on each device.

5. **Deploy the Worker:**
   ```
   wrangler deploy
   ```
   It prints your Worker URL, e.g. `https://df-sync.YOURNAME.workers.dev`. Copy it.

Your storage is now live. Test it (should say `unauthorized` without the key, `empty`/`404` with it):
```
curl -H "X-Sync-Key: YOUR_SECRET" https://df-sync.YOURNAME.workers.dev/data
```

---

## Part B — The app on Vercel (the frontend)

The app is a single self-contained HTML file. First build that file, then deploy it.

1. **Build the standalone file.** In the chat, ask: *"save as standalone HTML"*. You'll get one
   `.html` file that runs offline with no other files needed. Put it in a folder, renamed
   `index.html`.

2. **Deploy to Vercel** (free). Easiest is drag-and-drop:
   - Go to vercel.com → **Add New… → Project**.
   - Drag the folder containing `index.html`, or connect a Git repo containing it.
   - Deploy. You get a URL like `https://df-calculator.vercel.app`.

   Or with the CLI:
   ```
   npm i -g vercel
   cd folder-with-index-html
   vercel --prod
   ```

---

## Part C — Connect the app to your storage (each device)

1. Open your Vercel app URL on the device.
2. Go to the **Backup & storage** tab → **Cloudflare cloud sync**.
3. Paste your **Worker URL** and **Secret key**. Leave **Auto-sync** on.
4. Tap **Push to cloud now** once on the device that already has your data (to seed the cloud).
5. On the other device, paste the same URL + secret and tap **Pull & merge from cloud**.

From then on it's automatic: the app pulls when it opens and pushes a few seconds after every
edit. Conflicts are resolved by newest-edit-per-month, so as long as you edit one device at a
time (as you said), nothing is ever lost.

---

## Notes & safety

- **The secret is your only protection.** Anyone with the URL *and* secret can read/write your
  data. Use a long random secret; don't share the URL publicly with the secret.
- **KV free tier** is far more than enough for this (100k reads/day, 1k writes/day).
- **Backups still work.** The Download/Merge/Restore buttons are unchanged — keep taking the odd
  local backup as a belt-and-braces copy.
- **Cost:** Cloudflare Worker + KV and Vercel static hosting are all free at this scale.
