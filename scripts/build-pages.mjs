#!/usr/bin/env node
/* Sub-page builder — generates brief-v0 static pages from data/content.json:
   /about /services /gallery /clients /news /studio
   One shared template (chrome.css) + render-content.mjs renderers. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  esc, attr, renderNavItems, renderAbout, renderExpertise,
  renderServices, renderClients, renderNews, renderGalleryItems,
  renderGalleryThumbs, renderStudio,
} from "./render-content.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.dirname(scriptDir); // repo root (scripts/ sits one level down)
const content = JSON.parse(fs.readFileSync(path.join(siteRoot, "data", "content.json"), "utf8"));
const site = content.site || {};

/* ---------- shared chrome ---------- */
function navLinkHTML(n, current) {
  const c = n.href === current ? ' aria-current="page"' : "";
  return `          <a href="${attr(n.href)}"${c}>${esc(n.label)}</a>`;
}

function pageHTML({ route, title, desc, ogImage, body, ogCurrent }) {
  const cur = ogCurrent || route;
  const links = content.nav.map((n) => navLinkHTML(n, cur)).join("\n");
  const mobileLinks = content.nav.map((n) => `              <a href="${attr(n.href)}">${esc(n.label)}</a>`).join("\n");
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Trilux Design</title>
<meta name="description" content="${attr(desc)}">
<link rel="canonical" href="https://trilux-design-page.vercel.app${route}">
<link rel="icon" type="image/svg+xml" href="/assets/img/logo-mark.svg">
<meta property="og:title" content="${esc(title)} — Trilux Design">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://trilux-design-page.vercel.app${route}">
<meta property="og:image" content="https://trilux-design-page.vercel.app${ogImage}">
<link rel="stylesheet" href="/assets/css/style.css?v=6">
<link rel="stylesheet" href="/assets/css/sections.css?v=3">
<link rel="stylesheet" href="/assets/css/chrome.css?v=2">
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "WebPage", "name": ${JSON.stringify(title)}, "isPartOf": { "@type": "WebSite", "name": "Trilux Design", "url": "https://trilux-design-page.vercel.app/" } }
</script>
</head>
<body class="page-body">
<a class="skip-link" href="#main">Skip to main content</a>

<header class="sub-header">
  <div class="sub-header__inner">
    <a class="sub-logo" href="/" aria-label="Trilux Design — home">
      <img src="/assets/img/logo-mark.svg" alt="" width="24" height="24">
      <span>Trilux<em>&nbsp;Design</em></span>
    </a>
    <nav class="sub-nav" aria-label="Primary">
${links}
    </nav>
    <button class="sub-header__toggle" id="subNavToggle" type="button" aria-expanded="false" aria-controls="subNavOverlay" aria-label="Open menu">
      <span class="nav__toggle-bars"><span></span><span></span><span></span></span>
    </button>
  </div>
  <div class="sub-nav-overlay" id="subNavOverlay" aria-hidden="true">
    <nav aria-label="Mobile menu">
${mobileLinks}
    </nav>
    <a class="btn btn-on-ink" href="${attr(site.wa || "https://wa.me/6282287348422")}" target="_blank" rel="noopener">Whatsapp →</a>
  </div>
</header>

<main id="main" class="sub-main">
${body}
</main>

<footer class="site-footer panel-ink">
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <svg class="logo-live" width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect class="logo-draw d1" x="6" y="18" width="6" height="16" fill="#c08a3e"/>
        <rect class="logo-draw d2" x="17" y="6" width="6" height="28" fill="#c08a3e"/>
        <rect class="logo-draw d3" x="28" y="13" width="6" height="21" fill="#c08a3e"/>
        <rect class="logo-draw d4" x="4" y="34" width="32" height="1.5" fill="#c08a3e"/>
      </svg>
      <div>
        <span class="footer-name">Trilux <em>Design</em></span>
        <span class="footer-tag">Interior · Exterior · Building — Jakarta</span>
      </div>
    </div>
    <span class="footer-copy">© 2026 Trilux Design</span>
    <a href="${attr(route)}" id="backToTop">Back to top ↑</a>
  </div>
