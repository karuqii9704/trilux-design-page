/* Navbar — FLOATING ISLAND CLAYMORPHISM (melayang di tengah atas, rounded-full,
   tonjolan cahaya + bayangan ganda lembut, backdrop-blur, border tipis).
   - Island: logo kiri · menu anchor tengah (desktop) · theme toggle + CTA + burger kanan
   - BURGER MOBILE (diperbaiki 2026-11-02): hit-area 44px (h-11 w-11), garis 2px
     lebih tebal + terlihat, posisi FLOW (bukan absolute) → tidak pernah tertindih
     CTA/logo di layar sempit. Hanya tampil < md.
   - Theme toggle: matahari (terang) ↔ bulan (gelap) — ikon bermakna.
   - Drawer: mobile slide-up / desktop slide-from-right (500ms, expo).
   - Links stagger 150 + i*60 ms; hamburger→X morph; body scroll lock.
   Dipakai Landing dan StudioPage (props opsional). */
import { useEffect } from "react";
import { TriluxLogo } from "./Logo";
import { RouteLink } from "../hooks/usePath";
import { useTheme } from "../hooks/useTheme";

interface NavbarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

interface NavLink {
  label: string;
  href?: string; // anchor di landing
  route?: string; // SPA route (pushState)
}

/* anchor ke section brief v0 (Simulator "please take out" — sengaja tidak ada).
   Studio = ROUTE terpisah /studio (halaman eksklusif), bukan anchor. */
const LINKS: NavLink[] = [
  { label: "Work", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Studio", route: "/studio" },
  { label: "Contact", href: "#contact" },
];

const WA_URL = "https://wa.me/6282287348422";

/* kelas transform untuk drawer + link stagger — dipisah agar tidak ada inline <style> */
const DRAWER_CSS = `
  .trilux-drawer { top: 0; left: 0; right: 0; bottom: 0; width: 100%;
    transition: transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 500ms cubic-bezier(0.16,1,0.3,1); }
  @media (min-width: 640px) { .trilux-drawer { left: auto; max-width: 24rem; } }
  .trilux-drawer[data-state="open"]   { transform: translate(0,0);  pointer-events: auto; }
  .trilux-drawer[data-state="closed"] { transform: translate(0,100%); pointer-events: none; }
  @media (min-width: 640px) {
    .trilux-drawer[data-state="open"]   { transform: translateX(0); }
    .trilux-drawer[data-state="closed"] { transform: translateX(100%); }
  }
  .trilux-link { opacity: 0; transform: translateX(2rem);
    transition: opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1); }
  .trilux-drawer[data-state="open"] .trilux-link { opacity: 1; transform: translateX(0); }
  .trilux-cta-drawer { opacity: 0; transform: translateY(1rem);
    transition: opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1); }
  .trilux-drawer[data-state="open"] .trilux-cta-drawer { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    .trilux-drawer, .trilux-link, .trilux-cta-drawer { transition-duration: 0.01ms; }
  }
`;

/* Ikon tema — matahari saat GELAP (klik → terang), bulan saat TERANG (klik → gelap). */
function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {theme === "light" ? (
        /* bulan — klik untuk gelap */
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      ) : (
        /* matahari — klik untuk terang */
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      )}
    </svg>
  );
}

