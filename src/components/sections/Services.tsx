/* Services — 4 layanan (Interior · Exterior · MEP · Manufacturing).
   Brief v0: "visualisasikan lebih modern & minimalist" → numbered rows/hairline,
   hover reveal deskripsi + points. Berbasis data CMS.
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import { useState } from "react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import type { ServiceItem } from "../../types";

export default function Services({ services }: { services: ServiceItem[] }) {
  const [active, setActive] = useState<number>(0);

  return (
    <section id="services" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Services"
        title="Interior, exterior, sistem, hingga produksinya."
        sub="Turnkey fit-out & project — dari konsep hingga serah terima kunci."
      />

      <div className="mt-12">
        {services.map((s, i) => {
          const open = i === active;
          return (
            <Reveal key={s.name} delay={i * 60}>
              <button
                type="button"
                onClick={() => setActive(open ? -1 : i)}
                aria-expanded={open}
                className="group w-full text-left border-t tr-line py-6 sm:py-7 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:tr-line-strong"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
                    <span className="text-xs font-medium tr-faint tabular-nums">{s.tag}</span>
                    <h3 className={`text-2xl sm:text-3xl font-semibold tracking-tight transition-colors duration-300 tr-fg ${
                      open ? "" : "group-hover:tr-faint"
                    }`}>
                      {s.name}
                    </h3>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex-none text-2xl leading-none tr-faint transition-transform duration-500 ${
                      open ? "rotate-45 tr-fg" : ""
                    }`}
                  >
                    +
                  </span>
                </div>

                {/* jawaban accordion — animasi grid-rows (GPU-friendly) */}
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-4 max-w-3xl">
                      <p className="text-base sm:text-lg tr-muted leading-relaxed">{s.desc}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {s.points.map((p: string) => (
                          <li
                            key={p}
                            className="tr-chip text-xs font-medium uppercase tracking-wider px-3 py-1.5"
                          >
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            </Reveal>
          );
        })}
        <div className="border-t tr-line" />
      </div>
    </section>
  );
}