</footer>

<script src="/assets/js/track.js" defer></script>
<script src="/assets/js/chrome.js?v=1" defer></script>
<script src="/assets/js/pages.js?v=2" defer></script>
</body>
</html>`;
}

/* ---------- shared contact CTA strip (bridging copy) ---------- */
function ctaStrip(panel) {
  return `
  <section class="cta-strip ${panel}" aria-label="Hubungi Trilux">
    <div class="wrap cta-strip__grid">
      <div>
        <p class="eyebrow">Next step</p>
        <h2>Ceritakan proyek Anda.</h2>
        <p>Survei lokasi gratis, lalu tim kami buka RAB detail — angka yang mengikat, bukan estimasi.</p>
      </div>
      <div class="cta-strip__ctas">
        <a class="btn btn-on-ink" href="mailto:${attr(site.email || "triluxdesign@gmail.com")}">Email Us →</a>
        <a class="btn btn-on-ink js-wa" href="${attr(site.wa || "https://wa.me/6282287348422")}" target="_blank" rel="noopener">Whatsapp →</a>
      </div>
    </div>
  </section>`;
}

/* ---------- footer reused inside body ---------- */
const FOOT = `
<footer class="site-footer panel-ink" style="margin-top:0">
  <div class="wrap footer-inner">
    <span class="footer-copy">© 2026 Trilux Design · Interior · Exterior · Building</span>
    <a href="/" id="backToTop">Back to top ↑</a>
  </div>
</footer>`;

/* ================= ABOUT ================= */
const aboutBody = `
  <section class="sec panel-bone" style="padding-top:var(--sp-9)">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">${esc(content.about.eyebrow)}</p>
        <h1 class="section-title">${esc(content.about.title)}</h1>
      </div>
      ${renderAbout(content)}
    </div>
  </section>

  <section class="sec panel-ink" id="expertise" aria-label="Our expertise">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Capabilities</p>
        <h2 class="section-title">Our Expertise</h2>
      </div>
      <div class="expertise-grid reveal">
${renderExpertise(content)}
      </div>
    </div>
  </section>

  ${ctaStrip("panel-ink")}
  ${FOOT}`;

/* ================= SERVICES ================= */
const servicesBody = `
  <section class="sec panel-bone" style="padding-top:var(--sp-9)">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">What we do</p>
        <h1 class="section-title">Services</h1>
        <p class="sec-sub">Empat disiplin, satu tanggung jawab — dari sketsa konsep hingga instalasi terakhir. Setiap layanan dikurasi seperti proyeknya sendiri: presisi, jujur, tahan lama.</p>
      </div>
    </div>
  </section>
  <section class="sec panel-bone" style="padding-top:0">
    <div class="wrap">
      <div class="services-grid reveal">
${renderServices(content)}
      </div>
      <p class="gallery-hint" style="margin-top:var(--sp-5)">Scope lengkap ditentukan setelah survei lokasi — setiap proyek dikurasi, bukan dikatalogkan.</p>
    </div>
  </section>
  ${ctaStrip("panel-ink")}
  ${FOOT}`;

/* ================= GALLERY ================= */
const galleryBody = `
  <section class="sec panel-bone" style="padding-top:var(--sp-9)">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Katalog visual</p>
        <h1 class="section-title">Gallery</h1>
        <p class="sec-sub">${esc(content.gallery?.note || "Tampak 3D proyek — swipe untuk menjelajah, klik untuk zoom.")}</p>
      </div>
    </div>
  </section>
  <section class="sec panel-bone" style="padding-top:0" aria-label="3D views gallery">
    <div class="wrap">
      <div class="gallery-shell reveal">
        <div class="gallery-viewport" id="galleryViewport" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Galeri tampak 3D proyek">
          <div class="gallery-track" id="galleryTrack">
