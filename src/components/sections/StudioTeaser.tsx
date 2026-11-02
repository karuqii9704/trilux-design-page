/* StudioTeaser — menggantikan section Studio interaktif di landing.
   Tujuan (user): studio TIDAK lagi muncul interaktif di landing — cukup teks +
   tombol yang membawa ke halaman Studio terpisah (/studio), supaya terasa
   lebih EKSKLUSIF (alat eksplorasi ruang = halaman khusus, bukan section biasa).
   i18n (2026-11-02): heading/body/CTA/note dari useLocale().t; disclaimer CMS.
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { navigate } from "../../hooks/usePath";
import { useLocale } from "../../hooks/useLocale";

export default function StudioTeaser({ note }: { note: string }) {
  const { t } = useLocale();

  return (
    <section id="studio" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow={t.studioTeaser.eyebrow}
        title={t.studioTeaser.title}
        align="left"
      />

      <Reveal className="mt-10" delay={100}>
        <div className="border tr-line rounded-sm tr-surface p-6 sm:p-10">
          <p className="max-w-2xl text-base sm:text-lg tr-muted leading-relaxed">
            {t.studioTeaser.body}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => navigate("/studio")}
              className="tr-btn inline-flex text-sm font-medium rounded-full px-6 py-3 cursor-pointer"
            >
              {t.studioTeaser.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
            <p className="text-xs tr-faint">
              {t.studioTeaser.note}
            </p>
          </div>
          <p className="mt-6 text-xs tr-faint border-t tr-line pt-4">{note}</p>
        </div>
      </Reveal>
    </section>
  );
}
