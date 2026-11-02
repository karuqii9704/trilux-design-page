/* StudioPage — halaman EKSKLUSIF /studio (pindah dari landing section).
   Memakai Navbar floating-island (shared dengan landing) + StudioFooterIsland.
   Badge "Akses Eksklusif" DIHAPUS (user) — eksklusivitas disampaikan lewat
   copy teaser di landing + halaman khusus, bukan badge.
   Intro, floorplan interaktif penuh (drag furnitur cm + partisi adjustable +
   stepper), disclaimer dummy jujur.
   Rute dijamin oleh vercel.json rewrite catch-all → /index. */
import StudioFloorplan from "../components/sections/Studio";
import Navbar from "../components/Navbar";
import FooterIsland from "../components/FooterIsland";
import Reveal from "../components/Reveal";
import { RouteLink } from "../hooks/usePath";
import type { ContentData, StudioData } from "../types";

interface StudioPageProps {
  content: ContentData;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function StudioPage({ content, menuOpen, setMenuOpen }: StudioPageProps) {
  const studio: StudioData = content.studio;
  void content.site; // site dipakai Contact di landing; halaman studio pakai kontak WA langsung

  return (
    <div className="min-h-screen tr-bg">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {/* ===== Intro ===== */}
        <section className="px-4 sm:px-6 md:px-10 pt-28 sm:pt-32 pb-4 max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between gap-4">
              <RouteLink
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-current transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Kembali ke landing
              </RouteLink>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
                Studio — Eksplorasi Ruang Interaktif
              </p>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight tr-fg leading-[1.08] max-w-3xl">
              Uji ruang Anda sebelum tim kami ke lokasi.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {studio.note} Partisi bisa di-adjust, furnitur bisa ditarik, ukuran dalam
              satuan cm — eksplorasi awal sebelum survei.
            </p>
          </Reveal>
        </section>

        {/* ===== Floorplan interaktif ===== */}
        <section className="px-4 sm:px-6 md:px-10 pb-16 sm:pb-24 max-w-6xl mx-auto" aria-label="Floorplan interaktif">
          <StudioFloorplan studio={studio} />
        </section>
      </main>
      <FooterIsland />
    </div>
  );
}
