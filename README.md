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

## Struktur halaman (single-page marketing landing)
1. **Navbar** — fixed top, logo Trilux, burger 2-garis centered, CTA "Book a meeting" (→ WA),
   full-screen drawer menu (mobile slide-up / desktop slide-from-right, stagger links, X-morph, scroll lock)
2. **Hero** — minimal white, teks saja: "Experiencing Luxury, Before It's Built." + subhead
3. **ImageMarquee** — infinite drag-enabled strip (rAF 0.8px/frame + momentum inertia + seamless loop),
   curved white masks atas/bawah, 6 gambar (Higgs CDN proxy URLs persis spec lampiran)
4. **BottomSection** — copy + 2 underline CTA ("Book a meeting" / "See Projects")

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
