/* App — router minimal (pathname-based):
   /studio → StudioPage (halaman eksklusif) · selain itu → Landing (single-page).
   Rute /studio dijamin server-side oleh vercel.json rewrite → /index.html. */
import { usePath } from "./hooks/usePath";
import ScrollProgress from "./components/ScrollProgress";
import Landing from "./pages/Landing";
import StudioPage from "./pages/StudioPage";
import { useContent } from "./hooks/useContent";
import { useProjects } from "./hooks/useProjects";

export default function App() {
  const path = usePath();
  const content = useContent();
  const projects = useProjects();

  const isStudio = path === "/studio" || path === "/studio/" || path.startsWith("/studio/");

  /* defensive: hook selalu return shape valid, tapi guard untuk keamanan hydration */
  const featured = projects?.featured;
  const projectList = projects?.projects ?? [];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <ScrollProgress />
      {isStudio ? (
        <StudioPage content={content} />
      ) : (
        <Landing
          content={content}
          featured={featured}
          projects={projectList}
        />
      )}
    </div>
  );
}
