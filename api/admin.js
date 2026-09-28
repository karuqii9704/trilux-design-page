/* Admin API — token-authenticated CMS + stats.
   GET  ?stats=1            → aggregated analytics
   GET                      → current projects.json content
   POST {projects: {...}}   → save data/projects.json + trigger redeploy */
import fs from "fs";
import path from "path";
import { blobTokenPresent, readBlobText, loadBlob, blobErrorResponse, logBlobFailure } from "./_blob.js";

function checkAuth(req) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : (req.query.t || "");
  const expected = process.env.ADMIN_TOKEN;
  return expected && token.length > 20 && token === expected;
}

function aggregate(lines) {
  const byPath = {}, ips = new Set(), uas = {};
  for (const l of lines) {
    let o; try { o = JSON.parse(l); } catch (_) { continue; }
    byPath[o.path] = (byPath[o.path] || 0) + 1;
    if (o.ip) ips.add(o.ip);
    if (o.ua) {
      const b = /Edg\//.test(o.ua) ? "Edge" : /OPR\//.test(o.ua) ? "Opera" : /Chrome\//.test(o.ua) ? "Chrome" : /Firefox\//.test(o.ua) ? "Firefox" : /Safari\//.test(o.ua) ? "Safari" : /bot|spider|crawl/i.test(o.ua) ? "Bot" : "Other";
      uas[b] = (uas[b] || 0) + 1;
    }
  }
  return { viewsByPath: byPath, uniqueVisitors: ips.size, ips: [...ips], browsers: uas };
}

/* Read CMS JSON: Blob copy wins; local file is the seed. Shared with build.js logic.
   Kalau Blob TIDAK BISA DIBACA, jangan diam-diam menyajikan file lokal: owner bisa
   mengira itu isi terbaru lalu menyimpannya kembali, menimpa CMS yang lebih baru. */
async function readProjectsJson() {
  const local = path.join(process.cwd(), "data", "projects.json");
  if (!blobTokenPresent()) {
    return fs.readFileSync(local, "utf8");
  }
  const remote = await readBlobText("cms/projects.json"); // null = CMS belum pernah diisi
  if (remote === null) return fs.readFileSync(local, "utf8");
  try {
    JSON.parse(remote);
  } catch (e) {
    const err = new Error("cms/projects.json di Blob bukan JSON valid: " + (e && e.message));
    err.code = "cms_invalid_json";
    logBlobFailure("admin:parse cms/projects.json", err);
    throw err;
  }
  return remote;
}

