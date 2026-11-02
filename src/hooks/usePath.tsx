/* Tiny SPA router (pushState + popstate) — untuk route /studio sebagai halaman
   terpisah (eksklusif) tanpa framework routing. Vercel rewrite /studio → /index.html
   menjamin direct-load & refresh jalan; client router membaca pathname. */
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export function usePath(): string {
  const [path, setPath] = useState<string>(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

export function navigate(to: string) {
  if (window.location.pathname !== to) {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  }
}

interface RouteLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  onClick?: () => void;
}

/* <a> yang navigasi via pushState (SPA) — tetap bisa di-open-in-new-tab (href nyata). */
export function RouteLink({ to, children, className, style, ariaLabel, onClick }: RouteLinkProps) {
  return (
    <a
      href={to}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
