/* BottomSection — copy + 2 underline CTA (bukan tombol).
   Adaptasi Trilux: copy mengambil esensi brief + link kontak WA/email. */
export default function BottomSection() {
  return (
    <section
      id="contact"
      className="text-center px-4 sm:px-6 pt-2 pb-12 sm:pb-16 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
        Ruang yang tenang, presisi, tahan lama.
      </h2>
      <p className="mt-4 text-base sm:text-lg text-neutral-700 leading-relaxed">
        Trilux Design merancang private residence dan commercial space dari halaman
        kosong — konsep hingga serah terima kunci, dengan visualisasi imersif sebelum
        satu pun material dipasang.
      </p>
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <a
          href="https://wa.me/6282287348422"
          target="_blank"
          rel="noopener"
          className="text-neutral-900 font-semibold underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-900 transition-colors"
        >
          Book a meeting
        </a>
        <a
          href="#work"
          className="text-neutral-900 font-semibold underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-900 transition-colors"
        >
          See Projects
        </a>
      </div>
    </section>
  );
}
