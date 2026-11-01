/* Trilux Design — fresh single-page marketing landing.
   Struktur 4 section (sesuai spec prompt lampiran, diadaptasi ke Trilux):
   1) Fixed Navbar (drawer menu physics)  2) Hero (teks saja, minimal white)
   3) ImageMarquee (drag-enabled rAF strip + curved white masks)
   4) BottomSection (copy + 2 underline CTA)
   Semua konten = knowledge capture Trilux (FEATURES_KEEP.md). Shapes-based only. */
import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import BottomSection from "./components/BottomSection";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <Marquee />
        <BottomSection />
      </main>
    </div>
  );
}
