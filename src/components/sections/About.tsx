/* About — Sekilas Perusahaan + Visi & Misi (copy asli brief v0, verbatim).
   Layout modern-minimal: grid 2 kolom (intro + misi bernomor), visi sebagai panel quote.
   Warna via utilitas tema (.tr-*) — otomatis ikut mode gelap/terang. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import type { AboutData, Mission } from "../../types";

export default function About({ about }: { about: AboutData }) {
  return (
    <section id="about" className="px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow={about.eyebrow}
        title={about.title}
        align="left"
      />

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Sekilas Perusahaan */}
        <Reveal>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">
              {about.company.label}
            </p>
            <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight tr-fg">
              {about.company.title}
            </h3>
            <p className="mt-4 text-base sm:text-lg tr-muted leading-relaxed">
              {about.intro}
            </p>
            <p className="mt-4 text-base tr-muted leading-relaxed">
              {about.company.text}
            </p>
          </div>
        </Reveal>

        {/* Visi & Misi */}
        <Reveal delay={120}>
          <div className="border-l-2 tr-line-strong pl-6 sm:pl-8">
            <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">
              {about.vision.label}
            </p>
            <p className="mt-3 text-lg sm:text-xl tr-fg leading-snug font-medium">
              {about.vision.text}
            </p>

            <div className="mt-10 space-y-6">
              <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">Misi</p>
              {about.missions.map((m: Mission, i: number) => (
                <div key={m.title} className="flex gap-4">
                  <span className="text-sm font-semibold tr-faint pt-0.5 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="text-base font-semibold tr-fg">{m.title}</h4>
                    <p className="mt-1 text-sm sm:text-base tr-muted leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
