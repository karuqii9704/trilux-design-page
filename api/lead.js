/* Public lead capture — POST /api/lead
   AC-4 "Hybrid Capture" (§13): honeypot + time-trap + rate limit + consent +
   controlled enums (§12.3). Setiap submission tetap disimpan — skor tinggi
   hanya menandai `status: "spam"` (§13.4 lapis 6), tidak dihapus otomatis.
   Appends one JSON line to Vercel Blob cms/leads.jsonl (read-modify-write;
   /tmp fallback when no Blob token). No auth: this is the public form endpoint.

   CATATAN: read-modify-write di bawah masih menelan error baca Blob
   (`existing = ""`), jadi baca gagal = put() menimpa seluruh lead lama.
   Perbaikannya ada di branch `agent/port-tooling` (api/_blob.js) dan sengaja
   tidak disalin ke sini supaya kedua branch tetap bisa di-merge. */
import fs from "fs";
import { randomUUID } from "crypto";

/* §12.3 — enum terkendali, bukan input bebas. */
const CATEGORIES = ["Interior", "Exterior", "Building", "Renovation"];
const BUDGETS = ["< 500 Jt", "500 Jt – 1 M", "1 – 3 M", "3 – 5 M", "> 5 M", "Dirahasiakan"];
const CHANNELS = ["whatsapp", "email"];
const SOURCES = ["simulator", "contact_page", "project_detail", "whatsapp_direct"];

/* §13.4 — nama field honeypot & ambang skor. */
const HONEYPOT_FIELD = "company";
const TIME_TRAP_MS = 3000;      // lapis 2: submit < 3 dtk sejak form tampil
const RATE_LIMIT_MAX = 5;       // lapis 3: 5 submit / jam / IP
const RATE_LIMIT_WINDOW_MS = 3600e3;
const SCORE_HONEYPOT = 60;
const SCORE_TIME_TRAP = 40;
const SPAM_FLAG_AT = 40;        // skor >= ini → status "spam" (tetap tersimpan)

/* §13.4 lapis 3 — penghitung per proses. Container ini satu instance
   (lihat /srv/vps-plus/docs/MIGRATION-NOTES.md: "Rate limiting is per
   process"), jadi benar hari ini; kalau nanti di-scale jadi >1 replika,
   batas efektifnya ikut berlipat dan counter harus pindah ke Redis. */
const hits = new Map();

function clientIp(req) {
  /* Satu reverse proxy tepercaya di depan container ini menambahkan IP peer
     asli di posisi TERAKHIR, jadi entri terakhir yang bisa dipercaya —
     X-Forwarded-For yang dikirim klien sendiri berada di depan dan tidak
     bisa memalsukan ini. */
  const fwd = String(req.headers["x-forwarded-for"] || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  return fwd.length ? fwd[fwd.length - 1] : String(req.socket?.remoteAddress || "unknown");
}

/* Return detik tunggu (untuk Retry-After), atau 0 kalau boleh lanjut.
   Setiap POST dihitung, termasuk yang nanti gagal validasi — kalau tidak,
   pengirim spam yang selalu salah payload tidak pernah kena batas. */
function rateLimit(ip) {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000));
  }
  recent.push(now);
  hits.set(ip, recent);
  return 0;
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

/* §13.4 lapis 4 — format telepon Indonesia: 08… / +62… / 62… */
function phoneDigits(s) { return s.replace(/[\s().-]/g, ""); }
const isPhoneID = (s) => /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/.test(phoneDigits(s));
function normalizePhone(s) {
  const d = phoneDigits(s);
  if (d.startsWith("+62")) return d;
  if (d.startsWith("62")) return "+" + d;
  return "+62" + d.slice(1);
}

