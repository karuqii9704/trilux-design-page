/* StudioPage — halaman EKSKLUSIF /studio (pindah dari landing section).
   Header sendiri (logo → home, badge "Akses Eksklusif", back link, CTA WA),
   intro, floorplan interaktif penuh (drag furnitur cm + partisi adjustable + stepper),
   disclaimer dummy jujur, footer minimal.
   Rute dijamin oleh vercel.json rewrite /studio → /index.html (direct-load & refresh aman). */
import { navigate, RouteLink } from "../hooks/usePath";
import { TriluxLogo } from "../components/Logo";
import StudioFloorplan from "../components/sections/Studio";
import Reveal from "../components/Reveal";
import type { ContentData, StudioData } from "../types";

const WA_URL = "https://wa.me/6282287348422";

interface StudioPageProps {
  content: ContentData;
}

export default function StudioPage({ content }: StudioPageProps) {
  const studio: StudioData = content.studio;
  void content.site; // site dipakai Contact di landing; halaman studio pakai kontak WA langsung

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Header khusus studio (bukan navbar landing) ===== */}
      <header className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Trilux Design — kembali ke landing"
            className="flex items-center gap-2.5 text-neutral-900 cursor-pointer"
          >
            <TriluxLogo size={26} />
            <span className="text-base font-semibold tracking-tight">
              Trilux<em className="not-italic font-medium text-neutral-500">&nbsp;Design</em>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600 border border-neutral-300 rounded-full px-3 py-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="11" width="16" height="10" rx="1" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Akses Eksklusif
            </span>
            <RouteLink
              to="/"
              className="text-sm font-medium text-neutral-700 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
            >
              ← Landing
            </RouteLink>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener"
              className="hidden sm:inline-flex text-sm font-medium text-white bg-neutral-900 rounded-full px-5 py-2.5 hover:bg-neutral-800 transition-colors"
            >
              Book a meeting
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ===== Intro ===== */}
        <section className="px-4 sm:px-6 md:px-10 pt-14 sm:pt-20 pb-4 max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
              Studio — Eksplorasi Ruang Interaktif
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl">
              Uji ruang Anda sebelum tim kami ke lokasi.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl">
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

      {/* ===== Footer minimal ===== */}
      <footer className="border-t border-neutral-200 px-4 sm:px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Trilux Design · Studio — eksplorasi dummy (akun &amp; kolaborasi belum tersedia)
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener"
            className="text-xs font-medium text-neutral-700 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
          >
            Lanjutkan via WhatsApp →
          </a>
        </div>
      </footer>
    </div>
  );
}
