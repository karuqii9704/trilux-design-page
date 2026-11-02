/* useContent — CMS runtime hydration (pola terbukti build lama) + i18n.
   Ambil /api/content (Vercel Blob, no-store) → fallback seed data/content.json.
   Selama fetch berjalan, seed langsung render (tidak ada loading state — konten
   selalu ada, hydrate diam-diam bila Blob lebih baru).

   Seed & Blob menyimpan field teks sebagai bilingual {id, en}; hook ini
   me-flatten ke string sesuai locale aktif (helper pick() dari types.ts)
   sebelum dikembalikan, sehingga komponen section tetap menerima ContentData
   berisi string biasa dan TIDAK perlu tahu soal locale. */
import { useEffect, useMemo, useState } from "react";
import seedRaw from "../../data/content.json";
import { pick, type Bilingual, type ContentData, type Locale } from "../types";

/* --- flatten helpers: {id,en} | scalar → scalar, rekursif per shape --- */

function flattenNav(raw: unknown, locale: Locale): ContentData["nav"] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((n: any) => ({
    label: pick(n?.label, locale),
    href: typeof n?.href === "string" ? n.href : "#",
  }));
}

function flattenMission(m: any, locale: Locale) {
  return { title: pick(m?.title, locale), text: pick(m?.text, locale) };
}

function flattenAbout(raw: any, locale: Locale): ContentData["about"] {
  return {
    eyebrow: pick(raw?.eyebrow, locale),
    title: pick(raw?.title, locale),
    intro: pick(raw?.intro, locale),
    vision: {
      label: pick(raw?.vision?.label, locale),
      text: pick(raw?.vision?.text, locale),
    },
    missions: Array.isArray(raw?.missions)
      ? raw.missions.map((m: any) => flattenMission(m, locale))
      : [],
    company: {
      label: pick(raw?.company?.label, locale),
      title: pick(raw?.company?.title, locale),
      text: pick(raw?.company?.text, locale),
    },
  };
}

function flattenExpertise(raw: unknown, locale: Locale): ContentData["expertise"] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((e: any) => ({
    num: pick(e?.num, locale),
    title: pick(e?.title, locale),
    text: pick(e?.text, locale),
  }));
}

function flattenServices(raw: unknown, locale: Locale): ContentData["services"] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((s: any) => ({
    name: pick(s?.name, locale),
    tag: pick(s?.tag, locale),
    desc: pick(s?.desc, locale),
    points: Array.isArray(s?.points)
      ? s.points.map((p: any) => pick(p, locale))
      : [],
  }));
}

function flattenGallery(raw: any, locale: Locale): ContentData["gallery"] {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((g: any) => ({
        src: typeof g?.src === "string" ? g.src : "",
        alt: pick(g?.alt, locale),
        caption: pick(g?.caption, locale),
        kind: pick(g?.kind, locale),
      }))
    : [];
  return { note: pick(raw?.note, locale), items };
}

function flattenClients(raw: any, locale: Locale): ContentData["clients"] {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((c: any) => ({
        name: pick(c?.name, locale),
        type: pick(c?.type, locale),
      }))
    : [];
  return { note: pick(raw?.note, locale), items };
}

function flattenNews(raw: any, locale: Locale): ContentData["news"] {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((a: any) => ({
        slug: typeof a?.slug === "string" ? a.slug : "",
        category: pick(a?.category, locale),
        title: pick(a?.title, locale),
        excerpt: pick(a?.excerpt, locale),
        date: typeof a?.date === "string" ? a.date : "",
        readTime: typeof a?.readTime === "string" ? a.readTime : "",
      }))
    : [];
  return { note: pick(raw?.note, locale), items };
}

function flattenStudio(raw: any, locale: Locale): ContentData["studio"] {
  const partitions = Array.isArray(raw?.partitions)
    ? raw.partitions.map((p: any) => ({
        id: typeof p?.id === "string" ? p.id : "",
        orientation: p?.orientation === "horizontal" ? "horizontal" : "vertical",
        x: typeof p?.x === "number" ? p.x : 0,
        from: typeof p?.from === "number" ? p.from : 0,
        to: typeof p?.to === "number" ? p.to : 0,
        label: pick(p?.label, locale),
      }))
    : [];
  const furniture = Array.isArray(raw?.furniture)
    ? raw.furniture.map((f: any) => ({
        id: typeof f?.id === "string" ? f.id : "",
        label: pick(f?.label, locale),
        w: typeof f?.w === "number" ? f.w : 0,
        d: typeof f?.d === "number" ? f.d : 0,
        x: typeof f?.x === "number" ? f.x : 0,
        y: typeof f?.y === "number" ? f.y : 0,
      }))
    : [];
  return {
    note: pick(raw?.note, locale),
    room: {
      label: pick(raw?.room?.label, locale),
      w: raw?.room?.w ?? 600,
      d: raw?.room?.d ?? 420,
      unit: raw?.room?.unit ?? "cm",
    },
    partitions,
    furniture,
  };
}

function flattenSite(raw: any, locale: Locale): ContentData["site"] {
  return {
    title: pick(raw?.title, locale),
    description: pick(raw?.description, locale),
    phone: typeof raw?.phone === "string" ? raw.phone : "",
    phoneHref: typeof raw?.phoneHref === "string" ? raw.phoneHref : "",
    email: typeof raw?.email === "string" ? raw.email : "",
    instagram: typeof raw?.instagram === "string" ? raw.instagram : "",
    instagramUrl: typeof raw?.instagramUrl === "string" ? raw.instagramUrl : "",
    wa: typeof raw?.wa === "string" ? raw.wa : "",
    location: pick(raw?.location, locale),
  };
}

/** Flatten satu objek CMS mentah (bilingual) menjadi ContentData ber-string
 *  untuk locale tertentu. Diekspor supaya api/admin & seed dump bisa pakai
 *  logika yang sama (DRY). */
export function flattenContent(raw: unknown, locale: Locale): ContentData {
  const r = (raw ?? {}) as any;
  return {
    nav: flattenNav(r.nav, locale),
    about: flattenAbout(r.about, locale),
    expertise: flattenExpertise(r.expertise, locale),
    services: flattenServices(r.services, locale),
    gallery: flattenGallery(r.gallery, locale),
    clients: flattenClients(r.clients, locale),
    news: flattenNews(r.news, locale),
    studio: flattenStudio(r.studio, locale),
    site: flattenSite(r.site, locale),
  };
}

export function useContent(locale: Locale): ContentData {
  /* raw = objek CMS bilingual (seed atau Blob). Disimpan utuh, hanya di-flatten
     ulang saat locale berubah — switch bahasa TIDAK mengembalikan ke seed dan
     TIDAK me-refetch. */
  const [raw, setRaw] = useState<unknown>(seedRaw);

  const content = useMemo(
    () => flattenContent(raw, locale),
    [raw, locale],
  );

  useEffect(() => {
    let alive = true;
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && j.site && j.about) setRaw(j);
      })
      .catch(() => {
        /* offline / API mati — seed build-time tetap jalan */
      });
    return () => {
      alive = false;
    };
  }, []);

  return content;
}

/* tipe helper — tidak dipakai komponen, tapi dijaga agar seed bilingual
   tervalidasi oleh TS saat import. */
export type { Bilingual };
