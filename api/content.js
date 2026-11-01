/* Content CMS API — public read + token-auth write for data/content.json.
   GET  /api/content         → content.json (Blob wins, local seed fallback)
   POST {content:{...}}      → save + trigger redeploy (ADMIN_TOKEN required) */
import fs from "fs";
import path from "path";

function checkAuth(req) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : (req.query.t || "");
  const expected = process.env.ADMIN_TOKEN;
  return expected && token.length > 20 && token === expected;
}

async function readBlobText(file) {
  try {
    const { head } = await import("@vercel/blob");
    const h = await head(file);
    return await (await fetch(h.url)).text();
  } catch (_) { return ""; }
}

async function readContentJson() {
  const local = path.join(process.cwd(), "data", "content.json");
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const remote = await readBlobText("cms/content.json");
      if (remote) { JSON.parse(remote); return remote; }
    } catch (_) { /* fall through to local */ }
  }
  return fs.readFileSync(local, "utf8");
}

export default async function handler(req, res) {
  /* ---- public read (no auth) — runtime hydration ---- */
  if (req.method === "GET") {
    try {
      const txt = await readContentJson();
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(txt);
    } catch (e) {
      res.status(500).json({ error: "read failed", detail: String(e && e.message) });
    }
    return;
  }

  if (!checkAuth(req)) { res.status(401).json({ error: "unauthorized" }); return; }

  /* ---- authed write ---- */
  if (req.method === "POST") {
    let body;
    try {
      const b = req.body;
      let raw;
      if (typeof b === "string") raw = b;
      else if (Buffer.isBuffer(b)) raw = b.toString("utf8");
      else if (b instanceof Uint8Array) raw = new TextDecoder().decode(b);
      else if (b && typeof b === "object") raw = null;
      else raw = String(b ?? "");
      body = raw === null ? b : JSON.parse(raw);
    } catch (_) { res.status(400).json({ error: "bad json" }); return; }

    const content = body && body.content;
    if (!content || typeof content !== "object") {
      res.status(422).json({ error: "payload must be {content:{...}}" });
      return;
    }
    try {
      const storedContent = JSON.stringify(content, null, 2) + "\n";
      JSON.parse(storedContent); // validate round-trip
      let stored = "none";
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = await import("@vercel/blob");
        await put("cms/content.json", storedContent, { access: "public", addRandomSuffix: false, allowOverwrite: true });
        stored = "blob";
      } else {
        // ponytail: /tmp fallback is per-instance — set Blob token for durable CMS
        fs.writeFileSync("/tmp/content.json", storedContent);
        stored = "tmp-ephemeral";
      }
      let deploy = null;
      if (process.env.VERCEL_DEPLOY_HOOK_URL) {
        try {
          const r = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
          deploy = r.ok ? "triggered" : "hook-failed-" + r.status;
        } catch (_) { deploy = "hook-error"; }
      } else {
        deploy = "no-deploy-hook-configured";
      }
      res.status(200).json({ ok: true, saved: stored, redeploy: deploy });
    } catch (e) {
      res.status(500).json({ error: "write failed", detail: String(e && e.message) });
    }
    return;
  }

  res.status(405).json({ error: "method" });
}
