/* POST /api/track — privacy-friendly page-view + click events.
   Storage: Vercel Blob (if BLOB_READ_WRITE_TOKEN set) else in-memory. */
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }

  let body = {};
  try {
    const raw = await new Promise((resolve) => {
      let d = "";
      req.on("data", (c) => { d += c; if (d.length > 2048) { resolve(null); req.destroy(); } });
      req.on("end", () => resolve(d));
      setTimeout(() => resolve(d || null), 3000);
    });
    if (!raw) throw new Error("no body");
    body = JSON.parse(raw);
  } catch (_) { res.status(400).json({ error: "bad body" }); return; }

  /* PRD §18 — kosakata event. Selain view/click, nama event yang dikenal
     disimpan sebagai kind "event" (analytics/<hari>-event.jsonl) supaya jumlah
     file per hari tetap sedikit, tapi event §18 tidak lagi salah label "view". */
  const EVENT_NAMES = new Set([
    "page_view", "scroll_depth", "hero_cta_click", "project_view", "gallery_thumb_click",
    "filter_apply", "contact_form_start", "contact_form_submit", "contact_form_error",
    "whatsapp_click", "email_click", "web_vitals",
  ]);
  const rawType = String(body.type || "");
  const kind = rawType === "click" ? "click" : EVENT_NAMES.has(rawType) ? "event" : "view";
  const event = kind === "click" ? "click" : kind === "event" ? rawType : "view";
  const path = String(body.path || "/").slice(0, 200);
  const label = kind === "click" ? String(body.label || "").slice(0, 80) : null;
  const props = body.props && typeof body.props === "object" ? JSON.stringify(body.props).slice(0, 300) : null;
  const ip = (req.headers["x-forwarded-for"] || "?").split(",")[0].trim();
  const ua = String(req.headers["user-agent"] || "").slice(0, 300);
  const ref = String(req.headers.referer || req.headers.referrer || "").slice(0, 300);

  // daily bucket key — one blob per day per type
  const now = new Date();
  const day = new Date(now.getTime() + 7 * 3600e3).toISOString().slice(0, 10); // WIB-ish
  const file = `analytics/${day}-${kind}.jsonl`;

  const line = JSON.stringify({ t: Date.now(), e: event, path, label, props, ip, ua, ref }) + "\n";

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // ponytail: in-memory fallback, lost on cold start — set Blob token for durability
      globalThis.__hits = globalThis.__hits || [];
      globalThis.__hits.push(line);
    } else {
      const { put, head, getDownloadUrl } = await import("@vercel/blob");
      let prev = "";
      try {
        const h = await head(file);
        const dl = await getDownloadUrl(h.url);
        prev = await (await fetch(dl + "&cb=" + Date.now(), { cache: "no-store" })).text();
      } catch (_) { /* first write today */ }
      await put(file, prev + line, { access: "public", addRandomSuffix: false, allowOverwrite: true });
    }
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: "store failed", detail: String(e && e.message) });
  }
}
