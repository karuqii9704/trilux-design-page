# Trilux Design — Web

Website resmi Trilux Design — studio desain interior & arsitektur premium (Mostar, Bosnia & Herzegovina).
Static site vanilla (HTML + CSS + JS build-time CMS), dideploy ke Vercel.

## Arsitektur

```
index.html              Landing page (9 navigasi brief v0 + semua section)
about/ services/        Sub-page (clean routes)
gallery/ clients/
news/ studio/
project/                Sub-app Portfolio detail (vanilla JS, 9 nav baru)
simulasi/               Sub-app 3D Simulator (Three.js, 9 nav baru)
data/content.json       SINGLE SOURCE OF TRUTH konten (CMS)
data/projects.json      Data proyek featured (landing S5)
data/routes.json        Manifest route sub-page
build.js                Inject seed CMS → index.html (idempotent)
scripts/
  build-pages.mjs       Generate 6 sub-page dari content.json
  render-content.mjs    Renderer shared (dipakai build + pages + API)
  generate-gallery-assets.mjs  Placeholder SVG shapes-based (NO foto)
  serve.mjs             Static server + clean-route fallback (dev)
assets/js/
  sections.js           Hydrasi landing (fetch /api/content → fallback seed)
  pages.js              Interaksi sub-page: carousel gallery, zoom lightbox, drag floorplan studio
  chrome.js             Drawer mobile shared sub-page
  main.js               Reveal scroll, cursor, marquee (existing)
assets/css/
  style.css             Token PRD + landing (existing)
  sections.css          Section brief v0 (about/expertise/services/clients/news/studio)
  chrome.css            Chrome sub-page (header/footer/drawer)
  cinema.css            Stage shapes-based (existing)
api/content.js          GET/POST content CMS (Vercel Blob, token-auth)
admin/                  CMS admin (tabs: Dashboard/Projects/Gallery/Content/Auth)
```

## CMS

- **Source of truth**: `data/content.json`
- **Build**: `npm run build` = `node build.js && node scripts/build-pages.mjs`
  - `build.js` inject seed ke `index.html` (marker `CMS:*:START/END`, idempotent)
  - `build-pages.mjs` generate 6 sub-page
- **Runtime**: landing + sub-page fetch `/api/content` (Blob); fallback ke seed build-time
- **Admin**: `/admin` (token via `ADMIN_TOKEN`) — tab **Content** edit JSON, save → Blob → rebuild

## Dev

```bash
npm run build
node scripts/serve.mjs 3000   # http://localhost:3000 (clean routes aman)
```

## Brief v0 — status implementasi

| Item brief | Status |
|---|---|
| Nav 9 item (About·Portfolio·Services·Gallery·Client·News·Simulator·Studio·Contact) | ✅ landing + semua sub-app |
| About + Visi & Misi (3 misi bernomor) | ✅ landing + /about |
| Expertise 4 kolom | ✅ |
| Portfolio featured + View details | ✅ S5 landing + /project |
| Services 4 (Interior·Exterior·MEP·Manufacturing) | ✅ teaser landing + /services |
| Gallery swipe + zoom (gambar mostly dummy) | ✅ /gallery carousel + lightbox, 8 placeholder SVG shapes-based (jujur, shapes-only) |
| Clients (dummy) | ✅ /clients marquee 12 placeholder + disclaimer |
| Article/News (dummy) | ✅ /news 3 artikel dummy |
| Simulator (Please take out) | ✅ /simulasi sub-app existing dipertahankan; link di nav 9 |
| Studio: partisi adjustable + drag furnitur + ukuran cm (dummy) | ✅ /studio floorplan 8m×6m, 3 furnitur draggable, 1 partisi adjustable, 8 label dimensi |
| Mobile: hamburger + overlay drawer | ✅ semua page |

## Watermelon UI (adaptasi)

Pola komponen dari [watermelon-platform](https://github.com/WatermelonCorp/watermelon-platform) (MIT)
diadaptasi ke vanilla JS: carousel (embla-adapted), dialog/lightbox, dnd floorplan, slider, layout dashboard.
Lihat `watermelon-ref/` (lokal, tidak di-publish).

## Deploy

Push ke `master` → Vercel auto-deploy → trilux-design-page.vercel.app.
`vercel.json`: buildCommand = `node build.js && node scripts/build-pages.mjs`;
api/content.js + api/admin.js sebagai Functions; cache /assets/img/* 7 hari.
