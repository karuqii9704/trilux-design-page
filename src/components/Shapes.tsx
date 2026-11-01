/* Shapes — placeholder visual shapes-based (NO foto layer — standing constraint).
   Komposisi garis arsitektur abstrak: dinding, void, tangga, furnitur — netral ink +
   aksen brass. Dipakai gallery (8 varian portrait), portfolio cover + thumbs.
   Struktur siap ganti aset asli begitu foto proyek tersedia (brief v0: foto masih tahap desain). */

const INK = "#141010";
const BRASS = "#b07f3a";
const BONE = "#f0ebe2";

interface ShapeProps {
  variant: number; // 1..8
  className?: string;
}

/* setiap varian = komposisi <path>/<rect> pada viewBox 0 0 300 400 (portrait 3:4) */
export function Shape({ variant, className = "" }: ShapeProps) {
  const common = {
    fill: "none",
    stroke: INK,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 300 400" className={className} aria-hidden="true" role="presentation">
      <rect x="0" y="0" width="300" height="400" fill="#ffffff" />
      {variant === 1 && (
        <g {...common}>
          <rect x="30" y="60" width="240" height="280" />
          <line x1="30" y1="60" x2="150" y2="20" />
          <line x1="150" y1="20" x2="270" y2="60" />
          <line x1="75" y1="110" x2="75" y2="210" />
          <line x1="150" y1="110" x2="150" y2="210" />
          <line x1="225" y1="110" x2="225" y2="210" />
          <line x1="30" y1="230" x2="270" y2="230" />
          <line x1="30" y1="340" x2="10" y2="340" stroke={BRASS} />
          <line x1="270" y1="340" x2="290" y2="340" stroke={BRASS} />
        </g>
      )}
      {variant === 2 && (
        <g {...common}>
          <rect x="60" y="30" width="180" height="340" />
          <line x1="60" y1="30" x2="240" y2="120" stroke={BRASS} strokeOpacity="0.55" />
          <line x1="60" y1="30" x2="240" y2="210" stroke={BRASS} strokeOpacity="0.3" />
          <rect x="90" y="150" width="120" height="180" fill={BONE} fillOpacity="0.6" />
          <line x1="90" y1="150" x2="210" y2="150" />
        </g>
      )}
      {variant === 3 && (
        <g {...common}>
          <path d="M40 80 H200 V340 H40 Z" />
          <rect x="120" y="180" width="90" height="60" fill={BONE} fillOpacity="0.6" />
          <circle cx="135" cy="270" r="8" />
          <circle cx="170" cy="270" r="8" />
          <circle cx="205" cy="270" r="8" />
          <line x1="40" y1="120" x2="200" y2="120" />
          <line x1="240" y1="80" x2="240" y2="340" stroke={BRASS} />
        </g>
      )}
      {variant === 4 && (
        <g {...common}>
          <rect x="70" y="50" width="160" height="300" />
          <line x1="150" y1="50" x2="150" y2="350" />
          <line x1="138" y1="180" x2="146" y2="180" stroke={BRASS} />
          <line x1="154" y1="180" x2="162" y2="180" stroke={BRASS} />
          <line x1="70" y1="350" x2="230" y2="350" strokeWidth="4" />
        </g>
      )}
      {variant === 5 && (
        <g {...common}>
          <rect x="40" y="70" width="220" height="280" />
          <line x1="40" y1="70" x2="150" y2="30" />
          <line x1="150" y1="30" x2="260" y2="70" />
          <circle cx="150" cy="140" r="26" stroke={BRASS} />
          <circle cx="90" cy="230" r="3" fill={BRASS} stroke="none" />
          <circle cx="130" cy="230" r="3" fill={BRASS} stroke="none" />
          <circle cx="170" cy="230" r="3" fill={BRASS} stroke="none" />
          <circle cx="210" cy="230" r="3" fill={BRASS} stroke="none" />
          <line x1="70" y1="290" x2="230" y2="290" />
        </g>
      )}
      {variant === 6 && (
        <g {...common}>
          <ellipse cx="150" cy="200" rx="70" ry="40" fill={BONE} fillOpacity="0.6" />
          <rect x="60" y="160" width="26" height="40" />
          <rect x="214" y="160" width="26" height="40" />
          <rect x="120" y="290" width="26" height="40" />
          <rect x="158" y="290" width="26" height="40" />
          <line x1="30" y1="340" x2="270" y2="340" />
        </g>
      )}
      {variant === 7 && (
        <g {...common}>
          <rect x="50" y="90" width="200" height="240" />
          <rect x="50" y="90" width="200" height="70" fill={BONE} fillOpacity="0.6" />
          <circle cx="150" cy="220" r="34" />
          <line x1="50" y1="300" x2="250" y2="300" />
          <line x1="90" y1="300" x2="90" y2="330" />
          <line x1="210" y1="300" x2="210" y2="330" />
        </g>
      )}
      {variant === 8 && (
        <g {...common}>
          <rect x="60" y="60" width="180" height="300" fill="none" />
          <path d="M70 340 h20 v-20 h20 v-20 h20 v-20 h20 v-20 h20 v-20 h20 v-20 h20 v-20 h20" />
          <rect x="170" y="60" width="70" height="110" fill={BONE} fillOpacity="0.6" />
          <line x1="60" y1="60" x2="240" y2="60" strokeWidth="4" />
        </g>
      )}
    </svg>
  );
}

/* Cover shape — massing composition landscape (portfolio featured) */
export function CoverShape({ className = "" }: { className?: string }) {
  const common = {
    fill: "none",
    stroke: INK,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 800 500" className={className} aria-hidden="true" role="presentation">
      <rect x="0" y="0" width="800" height="500" fill="#ffffff" />
      <g {...common}>
        <line x1="0" y1="400" x2="800" y2="400" strokeWidth="3" />
        <rect x="120" y="160" width="260" height="240" fill={BONE} fillOpacity="0.5" />
        <rect x="420" y="100" width="220" height="300" />
        <line x1="420" y1="100" x2="530" y2="40" />
        <line x1="530" y1="40" x2="640" y2="100" />
        <rect x="300" y="260" width="180" height="140" fill="#ffffff" />
        <line x1="180" y1="220" x2="320" y2="220" stroke={BRASS} />
        <line x1="480" y1="180" x2="600" y2="180" stroke={BRASS} />
        <line x1="480" y1="260" x2="600" y2="260" stroke={BRASS} strokeOpacity="0.5" />
      </g>
      <g fill={INK} opacity="0.18">
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={60 + (i % 6) * 24} cy={440 + Math.floor(i / 6) * 24} r="2" />
        ))}
      </g>
    </svg>
  );
}
