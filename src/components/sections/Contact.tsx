/* Contact — CONTACT (brief v0 nav item).
   Copy singkat + kontak asli (WA/email/IG/lokasi dari CMS site).
   Footer = FooterIsland (floating island) — dirender Landing, bukan di sini.
   i18n (2026-11-02): heading + label dl + CTA dari useLocale().t; data kontak
   dari CMS (phone/email/IG/lokasi bilingual). Warna via utilitas tema. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useLocale } from "../../hooks/useLocale";
import type { SiteData } from "../../types";

export default function Contact({ site }: { site: SiteData }) {
  const { t } = useLocale();

  return (
    <section id="contact" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={t.contact.eyebrow}
            title={t.contact.title}
            sub={t.contact.sub}
          />
          <Reveal delay={150}>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={site.wa}
                target="_blank"
                rel="noopener"
                className="tr-btn inline-flex text-sm font-medium rounded-full px-6 py-3"
              >
                {t.contact.whatsapp} →
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium tr-fg border tr-line rounded-full px-6 py-3 hover:border-current transition-colors"
              >
                {t.contact.emailUs} →
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <dl className="border-t-2 tr-line-strong pt-6 space-y-5 text-sm">
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">{t.contact.phone}</dt>
              <dd className="font-medium tr-fg">
                <a href={site.phoneHref} className="hover:opacity-60 transition-opacity">{site.phone}</a>
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">{t.contact.email}</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="tr-muted hover:tr-fg transition-colors">{site.email}</a>
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">{t.contact.instagram}</dt>
              <dd>
                <a href={site.instagramUrl} target="_blank" rel="noopener" className="tr-muted hover:tr-fg transition-colors">
                  {site.instagram}
                </a>
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-24 flex-none text-xs uppercase tracking-wider tr-faint pt-0.5">{t.contact.location}</dt>
              <dd className="tr-muted">{site.location}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
