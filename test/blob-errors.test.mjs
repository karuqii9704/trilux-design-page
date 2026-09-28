/* Regresi untuk temuan "kegagalan Blob disembunyikan jadi string kosong".
 *
 * Bug aslinya: `catch (_) { return ""; }` pada pembacaan Blob membuat pemanggil
 * mengira "belum ada data" lalu `put()` menimpa lead/analytics lama. Test di sini
 * mengunci sifat yang menggantikannya:
 *   1. pembacaan yang gagal MELEMPAR (bukan mengembalikan "") kecuali 404;
 *   2. 404 tetap dianggap "belum ada data" (null) supaya hari/lead pertama tidak error;
 *   3. handler publik tidak pernah melaporkan kegagalan sebagai sukses;
 *   4. handler publik tidak membocorkan pesan internal ke klien.
 *
 * Tanpa jaringan dan tanpa dependency: @vercel/blob boleh ada atau tidak.
 * Jalankan: npm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EventEmitter } from "node:events";

import { isNotFound, readBlobText, blobErrorResponse, logBlobFailure } from "../api/_blob.js";
import leadHandler from "../api/lead.js";
import trackHandler from "../api/track.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fakeRes() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    ended: false,
    status(c) { res.statusCode = c; return res; },
    json(b) { res.body = b; return res; },
    send(b) { res.body = b; return res; },
    setHeader(k, v) { res.headers[k] = v; },
    end() { res.ended = true; return res; },
  };
  return res;
}

function fakeTrackReq(body) {
  const req = new EventEmitter();
  req.method = "POST";
  req.headers = {};
  req.query = {};
  req.destroy = () => {};
  setImmediate(() => { req.emit("data", JSON.stringify(body)); req.emit("end"); });
  return req;
}

function captureErrors(fn) {
  const seen = [];
  const orig = console.error;
  console.error = (...a) => seen.push(a.join(" "));
  try { fn(); } finally { console.error = orig; }
  return seen;
}

/* ---------- klasifikasi error ---------- */

test("404 dari Blob dianggap 'belum ada data', bukan kegagalan", () => {
  assert.equal(isNotFound({ status: 404 }), true);
  assert.equal(isNotFound({ statusCode: 404 }), true);
  assert.equal(isNotFound(Object.assign(new Error("x"), { name: "BlobNotFoundError" })), true);
  assert.equal(isNotFound(new Error("blob not found")), true);
});

test("error lain TIDAK dianggap 'belum ada data'", () => {
  assert.equal(isNotFound(new Error("fetch failed")), false);
  assert.equal(isNotFound(Object.assign(new Error("Unauthorized"), { status: 403 })), false);
  assert.equal(isNotFound(new Error("paket @vercel/blob gagal dimuat")), false);
});

/* ---------- readBlobText tidak lagi menelan kegagalan ---------- */

test("tanpa token: readBlobText melempar no_token, bukan balik string kosong", async () => {
  const saved = process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  try {
    await assert.rejects(
      () => readBlobText("cms/leads.jsonl"),
      (e) => e.code === "no_token" && typeof e.message === "string" && e.message.length > 0
    );
  } finally {
    if (saved !== undefined) process.env.BLOB_READ_WRITE_TOKEN = saved;
  }
});

test("token ada tapi @vercel/blob tak terpasang: melempar blob_module_missing", async (t) => {
  const saved = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test_token";
  try {
    let mod = null;
    try { mod = await import("@vercel/blob"); } catch { /* memang tak terpasang */ }
    if (mod) { t.skip("dependency terpasang — jalur modul-hilang tidak bisa diuji di sini"); return; }
    await assert.rejects(
      () => readBlobText("cms/leads.jsonl"),
      (e) => e.code === "blob_module_missing"
    );
  } finally {
    if (saved === undefined) delete process.env.BLOB_READ_WRITE_TOKEN; else process.env.BLOB_READ_WRITE_TOKEN = saved;
  }
});

/* ---------- respons error yang terlihat ---------- */

test("blobErrorResponse: 503 + code stabil + tercatat di log", () => {
  const err = Object.assign(new Error("rahasia internal: dl.blob.vercel-storage.com/x"), { code: "blob_read_failed" });
  const res = fakeRes();
  let out;
  const logs = captureErrors(() => { out = blobErrorResponse(res, "lead:read cms/leads.jsonl", err); });

  assert.equal(out, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, "penyimpanan tidak tersedia");
  assert.equal(res.body.code, "blob_read_failed");
  assert.equal("detail" in res.body, false, "endpoint publik tidak boleh membocorkan pesan internal");

  assert.equal(logs.length, 1, "kegagalan harus tercatat, bukan hilang diam-diam");
  assert.match(logs[0], /blob_read_failed/);
  assert.match(logs[0], /lead:read cms\/leads\.jsonl/);
});

test("logBlobFailure memberi kode default saat error tidak punya code", () => {
  const logs = captureErrors(() => logBlobFailure("track:put", new Error("koneksi putus")));
  assert.match(logs[0], /blob_error/);
  assert.match(logs[0], /koneksi putus/);
});

/* ---------- handler tidak melaporkan gagal sebagai sukses ---------- */

test("POST /api/lead: baca Blob gagal → bukan sukses, tanpa detail internal", async () => {
  const saved = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test_token";
  const res = fakeRes();
  const logs = await (async () => {
    const orig = console.error; const seen = [];
    console.error = (...a) => seen.push(a.join(" "));
    try {
      await leadHandler({ method: "POST", body: { contact: "0812-test" }, headers: {}, query: {} }, res);
    } finally { console.error = orig; }
    return seen;
  })();
  if (saved === undefined) delete process.env.BLOB_READ_WRITE_TOKEN; else process.env.BLOB_READ_WRITE_TOKEN = saved;

  assert.notEqual(res.statusCode, 200, "lead tidak boleh dilaporkan terkirim kalau penyimpanan gagal");
  assert.equal("detail" in (res.body || {}), false);
  assert.ok(res.body && res.body.code, "respons harus membawa kode kegagalan");
  assert.ok(logs.length >= 1, "kegagalan lead harus tercatat di log");
});

test("POST /api/track: baca Blob gagal → bukan 204 (tidak diam-diam sukses)", async () => {
  const saved = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test_token";
  const res = fakeRes();
  await trackHandler(fakeTrackReq({ type: "view", path: "/index.html" }), res);
  if (saved === undefined) delete process.env.BLOB_READ_WRITE_TOKEN; else process.env.BLOB_READ_WRITE_TOKEN = saved;

  assert.notEqual(res.statusCode, 204, "kegagalan simpan tidak boleh terlihat seperti sukses");
  assert.ok(res.body && res.body.code, "respons harus membawa kode kegagalan");
  assert.equal("detail" in (res.body || {}), false);
});

/* ---------- penjaga sumber: pola penelan error tidak boleh kembali ---------- */

test("api/*.js tidak lagi menelan kegagalan baca Blob jadi string kosong", () => {
  const swallow = /catch\s*\(_\)\s*\{\s*(return\s*""|existing\s*=\s*""|prev\s*=\s*"")/;
  for (const f of ["admin.js", "lead.js", "track.js"]) {
    const src = fs.readFileSync(path.join(root, "api", f), "utf8");
    assert.equal(swallow.test(src), false, `api/${f} masih menelan kegagalan baca Blob`);
    assert.match(src, /_blob\.js/, `api/${f} harus memakai helper api/_blob.js`);
  }
});
