/* Landing — single-page marketing landing (brief v0).
   Studio SUDAH PINDAH ke halaman eksklusif /studio (StudioTeaser di sini).
   Urutan: Navbar → Hero → Marquee → About → Expertise → Services → Portfolio →
   Gallery → Clients → News → StudioTeaser → Contact → Footer.
   State drawer menu milik landing (Navbar butuh props). */
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import About from "../components/sections/About";
import Expertise from "../components/sections/Expertise";
import Services from "../components/sections/Services";
import Portfolio from "../components/sections/Portfolio";
import Gallery from "../components/sections/Gallery";
import Clients from "../components/sections/Clients";
import News from "../components/sections/News";
import StudioTeaser from "../components/sections/StudioTeaser";
import Contact from "../components/sections/Contact";
import FooterIsland from "../components/FooterIsland";
import type { ContentData, FeaturedProject, ProjectItem } from "../types";
interface LandingProps {
  content: ContentData;
  featured?: FeaturedProject;
  projects: ProjectItem[];
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function Landing({ content, featured, projects, menuOpen, setMenuOpen }: LandingProps) {
  return (
    <>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero intro={content.about.intro} wa={content.site.wa} />
        <Marquee />
        <About about={content.about} />
        <Expertise items={content.expertise} />
        <Services services={content.services} />
        {featured ? <Portfolio featured={featured} projects={projects} /> : null}
        <Gallery gallery={content.gallery} />
        <Clients clients={content.clients} />
        <News news={content.news} />
        <StudioTeaser note={content.studio.note} />
        <Contact site={content.site} />
      </main>
      <FooterIsland />
    </>
  );
}
