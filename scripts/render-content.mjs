/* Shared content renderer — Trilux Design.
   ONE source of truth for content HTML, used by:
   - build.js (build-time seed injection into index.html)
   - scripts/build-pages.mjs (sub-page generation)
   - assets/js/sections.js + pages.js (runtime hydration, browser ESM import)
   Must stay dependency-free and browser-compatible (no fs, no Node APIs). */

export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
export const attr = (s) => esc(s).replace(/'/g, "&#39;");

/* ---------- nav ---------- */
export function renderNavItems(content) {
  const items = Array.isArray(content?.nav) ? content.nav : [];
  return items
    .map((n) => `<a href="${attr(n.href)}">${esc(n.label)}</a>`)
    .join("\n            ");
}

/* ---------- about ---------- */
export function renderAbout(content) {
  const a = content?.about;
  if (!a) return "";
  const missions = (a.missions || [])
    .map(
      (m, i) => `<li>
      <span class="m-num">0${i + 1}</span>
      <div>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.text)}</p>
      </div>
    </li>`
    )
    .join("\n      ");
  return `
      <div class="about-grid reveal">
        <div>
          <p class="about-lede">${esc(a.title)}</p>
          <p class="about-body">${esc(a.intro)}</p>
        </div>
        <div>
          <div class="vision-block">
            <p class="vision-label">${esc(a.vision.label)}</p>
            <p class="vision-text">${esc(a.vision.text)}</p>
          </div>
          <ul class="mission-list">
      ${missions}
          </ul>
        </div>
      </div>`;
}

/* ---------- expertise ---------- */
export function renderExpertise(content) {
  const cells = (content?.expertise || [])
    .map(
      (e) => `<div class="expertise-cell">
        <span class="e-num">${esc(e.num)}</span>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.text)}</p>
      </div>`
    )
    .join("\n      ");
  return `\n      ${cells}\n    `;
}

/* ---------- services ---------- */
export function renderServices(content) {
  const cards = (content?.services || [])
    .map(
      (s) => `<article class="service-card">
        <span class="s-tag">${esc(s.tag)}</span>
        <h3>${esc(s.name)}</h3>
        <p class="s-desc">${esc(s.desc)}</p>
        <ul>
          ${(s.points || []).map((p) => `<li>${esc(p)}</li>`).join("\n          ")}
        </ul>
      </article>`
    )
    .join("\n      ");
  return `\n      ${cards}\n    `;
}

/* ---------- clients rail (auto-scroll marquee, duplicated for loop) ---------- */
export function renderClients(content) {
  const items = (content?.clients?.items || []).map(
    (c, i) => `<div class="client-item">
        <span class="c-mark" aria-hidden="true">${esc((c.name || "C").charAt(0))}</span>
        <span class="c-name">${esc(c.name)}</span>
        <span class="c-type">${esc(c.type)}</span>
      </div>`
  );
  if (!items.length) return "";
  const half = items.join("\n      ");
  // duplicate the half so translateX(-50%) loops seamlessly
  return `\n      ${half}\n      ${half}\n    `;
}

/* ---------- news cards ---------- */
export function renderNews(content) {
  const cards = (content?.news?.items || [])
    .map(
      (n) => `<article class="news-card" id="${esc(n.slug || "")}">
        <span class="n-cat">${esc(n.category)}</span>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.excerpt)}</p>
        <div class="n-meta"><span>${esc(n.date)}</span><span>${esc(n.readTime)}</span></div>
        <a class="n-link" href="/news#${esc(n.slug || "")}">Baca selengkapnya <span aria-hidden="true">→</span></a>
      </article>`
    )
    .join("\n      ");
  return `\n      ${cards}\n    `;
}

/* ---------- gallery (swipe + zoom — embla/dialog pattern from Watermelon, vanilla) ---------- */
const ABS = (src) => (src && src.startsWith("assets/") ? "/" + src : src); // clean-route safe
export function renderGalleryItems(content) {
  return (content?.gallery?.items || [])
    .map(
      (g, i) => `<figure class="gallery-slide" data-index="${i}" data-full="${attr(ABS(g.src))}">
        <div class="g-frame">
          <img src="${attr(ABS(g.src))}" alt="${attr(g.alt)}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async">
        </div>
        <figcaption class="gallery-caption">
          <span class="g-cap">${esc(g.caption)}</span>
          <span class="g-kind">${esc(g.kind)}</span>
        </figcaption>
      </figure>`
    )
    .join("\n        ");
}

export function renderGalleryThumbs(content) {
  return (content?.gallery?.items || [])
    .map(
      (g, i) => `<button type="button" data-index="${i}"${i === 0 ? ' aria-current="true"' : ""} aria-label="Tampilkan ${esc(g.caption)}">
          <img src="${attr(ABS(g.src))}" alt="" loading="lazy" decoding="async">
        </button>`
    )
    .join("\n        ");
}

/* ---------- studio floorplan (SVG, 1 unit = 1 cm) ---------- */
export function renderStudio(data) {
  const s = data?.studio;
  if (!s) return "";
  const room = s.room;
  const SCALE = 1; // viewBox units == cm
  const vbW = room.w, vbH = room.d;
  const parts = (s.partitions || []).map((p) => {
    if (p.orientation === "vertical") {
      return `<line class="st-part" data-id="${esc(p.id)}" x1="${p.x}" y1="${p.from}" x2="${p.x}" y2="${p.to}" stroke="var(--brass-700)" stroke-width="3"/>
        <circle class="st-part-handle" data-id="${esc(p.id)}" data-handle="to" cx="${p.x}" cy="${p.to}" r="7" fill="var(--brass-500)"/>`;
    }
    return `<line class="st-part" data-id="${esc(p.id)}" x1="${p.from}" y1="${p.x}" x2="${p.to}" y2="${p.x}" stroke="var(--brass-700)" stroke-width="3"/>
      <circle class="st-part-handle" data-id="${esc(p.id)}" data-handle="to" cx="${p.to}" cy="${p.x}" r="7" fill="var(--brass-500)"/>`;
  });
  const furn = (s.furniture || []).map((f) => {
    const x = f.x, y = f.y;
    return `<g class="st-furn" data-id="${esc(f.id)}" transform="translate(${x} ${y})">
      <rect width="${f.w}" height="${f.d}" fill="rgba(192,138,62,.10)" stroke="var(--brass-700)" stroke-width="1.5"/>
      <text class="st-dim-label" x="4" y="-6">${esc(f.label)}</text>
      <text class="st-dim-label" x="${f.w / 2}" y="${f.d / 2 + 4}" text-anchor="middle">${f.w} × ${f.d} cm</text>
    </g>`;
  });
  // dimension lines: room width (top), depth (left)
  const gridLines = [];
  for (let gx = 40; gx < vbW; gx += 40) gridLines.push(`<line x1="${gx}" y1="0" x2="${gx}" y2="${vbH}" class="st-grid-line"/>`);
  for (let gy = 40; gy < vbH; gy += 40) gridLines.push(`<line x1="0" y1="${gy}" x2="${vbW}" y2="${gy}" class="st-grid-line"/>`);
  return { svg: `<svg class="studio-canvas" id="studioCanvas" data-room-w="${vbW}" data-room-d="${vbH}" viewBox="-30 -30 ${vbW + 60} ${vbH + 60}" role="application" aria-label="Floorplan interaktif — seret furnitur, sesuaikan partisi dan ukuran dalam sentimeter">
  <defs>
    <pattern id="stGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" class="st-grid-line"/>
    </pattern>
  </defs>
  <rect x="-30" y="-30" width="${vbW + 60}" height="${vbH + 60}" fill="none" stroke="none"/>
  <rect x="0" y="0" width="${vbW}" height="${vbH}" fill="url(#stGrid)" class="st-room"/>
  <rect x="0" y="0" width="${vbW}" height="${vbH}" fill="none" stroke="var(--text-on-bone)" stroke-width="4" class="st-room-wall"/>
  ${gridLines.map((l) => l.replace('class="st-grid-line"', 'class="st-grid-line" style="display:none"')).join("")}
  <!-- room dimension labels -->
  <text class="st-dim-label" x="${vbW / 2}" y="-14" text-anchor="middle">${room.w} cm</text>
  <text class="st-dim-label" x="-14" y="${vbH / 2}" text-anchor="middle" transform="rotate(-90 -14 ${vbH / 2})">${room.d} cm</text>
  ${parts.join("\n  ")}
  ${furn.join("\n  ")}
</svg>`, room, partitions: s.partitions, furniture: s.furniture, note: s.note };
}