export default async function handler(req, res) {
  /* ---- public CMS read (no auth) — runtime hydration for index.html ---- */
  if (req.method === "GET" && req.query.cms === "1") {
    try {
      const txt = await readProjectsJson();
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(txt);
    } catch (e) {
      res.status(500).json({ error: "read failed", detail: String(e && e.message) });
    }
    return;
  }

  if (!checkAuth(req)) { res.status(401).json({ error: "unauthorized" }); return; }

  /* ---- stats ---- */
  if (req.method === "GET" && (req.query.stats === "1" || req.query.stats === "true")) {
    const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
    const days = Math.min(parseInt(req.query.days || "30", 10), 90);
    const out = { rangeDays: days, totalViews: 0, totalClicks: 0, perDay: [], topPaths: {}, topClicks: {}, uniqueVisitors: 0, browsers: {} };

    const visitorIps = new Set();
    // Baca per hari. null = bucket belum ada (normal, hitung 0); error nyata dicatat
    // sebagai warning supaya dashboard tidak melaporkan 0 seolah-olah benar.
    const warnings = [];
    const readDay = async (file) => {
      try {
        return await readBlobText(file); // string | null
      } catch (e) {
        logBlobFailure("admin:stats " + file, e);
        warnings.push({ file, code: (e && e.code) || "blob_error" });
        return undefined; // tidak diketahui
      }
    };

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() + 7 * 3600e3 - i * 864e5).toISOString().slice(0, 10);
      const rec = { date: d, views: 0, visitors: null };
      if (hasBlob) {
        const vt = await readDay(`analytics/${d}-view.jsonl`);
        const lines = vt ? vt.trim().split("\n") : [];
        if (vt === undefined) rec.views = null; else rec.views = lines.length;
        const agg = aggregate(lines);
        if (vt !== undefined) rec.visitors = agg.uniqueVisitors;
        for (const ip of agg.ips || []) visitorIps.add(ip);
        for (const [p, n] of Object.entries(agg.viewsByPath)) out.topPaths[p] = (out.topPaths[p] || 0) + n;
        for (const [b, n] of Object.entries(agg.browsers)) out.browsers[b] = (out.browsers[b] || 0) + n;

        const ct = await readDay(`analytics/${d}-click.jsonl`);
        const clines = ct ? ct.trim().split("\n") : [];
        const cagg = aggregate(clines);
        if (ct !== undefined) out.totalClicks += clines.length;
        for (const l of clines) { try { const o = JSON.parse(l); if (o.label) out.topClicks[o.label] = (out.topClicks[o.label] || 0) + 1; } catch (_) {} }
        if (rec.views !== null) out.totalViews += rec.views;
      } else {
        const mem = globalThis.__hits || [];
        rec.views = mem.filter((l) => l.includes(`-${d}`) ).length; // ponytail: rough in-memory fallback only
        for (const l of mem) {
          try { if (JSON.parse(l).ip) visitorIps.add(JSON.parse(l).ip); } catch (_) {}
        }
        out.totalViews += rec.views;
      }
      out.perDay.push(rec);
    }
    out.uniqueVisitors = visitorIps.size;
    if (warnings.length) { out.degraded = true; out.warnings = warnings.slice(0, 10); }
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(out);
    return;
  }

  /* ---- leads inbox ---- */
  if (req.method === "GET" && (req.query.leads === "1" || req.query.leads === "true")) {
    try {
      let text = "";
      if (blobTokenPresent()) {
        // null = belum ada lead; error dilempar supaya tidak dilaporkan sebagai "0 lead".
        text = (await readBlobText("cms/leads.jsonl")) ?? "";
      } else {
        try { text = fs.readFileSync("/tmp/leads.jsonl", "utf8"); } catch (_) { text = ""; }
      }
      const leads = text.trim() ? text.trim().split("\n").map((l) => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean) : [];
      leads.reverse(); // newest first
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ leads: leads.slice(0, 200), total: leads.length });
    } catch (e) {
      logBlobFailure("admin:leads cms/leads.jsonl", e);
      res.status(503).json({ error: "leads read failed", code: (e && e.code) || "blob_error", detail: String(e && e.message) });
    }
    return;
  }

  /* ---- CMS read ---- */
  if (req.method === "GET") {
    try {
      const data = await readProjectsJson();
      res.status(200).json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: "read failed", detail: String(e && e.message) });
    }
    return;
  }

  /* ---- CMS write ---- */
  if (req.method === "POST") {
    let body;
    try {
      const b = req.body;
      let raw;
      if (typeof b === "string") raw = b;
      else if (Buffer.isBuffer(b)) raw = b.toString("utf8");
      else if (b instanceof Uint8Array) raw = new TextDecoder().decode(b);
      else if (b && typeof b === "object") raw = null; // already parsed
      else raw = String(b ?? "");
      body = raw === null ? b : JSON.parse(raw);
    } catch (_) { res.status(400).json({ error: "bad json" }); return; }
    const projects = body.projects;
    const valid = projects && typeof projects === "object"
      && (projects.featured || Array.isArray(projects.projects));
    if (!valid) {
      res.status(422).json({ error: "payload must be {projects:{featured|projects[]}}" });
      return;
    }
    try {
      const content = JSON.stringify(projects, null, 2) + "\n";
      JSON.stringify(projects); // validate round-trip

      let stored = "none";
      if (blobTokenPresent()) {
        const { put } = await loadBlob();
        await put("cms/projects.json", content, { access: "public", addRandomSuffix: false, allowOverwrite: true });
        stored = "blob";
      } else {
        // ponytail: /tmp fallback is per-instance and lost on redeploy — set Blob token for durable CMS
        fs.writeFileSync("/tmp/projects.json", content);
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
      logBlobFailure("admin:write cms/projects.json", e);
      res.status(500).json({ error: "write failed", code: (e && e.code) || "blob_put_failed", detail: String(e && e.message) });
    }
    return;
  }

  res.status(405).json({ error: "method" });
}
