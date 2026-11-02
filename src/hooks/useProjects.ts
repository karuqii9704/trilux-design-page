/* useProjects — featured + daftar proyek (CMS runtime, pola sama dengan useContent).
   GET /api/admin?cms=1 adalah public read (tanpa auth) yang mengembalikan projects.json;
   Blob wins, fallback seed build-time data/projects.json.

   i18n: projects.json menyimpan field teks bilingual {id, en}; hook me-flatten
   ke string sesuai locale (pick()). Data numerik/URL/thumb tetap scalar. */
import { useEffect, useMemo, useState } from "react";
import seed from "../../data/projects.json";
import { pick, type FeaturedProject, type Locale, type ProjectItem, type ProjectsData } from "../types";

function flattenProject(p: any, locale: Locale): ProjectItem {
  return {
    slug: typeof p?.slug === "string" ? p.slug : "",
    name: pick(p?.name, locale),
    location: pick(p?.location, locale),
    year: typeof p?.year === "string" ? p.year : "",
    type: pick(p?.type, locale),
    specifics: pick(p?.specifics, locale),
    client: pick(p?.client, locale),
    cover: typeof p?.cover === "string" ? p.cover : "",
    coverAlt: pick(p?.coverAlt, locale),
    description: pick(p?.description, locale),
    highlights: Array.isArray(p?.highlights) ? p.highlights.map((h: any) => pick(h, locale)) : [],
    gallery: Array.isArray(p?.gallery)
      ? p.gallery.map((g: any) => ({
          thumb: typeof g?.thumb === "string" ? g.thumb : "",
          label: pick(g?.label, locale),
        }))
      : [],
  };
}

function flatten(raw: unknown, locale: Locale): ProjectsData {
  const r = (raw ?? {}) as any;
  const featured = flattenProject(r.featured, locale) as FeaturedProject;
  featured.index = typeof r.featured?.index === "string" ? r.featured.index : "01/04";
  featured.slug = typeof r.featured?.slug === "string" ? r.featured.slug : "featured";
  return {
    featured,
    projects: Array.isArray(r.projects) ? r.projects.map((p: any) => flattenProject(p, locale)) : [],
  };
}

export function useProjects(locale: Locale): ProjectsData {
  const [raw, setRaw] = useState<unknown>(seed);

  const data = useMemo(() => flatten(raw, locale), [raw, locale]);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin?cms=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && (j.featured || j.projects)) setRaw(j);
      })
      .catch(() => {
        /* API mati/offline — seed build-time tetap jalan */
      });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
