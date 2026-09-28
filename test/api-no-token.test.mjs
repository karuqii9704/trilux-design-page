/* Smoke test handler admin/lead dengan TANPA BLOB_READ_WRITE_TOKEN — jalur
 * fallback yang didokumentasikan (data lokal + in-memory + /tmp). Semua
 * pemeriksaan di sini READ-ONLY: tidak ada tulis ke /tmp atau ke Blob.
 *
 * Jalankan: npm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root); // admin.js membaca data/projects.json lewat process.cwd()

delete process.env.BLOB_READ_WRITE_TOKEN;
process.env.ADMIN_TOKEN = "x".repeat(32);

const { default: adminHandler } = await import("../api/admin.js");

function fakeRes() {
  const res = {
    statusCode: null, body: null, headers: {}, sent: null,
    status(c) { res.statusCode = c; return res; },
    json(b) { res.body = b; return res; },
    send(b) { res.sent = b; return res; },
    setHeader(k, v) { res.headers[k] = v; },
    end() { return res; },
  };
  return res;
}
const call = async (req) => { const res = fakeRes(); await adminHandler(req, res); return res; };
const auth = { authorization: "Bearer " + process.env.ADMIN_TOKEN };

test("GET /api/admin tanpa token admin → 401", async () => {
  const res = await call({ method: "GET", query: {}, headers: {} });
  assert.equal(res.statusCode, 401);
});

test("GET /api/admin?cms=1 tanpa Blob → 200 + projects.json lokal valid", async () => {
  const res = await call({ method: "GET", query: { cms: "1" }, headers: {} });
  assert.equal(res.statusCode, 200);
  const parsed = JSON.parse(res.sent);
  assert.ok(parsed.featured || Array.isArray(parsed.projects), "harus berisi featured atau projects[]");
  assert.deepEqual(parsed, JSON.parse(fs.readFileSync(path.join(root, "data", "projects.json"), "utf8")));
});

test("GET /api/admin (terautentikasi) tanpa Blob → 200 JSON lokal", async () => {
  const res = await call({ method: "GET", query: {}, headers: auth });
  assert.equal(res.statusCode, 200);
  assert.ok(res.body && (res.body.featured || Array.isArray(res.body.projects)));
});

test("GET /api/admin?stats=1 tanpa Blob → 200, tanpa flag degraded", async () => {
  const res = await call({ method: "GET", query: { stats: "1", days: "7" }, headers: auth });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.perDay.length, 7);
  assert.equal(res.body.degraded, undefined, "tanpa Blob tidak ada pembacaan yang gagal");
  assert.equal("warnings" in res.body, false);
});

test("GET /api/admin?leads=1 tanpa Blob → 200 dengan daftar leads (baca saja)", async () => {
  const res = await call({ method: "GET", query: { leads: "1" }, headers: auth });
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.leads));
  assert.equal(typeof res.body.total, "number");
});
