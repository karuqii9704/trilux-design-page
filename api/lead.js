/* Public lead capture — POST {contact, scope, area, total, config}
   Appends one JSON line to Vercel Blob cms/leads.jsonl (read-modify-write;
   /tmp fallback when no Blob token). No auth: this is the public form endpooint. */
import fs from "fs";
import { blobTokenPresent, readBlobText, loadBlob, blobErrorResponse, logBlobFailure } from "./_blob.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }

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

  const contact = String(body?.contact || "").trim();
  if (!contact || contact.length > 200) { res.status(422).json({ error: "contact required" }); return; }

  const lead = {
    ts: new Date().toISOString(),
    contact,
    name: String(body?.name || "").slice(0, 120),
    scope: String(body?.scope || "").slice(0, 80),
    area: Number(body?.area) || null,
    total: String(body?.total || "").slice(0, 120),
    config: String(body?.config || "").slice(0, 1200),
    ua: String(req.headers["user-agent"] || "").slice(0, 160),
  };

  const line = JSON.stringify(lead) + "\n";

  if (!blobTokenPresent()) {
    // ponytail: /tmp fallback is per-instance and lost — set Blob token for durable leads
    fs.appendFileSync("/tmp/leads.jsonl", line);
    res.status(200).json({ ok: true, stored: "tmp-ephemeral" });
    return;
  }

  // Baca dulu isi lama. Kalau baca GAGAL, berhenti di sini: menulis sekarang akan
  // menimpa seluruh lead sebelumnya dengan satu baris ini.
  let existing;
  try {
    existing = (await readBlobText("cms/leads.jsonl")) ?? ""; // null = belum ada lead sama sekali
  } catch (e) {
    blobErrorResponse(res, "lead:read cms/leads.jsonl", e);
    return;
  }

  try {
    const { put } = await loadBlob();
    await put("cms/leads.jsonl", existing + line, {
      access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/x-ndjson",
    });
    res.status(200).json({ ok: true, stored: "blob" });
  } catch (e) {
    logBlobFailure("lead:put cms/leads.jsonl", e);
    res.status(500).json({ error: "store failed", code: (e && e.code) || "blob_put_failed" });
  }
}
