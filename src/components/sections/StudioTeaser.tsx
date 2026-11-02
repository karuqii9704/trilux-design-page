/* StudioTeaser — menggantikan section Studio interaktif di landing.
   Tujuan (user): studio TIDAK lagi muncul interaktif di landing — cukup teks +
   tombol yang membawa ke halaman Studio terpisah (/studio), supaya terasa
   lebih EKSKLUSIF (alat eksplorasi ruang = halaman khusus, bukan section biasa).
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { navigate } from "../../hooks/usePath";

export default function StudioTeaser({ note }: { note: string }) {
  return (
    <section id="studio" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Studio · Eksklusif"
        title="Uji konsep ruang Anda sebelum survei."
        align="left"
      />

      <Reveal className="mt-10" delay={100}>
        <div className="border tr-line rounded-sm tr-surface p-6 sm:p-10">
          <p className="max-w-2xl text-base sm:text-lg tr-muted leading-relaxed">
            Atur partisi, tarik furnitur, dan sesuaikan dimensi dalam satuan sentimeter —
            alat eksplorasi awal untuk proyek Anda, sebelum tim Trilux ke lokasi.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => navigate("/studio")}
              className="tr-btn text-sm font-medium rounded-full px-6 py-3 cursor-pointer"
            >
              Buka Studio
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
            <p className="text-xs tr-faint">
              Akses eksklusif untuk calon klien · eksplorasi awal sebelum survei lokasi
            </p>
          </div>
          <p className="mt-6 text-xs tr-faint border-t tr-line pt-4">{note}</p>
        </div>
      </Reveal>
    </section>
  );
}
