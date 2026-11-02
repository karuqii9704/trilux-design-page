/* Hero — minimal, teks saja (tanpa kartu/foto).
   H1 dua baris + subhead. Copy Trilux (knowledge capture).
   Warna via utilitas tema (.tr-fg/.tr-faint) — otomatis ikut mode gelap/terang. */
export default function Hero() {
  return (
    <section id="top" className="pt-24 sm:pt-28 pb-1 text-center px-4 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] tr-faint">
        Interior · Exterior · Architecture — Jakarta
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight tr-fg leading-[1.05] max-w-3xl mx-auto mt-6">
        Experiencing Luxury,
        <br />
        Before It&rsquo;s Built.
      </h1>
      <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl tr-muted max-w-xl mx-auto leading-relaxed">
        Trilux Design adalah studio desain interior dan arsitektur premium —
        kami merancang ruang yang tenang, presisi, dan tahan lama, dari konsep
        hingga serah terima kunci.
      </p>
    </section>
  );
}
