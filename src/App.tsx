/* App — router minimal (pathname-based):
   /studio → StudioPage (halaman eksklusif) · selain itu → Landing (single-page).
   Rute /studio dijamin server-side oleh vercel.json rewrite → /index.html.
   State drawer menu + mode tema ada di level App supaya Navbar floating-island
   konsisten di kedua page.
   i18n (2026-11-02): locale dari LocaleProvider (useLocale) → diteruskan ke
   useContent(locale) & useProjects(locale) supaya CMS bilingual di-flatten
   ke bahasa aktif. Switch bahasa tidak reload, tidak refetch, tidak reset state. */
import { useState } from "react";
import { usePath } from "./hooks/usePath";
import ScrollProgress from "./components/ScrollProgress";
import Landing from "./pages/Landing";
import StudioPage from "./pages/StudioPage";
import { useContent } from "./hooks/useContent";
import { useProjects } from "./hooks/useProjects";
import { useLocale } from "./hooks/useLocale";

export default function App() {
  const path = usePath();
  const { locale } = useLocale();
  const content = useContent(locale);
  const projects = useProjects(locale);

  const isStudio = path === "/studio" || path === "/studio/" || path.startsWith("/studio/");
  const [menuOpen, setMenuOpen] = useState(false);

  /* defensive: hook selalu return shape valid, tapi guard untuk keamanan hydration */
  const featured = projects?.featured;
  const projectList = projects?.projects ?? [];

  return (
    <div className="min-h-screen tr-bg overflow-hidden">
      <ScrollProgress />
      {isStudio ? (
        <StudioPage content={content} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      ) : (
        <Landing
          content={content}
          featured={featured}
          projects={projectList}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      )}
    </div>
  );
}
