/* Expertise — OUR EXPERTISE, 4 kolom bernomor (brief v0: "modern & minimalist").
   Sel-sel bernomor 01–04, hairline top, hover: angka naik tipis + garis brass. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import type { ExpertiseItem } from "../../types";

export default function Expertise({ items }: { items: ExpertiseItem[] }) {
  return (
    <section id="expertise" className="border-t border-neutral-200 px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading eyebrow="Our Expertise" title="Keahlian yang mengerjakan segalanya, dari awal hingga akhir." />

      <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c, i) => (
          <Reveal key={c.num} delay={i * 90}>
            <div className="group border-t-2 border-neutral-900 pt-5 transition-transform duration-300 hover:-translate-y-1">
              <span className="block text-sm font-semibold text-neutral-400 tabular-nums transition-colors duration-300 group-hover:text-neutral-900">
                {c.num}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-900 leading-snug">
                {c.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{c.text}</p>
              <span className="mt-5 block h-[2px] w-8 bg-neutral-900 transition-all duration-300 group-hover:w-16 group-hover:bg-[#b07f3a]" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
