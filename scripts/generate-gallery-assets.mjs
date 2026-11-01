#!/usr/bin/env node
/* Generates placeholder 3D-view gallery assets as inline SVG (shapes-based,
   consistent with the cinema-stage rule: NO photo layers). Brief disclaimer:
   "gambar mostly dummy" — real project renders replace these via CMS later.
   Each SVG is an isometric room/facade composition in Trilux tokens. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(scriptDir); // repo root (scripts/ sits one level down)
const outDir = path.join(root, "assets", "img", "gallery");
fs.mkdirSync(outDir, { recursive: true });

const INK = "#1b1512", INK2 = "#241c18", BONE = "#efe9dc", BONE2 = "#e4dccb";
const BRASS = "#c08a3e", BRASS_L = "#e4c07a", BRASS_D = "#8a5f1e";

/* isometric helpers (30° dimetric) */
const cos30 = Math.cos(Math.PI / 6), sin30 = 0.5;
const iso = (x, y, z, cx, cy, s) => [
  cx + (x - y) * cos30 * s,
  cy + (x + y) * sin30 * s - z * s,
];
const pt = (a) => a.flat(1).map((n) => Number(n).toFixed(1)).join(",");

function box(x, y, z, w, d, h, s, cx, cy, fill, stroke) {
  // top
  const top = [iso(x, y, z + h, cx, cy, s), iso(x + w, y, z + h, cx, cy, s), iso(x + w, y + d, z + h, cx, cy, s), iso(x, y + d, z + h, cx, cy, s)];
  // left face (front-left)
  const left = [iso(x, y + d, z + h, cx, cy, s), iso(x + w, y + d, z + h, cx, cy, s), iso(x + w, y + d, z, cx, cy, s), iso(x, y + d, z, cx, cy, s)];
  // right face
  const right = [iso(x + w, y, z + h, cx, cy, s), iso(x + w, y + d, z + h, cx, cy, s), iso(x + w, y + d, z, cx, cy, s), iso(x + w, y, z, cx, cy, s)];
  return `<polygon points="${pt(right)}" fill="${shade(fill, -18)}" stroke="${stroke}" stroke-width="1"/>
<polygon points="${pt(left)}" fill="${shade(fill, -8)}" stroke="${stroke}" stroke-width="1"/>
<polygon points="${pt(top)}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/* room interior: floor slab, back wall, window opening, furniture blocks, light line */
function interior(name, opts = {}) {
  const W = 800, H = 500, s = 2.2, cx = 400, cy = 250;
  const roomW = 12, roomD = 9, roomH = 5;
  let body = `<rect width="${W}" height="${H}" fill="${INK}"/>`;
  // floor slab
  const fl = [iso(0, 0, 0, cx, cy, s), iso(roomW, 0, 0, cx, cy, s), iso(roomW, roomD, 0, cx, cy, s), iso(0, roomD, 0, cx, cy, s)];
  body += `<polygon points="${pt(fl)}" fill="${INK2}" stroke="${BRASS_D}" stroke-width="1"/>`;
  // back wall (left wall) with window
  const wallL = [iso(0, 0, 0, cx, cy, s), iso(0, roomD, 0, cx, cy, s), iso(0, roomD, roomH, cx, cy, s), iso(0, 0, roomH, cx, cy, s)];
  body += `<polygon points="${pt(wallL)}" fill="${shade(INK, 8)}" stroke="${BRASS_D}" stroke-width="1"/>`;
  // window opening on back wall
  const wx = 3, ww = 4, wh = 2.6, wz = 1.6;
  const win = [iso(0, wx, wz, cx, cy, s), iso(0, wx + ww, wz, cx, cy, s), iso(0, wx + ww, wz + wh, cx, cy, s), iso(0, wx, wz + wh, cx, cy, s)];
  body += `<polygon points="${pt(win)}" fill="${shade(BONE, -22)}" stroke="${BRASS}" stroke-width="1.4"/>`;
  // window mullion
  const m1 = [iso(0, wx + ww / 2, wz, cx, cy, s), iso(0, wx + ww / 2, wz + wh, cx, cy, s)];
  body += `<line x1="${m1[0]}" y1="${m1[1]}" x2="${m1[2]}" y2="${m1[3]}" stroke="${BRASS}" stroke-width="1"/>`;
  // right wall
  const wallR = [iso(0, roomD, 0, cx, cy, s), iso(roomW, roomD, 0, cx, cy, s), iso(roomW, roomD, roomH, cx, cy, s), iso(0, roomD, roomH, cx, cy, s)];
  body += `<polygon points="${pt(wallR)}" fill="${shade(INK, 3)}" stroke="${BRASS_D}" stroke-width="1"/>`;
  // furniture per opts: sofa, table, cabinet, plant
  const items = opts.items || [
    { t: "sofa", x: 1.5, y: 4.5 },
    { t: "table", x: 6.5, y: 5.5 },
    { t: "cabinet", x: 9.5, y: 1.2 },
  ];
  for (const it of items) {
    if (it.t === "sofa") {
      body += box(it.x, it.y, 0, 3.2, 1.1, 0.9, s, cx, cy, BONE2, BRASS_D);
      body += box(it.x, it.y, 0.9, 3.2, 1.1, 0.35, s, cx, cy, BONE, BRASS_D);
      body += box(it.x, it.y + 0.9, 0, 3.2, 0.22, 0.75, s, cx, cy, BONE2, BRASS_D);
    } else if (it.t === "table") {
      body += box(it.x, it.y, 0, 2.2, 1.1, 0.75, s, cx, cy, BONE, BRASS_D);
    } else if (it.t === "cabinet") {
      body += box(it.x, it.y, 0, 2.4, 0.6, 2.2, s, cx, cy, BONE2, BRASS_D);
      body += box(it.x + 0.1, it.y + 0.05, 2.2, 2.2, 0.5, 0.06, s, cx, cy, BRASS, BRASS_D);
    } else if (it.t === "lamp") {
      body += box(it.x, it.y, 0, 0.5, 0.5, 2.6, s, cx, cy, BRASS_D, BRASS_D);
      body += box(it.x - 0.15, it.y - 0.15, 2.6, 0.8, 0.8, 0.35, s, cx, cy, BRASS_L, BRASS);
    }
  }
  // brass floor line (light strip)
  const l1 = iso(0, roomD - 0.3, 0.05, cx, cy, s), l2 = iso(roomW, roomD - 0.3, 0.05, cx, cy, s);
  body += `<line x1="${l1[0]}" y1="${l1[1]}" x2="${l2[0]}" y2="${l2[1]}" stroke="${BRASS}" stroke-width="2" opacity="0.85"/>`;
  return svgWrap(W, H, name, body);
}

/* facade exterior: masses, roof, cladding grid, ground line */
function exterior(name, opts = {}) {
  const W = 800, H = 500, s = 2.0, cx = 400, cy = 300;
  let body = `<rect width="${W}" height="${H}" fill="${BONE}"/>`;
  // sky band
  body += `<rect width="${W}" height="${H * 0.42}" fill="${shade(BONE, 6)}"/>`;
  // ground
  body += `<rect y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="${shade(BONE, -10)}"/>`;
  const masses = opts.masses || [
    { x: 0, y: 0, z: 0, w: 8, d: 7, h: 6.5, fill: INK },
    { x: 8.5, y: 1.5, z: 0, w: 5, d: 5.5, h: 4, fill: shade(INK, 10) },
  ];
  for (const m of masses) {
    body += box(m.x, m.y, m.z, m.w, m.d, m.h, s, cx, cy, m.fill, BRASS_D);
    // cladding vertical lines on front-left face
    const lines = Math.floor(m.w * 2);
    for (let i = 1; i < lines; i++) {
      const lx = m.x + (i * m.w) / lines;
      const a = iso(lx, m.y + m.d, 0, cx, cy, s), b = iso(lx, m.y + m.d, m.h, cx, cy, s);
      body += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${shade(m.fill, 14)}" stroke-width="0.8" opacity="0.8"/>`;
    }
  }
  // brass reveal on main mass
  const b1 = iso(0, 7, 3.2, cx, cy, s), b2 = iso(8, 7, 3.2, cx, cy, s);
  body += `<line x1="${b1[0]}" y1="${b1[1]}" x2="${b2[0]}" y2="${b2[1]}" stroke="${BRASS}" stroke-width="2.2"/>`;
  // ground hairline
  body += `<line x1="0" y1="${H * 0.72}" x2="${W}" y2="${H * 0.72}" stroke="${BRASS_D}" stroke-width="1"/>`;
  return svgWrap(W, H, name, body);
}

