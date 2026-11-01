# Trilux Design — Web (fresh rebuild v3)

Website resmi Trilux Design — studio desain interior & arsitektur premium (Jakarta).
**Fresh SPA**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Geist, deploy statis ke Vercel.

> 2026-11-01: landing page, hero, navbar, dan route di-reset & dibangun ulang dari nol
> (sesuai arahan + spec prompt lampiran "Bespoke Architecture Studio", diadaptasi ke
> brand/copy Trilux). Fitur studio & informasi lain di-keep sebagai knowledge:
> lihat `.akos/knowledge/FEATURES_KEEP.md`. Backup kode lama: branch `backup/pre-reset-2026-11-01`.

## Stack
- React 18 + TypeScript + Vite 5
- Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss"`)
- Font: Geist (Google Fonts, persis spec lampiran)
- Aset: shapes-based only — tidak ada foto/video layer (standing user call)

## Struktur halaman (single-page marketing landing — scroll ke bawah hingga footer)
Navbar (drawer) → Hero (minimal white, teks) → ImageMarquee (drag rAF, 6 gambar Higgs, curved masks)
→ **About** (Sekilas Perusahaan + Visi & Misi 3 bernomor, copy verbatim brief v0)
→ **Our Expertise** (4 kolom bernomor 01–04) → **Services** (accordion 4 layanan, modern-minimal)
→ **Portfolio** (featured Padang Residence I + grid + lightbox View details)
→ **Gallery** (karosel drag + prev/next + thumbnail rail + zoom lightbox — shapes placeholder, swipe+zoom per brief)
→ **Clients** (text rail marquee + disclaimer izin) → **News** (3 kartu artikel dummy)
→ **Studio** (floorplan SVG interaktif: drag furnitur cm, partisi adjustable, stepper cm — dummy jujur)
→ **Contact** (WA/email/IG/lokasi) → **Footer**.
Plus: scroll progress bar 2px di atas viewport.

Konten = CMS runtime hydration (`useContent` → `/api/content` Blob, fallback seed `data/`);
proyek = `useProjects` → `/api/admin?cms=1`.
Simulator: brief v0 tulis "Please take out" → sengaja tidak dibangun.
Semua visual shapes-based (NO foto layer — standing constraint; brief: foto asli masih tahap desain).

## Tetap dipertahankan (di luar SPA)
- `admin/` — CMS admin (self-contained: dashboard stats, featured/projects CMS, content JSON, leads) — token via `ADMIN_TOKEN`
- `api/` — Vercel Functions: `/api/content` (CMS Blob read/public + write token-auth),
  `/api/admin` (stats + projects CMS), `/api/lead` (lead capture), `/api/track` (analytics)
- `data/` — seed CMS: `content.json`, `projects.json`, `routes.json`

## Dev
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run preview    # preview build
```

## Deploy
Push ke `master` → Vercel auto-deploy → trilux-design-page.vercel.app.
`vercel.json`: `buildCommand = "npm run build"`, `outputDirectory = "dist"`,
`api/*.js` sebagai Functions, cache immutable untuk `/assets/*`.

## Catatan
- Copy/brand asli Trilux (visi/misi, expertise, services, Padang Residence I, kontak WA)
  tersimpan di `.akos/knowledge/FEATURES_KEEP.md` — dipakai sebagai sumber saat mengembangkan
  section lanjutan (About/Work/Contact) dan fitur Studio floorplan planner.
- Stage/shapes-based only: jangan tambah foto/video layer pada hero (sudah 4× ditolak).
