/* ImageMarquee — core visual: infinite drag-enabled horizontal strip
   dengan curved white masks atas/bawah (persis spec prompt lampiran).
   Engine: requestAnimationFrame (BUKAN CSS marquee).
   - SPEED 0.8 px/frame auto-crawl kiri
   - pointer drag + setPointerCapture, velocity = (dx/dt)*16
   - momentum decay 0.95 saat release, lalu resume auto-crawl
   - seamless loop: [...images, ...images], wrap di halfWidth = scrollWidth/2
   Gambar: 6 URL persis lampiran (Higgs CDN webp proxy, urutan terjaga). */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/* eslint-disable @typescript-eslint/no-explicit-any */
const IMAGES: string[] = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260725_120544_94be5de4-0f4f-494c-bb78-c532290040a6.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260725_120601_5c6e4705-b992-4227-9dff-9b000351c283.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260725_120619_7bc65416-a3d7-4e8c-9929-743f233378fe.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260725_120627_b40a97b0-c5fa-408c-a77e-dc8fa44f8584.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260725_120635_515cde41-2dc6-48ce-a236-088a5bc74ca8.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260725_120645_5a1170c6-145b-477b-abd2-f8620acccd8d.png&w=1920&q=85",
];

const SPEED = 0.8; // px per frame auto-scroll left

/* Curved mask — concave curtain (persis path spec).
   Fill mengikuti variabel tema (.tr-mask) agar seam dengan bg di mode gelap. */
function Mask({ top }: { top: boolean }) {
  const d = top
    ? "M0 0H1440V50C1440 50 1200 100 720 100C240 100 0 50 0 50V0Z"
    : "M0 100H1440V50C1440 50 1200 0 720 0C240 0 0 50 0 50V100Z";
  return (
    <div
      className={`absolute left-0 right-0 h-[80px] sm:h-[100px] pointer-events-none z-10 ${
        top ? "top-0" : "bottom-0"
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-full">
        <path d={d} className="tr-mask" />
      </svg>
    </div>
  );
}

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const stateRef = useRef({
    offset: 0,
    dragging: false,
    startX: 0,
    startOffset: 0,
    velocity: 0,
    lastX: 0,
    lastT: 0,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const st = stateRef.current;

    const halfWidth = () => Math.max(track.scrollWidth / 2, 1);

    const loop = () => {
      if (!st.dragging) {
        if (Math.abs(st.velocity) > 0.1) {
          st.offset += st.velocity;
          st.velocity *= 0.95; // inertial coast
        } else {
          st.velocity = 0;
          if (!reduced) st.offset -= SPEED; // resume auto-crawl (reduced-motion: berhenti)
        }
      }
      /* seamless wrap */
      const hw = halfWidth();
      if (st.offset <= -hw) st.offset += hw;
      if (st.offset > 0) st.offset -= hw;

      track.style.transform = `translate3d(${st.offset}px, 0, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    /* ---- drag / pointer interaction ---- */
    const onDown = (e: PointerEvent) => {
      st.dragging = true;
      st.velocity = 0;
      st.startX = e.clientX;
      st.startOffset = st.offset;
      st.lastX = e.clientX;
      st.lastT = performance.now();
      track.setPointerCapture(e.pointerId);
      track.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const now = performance.now();
      const dt = Math.max(now - st.lastT, 1);
      st.velocity = ((e.clientX - st.lastX) / dt) * 16; // normalize ~60fps
      st.lastX = e.clientX;
      st.lastT = now;
      st.offset = st.startOffset + (e.clientX - st.startX);
    };
    const onUp = () => {
      st.dragging = false;
      track.style.cursor = "grab";
    };

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
    };
  }, [reduced]);

  const slides = [...IMAGES, ...IMAGES]; // duplicated once for seamless loop

  return (
    <section id="work" className="relative py-4 overflow-hidden" aria-label="Portfolio strip">
      <Mask top />
      <Mask top={false} />
      <div
        ref={trackRef}
        className="flex w-max gap-3 sm:gap-4 py-4 select-none cursor-grab"
        style={{ willChange: "transform" }}
      >
        {slides.map((src, i) => (
          <figure
            key={i}
            className="w-60 h-80 sm:w-80 sm:h-[32rem] flex-shrink-0 rounded-2xl overflow-hidden tr-sunken"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
