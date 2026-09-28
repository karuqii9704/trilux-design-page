/* Akses Vercel Blob bersama untuk handler di api/.
 *
 * Kenapa file ini ada: versi sebelumnya membungkus semua kegagalan Blob jadi
 * string kosong (`catch (_) { return ""; }`). Itu berbahaya karena pemanggilnya
 * memakai pola read-modify-write — baca gagal → dianggap "belum ada data" →
 * `put()` menimpa blob dengan isi baru saja, sehingga lead/analytics lama hilang
 * tanpa satu pun error yang terlihat.
 *
 * Kontrak:
 *   readBlobText(file) -> string            file ada, isi dikembalikan
 *                      -> null              file memang BELUM ADA (404) — bukan error
 *                      -> throw             kegagalan nyata (token hilang, paket tidak
 *                                           ada, network/HTTP gagal). Pemanggil WAJIB
 *                                           berhenti dan TIDAK menulis apa pun.
 *   Semua error yang dilempar membawa `.code` supaya bisa dibedakan di log/respons.
 *
 * Nama diawali "_" agar tidak diperlakukan sebagai route; default export-nya
 * handler 404 yang aman kalau host ternyata tetap memuatnya sebagai route.
 */

const TOKEN_ENV = "BLOB_READ_WRITE_TOKEN";

function tag(e, code) {
  const err = e instanceof Error ? e : new Error(String(e));
  if (!err.code) err.code = code;
  return err;
}

export function blobTokenPresent() {
  return !!process.env[TOKEN_ENV];
}

/* 404 dari Blob = data memang belum ada. Itu normal (hari pertama, lead pertama). */
export function isNotFound(e) {
  const status = e && (e.status || e.statusCode);
  if (status === 404) return true;
  if (e && e.name === "BlobNotFoundError") return true;
  return /not.?found|blob_not_found/i.test(String((e && e.message) || ""));
}

export async function loadBlob() {
  if (!process.env[TOKEN_ENV]) {
    throw tag(new Error(`${TOKEN_ENV} tidak diset`), "no_token");
  }
  try {
    return await import("@vercel/blob");
  } catch (e) {
    // Penyebab paling mungkin: dependency belum terpasang di host.
    throw tag(new Error(`paket @vercel/blob gagal dimuat: ${(e && e.message) || e}`), "blob_module_missing");
  }
}

export async function readBlobText(file) {
  const { head, getDownloadUrl } = await loadBlob();

  let h;
  try {
    h = await head(file);
  } catch (e) {
    if (isNotFound(e)) return null;
    throw tag(new Error(`head(${file}) gagal: ${(e && e.message) || e}`), "blob_head_failed");
  }

  try {
    const dl = await getDownloadUrl(h.url);
    const r = await fetch(dl + "&cb=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } catch (e) {
    throw tag(new Error(`baca ${file} gagal: ${(e && e.message) || e}`), "blob_read_failed");
  }
}

export function logBlobFailure(where, e) {
  console.error(`[api] blob gagal di ${where}: ${(e && e.code) || "blob_error"} — ${(e && e.message) || e}`);
}

/* Respons untuk endpoint PUBLIK: tanpa detail internal, hanya kode yang stabil. */
export function blobErrorResponse(res, where, e) {
  logBlobFailure(where, e);
  return res.status(503).json({ error: "penyimpanan tidak tersedia", code: (e && e.code) || "blob_error" });
}

/* Kalau file ini dimuat host sebagai route, jangan sampai meledak atau membocorkan apa pun. */
export default function notARoute(_req, res) {
  res.status(404).json({ error: "not found" });
}
