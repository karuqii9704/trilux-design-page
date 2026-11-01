#!/usr/bin/env node
/* Tiny static file server with Vercel-style clean routes (no deps).
   Usage: node scripts/serve.mjs [port] — defaults to 3000, serves repo root. */
import http from "http";
import { readFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const siteRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.argv[2] || 3000);
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript",
  ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".gif": "image/gif", ".json": "application/json",
  ".woff2": "font/woff2", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8", ".pdf": "application/pdf",
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let p = decodeURIComponent(url.pathname);
  if (p === "/") p = "/index.html";
  let fp = path.join(siteRoot, p);
  try {
    const st = await stat(fp);
    if (st.isDirectory()) fp = path.join(fp, "index.html");
  } catch { /* fallthrough */ }
  if (!path.extname(fp)) {
    // clean route: /about -> /about/index.html, else /about.html
    try { await stat(path.join(fp, "index.html")); fp = path.join(fp, "index.html"); }
    catch {
      try { await stat(fp + ".html"); fp = fp + ".html"; } catch { /* 404 below */ }
    }
  }
  try {
    const data = await readFile(fp);
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 not found: " + p);
  }
}).listen(PORT, () => console.log("trilux-static: http://localhost:" + PORT + "  root=" + siteRoot));
