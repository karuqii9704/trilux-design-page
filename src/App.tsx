/* App — Trilux Design SPA (fresh v3 + section brief v0).
   Urutan (scroll ke bawah hingga footer):
   Navbar → Hero → Marquee (work strip) → About (visi & misi) → Expertise →
   Services → Portfolio (featured + grid + lightbox) → Gallery (swipe+zoom) →
   Clients rail → News → Studio (floorplan interaktif) → Contact → Footer.
   Simulator: brief v0 tulis "Please take out" → sengaja tidak dibangun. */
import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import ScrollProgress from "./components/ScrollProgress";
import About from "./components/sections/About";
import Expertise from "./components/sections/Expertise";
import Services from "./components/sections/Services";
import Portfolio from "./components/sections/Portfolio";
import Gallery from "./components/sections/Gallery";
import Clients from "./components/sections/Clients";
import News from "./components/sections/News";
import Studio from "./components/sections/Studio";
import Contact from "./components/sections/Contact";
import { useContent } from "./hooks/useContent";
import { useProjects } from "./hooks/useProjects";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const content = useContent();
  const projects = useProjects();

  /* defensive: hook selalu return shape valid, tapi guard untuk keamanan hydration */
  const featured = projects?.featured;
  const projectList = projects?.projects ?? [];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <ScrollProgress />
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <Marquee />
        <About about={content.about} />
        <Expertise items={content.expertise} />
        <Services services={content.services} />
        <Portfolio featured={featured} projects={projectList} />
        <Gallery gallery={content.gallery} />
        <Clients clients={content.clients} />
        <News news={content.news} />
        <Studio studio={content.studio} />
        <Contact site={content.site} />
      </main>
    </div>
  );
}
