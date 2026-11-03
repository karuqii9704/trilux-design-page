/* Navbar — FLOATING ISLAND CLAYMORPHISM (melayang di tengah atas, rounded-full,
   tonjolan cahaya + bayangan ganda lembut, backdrop-blur, border tipis).
   - Island: logo kiri · menu anchor tengah (desktop) · language switcher + theme
     toggle + CTA + burger kanan
   - i18n (2026-11-02): label menu + CTA + aria-label dari useLocale().t —
     switcher EN|ID mengganti SELURUH halaman tanpa reload.
   - LANGUAGE SWITCHER (dipulihkan 2026-11-02): pill kecil EN | ID di kanan
     navbar desktop (sebelum theme toggle) + di drawer mobile. Aktif = chip
     terbalik (.tr-invert). Bekerja penuh, bukan dekoratif.
   - BURGER MOBILE: hit-area 44px (h-11 w-11), garis 2px tebal, posisi FLOW
     (bukan absolute) → tidak pernah tertindih CTA/logo di layar sempit.
   - OVERLAP FIX (2026-11-02): island pakai flex-wrap + gap konsisten; CTA
     "Book a meeting" punya max-w + shrink-0 + whitespace-nowrap supaya tidak
     menindih switcher/toggle di viewport menengah (sm..md); z-index island
     (z-50) < overlay (z-60) < drawer (z-70) — stacking konteks tegas.
   - Drawer: mobile slide-up / desktop slide-from-right (500ms, expo).
   - Links stagger 150 + i*60 ms; hamburger→X morph; body scroll lock.
   Dipakai Landing dan StudioPage (props opsional). */
import { useEffect } from "react";
import { TriluxLogo } from "./Logo";
import { RouteLink } from "../hooks/usePath";
import { useTheme } from "../hooks/useTheme";
import { useLocale, type Locale } from "../hooks/useLocale";

interface NavbarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

interface NavLink {
  key: string;
  href?: string; // anchor di landing
  route?: string; // SPA route (pushState)
}

/* anchor ke section brief v0 (Simulator "please take out" — sengaja tidak ada).
   Studio = ROUTE terpisah /studio (halaman eksklusif), bukan anchor.
   Label dari kamus i18n (t.nav.*) — bilingual. */
const LINKS: NavLink[] = [
  { key: "work", href: "#portfolio" },
  { key: "about", href: "#about" },
  { key: "services", href: "#services" },
  { key: "gallery", href: "#gallery" },
  { key: "studio", route: "/studio" },
  { key: "contact", href: "#contact" },
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

/* Language switcher — pill EN | ID. Aktif = chip terbalik (.tr-invert-bg/fg).
   Bekerja penuh: setLocale() → seluruh halaman berganti tanpa reload. */
function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="flex items-center rounded-full border tr-line tr-surface/70 backdrop-blur-sm"
      role="group"
      aria-label={t.lang.label}
    >
      {(["id", "en"] as Locale[]).map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            aria-label={l === "en" ? t.lang.switchToEn : t.lang.switchToId}
            title={l === "en" ? t.lang.switchToEn : t.lang.switchToId}
            className={
              compact
                ? `cursor-pointer rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    active ? "tr-invert-bg tr-invert-fg" : "tr-fg tr-faint hover:tr-fg"
                  }`
                : `cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    active ? "tr-invert-bg tr-invert-fg" : "tr-fg tr-faint hover:tr-fg"
                  }`
            }
          >
            {l.toUpperCase()}
          </button>
        );
      })}
      <span className="sr-only">{t.lang.label}</span>
    </div>
  );
}

