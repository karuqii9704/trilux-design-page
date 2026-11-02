/* Trilux Design — localization (i18n) ID/EN.
 *
 * Satu kamus terstruktur untuk SELURUH UI text statis (nav, hero, heading
 * section, tombol, label form, aria-label, footer). Konten panjang (about,
 * services, expertise, gallery, clients, news, studio) tinggal di CMS
 * content.json dalam bentuk bilingual { id, en } — dipetakan di useContent.
 *
 * Pola: komponen panggil t().<key>, NEVER hardcode copy. LocaleContext
 * menyediakan locale + setLocale; persist localStorage 'trilux-locale';
 * <html lang> di-sync supaya screen reader & SEO benar. Default: id
 * (PRD §12.2 opsi B+ — pasar utama Indonesia; heading merek tetap Inggris).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
const STORAGE_KEY = "trilux-locale";

/* ─── Kamus UI statis ─────────────────────────────────────────────── */

const dict = {
  id: {
    /* nav + drawer */
    nav: {
      work: "Work",
      about: "About",
      services: "Services",
      gallery: "Gallery",
      studio: "Studio",
      contact: "Contact",
      bookMeeting: "Book a meeting",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
    },
    /* language switcher */
    lang: {
      label: "Bahasa",
      switchToEn: "Ganti ke Bahasa Inggris",
      switchToId: "Ganti ke Bahasa Indonesia",
    },
    /* hero */
    hero: {
      eyebrow: "Interior · Exterior · Architecture — Jakarta",
      titleA: "Experiencing Luxury,",
      titleB: "Before It’s Built.",
      ctaPrimary: "Book a meeting",
      ctaSecondary: "View Project",
    },
    /* section headings + UI copy */
    about: {
      eyebrow: "About us",
      title: "Experiencing Luxury, Before It’s Built",
      companyLabel: "Sekilas Perusahaan",
      companyTitle: "About Trilux",
      visionLabel: "Visi",
      missionsLabel: "Misi",
    },
    expertise: {
      eyebrow: "Our Expertise",
      title: "Keahlian yang mengerjakan segalanya, dari awal hingga akhir.",
    },
    services: {
      eyebrow: "Services",
      title: "Interior, exterior, sistem, hingga produksinya.",
      sub: "Turnkey fit-out & project — dari konsep hingga serah terima kunci.",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Proyek yang sudah selesai dikerjakan.",
      sub: "Setiap proyek punya tombol View details — deskripsi, spesifikasi, dan galeri tampak 3D.",
      featuredProject: "Featured Project",
      viewDetails: "View details",
      projectDetails: "Detail Proyek",
      specifics: "Spesifikasi",
      type: "Tipe",
      client: "Client",
      gallery3d: "Galeri — tampak 3D",
      placeholderNote: "Placeholder shapes-based — foto asli proyek menyusul (tahap desain).",
      closeDetails: "Tutup detail proyek",
      viewProject: "Lihat proyek",
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Katalog tampak 3D.",
      prev: "Gambar sebelumnya",
      next: "Gambar berikutnya",
      thumbRail: "Thumbnail gallery",
      choose: "Pilih",
      clickToZoom: "klik untuk zoom",
      closeZoom: "Tutup zoom",
    },
    clients: {
      eyebrow: "Our Clients",
      title: "Dipercaya proyek-proyek residensial & komersial.",
    },
    news: {
      eyebrow: "Articles",
      title: "Artikel inspirasi desain.",
      read: "baca",
      readMore: "Baca",
    },
    studioTeaser: {
      eyebrow: "Studio · Eksklusif",
      title: "Uji konsep ruang Anda sebelum survei.",
      body: "Atur partisi, tarik furnitur, dan sesuaikan dimensi dalam satuan sentimeter — alat eksplorasi awal untuk proyek Anda, sebelum tim Trilux ke lokasi.",
      cta: "Buka Studio",
      note: "Akses eksklusif untuk calon klien · eksplorasi awal sebelum survei lokasi",
    },
    contact: {
      eyebrow: "Contact",
      title: "Ceritakan proyek Anda.",
      sub: "Survei lokasi gratis, lalu tim kami buka RAB detail — angka yang mengikat, bukan estimasi.",
      phone: "Phone",
      email: "Email",
      instagram: "Instagram",
      location: "Location",
      whatsapp: "Whatsapp",
      emailUs: "Email Us",
    },
    footer: {
      whatsapp: "WhatsApp",
      email: "Email",
      modeDark: "Mode gelap",
      modeLight: "Mode terang",
    },
    /* studio page (/studio) */
    studio: {
      back: "Kembali",
      backToLanding: "Kembali ke landing",
      kicker: "Studio — Eksplorasi Ruang Interaktif",
      heading: "Uji ruang Anda sebelum tim kami ke lokasi.",
      room: "Ruangan",
      width: "Lebar",
      depth: "Kedalaman",
      partitions: "Partisi / Dinding",
      furniture: "Furnitur",
      furnitureWidth: "Lebar furnitur",
      addPartition: "Tambah partisi",
      remove: "Hapus",
      addVertical: "Partisi vertikal",
      addHorizontal: "Partisi horizontal",
      orientationV: "vertikal",
      orientationH: "horizontal",
      newPartition: "Partisi",
      gridNote: "Grid = 40 cm. Semua dimensi dalam sentimeter. Nilai dummy per brief.",
      partitionHint: "Tarik handle brass untuk mengubah panjang. Seret badan partisi untuk menggeser posisi. Klik partisi tanpa menggeser untuk menghapus.",
      furnitureHint: "Seret furnitur di canvas. Pilih untuk melihat & mengubah ukuran (cm).",
      selectedSize: "Ukuran terpilih:",
      selectHint: "Klik furnitur untuk memilih · drag untuk memindah · handle brass untuk resize",
      disclaimer: "Eksplorasi ruang interaktif — dummy. Akun dan fitur kolaborasi belum tersedia.",
      floorplanAria: "Floorplan interaktif — seret furnitur, sesuaikan partisi dan ukuran dalam sentimeter",
      handlePartition: "Handle partisi",
      reduce: "Kurangi",
      increase: "Tambah",
      bodyIntro: "Partisi bisa di-adjust, furnitur bisa ditarik, ukuran dalam satuan cm — eksplorasi awal sebelum survei.",
    },
    /* marquee */
    marquee: {
      strip: "Portfolio strip",
    },
  },
  en: {
    /* nav + drawer */
    nav: {
      work: "Work",
      about: "About",
      services: "Services",
      gallery: "Gallery",
      studio: "Studio",
      contact: "Contact",
      bookMeeting: "Book a meeting",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    /* language switcher */
    lang: {
      label: "Language",
      switchToEn: "Switch to English",
      switchToId: "Switch to Bahasa Indonesia",
    },
    /* hero */
    hero: {
      eyebrow: "Interior · Exterior · Architecture — Jakarta",
      titleA: "Experiencing Luxury,",
      titleB: "Before It’s Built.",
      ctaPrimary: "Book a meeting",
      ctaSecondary: "View Project",
    },
    /* section headings + UI copy */
    about: {
      eyebrow: "About us",
      title: "Experiencing Luxury, Before It’s Built",
      companyLabel: "At a Glance",
      companyTitle: "About Trilux",
      visionLabel: "Vision",
      missionsLabel: "Missions",
    },
    expertise: {
      eyebrow: "Our Expertise",
      title: "Expertise that handles everything, from start to finish.",
    },
    services: {
      eyebrow: "Services",
      title: "Interior, exterior, systems, and its production.",
      sub: "Turnkey fit-out & project — from concept to key handover.",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Completed projects.",
      sub: "Every project has a View details button — description, specifications, and a 3D-view gallery.",
      featuredProject: "Featured Project",
      viewDetails: "View details",
      projectDetails: "Project Details",
      specifics: "Specifics",
      type: "Type",
      client: "Client",
      gallery3d: "Gallery — 3D views",
      placeholderNote: "Shapes-based placeholder — original project photos to follow (design phase).",
      closeDetails: "Close project details",
      viewProject: "View project",
    },
    gallery: {
      eyebrow: "Gallery",
      title: "3D view catalogue.",
      prev: "Previous image",
      next: "Next image",
      thumbRail: "Gallery thumbnails",
      choose: "Select",
      clickToZoom: "click to zoom",
      closeZoom: "Close zoom",
    },
    clients: {
      eyebrow: "Our Clients",
      title: "Trusted by residential & commercial projects.",
    },
    news: {
      eyebrow: "Articles",
      title: "Design inspiration articles.",
      read: "min read",
      readMore: "Read",
    },
    studioTeaser: {
      eyebrow: "Studio · Exclusive",
      title: "Test your space concept before the survey.",
      body: "Adjust partitions, drag furniture, and set dimensions in centimetres — an early exploration tool for your project, before the Trilux team goes on site.",
      cta: "Open Studio",
      note: "Exclusive access for prospective clients · early exploration before site survey",
    },
    contact: {
      eyebrow: "Contact",
      title: "Tell us about your project.",
      sub: "Free site survey, then our team prepares a detailed BOQ — binding figures, not estimates.",
      phone: "Phone",
      email: "Email",
      instagram: "Instagram",
      location: "Location",
      whatsapp: "Whatsapp",
      emailUs: "Email Us",
    },
    footer: {
      whatsapp: "WhatsApp",
      email: "Email",
      modeDark: "Dark mode",
      modeLight: "Light mode",
    },
    /* studio page (/studio) */
    studio: {
      back: "Back",
      backToLanding: "Back to landing",
      kicker: "Studio — Interactive Space Exploration",
      heading: "Test your space before our team goes on site.",
      room: "Room",
      width: "Width",
      depth: "Depth",
      partitions: "Partitions / Walls",
      furniture: "Furniture",
      furnitureWidth: "Furniture width",
      addPartition: "Add partition",
      remove: "Remove",
      addVertical: "Vertical partition",
      addHorizontal: "Horizontal partition",
      orientationV: "vertical",
      orientationH: "horizontal",
      newPartition: "Partition",
      gridNote: "Grid = 40 cm. All dimensions in centimetres. Dummy values per brief.",
      partitionHint: "Drag the brass handle to change length. Drag the partition body to move it. Click a partition without dragging to remove it.",
      furnitureHint: "Drag furniture on the canvas. Select one to view & change its size (cm).",
      selectedSize: "Selected size:",
      selectHint: "Click furniture to select · drag to move · brass handle to resize",
      disclaimer: "Interactive space exploration — dummy. Accounts and collaboration features are not available yet.",
      floorplanAria: "Interactive floorplan — drag furniture, adjust partitions and sizes in centimetres",
      handlePartition: "Partition handle",
      reduce: "Decrease",
      increase: "Increase",
      bodyIntro: "Partitions are adjustable, furniture is draggable, dimensions in centimetres — early exploration before the survey.",
    },
    /* marquee */
    marquee: {
      strip: "Portfolio strip",
    },
  },
}

export type Dict = (typeof dict)["id"];

/* ─── Konteks ─────────────────────────────────────────────────────── */

interface LocaleCtx {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<LocaleCtx>({
  locale: DEFAULT_LOCALE,
  t: dict[DEFAULT_LOCALE],
  setLocale: () => {},
});

function readInitial(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "id" || saved === "en") return saved;
    /* deep-link/QA: ?lang=en|id didahulukan (tanpa menyimpan) */
    const qp = new URLSearchParams(window.location.search).get("lang");
    if (qp === "id" || qp === "en") return qp;
  } catch {
    /* localStorage tidak tersedia — abaikan */
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitial);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  /* sync <html lang> — aksesibilitas + SEO, tanpa reload */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, t: dict[locale], setLocale }),
    [locale, setLocale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}
