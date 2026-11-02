/* Portfolio — PORTFOLIO brief v0: proyek selesai + tombol "View details" per proyek.
   Featured project besar (Padang Residence I — data asli) + grid proyek lain.
   Lightbox detail: deskripsi, meta (spesifik/spesifikasi, tipe, client), highlights,
   gallery thumb (shapes-based placeholder).
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import { useState } from "react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { CoverShape, Shape } from "../Shapes";
import type { FeaturedProject, ProjectGalleryThumb, ProjectItem } from "../../types";

const WA_URL = "https://wa.me/6282287348422";

interface Props {
  featured: FeaturedProject;
  projects: ProjectItem[];
}

export default function Portfolio({ featured, projects }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openProject = openSlug
    ? projects.find((p) => p.slug === openSlug) ?? (openSlug === featured.slug ? featured : null)
    : null;

  return (
    <section id="portfolio" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Portfolio"
        title="Proyek yang sudah selesai dikerjakan."
        sub="Setiap proyek punya tombol View details — deskripsi, spesifikasi, dan galeri tampak 3D."
      />

      {/* Featured */}
      <Reveal className="mt-12">
        <article className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-sm border tr-line tr-sunken">
            <CoverShape className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">
              Featured Project {featured.index}
            </p>
            <h3 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight tr-fg">
              {featured.name}
            </h3>
            <p className="mt-2 text-sm tr-faint">
              {featured.location} · {featured.year}
            </p>
            <p className="mt-5 text-base sm:text-lg tr-muted leading-relaxed line-clamp-4">
              {featured.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider tr-faint">Type</p>
                <p className="mt-1 font-medium tr-fg">{featured.type}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider tr-faint">Client</p>
                <p className="mt-1 font-medium tr-fg">{featured.client}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenSlug(featured.slug)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tr-fg underline underline-offset-4 hover:opacity-60 transition-opacity cursor-pointer"
            >
              View details →
            </button>
          </div>
        </article>
      </Reveal>

      {/* Grid proyek lain */}
      {projects && projects.length > 0 && (
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <article className="group border tr-line rounded-sm overflow-hidden tr-surface">
                <button
                  type="button"
                  onClick={() => setOpenSlug(p.slug)}
                  aria-label={`Lihat detail ${p.name}`}
                  className="block w-full text-left cursor-pointer"
                >
                  <div className="aspect-[4/3] tr-sunken overflow-hidden">
                    <Shape
                      variant={(i % 8) + 1}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="px-5 py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight tr-fg group-hover:tr-faint transition-colors">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm tr-faint">
                        {p.location} · {p.year}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tr-fg underline underline-offset-4 group-hover:opacity-60 transition-opacity">
                      View details →
                    </span>
                  </div>
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {/* Lightbox detail proyek */}
      {openProject && (
        <Lightbox project={openProject} onClose={() => setOpenSlug(null)} />
      )}
    </section>
  );
}

function Lightbox({ project, onClose }: { project: FeaturedProject | ProjectItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] tr-overlay backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail proyek ${project.name}`}
      onClick={onClose}
    >
      <div
        className="tr-surface max-w-3xl w-full max-h-[88vh] overflow-y-auto rounded-sm shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b tr-line">
          <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">Project Details</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail proyek"
            className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xl leading-none tr-fg cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="px-5 sm:px-7 py-6">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight tr-fg">
            {project.name}
          </h3>
          <p className="mt-1 text-sm tr-faint">
            {project.location} · {project.year} · {project.type}
          </p>

          <div className="aspect-[16/9] mt-6 overflow-hidden border tr-line tr-sunken">
            <CoverShape className="h-full w-full object-cover" />
          </div>

          <p className="mt-6 text-base tr-muted leading-relaxed">{project.description}</p>

          {project.highlights && project.highlights.length > 0 && (
            <ul className="mt-6 space-y-2">
              {project.highlights.map((h: string) => (
                <li key={h} className="flex gap-3 text-sm tr-muted">
                  <span className="tr-brass" aria-hidden="true">—</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-6 grid sm:grid-cols-3 gap-4 border-t tr-line pt-5 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider tr-faint">Specifics</dt>
              <dd className="mt-1 font-medium tr-fg">{project.specifics}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider tr-faint">Type</dt>
              <dd className="mt-1 font-medium tr-fg">{project.type}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider tr-faint">Client</dt>
              <dd className="mt-1 font-medium tr-fg">{project.client}</dd>
            </div>
          </dl>

          {project.gallery && project.gallery.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.22em] tr-faint">Gallery — tampak 3D</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {project.gallery.map((_g: ProjectGalleryThumb, i: number) => (
                  <figure key={i} className="aspect-[3/4] overflow-hidden border tr-line tr-sunken">
                    <Shape variant={(i % 8) + 1} className="h-full w-full object-cover" />
                  </figure>
                ))}
              </div>
              <p className="mt-3 text-xs tr-faint">Placeholder shapes-based — foto asli proyek menyusul (tahap desain).</p>
            </div>
          )}

          <div className="mt-7">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex text-sm font-semibold tr-fg underline underline-offset-4 hover:opacity-60 transition-opacity"
            >
              Tanya proyek serupa via WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
