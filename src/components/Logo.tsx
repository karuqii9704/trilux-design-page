/* Logo mark Trilux Design — SVG self-contained (aset lama di-reset).
   Bentuk: tiga batang vertikal brass + garis dasar (arsitektur/struktur). */
export function TriluxLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="5" y="15" width="6" height="13" fill="currentColor" />
      <rect x="13" y="4" width="6" height="24" fill="currentColor" />
      <rect x="21" y="10" width="6" height="18" fill="currentColor" />
      <rect x="3" y="29.5" width="26" height="1.5" fill="currentColor" />
    </svg>
  );
}
