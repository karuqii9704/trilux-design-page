#!/usr/bin/env python3
"""QA static server untuk dist/ dengan SPA fallback (path routing /studio, /admin).
Throwaway — produksi ditangani Vercel rewrites. Pakai: python scripts/qa_serve.py [port]"""
import http.server, socketserver, os, sys, urllib.parse

DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")
PORT = int(sys.argv[1] if len(sys.argv) > 1 else 4181)

MIME = {
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
}

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # decode & bersihkan
        p = urllib.parse.unquote(urllib.parse.urlparse(path).path)
        local = os.path.normpath(os.path.join(DIST, p.lstrip("/")))
        if os.path.isdir(local):
            local = os.path.join(local, "index.html")
        if not os.path.exists(local):
            local = os.path.join(DIST, "index.html")  # SPA fallback
        return local

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass  # sunyi

with socketserver.TCPServer(("127.0.0.1", PORT), SPAHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f"qa_serve → http://127.0.0.1:{PORT} (SPA fallback ON: /studio, /admin)", flush=True)
    httpd.serve_forever()
