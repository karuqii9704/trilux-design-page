/* Navbar — fixed top bar + full-screen drawer menu (physics per spec prompt).
   Adaptasi Trilux: logo Trilux, link anchor ke section brief v0,
   CTA "Book a meeting" → WA.
   - Burger: 2 garis, hover shrink w-6→w-5, absolutely centered
   - Overlay: fade + backdrop-blur
   - Drawer: mobile slide-up / desktop slide-from-right (500ms, cubic-bezier(0.16,1,0.3,1))
   - Links stagger 150 + i*60 ms; hamburger→X morph; body scroll lock */
import { useEffect } from "react";
import { TriluxLogo } from "./Logo";
import { RouteLink } from "../hooks/usePath";

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

export default function Navbar({ menuOpen, setMenuOpen }: NavbarProps) {
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

      {/* ══════════ FIXED TOP BAR ══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          {/* LEFT — logo */}
          <a href="#top" aria-label="Trilux Design — home" className="flex items-center gap-2.5 text-neutral-900">
            <TriluxLogo size={28} />
            <span className="text-base font-semibold tracking-tight">
              Trilux<em className="not-italic font-medium text-neutral-500">&nbsp;Design</em>
            </span>
          </a>

          {/* CENTER — hamburger (2 garis, absolute centered) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-[5px] p-2 cursor-pointer"
          >
            <span className="block w-6 h-[1.5px] bg-neutral-900 rounded-full transition-all duration-300 hover:w-5" />
            <span className="block w-6 h-[1.5px] bg-neutral-900 rounded-full transition-all duration-300 hover:w-5" />
          </button>

          {/* RIGHT — CTA (desktop only) */}
          <div className="flex items-center">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener"
              className="hidden sm:inline-flex text-sm font-medium text-white bg-neutral-900 rounded-full px-5 py-2.5 hover:bg-neutral-800 transition-colors"
            >
              Book a meeting
            </a>
            {/* mobile spacer — seimbangkan logo */}
            <span className="block w-7 sm:hidden" aria-hidden="true" />
          </div>
        </nav>
      </header>

      {/* ══════════ OVERLAY ══════════ */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ══════════ DRAWER / FULL-SCREEN MENU ══════════ */}
      <aside
        className="trilux-drawer fixed z-[70] bg-white"
        data-state={menuOpen ? "open" : "closed"}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
      >
        {/* header: logo + close (X morph) */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <span className="flex items-center gap-2.5 text-neutral-900">
            <TriluxLogo size={28} />
            <span className="text-base font-semibold tracking-tight">
              Trilux<em className="not-italic font-medium text-neutral-500">&nbsp;Design</em>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="relative w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <span
              className={`absolute left-1/2 top-1/2 block w-5 h-[1.5px] bg-neutral-900 rounded-full transition-all duration-500 ${
                menuOpen ? "-rotate-45" : "rotate-0 -translate-y-[3px]"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transform: menuOpen
                  ? "translate(-50%,-50%) rotate(45deg)"
                  : "translate(-50%, calc(-50% - 3px)) rotate(0deg)",
              }}
            />
            <span
              className={`absolute left-1/2 top-1/2 block w-5 h-[1.5px] bg-neutral-900 rounded-full transition-all duration-500 ${
                menuOpen ? "rotate-45" : "rotate-0 translate-y-[3px]"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transform: menuOpen
                  ? "translate(-50%,-50%) rotate(45deg)"
                  : "translate(-50%, calc(-50% + 3px)) rotate(0deg)",
              }}
            />
          </button>
        </div>

        {/* links (stagger 150 + i*60 ms) */}
        <nav className="px-4 sm:px-6 md:px-10 pt-6" aria-label="Menu">
          {LINKS.map((l, i) =>
            l.route ? (
              <RouteLink
                key={l.label}
                to={l.route}
                onClick={() => setMenuOpen(false)}
                className="trilux-link block text-3xl font-medium text-neutral-900 py-3 hover:text-neutral-500 transition-colors"
                style={menuOpen ? { transitionDelay: `${150 + i * 60}ms` } : { transitionDelay: "0ms" }}
              >
                {l.label}
              </RouteLink>
            ) : (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="trilux-link block text-3xl font-medium text-neutral-900 py-3 hover:text-neutral-500 transition-colors"
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
              className="trilux-cta-drawer inline-flex text-sm font-medium text-white bg-neutral-900 rounded-full px-6 py-3 hover:bg-neutral-800 transition-colors"
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