${renderGalleryItems(content)}
          </div>
          <button class="gallery-nav prev" id="galPrev" type="button" aria-label="Slide sebelumnya">←</button>
          <button class="gallery-nav next" id="galNext" type="button" aria-label="Slide berikutnya">→</button>
          <span class="gallery-count" id="galCount" aria-live="polite"></span>
        </div>
        <div class="gallery-thumbs" id="galleryThumbs" role="group" aria-label="Pilih gambar">
${renderGalleryThumbs(content)}
        </div>
        <p class="gallery-hint">Swipe / geser untuk menjelajah · klik gambar untuk zoom · Esc untuk tutup</p>
      </div>
    </div>
  </section>
  ${ctaStrip("panel-ink")}
  ${FOOT}`;

/* ================= CLIENTS ================= */
const clientsBody = `
  <section class="sec panel-bone" style="padding-top:var(--sp-9)">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Trusted by</p>
        <h1 class="section-title">Our Clients</h1>
      </div>
    </div>
  </section>
  <section class="sec panel-bone" style="padding-top:0" aria-label="Clients">
    <div class="wrap">
      <div class="client-rail reveal" id="clientRail" aria-label="Client logo carousel">
${renderClients(content)}
      </div>
      <p class="gallery-hint" id="clientNote" style="margin-top:var(--sp-4)">${esc(content.clients?.note || "")}</p>
    </div>
  </section>
  ${ctaStrip("panel-ink")}
  ${FOOT}`;

/* ================= NEWS ================= */
const newsBody = `
  <section class="sec panel-bone" style="padding-top:var(--sp-9)">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Journal</p>
        <h1 class="section-title">News &amp; Articles</h1>
        <p class="sec-sub">${esc(content.news?.note || "")}</p>
      </div>
    </div>
  </section>
  <section class="sec panel-bone" style="padding-top:0" aria-label="Articles">
    <div class="wrap">
      <div class="news-grid reveal" id="newsGrid">
${renderNews(content)}
      </div>
    </div>
  </section>
  ${ctaStrip("panel-ink")}
  ${FOOT}`;

/* ================= STUDIO ================= */
const studioRender = renderStudio(content);
const studioBody = `
  <section class="sec panel-bone" style="padding-top:var(--sp-9)">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="eyebrow">Ruang uji coba</p>
        <h1 class="section-title">Studio</h1>
        <p class="sec-sub">${esc(content.studio?.note || "")}</p>
      </div>
    </div>
  </section>
  <section class="sec panel-bone" style="padding-top:0" aria-label="Interactive floorplan studio">
    <div class="wrap">
      <div class="studio-grid">
        <div class="studio-canvas-wrap reveal">
