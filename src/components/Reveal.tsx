/* Reveal — scroll-triggered entrance (IntersectionObserver).
   Sesuai ui-animation skill: hanya transform + opacity, enter curve eksponensial,
   respects prefers-reduced-motion (langsung visible, tanpa transisi). */
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  y?: number; // px offset awal
}

export default function Reveal({ children, className = "", delay = 0, y = 16 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        ["--reveal-y" as string]: `${y}px`,
      }}
    >
      {children}
    </div>
  );
}
