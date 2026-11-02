/* Hero — adaptasi template RIVR glassmorphism ke Trilux (reset 2026-11-02).
   STRUKTUR TEMPLATE: page bg polos cerah → panel full-screen (rounded besar,
   overflow hidden) berisi: navbar floating island, copy centered (badge + H1 +
   sub + CTA), glass stat card bottom-left, corner card bottom-right.
   ATURAN STANDING (user, 4× ditegaskan): NO foto/video layer — bg video template
   diganti shapes SVG abstrak samar (komponen Shapes, warna ikut tema).
   Bg hero POLOS CERAH (--tr-bg) supaya copy gampang dibaca, per instruksi user.
   Semua warna via utilitas tema (.tr-*) — otomatis ikut mode gelap/terang. */
import { useEffect, useRef } from "react";
import Reveal from "./Reveal";
import { Shape } from "./Shapes";
import { navigate } from "../hooks/usePath";

interface HeroProps {
  intro: string;
  wa: string;
}

/* stats jujur dari seed CMS (featured = 1 project; projects list kosong → "1+") */
const STATS = [
  { value: "1+", label: "Project delivered" },
  { value: "4", label: "Disciplines in-house" },
] as const;

export default function Hero({ intro }: HeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  /* pointer parallax halus pada rig shapes (desktop pointer halus saja,
     nonaktif kalau reduced-motion) — pola yang sama dengan Shapes gallery */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const rig = stage.querySelector<HTMLElement>("[data-rig]");
    if (!rig) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 14;
      ty = (e.clientY / window.innerHeight - 0.5) * 10;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      rig.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="top"
      className="tr-surface-solid relative flex h-svh flex-col overflow-hidden px-3 pt-3 sm:px-5 sm:pt-4"
      aria-label="Trilux Design — hero"
    >
      {/* ── panel template: rounded besar, bg cerah polos (+ shapes samar) ── */}
      <div className="tr-clay relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-[1.5rem] border tr-line sm:rounded-[2.5rem]">
        {/* bg polos cerah — mudah dibaca (instruksi user) */}
        <div className="tr-bg absolute inset-0" aria-hidden="true" />
        {/* shapes stage SAMAR — pengisi visual tanpa mengurangi keterbacaan */}
        <div
          ref={stageRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.12]"
          aria-hidden="true"
        >
          <div data-rig className="w-[130%] max-w-5xl will-change-transform">
            <Shape variant={1} className="h-auto w-full" />
          </div>
        </div>

        {/* ── copy centered (template: badge · H1 · sub · CTA) ──
             pb besar supaya CTA tidak pernah masuk zona kartu bawah di viewport
             pendek (stat/corner anchor bottom ~ naik menyerang tengah). */}
        <div className="hero-copy relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-40 pt-14 text-center md:pb-48">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border tr-line tr-glass px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] tr-faint">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tr-brass"
                aria-hidden="true"
              >
                <path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z" />
              </svg>
              Interior · Exterior · Architecture — Jakarta
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-6 text-4xl font-normal tracking-tight tr-fg leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Experiencing Luxury,
              <br />
              <em className="not-italic tr-brass">Before It&rsquo;s Built.</em>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="hero-sub mt-5 max-w-xl text-base leading-relaxed tr-muted sm:text-lg md:text-xl">
              {intro}
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#contact"
                className="tr-btn inline-flex rounded-full px-7 py-3.5 text-sm font-medium"
              >
                Book a meeting
              </a>
              <a
                href="/project"
                className="inline-flex items-center gap-2 rounded-full border tr-line px-7 py-3.5 text-sm font-medium tr-fg transition-colors hover:border-current"
              >
                View Project
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </Reveal>
        </div>

        {/* ── glass stat card — template BottomLeftCard:
             desktop left-bawah · mobile berpindah kanan (right-4, di atas corner
             card) supaya tidak menumpuk corner card di layar sempit.
             VIEWPORT PENDEK: naik + compact (query max-height di index.css).
             NOTE: pakai div biasa + animasi CSS entrance (bukan Reveal/IO) —
             kartu anchor-bottom sudah di layar pertama; IO terbukti tidak
             reliable untuk elemen absolute yang sedikit overflow clip. ── */}
        <div
          className="hero-statcard hero-entrance absolute bottom-28 right-4 left-auto z-10 md:bottom-10 md:left-10 md:right-auto"
          style={{ animationDelay: "300ms" }}
        >
          <div className="tr-glass flex items-center gap-4 rounded-[1.2rem] p-3 sm:rounded-[1.5rem] sm:p-4 md:gap-6 md:rounded-[2rem] md:p-6">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-start gap-1">
                <b className="text-xl font-normal tracking-tight tr-fg tabular-nums md:text-3xl">
                  {s.value}
                </b>
                <span className="text-[9px] uppercase tracking-[0.14em] tr-faint md:text-xs">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── corner card — bottom-right (template BottomRightCorner) → studio.
             VIEWPORT PENDEK: compact (query max-height di index.css).
             Div biasa + animasi entrance (bukan Reveal) — lihat catatan stat card. ── */}
        <div
          className="hero-cornercard hero-entrance absolute bottom-6 right-4 z-10 md:bottom-10 md:right-10"
          style={{ animationDelay: "420ms" }}
        >
          <button
            type="button"
            onClick={() => navigate("/studio")}
            className="tr-clay tr-corner tr-surface flex cursor-pointer items-center gap-3 rounded-[1.2rem] py-3 pl-4 pr-5 text-left transition-transform duration-300 hover:-translate-y-0.5 sm:rounded-[1.5rem] md:rounded-[2rem] md:gap-4 md:py-4 md:pl-5 md:pr-6"
            aria-label="Buka studio simulator"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border tr-line tr-fg md:h-11 md:w-11">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </span>
            <span>
              <b className="block text-sm font-semibold tracking-tight tr-fg md:text-base">
                Walk the studio
              </b>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] tr-faint md:text-xs">
                Simulator →
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