${studioRender ? studioRender.svg : ""}
        </div>
        <aside class="studio-panel reveal">
          <div class="st-row">
            <p class="eyebrow" style="margin-bottom:var(--sp-3)">Ruangan</p>
            <div class="st-field">
              <label for="roomWOut">Lebar</label>
              <div class="stepper">
                <button type="button" data-room="w" data-delta="-20" aria-label="Kurangi lebar">−</button>
                <output id="roomWOut">${content.studio?.room?.w ?? ""}</output>
                <button type="button" data-room="w" data-delta="20" aria-label="Tambah lebar">+</button>
              </div>
            </div>
            <div class="st-field">
              <label for="roomDOut">Kedalaman</label>
              <div class="stepper">
                <button type="button" data-room="d" data-delta="-20" aria-label="Kurangi kedalaman">−</button>
                <output id="roomDOut">${content.studio?.room?.d ?? ""}</output>
                <button type="button" data-room="d" data-delta="20" aria-label="Tambah kedalaman">+</button>
              </div>
            </div>
            <p class="st-note">Grid = 40 cm. Semua dimensi dalam sentimeter. Nilai dummy per brief.</p>
          </div>
          <div class="st-row">
            <p class="eyebrow" style="margin-bottom:var(--sp-3)">Partisi / Dinding</p>
            <p class="st-note">Tarik ujung partisi (titik brass) untuk mengubah panjang. Klik partisi untuk menghapus.</p>
            <div class="st-actions">
              <button class="btn btn-on-bone" type="button" id="partAddV" style="color:var(--text-on-bone);border-color:var(--text-on-bone)">＋ Partisi vertikal</button>
              <button class="btn btn-on-bone" type="button" id="partAddH" style="color:var(--text-on-bone);border-color:var(--text-on-bone)">＋ Partisi horizontal</button>
            </div>
            <ul class="st-furn-list" id="partList" aria-label="Daftar partisi"></ul>
          </div>
          <div class="st-row">
            <p class="eyebrow" style="margin-bottom:var(--sp-3)">Furnitur</p>
            <p class="st-note">Seret furnitur di canvas. Pilih dari daftar untuk melihat ukuran (cm). Klik stepper untuk mengubah lebar.</p>
            <ul class="st-furn-list" id="furnList" aria-label="Daftar furnitur"></ul>
            <div class="st-field" id="furnSizeRow" style="margin-top:var(--sp-4)">
              <label for="furnWOut">Ukuran terpilih</label>
              <div class="stepper">
                <button type="button" id="furnMinus" aria-label="Kurangi ukuran">−</button>
                <output id="furnWOut">—</output>
                <button type="button" id="furnPlus" aria-label="Tambah ukuran">＋</button>
              </div>
            </div>
            <p class="st-note" id="furnDimNote">Klik furnitur di daftar atau di canvas untuk memilih.</p>
          </div>
        </aside>
      </div>
    </div>
  </section>
  ${ctaStrip("panel-ink")}
  ${FOOT}`;

/* ---------- build pages ---------- */
const pages = [
  { route: "/about", file: "about/index.html", title: "About — Visi & Misi",
    desc: "Trilux Design — studio desain interior dan arsitektur premium. Visi dan misi kami: eksperiential design, refined luxury, built perfection.",
    ogImage: "/assets/img/cover.jpg", body: aboutBody, ogCurrent: "/about" },
  { route: "/services", file: "services/index.html", title: "Services",
    desc: "Layanan Trilux Design: Interior, Exterior, Mechanical Electrical Plumbing, dan Manufacturing — dari sketsa hingga serah terima.",
    ogImage: "/assets/img/cover.jpg", body: servicesBody, ogCurrent: "/services" },
  { route: "/gallery", file: "gallery/index.html", title: "Gallery — Tampak 3D",
    desc: "Katalog tampak 3D proyek Trilux Design. Swipe untuk menjelajah, zoom untuk detail. Hanya gambar tampak 3D — tanpa detail ukuran maupun material.",
    ogImage: "/assets/img/gallery/g-01.svg", body: galleryBody, ogCurrent: "/gallery" },
  { route: "/clients", file: "clients/index.html", title: "Our Clients",
    desc: "Klien yang mempercayakan proyeknya kepada Trilux Design.",
    ogImage: "/assets/img/cover.jpg", body: clientsBody, ogCurrent: "/clients" },
  { route: "/news", file: "news/index.html", title: "News & Articles",
    desc: "Artikel inspirasi desain dari tim Trilux Design — terbit di blog dan kanal sosial kami.",
    ogImage: "/assets/img/cover.jpg", body: newsBody, ogCurrent: "/news" },
  { route: "/studio", file: "studio/index.html", title: "Studio — Floorplan Planner",
    desc: "Eksplorasi ruang interaktif: atur partisi, seret furnitur, dan sesuaikan dimensi dalam satuan cm. Eksplorasi awal sebelum survei.",
    ogImage: "/assets/img/cover.jpg", body: studioBody, ogCurrent: "/studio" },
];

for (const pg of pages) {
  const outPath = path.join(siteRoot, pg.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pageHTML(pg));
  console.log("page built:", pg.file);
}

fs.writeFileSync(
  path.join(siteRoot, "data", "routes.json"),
  JSON.stringify(pages.map((p) => ({ route: p.route, file: p.file, title: p.title })), null, 2) + "\n"
);
console.log("routes manifest updated");
