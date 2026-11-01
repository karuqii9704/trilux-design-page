/* News — ARTICLE brief v0: "dummy; perlu artikel inspirasi desain di sosmed dan blog."
   3 kartu artikel dummy (copy jujur dari CMS) — kategori, judul, excerpt, meta. */
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import type { NewsData, NewsItem } from "../../types";

export default function News({ news }: { news: NewsData }) {
  return (
    <section id="news" className="border-t border-neutral-200 px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Articles"
        title="Artikel inspirasi desain."
        sub={news.note}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {news.items.map((a: NewsItem, i: number) => (
          <Reveal key={a.slug} delay={i * 90}>
            <article className="group flex flex-col h-full border border-neutral-200 rounded-sm p-6 bg-white hover:border-neutral-900 transition-colors duration-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  {a.category}
                </span>
                <span className="text-xs text-neutral-400 tabular-nums">{a.date}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-neutral-900 leading-snug group-hover:text-neutral-500 transition-colors">
                {a.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed flex-1">{a.excerpt}</p>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                <span>{a.readTime} baca</span>
                <span className="text-neutral-900 font-medium">Baca →</span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
