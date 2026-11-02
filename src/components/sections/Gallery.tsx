/* Gallery — GALLERY brief v0: katalog referensi, HANYA gambar tampak 3D (tanpa
   detail ukuran/material), wajib tombol swipe + zoom.
   Implementasi: carousel drag (pointer events, native di mobile), prev/next +
   thumb rail, zoom lightbox (klik gambar / tombol zoom / ESC tutup).
   Visual = shapes-based placeholder (8 varian) — jujur dummy, siap ganti aset asli.
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { Shape } from "../Shapes";
import type { GalleryData, GalleryItem } from "../../types";

export default function Gallery({ gallery }: { gallery: GalleryData }) {
  const items = gallery?.items ?? [];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0 });

  const n = items.length;
  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + n) % n),
    [n],
  );

  /* keyboard prev/next/esc */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (!zoom) {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, zoom]);

  /* drag-to-swipe pada track */
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current.down = true;
    drag.current.startX = e.clientX;
    drag.current.startScroll = trackRef.current?.scrollLeft ?? 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down || !trackRef.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 6) trackRef.current.scrollLeft = drag.current.startScroll - dx;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };

  return (
    <section id="gallery" className="border-t tr-line px-4 sm:px-6 md:px-10 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Gallery"
          title="Katalog tampak 3D."
          sub={gallery.note}
        />

        <Reveal className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm tr-faint tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Gambar sebelumnya"
                className="w-11 h-11 rounded-full border tr-line hover:border-current transition-colors tr-fg cursor-pointer"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Gambar berikutnya"
                className="w-11 h-11 rounded-full border tr-line hover:border-current transition-colors tr-fg cursor-pointer"
              >
                →
              </button>
            </div>
          </div>

          {/* stage — gambar besar + tombol zoom */}
          <div className="mt-4 relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-sm border tr-line tr-sunken touch-none">
            {gallery.items.map((g: GalleryItem, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setZoom(true)}
                aria-label={`Zoom: ${g.caption}`}
                className={`absolute inset-0 cursor-zoom-in transition-opacity duration-500 ${
                  i === index ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Shape variant={(i % 8) + 1} className="h-full w-full object-cover" />
              </button>
            ))}
            <span className="absolute bottom-4 left-4 tr-surface/90 border tr-line text-xs font-medium uppercase tracking-wider tr-muted px-3 py-1.5">
              {gallery.items[index]?.kind}
            </span>
            <span className="absolute bottom-4 right-4 tr-surface/90 border tr-line text-xs tr-faint px-3 py-1.5">
              klik untuk zoom
            </span>
          </div>

          {/* caption */}
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight tr-fg">
              {gallery.items[index]?.caption}
            </h3>
            <p className="text-sm tr-faint">{gallery.items[index]?.alt}</p>
          </div>

          {/* thumb rail — swipeable/draggable */}
          <div
            ref={trackRef}
            className="mt-4 flex gap-3 overflow-x-auto pb-2 select-none cursor-grab active:cursor-grabbing touch-pan-x"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="group"
            aria-label="Thumbnail gallery"
          >
            {gallery.items.map((g: GalleryItem, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Pilih ${g.caption}`}
                aria-current={i === index}
                className={`flex-none w-24 h-32 sm:w-28 sm:h-36 overflow-hidden rounded-sm border transition-all duration-300 cursor-pointer ${
                  i === index
                    ? "tr-line-strong border-2"
                    : "tr-line opacity-60 hover:opacity-100"
                }`}
              >
                <Shape variant={(i % 8) + 1} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Zoom lightbox */}
      {zoom && gallery.items[index] && (
        <div
          className="fixed inset-0 z-[70] tr-overlay flex items-center justify-center p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoom: ${gallery.items[index].caption}`}
          onClick={() => setZoom(false)}
        >
          <figure
            className="tr-surface max-w-4xl w-full rounded-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] sm:aspect-[16/10] tr-sunken">
              <Shape variant={(index % 8) + 1} className="h-full w-full object-cover" />
            </div>
            <figcaption className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tr-fg">{gallery.items[index].caption}</p>
                <p className="text-xs tr-faint mt-0.5">{gallery.items[index].alt}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Sebelumnya"
                  className="w-10 h-10 rounded-full border tr-line hover:border-current tr-fg cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Berikutnya"
                  className="w-10 h-10 rounded-full border tr-line hover:border-current tr-fg cursor-pointer"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(false)}
                  aria-label="Tutup zoom"
                  className="w-10 h-10 rounded-full tr-btn cursor-pointer"
                >
                  ×
                </button>
              </div>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