export default function Navbar({ menuOpen, setMenuOpen }: NavbarProps) {
  const { theme, toggle } = useTheme();

  /* body scroll lock while menu open (spesifikasi: document.body.style.overflow) */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  /* Escape tutup menu */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      <style>{DRAWER_CSS}</style>

      {/* ══════════ FLOATING ISLAND — claymorphism (fixed, terpusat, melayang) ══════════ */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
        <nav className="tr-clay tr-surface pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border tr-line px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
          {/* LEFT — logo */}
          <a
            href="#top"
            aria-label="Trilux Design — home"
            className="tr-fg flex shrink-0 items-center gap-2"
          >
            <TriluxLogo size={24} />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              Trilux<em className="not-italic font-medium opacity-50">&nbsp;Design</em>
            </span>
          </a>

          {/* CENTER — menu anchor (desktop ≥md saja) */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex lg:gap-8">
            {LINKS.map((l) =>
              l.route ? (
                <RouteLink
                  key={l.label}
                  to={l.route}
                  className="tr-fg text-sm font-normal opacity-80 transition-opacity hover:opacity-50"
                >
                  {l.label}
                </RouteLink>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="tr-fg text-sm font-normal opacity-80 transition-opacity hover:opacity-50"
                >
                  {l.label}
                </a>
              ),
            )}
          </ul>

          {/* RIGHT — theme toggle + CTA (desktop) + burger (mobile) */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "light" ? "Mode gelap" : "Mode terang"}
              title={theme === "light" ? "Mode gelap" : "Mode terang"}
              className="tr-fg flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5"
            >
              <ThemeIcon theme={theme} />
            </button>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener"
              className="tr-btn hidden rounded-full px-4 py-2 text-xs font-medium tracking-wide sm:inline-flex"
            >
              Book a meeting
            </a>
            {/* BURGER — mobile only (< md). Hit area 44px, garis 2px tebal,
                posisi FLOW (bukan absolute) → tidak pernah tertindih elemen lain. */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="tr-fg flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5 md:hidden"
            >
              <span className="flex flex-col items-center justify-center gap-[6px]" aria-hidden="true">
                <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 hover:w-6" />
                <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 hover:w-6" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ══════════ OVERLAY ══════════ */}
      <div
        className={`tr-overlay fixed inset-0 z-[60] backdrop-blur-sm transition-opacity duration-500 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ══════════ DRAWER / FULL-SCREEN MENU ══════════ */}
      <aside
        className="trilux-drawer tr-bg fixed z-[70]"
        data-state={menuOpen ? "open" : "closed"}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
      >
        {/* header: logo + close (X morph) */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-10">
          <span className="tr-fg flex items-center gap-2.5">
            <TriluxLogo size={28} />
            <span className="text-base font-semibold tracking-tight">
              Trilux<em className="not-italic font-medium opacity-50">&nbsp;Design</em>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="tr-fg relative h-11 w-11 cursor-pointer rounded-full transition-colors hover:bg-black/5"
          >
            <span
              className="absolute left-1/2 top-1/2 block h-[2px] w-5 rounded-full bg-current transition-all duration-500"
              style={{
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transform: menuOpen
                  ? "translate(-50%,-50%) rotate(45deg)"
                  : "translate(-50%, calc(-50% - 3px)) rotate(0deg)",
              }}
            />
            <span
              className="absolute left-1/2 top-1/2 block h-[2px] w-5 rounded-full bg-current transition-all duration-500"
              style={{
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transform: menuOpen
                  ? "translate(-50%,-50%) rotate(-45deg)"
                  : "translate(-50%, calc(-50% + 3px)) rotate(0deg)",
              }}
            />
          </button>
        </div>

        {/* links (stagger 150 + i*60 ms) */}
        <nav className="px-4 pt-6 sm:px-6 md:px-10" aria-label="Menu">
          {LINKS.map((l, i) =>
            l.route ? (
              <RouteLink
                key={l.label}
                to={l.route}
                onClick={() => setMenuOpen(false)}
                className="trilux-link tr-fg block py-3 text-3xl font-medium transition-opacity hover:opacity-50"
                style={menuOpen ? { transitionDelay: `${150 + i * 60}ms` } : { transitionDelay: "0ms" }}
              >
                {l.label}
              </RouteLink>
            ) : (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="trilux-link tr-fg block py-3 text-3xl font-medium transition-opacity hover:opacity-50"
                style={menuOpen ? { transitionDelay: `${150 + i * 60}ms` } : { transitionDelay: "0ms" }}
              >
                {l.label}
              </a>
            ),
          )}

          {/* drawer CTA — delay 400ms */}
          <div className="pt-12">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener"
              onClick={() => setMenuOpen(false)}
              className="trilux-cta-drawer tr-btn inline-flex rounded-full px-6 py-3 text-sm font-medium"
              style={menuOpen ? { transitionDelay: "400ms" } : { transitionDelay: "0ms" }}
            >
              Book a meeting
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
