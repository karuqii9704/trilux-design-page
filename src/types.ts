/* Tipe data CMS — mirrors data/content.json & data/projects.json.
   Sumber kebenaran konten: brief v0 (TRILUX Web Brief_v0.pdf) + knowledge capture
   .akos/knowledge/FEATURES_KEEP.md. Dummy dinyatakan jujur di UI (clients/news/studio/gallery).

   i18n (2026-11-02): setiap field teks yang terlihat publik disimpan BILINGUAL
   di CMS sebagai { id, en }. Tipe Bilingual<T> merepresentasikannya; helper
   pick() di useContent/useProjects me-flatten ke string sesuai locale aktif
   sebelum ke komponen, sehingga komponen section tetap menerima string biasa
   dan tidak perlu tahu soal locale. Field non-teks (slug, tanggal, dimensi,
   URL, angka) tetap scalar — tidak diterjemahkan. */

export type Locale = "id" | "en";

/** Field teks bilingual di CMS. */
export type Bilingual = { id: string; en: string };

/* me-flatten {id,en} → string untuk locale tertentu; fallback id.
   Menerima scalar apa adanya (untuk field non-teks). */
export function pick(v: Bilingual | string | undefined, locale: Locale): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  return (v as Bilingual)[locale] ?? (v as Bilingual).id ?? "";
}

export interface NavItem { label: string; href: string }

export interface Mission { title: string; text: string }

export interface AboutData {
  eyebrow: string;
  title: string;
  intro: string;
  vision: { label: string; text: string };
  missions: Mission[];
  company: { label: string; title: string; text: string };
}

export interface ExpertiseItem { num: string; title: string; text: string }

export interface ServiceItem { name: string; tag: string; desc: string; points: string[] }

export interface GalleryItem { src: string; alt: string; caption: string; kind: string }
export interface GalleryData { note: string; items: GalleryItem[] }

export interface ClientItem { name: string; type: string }
export interface ClientsData { note: string; items: ClientItem[] }

export interface NewsItem {
  slug: string; category: string; title: string; excerpt: string; date: string; readTime: string;
}
export interface NewsData { note: string; items: NewsItem[] }

export interface Partition { id: string; orientation: "vertical" | "vertical-h" | "horizontal"; x: number; from: number; to: number; label: string }
export interface FurnitureItem { id: string; label: string; w: number; d: number; x: number; y: number }
export interface StudioData {
  note: string;
  room: { label: string; w: number; d: number; unit: string };
  partitions: Partition[];
  furniture: FurnitureItem[];
}

export interface SiteData {
  title: string; description: string; phone: string; phoneHref: string; email: string;
  instagram: string; instagramUrl: string; wa: string; location: string;
}

export interface ContentData {
  nav: NavItem[];
  about: AboutData;
  expertise: ExpertiseItem[];
  services: ServiceItem[];
  gallery: GalleryData;
  clients: ClientsData;
  news: NewsData;
  studio: StudioData;
  site: SiteData;
}

export interface ProjectGalleryThumb { thumb: string; label: string }
export interface ProjectItem {
  slug: string; name: string; location: string; year: string; type: string;
  specifics: string; client: string; cover: string; coverAlt: string;
  description: string; highlights: string[]; gallery: ProjectGalleryThumb[];
}
export interface FeaturedProject extends ProjectItem { index: string }
export interface ProjectsData { featured: FeaturedProject; projects: ProjectItem[] }
