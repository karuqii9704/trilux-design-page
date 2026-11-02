/* SectionHeading — heading section seragam (modern & minimalist per brief v0).
   Eyebrow kecil uppercase + hairline, H2 besar tracking-tight, sub opsional.
   Warna via utilitas tema — otomatis ikut mode gelap/terang. */
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}

export default function SectionHeading({ eyebrow, title, sub, align = "left" }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <Reveal className={`${center ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}`}>
      <p
        className={`text-xs font-medium uppercase tracking-[0.22em] tr-faint ${
          center ? "" : "border-l-2 tr-line-strong pl-4"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight tr-fg leading-[1.08]">
        {title}
      </h2>
      {sub ? (
        <p className={`mt-4 text-base sm:text-lg tr-muted leading-relaxed`}>
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}
