# Trilux Design — Feature Knowledge (captured 2026-11-01, sebelum fresh rebuild)

> Snapshot knowledge fitur/info yang KEEP saat landing page + hero + navbar + route di-reset
> dan dibangun ulang fresh. Sumber kebenaran: `data/content.json` (CMS single source of truth),
> halaman studio/simulasi/services, dan PRD_Trilux_Design_v2.md.
> Backup kode lengkap: git branch `backup/pre-reset-2026-11-01`.

## 1. Identitas & copy brand (WAJIB dipakai di build baru)
- Nama: **Trilux Design** — studio desain interior & arsitektur premium, Jakarta, Indonesia.
  (Catatan: versi awal pernah salah tulis "Mostar, Bosnia" — koreksi: Jakarta.)
- Tagline: **"Experiencing Luxury, Before It's Built"**
- Layanan inti (4): Interior · Exterior · MEP (Mechanical, Electrical, Plumbing) · Manufacturing
- Kontak: WA +62 822-8734-8422 (`https://wa.me/6282287348422`) · email triluxdesign@gmail.com
  · Instagram @trilux_design (https://instagram.com/trilux_design) · lokasi Jakarta, Indonesia
- Logo: SVG mark (lihat `assets/img/logo-mark.svg`) — bentuk batang vertikal + garis dasar brass.
  Favicon inline (data URI SVG) pernah dipakai di index.html lama.

## 2. About / Visi & Misi (copy asli — jangan diubah)
- Eyebrow: "About us"
- Title: "Experiencing Luxury, Before It's Built"
- Intro: "Trilux Design adalah studio desain interior dan arsitektur premium yang membuktikan
  kualitasnya lewat visualisasi imersif — klien melihat, merasakan, dan menguji setiap detail
  ruang sebelum satu pun material dipasang."
- Visi: "Menjadi studio desain interior dan arsitektur premium terdepan yang mendefinisikan ulang
  standar kemewahan masa depan melalui sinergi estetika minimalis dan teknologi pemodelan imersif."
- Misi (3, bernomor):
  1. **Experiential Design** — "Menghadirkan Pengalaman Desain Imersif — memungkinkan klien melihat,
     merasakan, dan menguji setiap detail ruang secara presisi melalui teknologi visualisasi berbasis
     virtual sebelum tahap konstruksi dimulai."
  2. **Refined Luxury** — "Mewujudkan Estetika Minimalis & Kemewahan Abadi — menciptakan karya
     arsitektur dan interior yang elegan, fungsional, dan bernilai tinggi dengan pendekatan desain
     minimalis serta pemilihan material berkualitas mutakhir."
  3. **Built Perfection** — "Menjamin Presisi dan Efisiensi Konstruksi — eksekusi lapangan menyeluruh
     dengan pengawasan teknis ketat untuk memastikan hasil akhir identik dengan desain digital."
- Sekilas Perusahaan: "Berbasis di Jakarta, Trilux Design bergerak dari konsep hingga serah terima
  kunci: perencanaan arsitektur, perancangan interior, visualisasi 3D, hingga manajemen proyek.
  Kami merancang ruang yang tenang, presisi, dan tahan lama — tanpa janji berlebihan."

## 3. Expertise (4 kolom, bernomor 01–04)
1. Virtual Experience & 3D Walkthrough — "Eksplorasi dan rasakan skala ruang, tata cahaya, serta
   detail material secara imersif sebelum konstruksi dimulai."
2. Luxury Interior & Spatial Design — "Perancangan interior minimalis kelas atas dengan proporsi
   presisi, pencahayaan terintegrasi, dan kurasi material premium."
3. Modern Architectural Planning — "Arsitektur bernilai estetika tinggi yang berfokus pada garis
   desain bersih, fungsi optimal, dan efisiensi struktur."
4. Management — "Eksekusi lapangan menyeluruh dengan pengawasan teknis ketat untuk memastikan
   hasil akhir identik dengan desain digital."

## 4. Services (4 kartu, tag 01–04)
- 01 Spatial — **Interior**: layout, lighting scenario, kurasi material, furnishing detail — dari
  konsep hingga specifikasi produksi. Points: Space planning & layout; Lighting & material curation;
  Custom furniture & millwork; Styling & handover.
- 02 Facade — **Exterior**: fasad berkarakter, komposisi material stone/timber/kaca yang age with
  dignity. Points: Facade composition; Cladding & material spec; Landscape interface; Night lighting concept.
- 03 Systems — **MEP**: sistem bangunan terintegrasi, presisi spesifikasi, koordinasi lapangan ketat.
  Points: MEP coordination; HVAC & electrical layout; Plumbing & drainage; Smart home readiness.
- 04 Craft — **Manufacturing**: produksi elemen kustom (millwork, railing, kanopi, finishing brass).
  Points: Custom millwork; Metal & brass works; Workshop drawings; Installation oversight.

## 5. Featured project (data asli — bukan dummy)
- **Padang Residence I** — Padang, West Sumatera · 2024 · Full Scope Design & Build
- Specifics: "A Residential Masterpiece" · Client: General Practitioner
- Cover: `assets/img/cover.jpg`; thumbs: thumb-1.jpg (taman & tangga eksterior),
  thumb-2.jpg (ruang makan), thumb-3.jpg (ruang keluarga cermin emas)
- Description (EN): "Located in Padang, this design features an architectural approach that
  prioritizes modern luxury through the harmonization of premium materials and bold geometric play.
  From a contemporary exterior facade dominated by strong lines to a grand living room interior with
  a high void and marble accents and gold elements that give a prestigious impression, this aesthetic
  is combined with flexible public functionality through the use of vertical wooden panels and warm
  indirect lighting, creating an elegant spatial transition that still feels comfortable and organic."
- Highlights: Stone-clad facade with bold geometric massing; Double-height living room with marble
  and brass accents; Vertical timber screens with warm indirect lighting.

## 6. STUDIO (floorplan planner) — HALAMAN EKSKLUSIF /studio (2026-11-02)
**Bukan section landing lagi** — pindah ke route `/studio` (halaman eksklusif, tujuan: rasa eksklusif).
Landing hanya menyisakan **StudioTeaser** (teks + tombol "Buka Studio" + badge "Akses Eksklusif").
- File: `src/pages/StudioPage.tsx` (header khusus + back link) + `src/components/sections/Studio.tsx`
  (StudioFloorplan, komponen murni tanpa wrapper section) + router `src/hooks/usePath.tsx` (pushState).
- Vercel rewrite catch-all `/((?!api/|admin).*)` → `/index` (wajib tanpa `.html` karena cleanUrls:true).
- Canvas SVG floorplan interaktif: ruang default 600×420 cm (Ruang Tamu), grid 40 cm.
- Furnitur DRAGGABLE (pointer events): Sofa 3-seater (220×90), Meja TV (180×45),
  Kabinet (120×45). Furnitur = grup SVG dengan rect + label + dimensi.
- Partisi adjustable: drag handle brass ubah panjang (240→320 cm terverifikasi), drag badan geser posisi,
  klik tanpa drag = hapus, tombol tambah vertikal/horizontal.
- Stepper cm: lebar/kedalaman ruang ±20 (600→660 terverifikasi); furnitur terpilih ±10.
- Disclaimer dummy ditampilkan jujur (brief v0). Data: `data/content.json` key `studio`.
- QA: jsdom interaction test lulus (drag sofa translate(80,60)→(170,110), stepper 600→640,
  tambah partisi horizontal, resize 240→320, router landing↔studio pushState tanpa reload, 0 error).
- Status: PRODUKSI LIVE — /studio 200 (direct-load + refresh), floorplan render, 0 console error.

## 6b. REGRESI PRODUKSI YANG PERNAH TERJADI (2026-11-02) — pelajaran
- `cms/projects.json` Blob shape lama (featured-only, tanpa key `projects`) → `projects.projects` undefined
  → Portfolio `t.length` crash → **seluruh halaman putih** (React unmount root).
  Perbaikan: optional chaining + guard di semua section, ErrorBoundary di main.tsx, Blob di-sync ulang.
- **Routing SPA di Vercel**: dengan `cleanUrls: true`, rewrite destination **harus tanpa `.html`**
  (`/index`, bukan `/index.html`) — kalau tidak rewrite tidak pernah match → 404 di direct-load /refresh.
  Konfigurasi yang jalan: `"rewrites": [{ "source": "/((?!api/|admin).*)", "destination": "/index" }]`.
  `_redirects` di public/ TIDAK ter-copy Vite (abaikan file `_`-prefixed) — jangan andalkan.
- Aturan: **selalu optional-chain data CMS hydrate** (`x?.y ?? []`), dan wajib ada ErrorBoundary —
  jangan sampai satu section bikin seluruh SPA blank.

## 7. Simulator estimasi biaya (`/simulasi`) — FITUR KEEP
- Sub-app vanilla JS + Three.js. Hitung estimasi biaya desain interior/renovasi/build secara instan.
- Kontrol: slider luas area (m²), segmented control lingkup proyek (Interior / Renovasi / Bangun Baru),
  kelas material (Standar/Premium/Luxury), output estimasi biaya + chip WA "Kirim ke WhatsApp".
- Copy: transparan, tanpa biaya tersembunyi. Route dijaga di manifest `data/routes.json`.

## 8. Gallery & Clients & News (semua jujur dummy — brief v0)
- Gallery `/gallery`: carousel swipe + zoom lightbox (adaptasi embla vanilla + dialog),
  thumb rail, prev/next. 8 placeholder **SVG shapes-based** (NO foto — standing user call:
  stage shapes-only; foto layer ditolak 4×). Siap ganti aset asli.
- Clients `/clients`: marquee 12 placeholder + disclaimer izin publikasi (dummy).
- News `/news`: 3 artikel dummy dengan copy jujur (lighting, material honesty, walkthrough).

## 9. Infra & pola yang bernilai (pertahankan sebagai pola, bukan file)
- CMS: `data/content.json` = single source of truth; build-time inject ke HTML via marker
  `CMS:*:START/END` (build.js); runtime fetch `/api/content` (Vercel Blob) dengan fallback seed.
- Admin: `/admin` (ADMIN_TOKEN) — tab Dashboard/Projects/Gallery/Content/Auth; Content tab edit
  JSON → save Blob → rebuild.
- QA vision: Ollama local model `minicpm-v` (serve: `ollama serve` dengan OLLAMA_MODELS=E:\Belajar\models;
  endpoint http://localhost:11434; model `minicpm-v:latest`). Hermes vision_analyze 401 (provider
  vision belum terkonfigurasi) — jalur Ollama lokal yang andal.
- Standing constraint (memory): stage hero WAJIB shapes-based — JANGAN foto/video layer (reject 4×).
- Stack tetap: static site vanilla (HTML+CSS+JS build-time CMS) di Vercel. BUKAN Next.js.
  (Prompt lampiran Bespoke memakai React+Vite+Tailwind+Geist — itu template referensi untuk
  hero/landing fresh baru; keputusan stack rebuild = sesuai arahan user berikutnya.)

## 10. ROUTING (2026-11-02)
- Landing = `/` (single-page: navbar→hero→marquee→about→expertise→services→portfolio→gallery→clients→news→studio-teaser→contact→FooterIsland).
- **Studio = halaman EKSKLUSIF `/studio`** (bukan section landing!) — tiny pushState router
  (`src/hooks/usePath.tsx`): `usePath()` baca pathname; App pilih StudioPage vs Landing.
  Landing hanya menyisakan **StudioTeaser** (teks + tombol "Buka Studio") — badge
  "Akses Eksklusif" DIHAPUS (user 2026-11-02): eksklusivitas via copy teaser + page khusus.
- Vercel: `vercel.json` rewrite catch-all `/((?!api/|admin).*)` → `/index` (cleanUrls-compatible).
- Navbar drawer: Studio = RouteLink `/studio` (bukan anchor).
- **Floating island UI (2026-11-02)**: Navbar + Footer = pill rounded-full melayang
  (border + backdrop-blur + shadow, tidak menempel edge). Footer = `FooterIsland.tsx`
  (© + WA + Email + toggle mode) — Contact section TIDAK punya footer sendiri.
- **Mode gelap/terang**: `src/hooks/useTheme.tsx` — ThemeProvider di main.tsx, persist
  localStorage `trilux-theme`, deep-link `?theme=dark|light` (untuk QA). Murni hitam/putih
  (class `html.trilux-dark` + variabel --tr-bg/--tr-fg; komponen pakai Tailwind dark: variant
  + util .tr-bg/.tr-fg/.tr-line). Toggle tombol di navbar island + footer island (ikon matahari/bulan).
- Simulasi estimasi biaya (`/simulasi`): brief "Please take out" — sengaja tidak dibangun.
- Simulator 3D Three.js: knowledge saja (belum direbuild ke SPA).

## 10b. PELAJARAN GIT/REPO (2026-11-02)
- **`git add -A` berbahaya di repo ini**: folder `REFERENSI DAN BAHAN/` (189MB aset klien),
  `dist/`, `node_modules/`, `.akos/runs/`, file `nul` (reserved device name) semua masuk
  staging. Aturan: **staging manual per-file** (`git add <path>`), jangan `-A`.
- `.gitignore` wajib mencakup: node_modules, dist, REFERENSI DAN BAHAN/, .akos/runs/, `nul`, *.fig.
- **File `nul`** (reserved Windows device name): tidak bisa dihapus/di-rename via Python/cmd
  biasa (Access denied). Solusi: truncate + gitignore saja (JANGAN dicoba di-create dari shell
  dengan redirect `>nul` — MSYS menciptakan file nyata!).
- File config (package.json, vercel.json, tsconfig, vite.config) pernah hilang dari working
  tree (penyebab tidak diketahui — kemungkinan efek proses eksternal). `git checkout HEAD --
  <files>` mengembalikan. Selalu cek `git status` sebelum commit; `git reset` bisa batalkan
  staging yang salah tanpa kehilangan kerja.
- Gambar 1 (image_c51f55.png): tampilan akhir "Bespoke Architecture Studio" — hero putih minimalis,
  h1 "Bespoke Architecture Studio", sub "The building you deserve has never been built before.",
  marquee strip 6 gambar interior, curved white masks atas/bawah, CTA "Book a meeting" + "See Projects",
  body: "We design private residences and commercial spaces from a blank page. No templates,
  no repeated floorplans, no shortcuts."
- Gambar 2 (image_0a4210.png): referensi luxury real-estate — hero gelap "Discover space you truly
  belong in" + BOOK A CALL, "Guiding you toward the residence of your dreams", property listings
  (Atherton Heights $450k, Azure Sanctuary $245k, Summit Pavilion), "Exclusive collection" section,
  footer Properties/Homes/Company/Careers/Blog/Search.
- Prompt lampiran: spec pixel-faithful Bespoke Architecture Studio (React+TS+Vite+Tailwind, Geist,
  navbar fixed + drawer menu physics, image marquee drag rAF velocity 0.8px/frame, curved masks,
  bottom section CTA underline). Lihat lampiran asli di chat.
