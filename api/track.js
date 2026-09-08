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

  const type = body.type === "click" ? "click" : "view";
  const path = String(body.path || "/").slice(0, 200);
  const label = type === "click" ? String(body.label || "").slice(0, 80) : null;
  const ip = (req.headers["x-forwarded-for"] || "?").split(",")[0].trim();
  const ua = String(req.headers["user-agent"] || "").slice(0, 300);
  const ref = String(req.headers.referer || req.headers.referrer || "").slice(0, 300);

  // daily bucket key — one blob per day per type
  const now = new Date();
  const day = new Date(now.getTime() + 7 * 3600e3).toISOString().slice(0, 10); // WIB-ish
  const file = `analytics/${day}-${type}.jsonl`;

  const line = JSON.stringify({ t: Date.now(), path, label, ip, ua, ref }) + "\n";

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // ponytail: in-memory fallback, lost on cold start — set Blob token for durability
      globalThis.__hits = globalThis.__hits || [];
      globalThis.__hits.push(line);
    } else {
      const { put, head } = await import("@vercel/blob");
      let prev = "";
      try {
        const h = await head(file);
        prev = await (await fetch(h.url)).text();
      } catch (_) { /* first write today */ }
      await put(file, prev + line, { access: "public", addRandomSuffix: false, allowOverwrite: true });
    }
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: "store failed", detail: String(e && e.message) });
  }
}
