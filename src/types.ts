/* Tipe data CMS — mirrors data/content.json & data/projects.json.
   Sumber kebenaran konten: brief v0 (TRILUX Web Brief_v0.pdf) + knowledge capture
   .akos/knowledge/FEATURES_KEEP.md. Dummy dinyatakan jujur di UI (clients/news/studio/gallery). */

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