function svgWrap(w, h, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">
<title>${title}</title>
${body}
</svg>`;
}

const scenes = [
  { f: "g-01", t: "Exterior — Stone Facade", kind: "exterior" },
  { f: "g-02", t: "Interior — Double-Height Living", kind: "interior", items: [{ t: "sofa", x: 1.2, y: 5.2 }, { t: "table", x: 6.8, y: 5.8 }, { t: "lamp", x: 10.2, y: 1.6 }, { t: "cabinet", x: 9.6, y: 1.2 }] },
  { f: "g-03", t: "Interior — Kitchen Island", kind: "interior", items: [{ t: "table", x: 2.2, y: 4.6 }, { t: "cabinet", x: 7.6, y: 1.2 }, { t: "lamp", x: 10.6, y: 6.8 }] },
  { f: "g-04", t: "Interior — Primary Suite", kind: "interior", items: [{ t: "cabinet", x: 1.4, y: 1.4 }, { t: "sofa", x: 5.6, y: 6.2 }] },
  { f: "g-05", t: "Exterior — Night Facade", kind: "exterior" },
  { f: "g-06", t: "Interior — Dining", kind: "interior", items: [{ t: "table", x: 3.4, y: 3.4 }, { t: "cabinet", x: 8.8, y: 1.4 }, { t: "lamp", x: 1.2, y: 7.2 }] },
  { f: "g-07", t: "Interior — Bath", kind: "interior", items: [{ t: "cabinet", x: 2.0, y: 1.4 }, { t: "table", x: 7.4, y: 6.0 }] },
  { f: "g-08", t: "Interior — Stair & Void", kind: "interior", items: [{ t: "sofa", x: 1.0, y: 6.4 }, { t: "lamp", x: 9.8, y: 2.0 }] },
];

for (const sc of scenes) {
  const svg = sc.kind === "exterior" ? exterior(sc.t) : interior(sc.t, { items: sc.items });
  fs.writeFileSync(path.join(outDir, sc.f + ".svg"), svg);
  console.log("gallery asset:", sc.f + ".svg");
}