export default function Navbar({ menuOpen, setMenuOpen }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const { t } = useLocale();

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

      {/* ══════════ 4 FLOATING ISLANDS TERPISAH (claymorphism) ══════════
           Desain (permintaan user 2026-11-02): navbar bukan satu pill panjang,
           tapi EMPAT pulau independen — masing-masing rounded-full, punya
           border + shadow clay sendiri, melayang terpisah:
             1. LOGO    — pojok kiri atas
             2. MENU    — tengah (6 anchor link; hidden < lg, ganti burger)
             3. KONTRAK — lang switcher + mode toggle (+ burger di < lg)
             4. BOOK    — CTA "Book a meeting" pill terpisah paling kanan
           Wrapper pointer-events-none; tiap island pointer-events-auto.
           Karena masing-masing absolute + shrink-0, mereka TIDAK PERNAH
           saling tumpang tindih (menu center hidden sebelum sempit).
           z-50 islands < overlay z-60 < drawer z-70 — stacking tegas. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50" aria-label="Navbar">
        {/* ── 1. LOGO — pojok kiri atas ── */}
        <div className="tr-clay tr-surface pointer-events-auto absolute left-3 top-3 flex items-center gap-2 rounded-full border tr-line px-3 py-2 backdrop-blur-xl sm:left-4 sm:top-4 sm:px-4">
          <a href="#top" aria-label="Trilux Design — home" className="tr-fg flex items-center gap-2">
            <TriluxLogo size={24} />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              Trilux<em className="not-italic font-medium opacity-50">&nbsp;Design</em>
            </span>
          </a>
        </div>

        {/* ── 2. MENU — tengah.
             lg..xl: varian COMPACT (gap/font kecil) supaya 4 island tetap
             muat tanpa berpapasan; xl+: varian nyaman. Di <lg → burger
             (island 3). */}
        <nav
          className="tr-clay tr-surface pointer-events-auto absolute left-1/2 top-3 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border tr-line px-1.5 py-1 backdrop-blur-xl sm:top-4 lg:flex xl:gap-1 xl:px-2 xl:py-1.5"
          aria-label="Primary"
        >
          {LINKS.map((l) => {
            const label = t.nav[l.key as keyof typeof t.nav];
            const cls = "tr-fg rounded-full px-2.5 py-1.5 text-[13px] font-normal opacity-80 transition-colors hover:bg-black/5 hover:opacity-100 xl:px-3 xl:text-sm";
            return l.route ? (
              <RouteLink key={l.key} to={l.route} className={cls}>
                {label}
              </RouteLink>
            ) : (
              <a key={l.key} href={l.href} className={cls}>
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── kanan: 3. KONTRAK (lang+mode, +burger mobile) · 4. BOOK ── */}
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
          {/* 3. LANGUAGE + MODE (+ burger < lg) */}
          <div className="tr-clay tr-surface pointer-events-auto flex items-center gap-1 rounded-full border tr-line px-1.5 py-1.5 backdrop-blur-xl sm:px-2">
            {/* burger — mobile/tablet saja (< lg), menggantikan menu island */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              className="tr-fg flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5 lg:hidden"
            >
              <span className="flex flex-col items-center justify-center gap-[5px]" aria-hidden="true">
                <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 hover:w-6" />
                <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 hover:w-6" />
              </span>
            </button>
            {/* language switcher — EN | ID (≥sm; di mobile lewat drawer) */}
            <span className="hidden sm:inline-flex">
              <LanguageSwitcher compact />
            </span>
            {/* theme toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "light" ? t.footer.modeDark : t.footer.modeLight}
              title={theme === "light" ? t.footer.modeDark : t.footer.modeLight}
              className="tr-fg flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5"
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>

          {/* 4. BOOK NOW — CTA pill terpisah */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener"
            className="tr-btn pointer-events-auto inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium tracking-wide sm:px-5 sm:py-3 sm:text-sm"
          >
            {t.nav.bookMeeting}
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
            aria-label={t.nav.closeMenu}
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
          {LINKS.map((l, i) => {
            const label = t.nav[l.key as keyof typeof t.nav];
            return l.route ? (
              <RouteLink
                key={l.key}
                to={l.route}
                onClick={() => setMenuOpen(false)}
                className="trilux-link tr-fg block py-3 text-3xl font-medium transition-opacity hover:opacity-50"
                style={menuOpen ? { transitionDelay: `${150 + i * 60}ms` } : { transitionDelay: "0ms" }}
              >
                {label}
              </RouteLink>
            ) : (
              <a
                key={l.key}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="trilux-link tr-fg block py-3 text-3xl font-medium transition-opacity hover:opacity-50"
                style={menuOpen ? { transitionDelay: `${150 + i * 60}ms` } : { transitionDelay: "0ms" }}
              >
                {label}
              </a>
            );
          })}

          {/* drawer footer — switcher bahasa + CTA (delay 400ms) */}
          <div className="pt-12">
            <div className="mb-5 inline-flex">
              <LanguageSwitcher />
            </div>
            <div>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener"
                onClick={() => setMenuOpen(false)}
                className="trilux-cta-drawer tr-btn inline-flex rounded-full px-6 py-3 text-sm font-medium"
                style={menuOpen ? { transitionDelay: "400ms" } : { transitionDelay: "0ms" }}
              >
                {t.nav.bookMeeting}
              </a>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
