/* Dev/preview server untuk dist/ dengan SPA fallback (path routing /studio).
   Pakai: npm run serve → http://localhost:4173
   (Vite dev server juga mendukung history fallback untuk npm run dev.) */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.argv[2] || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url || "/", "http://x").pathname);
    let file = path.join(root, p);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      /* SPA fallback — /studio & rute client lain → index.html */
      file = path.join(root, "index.html");
    }
    const ext = path.extname(file).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => {
    console.log(`serve dist → http://localhost:${port} (SPA fallback ON: /studio, /admin)`);
  });
