/* StudioPage — halaman EKSKLUSIF /studio (pindah dari landing section).
   Memakai Navbar floating-island (shared dengan landing) + FooterIsland.
   Intro bilingual (useLocale + studio.note dari CMS bilingual), floorplan
   interaktif penuh (drag furnitur cm + partisi adjustable + stepper),
   disclaimer dummy jujur.
   Rute dijamin oleh vercel.json rewrite catch-all → /index. */
import StudioFloorplan from "../components/sections/Studio";
import Navbar from "../components/Navbar";
import FooterIsland from "../components/FooterIsland";
import Reveal from "../components/Reveal";
import { RouteLink } from "../hooks/usePath";
import { useLocale } from "../hooks/useLocale";
import type { ContentData, StudioData } from "../types";

interface StudioPageProps {
  content: ContentData;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function StudioPage({ content, menuOpen, setMenuOpen }: StudioPageProps) {
  const { t } = useLocale();
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
                className="inline-flex items-center gap-1.5 text-xs font-medium tr-faint underline underline-offset-4 tr-line hover:tr-fg transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {t.studio.backToLanding}
              </RouteLink>
              <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">
                {t.studio.kicker}
              </p>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight tr-fg leading-[1.08] max-w-3xl">
              {t.studio.heading}
            </h1>
            <p className="mt-4 text-base sm:text-lg tr-muted leading-relaxed max-w-2xl">
              {studio.note} {t.studio.bodyIntro}
            </p>
          </Reveal>
        </section>

        {/* ===== Floorplan interaktif ===== */}
        <section className="px-4 sm:px-6 md:px-10 pb-16 sm:pb-24 max-w-6xl mx-auto" aria-label={t.studio.floorplanAria}>
          <StudioFloorplan studio={studio} />
        </section>
      </main>
      <FooterIsland />
    </div>
  );
}
