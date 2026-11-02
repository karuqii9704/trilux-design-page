/* FooterIsland — FOOTER FLOATING ISLAND (brief v0 footer content).
   Pill rounded-full melayang di atas bottom (bukan menempel edge),
   berisi © + kontak WA/email + mode toggle ringkas.
   Dipakai Landing (menggantikan BottomSection menempel) & StudioPage.
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import { useTheme } from "../hooks/useTheme";

const WA_URL = "https://wa.me/6282287348422";
const EMAIL = "hello@triluxdesign.id";

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {theme === "light" ? (
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      )}
    </svg>
  );
}

export default function FooterIsland() {
  const { theme, toggle } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 sm:px-6 pb-8 pt-2">
      <div className="mx-auto max-w-3xl rounded-full border tr-line tr-surface/80 backdrop-blur-xl tr-shadow px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* kiri — copyright + kontak */}
        <div className="flex items-center gap-4 sm:gap-5 text-xs tr-muted">
          <span>© {year} Trilux Design</span>
          <a href={WA_URL} target="_blank" rel="noopener" className="underline underline-offset-4 hover:opacity-70 transition-opacity">
            WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`} className="underline underline-offset-4 hover:opacity-70 transition-opacity">
            Email
          </a>
        </div>
        {/* kanan — mode toggle */}
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === "light" ? "Mode gelap" : "Mode terang"}
          title={theme === "light" ? "Mode gelap" : "Mode terang"}
          className="flex items-center gap-1.5 rounded-full border tr-line px-3 py-1.5 text-xs font-medium tr-fg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ThemeIcon theme={theme} />
          <span className="hidden sm:inline">{theme === "light" ? "Gelap" : "Terang"}</span>
        </button>
      </div>
    </footer>
  );
}
