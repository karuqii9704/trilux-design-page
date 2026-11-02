/* Hero — MINIMAL TEXT-ONLY (dipulihkan 2026-11-02 dari git history f02c52f/
   0019bf9 — "Hero — minimal white, teks saja (tanpa kartu/foto)" — DAN
   disesuaikan mockup brief image_33f79b: eyebrow kecil + H1 dua baris +
   subhead + 2 CTA pill, bg putih polos, TANPA stat card, corner card,
   shapes, maupun panel glass/RIVR).
   Copy mengikuti mockup hero brief secara verbatim (gpt-4o vision read):
   eyebrow "Interior · Exterior · Architecture — Jakarta", H1 EN dua baris
   (baris 2 brass), subhead = intro CMS (ID: "…visualisasi imersif…",
   EN: "…immersive visualization…"), CTA "Book a meeting" (pill gelap) +
   "View Project →" (outline). Bilingual via useLocale. */
import Reveal from "./Reveal";
import { useLocale } from "../hooks/useLocale";

interface HeroProps {
  intro: string; // subhead bilingual dari CMS (content.about.intro)
}

export default function Hero({ intro }: HeroProps) {
  const { t } = useLocale();

  return (
    <section id="top" aria-label="Hero" className="flex min-h-[70vh] items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6">
      <div className="w-full max-w-3xl">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">
            {t.hero.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="mx-auto mt-6 text-4xl font-semibold leading-[1.05] tracking-tight tr-fg sm:text-5xl md:text-7xl lg:text-[5.5rem]">
            {t.hero.titleA}
            <br />
            <em className="not-italic tr-brass">{t.hero.titleB}</em>
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed tr-muted sm:mt-6 sm:text-lg md:text-xl">
            {intro}
          </p>
        </Reveal>
        <Reveal delay={360}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contact"
              className="tr-btn inline-flex rounded-full px-7 py-3.5 text-sm font-medium"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="/project"
              className="inline-flex items-center gap-2 rounded-full border tr-line px-7 py-3.5 text-sm font-medium tr-fg transition-colors hover:border-current"
            >
              {t.hero.ctaSecondary}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
