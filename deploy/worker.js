// Cloudflare Worker — DF Calculator cloud sync (KV-backed, single-user)
// Stores the whole app dataset as one JSON blob in KV under key "dataset".
// Auth: a shared secret sent in the X-Sync-Key header (must match SYNC_SECRET).
//
// Endpoints:
//   GET  /data  -> returns the stored JSON (404 if never saved)
//   PUT  /data  -> overwrites the stored JSON with the request body
//   (OPTIONS handled for CORS preflight)
//
// Bindings required (see wrangler.toml):
//   KV namespace  : DF_KV
//   Secret        : SYNC_SECRET   (set with: wrangler secret put SYNC_SECRET)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Sync-Key",
  "Access-Control-Max-Age": "86400",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/data") {
      return json({ error: "not found" }, 404);
    }

    // shared-secret auth
    const key = request.headers.get("X-Sync-Key");
    if (!env.SYNC_SECRET || key !== env.SYNC_SECRET) {
      return json({ error: "unauthorized" }, 401);
    }

    if (request.method === "GET") {
      const stored = await env.DF_KV.get("dataset");
      if (stored === null) return json({ error: "empty" }, 404);
      return new Response(stored, {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    if (request.method === "PUT") {
      const text = await request.text();
      try {
        JSON.parse(text); // validate it's JSON before storing
      } catch (e) {
        return json({ error: "body must be valid JSON" }, 400);
      }
      await env.DF_KV.put("dataset", text);
      return json({ ok: true, savedAt: new Date().toISOString() });
    }

    return json({ error: "method not allowed" }, 405);
  },
};