const asText = (v, max) => String(v ?? "").trim().slice(0, max);
const oneOf = (v, allowed) => {
  const s = String(v ?? "").trim();
  return allowed.includes(s) ? s : null;
};

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
  } catch (_) { res.status(400).json({ error: "bad json", code: "bad_json" }); return; }

  /* ---- lapis 3: rate limit — satu-satunya lapis yang MENOLAK ---- */
  const wait = rateLimit(clientIp(req));
  if (wait) {
    res.setHeader("Retry-After", String(wait));
    const menit = Math.max(1, Math.ceil(wait / 60));
    res.status(429).json({
      error: `Terlalu banyak kiriman dari koneksi ini. Coba lagi dalam ${menit} menit, atau langsung chat WhatsApp kami.`,
      code: "rate_limited",
      retry_after: wait,
    });
    return;
  }

  /* ---- lapis 1: honeypot (terisi = bot) ---- */
  let spamScore = 0;
  const spamReasons = [];
  if (asText(body?.[HONEYPOT_FIELD], 200)) {
    spamScore += SCORE_HONEYPOT;
    spamReasons.push("honeypot");
  }

  /* ---- lapis 2: time-trap ---- */
  const elapsed = Number(body?.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 24 * 3600e3 && elapsed < TIME_TRAP_MS) {
    spamScore += SCORE_TIME_TRAP;
    spamReasons.push("time_trap");
  }

  /* ---- consent (§17.2 UU PDP — wajib, tidak boleh pre-checked) ---- */
  if (body?.consent !== true) {
    res.status(422).json({
      error: "Centang persetujuan penggunaan data dulu sebelum kirim.",
      code: "consent_required",
      field: "consent",
    });
    return;
  }

  /* ---- kontak wajib: email ATAU nomor Indonesia ---- */
  const contact = asText(body?.contact, 200);
  if (!contact) {
    res.status(422).json({
      error: "Isi nomor WhatsApp atau email supaya kami bisa membalas.",
      code: "invalid_contact",
      field: "contact",
    });
    return;
  }
  const email = isEmail(contact) ? contact : "";
  const phone = !email && isPhoneID(contact) ? normalizePhone(contact) : "";
  if (!email && !phone) {
    res.status(422).json({
      error: "Nomor WhatsApp-nya belum benar. Contoh: 0812 3456 7890 atau +62 812 3456 7890 — atau isi email.",
      code: "invalid_contact",
      field: "contact",
    });
    return;
  }

  /* ---- enum §12.3: opsional, tapi kalau diisi harus salah satu nilai ---- */
  const projectType = oneOf(body?.project_type, CATEGORIES);
  if (body?.project_type != null && String(body.project_type).trim() && !projectType) {
    res.status(422).json({
      error: `Jenis proyek harus salah satu dari: ${CATEGORIES.join(", ")}.`,
      code: "invalid_enum",
      field: "project_type",
      allowed: CATEGORIES,
    });
    return;
  }
  const budgetRange = oneOf(body?.budget_range, BUDGETS);
  if (body?.budget_range != null && String(body.budget_range).trim() && !budgetRange) {
    res.status(422).json({
      error: `Kisaran budget harus salah satu dari: ${BUDGETS.join(", ")}.`,
      code: "invalid_enum",
      field: "budget_range",
      allowed: BUDGETS,
    });
    return;
  }

  const now = new Date().toISOString();
  const lead = {
    /* §12.1 skema leads */
    id: randomUUID(),
    created_at: now,
    updated_at: now,
    name: asText(body?.name, 120),
    email,
    phone,
    contact,                                        // kolom lama, masih dipakai panel CMS
    preferred_channel: oneOf(body?.preferred_channel, CHANNELS) || (email ? "email" : "whatsapp"),
    project_type: projectType,
    budget_range: budgetRange,
    location: asText(body?.location, 120),
    message: asText(body?.message, 1000),
    source: oneOf(body?.source, SOURCES) || "simulator",
    utm_source: asText(body?.utm_source, 80),
    utm_medium: asText(body?.utm_medium, 80),
    utm_campaign: asText(body?.utm_campaign, 80),
    consent_given: true,
    spam_score: spamScore,
    status: spamScore >= SPAM_FLAG_AT ? "spam" : "new",
    /* konteks simulator (dipakai panel Monitoring apa adanya) */
    ts: now,
    scope: asText(body?.scope, 80),
    area: Number.isFinite(Number(body?.area)) && Number(body.area) > 0 ? Number(body.area) : null,
    total: asText(body?.total, 120),
    config: asText(body?.config, 1200),
    ua: String(req.headers["user-agent"] || "").slice(0, 160),
  };
  if (spamReasons.length) lead.spam_reasons = spamReasons;

  const line = JSON.stringify(lead) + "\n";
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { head, put, getDownloadUrl } = await import("@vercel/blob");
      let existing = "";
      try {
        const h = await head("cms/leads.jsonl");
        const dl = await getDownloadUrl(h.url);
        existing = await (await fetch(dl + "&cb=" + Date.now(), { cache: "no-store" })).text();
      } catch (_) { existing = ""; } // first lead ever
      await put("cms/leads.jsonl", existing + line, {
        access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/x-ndjson",
      });
      res.status(200).json({ ok: true, stored: "blob", id: lead.id });
    } else {
      // ponytail: /tmp fallback is per-instance and lost — set Blob token for durable leads
      fs.appendFileSync("/tmp/leads.jsonl", line);
      res.status(200).json({ ok: true, stored: "tmp-ephemeral", id: lead.id });
    }
  } catch (e) {
    res.status(500).json({ error: "store failed", code: "store_failed", detail: String(e && e.message) });
  }
}
