/* Clients — OUR CLIENTS (brief v0: "dummy; if any").
   Text rail marquee (CSS loop — bukan core interaction) + disclaimer jujur:
   publikasi logo menunggu persetujuan tertulis. Pause saat hover. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import type { ClientsData } from "../../types";

export default function Clients({ clients }: { clients: ClientsData }) {
  const items = clients?.items ?? [];
  const rail = [...items, ...items]; // duplikasi untuk loop seamless
  return (
    <section id="clients" className="border-t border-neutral-200 px-4 sm:px-6 md:px-10 py-16 sm:py-20 max-w-6xl mx-auto">
      <SectionHeading eyebrow="Our Clients" title="Dipercaya proyek-proyek residensial & komersial." align="left" />

      <Reveal className="mt-10">
        <div className="trilux-rail overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="trilux-rail-track flex w-max items-stretch gap-3">
            {rail.map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="flex-none flex items-center gap-3 border border-neutral-200 rounded-sm px-6 py-4 bg-white"
              >
                <span className="flex-none w-9 h-9 border border-neutral-300 rounded-sm flex items-center justify-center text-sm font-semibold text-neutral-500">
                  {(c.name || "C").charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">{c.name}</span>
                  <span className="block text-xs text-neutral-500">{c.type}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-400 max-w-2xl">{clients.note}</p>
      </Reveal>
    </section>
  );
}
