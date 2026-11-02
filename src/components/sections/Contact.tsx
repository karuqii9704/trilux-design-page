/* Contact — CONTACT (brief v0 nav item).
   Copy singkat + kontak asli (WA/email/IG/lokasi dari CMS site).
   Footer = FooterIsland (floating island) — dirender Landing, bukan di sini.
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import type { SiteData } from "../../types";

export default function Contact({ site }: { site: SiteData }) {
  return (
    <section id="contact" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Ceritakan proyek Anda."
            sub="Survei lokasi gratis, lalu tim kami buka RAB detail — angka yang mengikat, bukan estimasi."
          />
          <Reveal delay={150}>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={site.wa}
                target="_blank"
                rel="noopener"
                className="tr-btn text-sm font-medium rounded-full px-6 py-3"
              >
                Whatsapp →
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium tr-fg border tr-line rounded-full px-6 py-3 hover:border-current transition-colors"
              >
                Email Us →
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <dl className="border-t-2 tr-line-strong pt-6 space-y-5 text-sm">
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">Phone</dt>
              <dd className="font-medium tr-fg">
                <a href={site.phoneHref} className="hover:opacity-60 transition-opacity">{site.phone}</a>
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="tr-muted hover:tr-fg transition-colors">{site.email}</a>
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">Instagram</dt>
              <dd>
                <a href={site.instagramUrl} target="_blank" rel="noopener" className="tr-muted hover:tr-fg transition-colors">
                  {site.instagram}
                </a>
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">Location</dt>
              <dd className="tr-muted">{site.location}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
