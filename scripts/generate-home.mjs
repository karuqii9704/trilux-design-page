#!/usr/bin/env node
/* Generate the new Trilux home (index.html + assets/css/home.css) from scratch.

   Design language: Watermelon UI patterns (full-screen drawer w/ stagger physics,
   drag-enabled marquee with curved masks, feature/bento grids, minimal footer)
   adapted to vanilla JS + Trilux PRD §6 tokens (Fraunces display / Archivo body,
   ink/bone/brass, hairline rules, radius-none, no shadows on public pages).

   Stage = SHAPES-BASED only (no photo layers — standing user call).
   Gallery strip = the 8 shapes-based SVG placeholders (brief: "gambar mostly dummy").
   Content seeded at build time from data/content.json (CMS single source of truth).
*/
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(scriptDir); // repo root (scripts/ ..)
const content = JSON.parse(fs.readFileSync(path.join(root, "data/content.json"), "utf8"));
const nav = content.nav;
const site = content.site;
const about = content.about;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = (s) => esc(s).replace(/'/g, "&#39;");

/* ---------- gallery strip: reuse the 8 shapes-based SVG assets ---------- */
const slides = content.gallery.items.map((g, i) => `      <figure class="wm-slide" data-zoom="${i}" tabindex="0" role="button" aria-label="Zoom: ${esc(g.caption)}">
        <img src="/${attr(g.src)}" alt="${esc(g.alt)}" loading="lazy" decoding="async">
        <figcaption>${esc(g.caption)}</figcaption>
      </figure>`).join("\n");
const track = slides + "\n" + slides; // duplicated for seamless loop

/* ---------- sections from content.json ---------- */
const expCells = content.expertise.map((c) => `      <div class="wm-expertise__cell reveal">
        <span class="wm-expertise__num">${esc(c.num)}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.text)}</p>
      </div>`).join("\n");

const svcCards = content.services.map((s) => `      <article class="wm-bento__card reveal">
        <span class="wm-bento__num">${esc(s.tag)}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.desc)}</p>
        <div class="wm-bento__list">${(s.points || []).map((p) => `<span class="wm-chip">${esc(p)}</span>`).join("")}</div>
      </article>`).join("\n");

const clientItem = (c) => `        <div class="wm-client">
          <span class="wm-client__mark" aria-hidden="true">${esc((c.name || "C").charAt(0))}</span>
          <span><span class="wm-client__name">${esc(c.name)}</span><br><span class="wm-client__type">${esc(c.type)}</span></span>
        </div>`;
const clientsTrack = content.clients.items.map(clientItem).join("\n") + "\n" + content.clients.items.map(clientItem).join("\n");

const newsCards = content.news.items.map((n) => `      <article class="wm-news__card reveal" id="${esc(n.slug)}">
        <span class="wm-news__cat">${esc(n.category)}</span>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.excerpt)}</p>
        <div class="wm-news__meta"><span>${esc(n.date)}</span><span>${esc(n.readTime)}</span></div>
      </article>`).join("\n");

const missions = about.missions.map((m, i) => `      <div class="wm-mission reveal">
        <b>0${i + 1}</b>
        <div>
          <h3>${esc(m.title)}</h3>
          <p>${esc(m.text)}</p>
        </div>
      </div>`).join("\n");

const navLinks = nav.map((n, i) => `        <a class="wm-menu__link" href="${attr(n.href)}"><small>${String(i + 1).padStart(2, "0")}</small>${esc(n.label)}</a>`).join("\n");

/* ---------- CSS ---------- */
const CSS = `/* Trilux home — Watermelon-UI patterns × PRD §6 tokens.
   Global reset/tokens/reveal live in style.css (loaded first). */

:root{ --ease-out-expo: cubic-bezier(0.16,1,0.3,1); }

/* figure margin reset (figure dipakai untuk hero panel) */
figure{ margin: 0; }

/* home page sits on ink from the very top */
body{ background: var(--ink-900); color: var(--text-on-ink); }

/* body scroll lock while drawer/lightbox open (JS toggles class) */
html.wm-menu-open, body.wm-menu-open{ overflow: hidden; }

/* ---------- fixed navbar (Watermelon pattern) ---------- */
/* Always carries a scrim so wordmark/burger/CTA stay legible over the hero panel. */
.wm-nav{ position: fixed; inset: 0 0 auto 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 clamp(1rem,2.5vw,2.5rem); height: 4.5rem;
  background: linear-gradient(rgba(20,16,16,.72), rgba(20,16,16,0));
  -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
  border-bottom: 1px solid transparent;
  transition: background .4s var(--ease-out-expo), border-color .4s; }
.wm-nav.is-scrolled{ background: rgba(20,16,16,.88); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom-color: var(--rule-on-ink); }
.wm-nav__brand{ display: flex; align-items: center; gap: .6rem; height: 100%;
  font-family: var(--font-display); font-size: 1.15rem; letter-spacing: .02em; color: var(--text-on-ink); }
.wm-nav__brand em{ font-style: normal; color: var(--brass-500); }
.wm-nav__brand svg{ display: block; }
.wm-nav__center{ position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); }
.wm-burger{ display: flex; flex-direction: column; gap: 5px; padding: .75rem; z-index: 90; position: relative; }
.wm-burger span{ display: block; width: 1.5rem; height: 1.5px; background: var(--text-on-ink);
  border-radius: 999px; transition: width .3s var(--ease-out-expo); }
.wm-burger:hover span{ width: 1.25rem; }
.wm-nav__cta{ font-size: var(--label); letter-spacing: .18em; text-transform: uppercase;
  color: var(--text-on-ink); border: 1px solid var(--rule-on-ink); border-radius: 999px;
  padding: .55rem 1.25rem; transition: background .3s, color .3s, border-color .3s; }
.wm-nav__cta:hover{ background: var(--text-on-ink); color: var(--ink-900); border-color: var(--text-on-ink); }
@media (max-width: 860px){ .wm-nav__cta{ display: none; } }

/* ---------- full-screen menu (drawer physics) ---------- */
.wm-overlay{ position: fixed; inset: 0; z-index: 60; background: rgba(10,8,7,.55);
  backdrop-filter: blur(6px); opacity: 0; pointer-events: none;
  transition: opacity .5s var(--ease-out-expo); }
.wm-overlay.is-open{ opacity: 1; pointer-events: auto; }
.wm-drawer{ position: fixed; inset: 0; z-index: 70; background: var(--ink-800);
  display: flex; flex-direction: column; justify-content: center;
  padding: clamp(1.5rem,5vw,4rem);
  transform: translateY(100%); visibility: hidden;
  transition: transform .5s var(--ease-out-expo), visibility 0s .5s; }
@media (min-width: 861px){ .wm-drawer{ inset: 0 0 0 auto; width: min(26rem,100vw); transform: translateX(100%); } }
.wm-drawer.is-open{ transform: translate(0); visibility: visible; transition: transform .5s var(--ease-out-expo); }
.wm-drawer__close{ position: absolute; top: 1.25rem; right: clamp(1rem,2.5vw,2.5rem);
  width: 2.5rem; height: 2.5rem; border-radius: 999px; border: 1px solid var(--rule-on-ink);
  display: flex; align-items: center; justify-content: center; transition: background .3s; }
.wm-drawer__close:hover{ background: var(--ink-700); }
.wm-drawer__close i{ position: relative; display: block; width: 1.1rem; height: 1.5px; background: var(--text-on-ink); transform: rotate(45deg); }
.wm-drawer__close i::before{ content: ""; position: absolute; inset: 0; background: var(--text-on-ink); transform: rotate(90deg); }
.wm-menu{ display: flex; flex-direction: column; gap: .25rem; }
.wm-menu a{ font-family: var(--font-display); font-weight: 400;
  font-size: clamp(1.75rem,7vw,3.25rem); line-height: 1.15; color: var(--text-on-ink);
  padding: .45rem 0; display: flex; align-items: baseline; gap: 1rem;
  min-width: 0; word-break: break-word;
  opacity: 0; transform: translateX(2rem);
  transition: opacity .5s var(--ease-out-expo), transform .5s var(--ease-out-expo), color .3s; }
.wm-menu a small{ font-family: var(--font-mono); font-size: var(--label);
  letter-spacing: .18em; text-transform: uppercase; color: var(--brass-500); flex: 0 0 auto; }
@media (max-width: 860px){
  .wm-drawer{ padding: 1.25rem 1.25rem 3rem; }
  .wm-menu a{ gap: .6rem; font-size: clamp(1.6rem, 8.5vw, 2.25rem); }
}
.wm-menu a:hover{ color: var(--brass-300); }
.wm-drawer.is-open .wm-menu a{ opacity: 1; transform: translateX(0); }
.wm-drawer.is-open .wm-menu a:nth-child(1){ transition-delay: .08s; }
.wm-drawer.is-open .wm-menu a:nth-child(2){ transition-delay: .14s; }
.wm-drawer.is-open .wm-menu a:nth-child(3){ transition-delay: .20s; }
.wm-drawer.is-open .wm-menu a:nth-child(4){ transition-delay: .26s; }
.wm-drawer.is-open .wm-menu a:nth-child(5){ transition-delay: .32s; }
.wm-drawer.is-open .wm-menu a:nth-child(6){ transition-delay: .38s; }
.wm-drawer.is-open .wm-menu a:nth-child(7){ transition-delay: .44s; }
.wm-drawer.is-open .wm-menu a:nth-child(8){ transition-delay: .50s; }
.wm-drawer.is-open .wm-menu a:nth-child(9){ transition-delay: .56s; }
.wm-drawer__cta{ margin-top: 2.5rem; opacity: 0; transform: translateY(1rem);
  transition: opacity .5s var(--ease-out-expo) .4s, transform .5s var(--ease-out-expo) .4s; }
.wm-drawer.is-open .wm-drawer__cta{ opacity: 1; transform: translateY(0); }
.wm-drawer__meta{ position: absolute; bottom: clamp(1.5rem,4vw,3rem);
  left: clamp(1.5rem,5vw,4rem); right: clamp(1.5rem,5vw,4rem);
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  font-size: var(--body-s); color: var(--text-on-ink-muted); }

/* ---------- hero — split composition: calm copy left · framed shapes panel right ---------- */
.wm-hero{ position: relative; min-height: 100svh; display: flex; flex-direction: column;
  justify-content: center; padding: 7.5rem clamp(1rem,4vw,4rem) clamp(3rem,6vw,5rem); }
.wm-hero__inner{ position: relative; z-index: 2; max-width: var(--content-max); margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: clamp(2rem,5vw,5rem);
  align-items: center; }
.wm-hero__copy{ grid-column: 1; }
.wm-hero__panel{ grid-column: 2; position: relative;
  border: 1px solid var(--rule-on-ink); border-radius: 2px;
  aspect-ratio: 4 / 5; max-height: min(68vh, 44rem); width: 100%;
  overflow: hidden; background: linear-gradient(160deg, #241c18, #141010); }
.wm-hero__panel svg{ position: absolute; inset: 0; width: 100%; height: 100%; }
.wm-hero__panel figcaption{ position: absolute; left: 1rem; bottom: .9rem;
  font-size: var(--label); letter-spacing: .18em; text-transform: uppercase;
  color: var(--text-on-ink-muted); display: flex; gap: .5rem; align-items: center; }
.wm-hero__panel figcaption::before{ content: ""; width: .4rem; height: .4rem; background: var(--brass-500); border-radius: 50%; }
.wm-eyebrow{ font-size: var(--eyebrow); letter-spacing: .14em; text-transform: uppercase;
  color: var(--brass-500); display: flex; align-items: center; gap: .75rem; }
.wm-eyebrow::before{ content: ""; width: 2.5rem; height: 1px; background: var(--brass-500); }
.wm-hero h1{ font-family: var(--font-display); font-weight: 400;
  font-size: var(--display-xl); line-height: 1.02; letter-spacing: -.02em;
  margin: 1.25rem 0 1.5rem; max-width: 12ch; padding-top: .08em; padding-bottom: .12em; }
.wm-hero h1 em{ font-style: italic; color: var(--brass-300); }
.wm-hero__sub{ max-width: 46ch; color: var(--text-on-ink-muted); font-size: var(--body-l); }
.wm-hero__row{ display: flex; align-items: flex-end; justify-content: flex-start;
  gap: 2.5rem; flex-wrap: wrap; margin-top: 3rem; }
.wm-scrollcue{ display: flex; align-items: center; gap: .75rem; font-size: var(--label);
  letter-spacing: .18em; text-transform: uppercase; color: var(--text-on-ink-muted); }
.wm-scrollcue i{ position: relative; width: 1px; height: 2.5rem; background: var(--rule-on-ink); overflow: hidden; }
.wm-scrollcue i::after{ content: ""; position: absolute; left: 0; top: -100%; width: 100%; height: 100%;
  background: var(--brass-500); animation: wm-cue 2.2s var(--ease-out-expo) infinite; }
@keyframes wm-cue{ 0%{ top: -100%; } 55%{ top: 100%; } 100%{ top: 100%; } }
@media (max-width: 860px){
  .wm-hero{ justify-content: flex-start; padding-top: 6.5rem; }
  .wm-hero__inner{ display: block; }
  .wm-hero__copy{ margin-bottom: 2.5rem; }
  .wm-hero__panel{ max-height: 46vh; aspect-ratio: 1 / 1; width: 100%; }
  .wm-hero h1{ font-size: clamp(3rem, 13vw, 5rem); }
  .wm-hero__sub{ font-size: var(--body-m); }
}
.wm-btn-outline{ border: 1px solid var(--rule-on-ink); border-radius: 999px;
  padding: .8rem 1.75rem; font-size: var(--body-s); letter-spacing: .08em;
  display: inline-flex; align-items: center; gap: .6rem; color: var(--text-on-ink);
  transition: background .3s, color .3s, border-color .3s; }
.wm-btn-outline:hover{ background: var(--text-on-ink); color: var(--ink-900); border-color: var(--text-on-ink); }

/* ---------- marquee (drag-enabled, Watermelon pattern) ---------- */
.wm-marquee{ position: relative; padding: clamp(3rem,8vw,6rem) 0; overflow: hidden;
  background: var(--bone-100); color: var(--text-on-bone); }
.wm-marquee__mask{ position: absolute; left: 0; right: 0; height: 5rem; z-index: 3; pointer-events: none; }
.wm-marquee__mask svg{ width: 100%; height: 100%; display: block; }
.wm-marquee__head{ max-width: var(--content-max); margin: 0 auto clamp(2rem,4vw,3.5rem);
  padding: 0 clamp(1rem,4vw,4rem); display: flex; align-items: flex-end;
  justify-content: space-between; gap: 2rem; flex-wrap: wrap; }
.wm-marquee__head h2{ font-family: var(--font-display); font-weight: 400;
  font-size: var(--display-l); line-height: 1.12; letter-spacing: -.015em; margin-top: 1rem;
  padding-top: .06em; padding-bottom: .08em; }
.wm-marquee__head p{ max-width: 38ch; color: var(--text-on-bone-muted); }
.wm-marquee__track{ display: flex; width: max-content; gap: clamp(.75rem,2vw,1.25rem);
  padding: 1rem clamp(1rem,4vw,4rem); cursor: grab; user-select: none; touch-action: pan-y; will-change: transform; }
.wm-marquee__track.is-dragging{ cursor: grabbing; }
.wm-slide{ position: relative; flex: 0 0 auto; width: 15rem; height: 20rem;
  border-radius: 1rem; overflow: hidden; background: var(--bone-200); border: 1px solid var(--rule-on-bone); }
@media (min-width: 640px){ .wm-slide{ width: 20rem; height: 26rem; } }
.wm-slide img{ width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform .6s var(--ease-out-expo); pointer-events: none; }
.wm-slide:hover img{ transform: scale(1.04); }
.wm-slide figcaption{ position: absolute; left: 1rem; bottom: 1rem; z-index: 2;
  font-size: var(--label); letter-spacing: .14em; text-transform: uppercase;
  color: var(--text-on-ink); background: rgba(20,16,16,.55); backdrop-filter: blur(4px);
  padding: .35rem .8rem; border-radius: 999px; border: 1px solid var(--rule-on-ink); }
.wm-marquee__hint{ max-width: var(--content-max); margin: 1.5rem auto 0;
  padding: 0 clamp(1rem,4vw,4rem); font-size: var(--body-s); color: var(--text-on-bone-muted);
  display: flex; align-items: center; gap: .6rem; }

/* ---------- section shell ---------- */
.wm-section{ padding: clamp(4.5rem,10vw,10rem) clamp(1rem,4vw,4rem); }
.wm-section--bone{ background: var(--bone-100); color: var(--text-on-bone); }
.wm-section--ink{ background: var(--ink-900); color: var(--text-on-ink); }
.wm-wrap{ max-width: var(--content-max); margin: 0 auto; }
.wm-sec-head{ margin-bottom: clamp(2.5rem,5vw,4.5rem); display: flex; align-items: flex-end;
  justify-content: space-between; gap: 2rem; flex-wrap: wrap; }
.wm-sec-head h2{ font-family: var(--font-display); font-weight: 400;
  font-size: var(--display-l); line-height: 1.12; letter-spacing: -.015em; margin-top: 1rem;
  padding-top: .06em; padding-bottom: .08em; }
.wm-sec-head p{ max-width: 44ch; opacity: .72; }
.wm-sec-more{ font-size: var(--body-s); letter-spacing: .06em; display: inline-flex; gap: .5rem;
  align-items: center; border-bottom: 1px solid currentColor; padding-bottom: .2rem; transition: opacity .3s; }
.wm-sec-more:hover{ opacity: .65; }

/* ---------- about (editorial 2-col) ---------- */
.wm-about{ display: grid; grid-template-columns: 1fr; gap: clamp(2rem,5vw,5rem); }
@media (min-width: 900px){ .wm-about{ grid-template-columns: 5fr 6fr; gap: clamp(3rem,6vw,7rem); } }
.wm-about__lede{ font-family: var(--font-display); font-size: var(--display-m); line-height: 1.25; letter-spacing: -.01em; }
.wm-about__body{ max-width: 62ch; }
.wm-vision{ border-top: 1px solid var(--rule-on-bone); padding-top: 1.5rem; margin-top: 2rem; }
.wm-section--ink .wm-vision{ border-top-color: var(--rule-on-ink); }
.wm-vision h3{ font-size: var(--label); letter-spacing: .18em; text-transform: uppercase;
  color: var(--brass-700); margin-bottom: .75rem; }
.wm-section--ink .wm-vision h3{ color: var(--brass-500); }
.wm-vision p{ max-width: 62ch; }
.wm-missions{ margin-top: 2.5rem; display: grid; gap: 0; border-top: 1px solid var(--rule-on-bone); }
.wm-section--ink .wm-missions{ border-top-color: var(--rule-on-ink); }
.wm-mission{ display: grid; grid-template-columns: 3.5rem 1fr; gap: 1.25rem;
  padding: 1.5rem 0; border-bottom: 1px solid var(--rule-on-bone); }
.wm-section--ink .wm-mission{ border-bottom-color: var(--rule-on-ink); }
.wm-mission b{ font-family: var(--font-display); font-weight: 400; font-size: var(--display-m);
  color: var(--brass-700); font-variant-numeric: tabular-nums; }
.wm-section--ink .wm-mission b{ color: var(--brass-500); }
.wm-mission h3{ font-family: var(--font-display); font-weight: 400; font-size: var(--title-s); margin-bottom: .4rem; }
.wm-mission p{ opacity: .75; max-width: 60ch; }

/* ---------- expertise: numbered 4-col grid (feature-1 pattern) ---------- */
.wm-expertise{ display: grid; grid-template-columns: repeat(auto-fit,minmax(15rem,1fr));
  gap: 1px; background: var(--rule-on-bone); border: 1px solid var(--rule-on-bone); }
.wm-section--ink .wm-expertise{ background: var(--rule-on-ink); border-color: var(--rule-on-ink); }
.wm-expertise__cell{ background: inherit; padding: clamp(1.5rem,3vw,2.5rem); transition: background .35s; }
.wm-section--bone .wm-expertise__cell:hover{ background: var(--bone-200); }
.wm-section--ink .wm-expertise__cell:hover{ background: var(--ink-800); }
.wm-expertise__num{ font-size: var(--label); letter-spacing: .18em; color: var(--brass-700); }
.wm-section--ink .wm-expertise__num{ color: var(--brass-500); }
.wm-expertise__cell h3{ font-family: var(--font-display); font-weight: 400;
  font-size: var(--title-s); line-height: 1.3; margin: .9rem 0 .8rem; }
.wm-expertise__cell p{ opacity: .75; font-size: var(--body-s); }

/* ---------- services: 2×2 bento (bento-01 pattern) ---------- */
.wm-bento{ display: grid; grid-template-columns: repeat(2,1fr); gap: clamp(.75rem,2vw,1.25rem); }
@media (max-width: 700px){ .wm-bento{ grid-template-columns: 1fr; } }
.wm-bento__card{ border: 1px solid var(--rule-on-bone); padding: clamp(1.5rem,3vw,2.75rem);
  display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden;
  transition: border-color .3s, background .3s; }
.wm-section--ink .wm-bento__card{ border-color: var(--rule-on-ink); }
.wm-bento__card:hover{ border-color: var(--brass-700); }
.wm-section--ink .wm-bento__card:hover{ border-color: var(--brass-500); background: var(--ink-800); }
.wm-bento__num{ font-size: var(--label); letter-spacing: .18em; text-transform: uppercase; color: var(--brass-700); }
.wm-section--ink .wm-bento__num{ color: var(--brass-500); }
.wm-bento__card h3{ font-family: var(--font-display); font-weight: 400;
  font-size: clamp(1.5rem,2.5vw,2rem); line-height: 1.18;
  padding-top: .05em; padding-bottom: .07em; }
.wm-bento__card p{ opacity: .75; max-width: 52ch; }
.wm-bento__list{ margin-top: auto; display: flex; flex-wrap: wrap; gap: .5rem; padding-top: 1rem; }
.wm-chip{ font-size: var(--body-s); border: 1px solid var(--rule-on-bone); border-radius: 999px;
  padding: .3rem .9rem; opacity: .85; }
.wm-section--ink .wm-chip{ border-color: var(--rule-on-ink); }

/* ---------- clients rail (marquee, duplicated track for loop) ---------- */
.wm-clients{ overflow: hidden; border-top: 1px solid var(--rule-on-bone);
  border-bottom: 1px solid var(--rule-on-bone); padding: 2.25rem 0;
  -webkit-mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent); }
.wm-clients__track{ display: flex; width: max-content; gap: clamp(2rem,6vw,5rem);
  padding: 0 clamp(1rem,4vw,4rem); animation: wm-rail 36s linear infinite; }
.wm-clients:hover .wm-clients__track{ animation-play-state: paused; }
@keyframes wm-rail{ to{ transform: translateX(-50%); } }
.wm-client{ display: flex; align-items: center; gap: .9rem; white-space: nowrap; opacity: .8; }
.wm-client .wm-client__mark{ font-family: var(--font-display); font-size: 1.75rem; line-height: 1.15; color: var(--brass-700);
  padding-top: .04em; padding-bottom: .06em; }
.wm-client__name{ font-size: var(--body-m); letter-spacing: .04em; }
.wm-client__type{ font-size: var(--body-s); opacity: .6; }

/* ---------- news ---------- */
.wm-news{ display: grid; grid-template-columns: repeat(auto-fit,minmax(17rem,1fr));
  gap: 1px; background: var(--rule-on-ink); border: 1px solid var(--rule-on-ink); }
.wm-news__card{ background: inherit; padding: clamp(1.5rem,3vw,2.25rem);
  display: flex; flex-direction: column; gap: .9rem; transition: background .35s; }
.wm-news__card:hover{ background: var(--ink-800); }
.wm-news__cat{ font-size: var(--label); letter-spacing: .18em; text-transform: uppercase; color: var(--brass-500); }
.wm-news__card h3{ font-family: var(--font-display); font-weight: 400; font-size: var(--title-s); line-height: 1.3; }
.wm-news__card p{ font-size: var(--body-s); opacity: .75; }
.wm-news__meta{ margin-top: auto; display: flex; justify-content: space-between;
  font-size: var(--body-s); opacity: .6; font-variant-numeric: tabular-nums; }

/* ---------- studio pitch ---------- */
.wm-studio{ display: grid; grid-template-columns: 1fr; gap: clamp(2rem,5vw,5rem); align-items: center; }
@media (min-width: 900px){ .wm-studio{ grid-template-columns: 6fr 5fr; } }
.wm-studio__viz{ border: 1px solid var(--rule-on-bone); padding: clamp(1rem,3vw,2rem); background: var(--bone-200); }
.wm-studio__viz svg{ width: 100%; height: auto; display: block; }
.wm-studio h2{ font-family: var(--font-display); font-weight: 400;
  font-size: var(--display-l); line-height: 1.12; letter-spacing: -.015em; margin: 1rem 0 1.25rem;
  padding-top: .06em; padding-bottom: .08em; }
.wm-studio p{ max-width: 56ch; opacity: .85; }
.wm-studio__specs{ display: grid; grid-template-columns: repeat(3,1fr); gap: 1px;
  background: var(--rule-on-bone); border: 1px solid var(--rule-on-bone); margin-top: 2rem; }
.wm-studio__specs div{ background: var(--bone-100); padding: 1.25rem; }
.wm-studio__specs b{ display: block; font-family: var(--font-display); font-weight: 400;
  font-size: var(--display-m); color: var(--brass-700); font-variant-numeric: tabular-nums; }
.wm-studio__specs span{ font-size: var(--label); letter-spacing: .14em; text-transform: uppercase; color: var(--text-on-bone-muted); }

/* ---------- contact + footer (footer-1 pattern) ---------- */
.wm-contact{ border-top: 1px solid var(--rule-on-ink); }
.wm-contact__grid{ display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 900px){ .wm-contact__grid{ grid-template-columns: 7fr 5fr; gap: 4rem; } }
.wm-contact h2{ font-family: var(--font-display); font-weight: 400;
  font-size: var(--display-l); line-height: 1.14; letter-spacing: -.015em;
  padding-top: .06em; padding-bottom: .08em; }
.wm-contact h2 em{ font-style: italic; color: var(--brass-300); }
.wm-contact__actions{ display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2rem; }
.wm-btn-solid{ background: var(--text-on-ink); color: var(--ink-900); border-radius: 999px;
  padding: .9rem 1.9rem; font-size: var(--body-m); letter-spacing: .04em;
  display: inline-flex; align-items: center; gap: .6rem; transition: background .3s, color .3s; }
.wm-btn-solid:hover{ background: var(--brass-300); color: var(--ink-900); }
.wm-contact__info{ display: grid; gap: 1.5rem; align-content: start; }
.wm-contact__info h3{ font-size: var(--label); letter-spacing: .18em; text-transform: uppercase; color: var(--brass-500); }
.wm-contact__info p{ opacity: .8; max-width: 40ch; }
.wm-contact__info a{ display: block; padding: .35rem 0; border-bottom: 1px solid var(--rule-on-ink); transition: color .3s, border-color .3s; }
.wm-contact__info a:hover{ color: var(--brass-300); border-color: var(--brass-500); }
.wm-foot{ border-top: 1px solid var(--rule-on-ink); padding: 1.5rem clamp(1rem,4vw,4rem);
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  font-size: var(--body-s); color: var(--text-on-ink-muted); }
.wm-foot nav{ display: flex; gap: 1.5rem; flex-wrap: wrap; }
.wm-foot a:hover{ color: var(--text-on-ink); }

/* ---------- zoom lightbox for marquee cards ---------- */
.wm-lightbox{ position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center;
  background: rgba(10,8,7,.8); backdrop-filter: blur(8px);
  opacity: 0; pointer-events: none; transition: opacity .35s var(--ease-out-expo); }
.wm-lightbox.is-open{ opacity: 1; pointer-events: auto; }
.wm-lightbox figure{ width: min(24rem,86vw); margin: 0; }
.wm-lightbox img{ width: 100%; height: auto; border-radius: 1rem; border: 1px solid var(--rule-on-ink); }
.wm-lightbox figcaption{ text-align: center; margin-top: 1rem; font-size: var(--body-s);
  letter-spacing: .14em; text-transform: uppercase; color: var(--text-on-ink-muted); }
.wm-lightbox__close{ position: absolute; top: 1.25rem; right: clamp(1rem,3vw,2.5rem);
  width: 2.75rem; height: 2.75rem; border-radius: 999px; border: 1px solid var(--rule-on-ink);
  color: var(--text-on-ink); font-size: 1.25rem; display: flex; align-items: center; justify-content: center;
  transition: background .3s; }
.wm-lightbox__close:hover{ background: rgba(242,237,228,.1); }

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce){
  .wm-clients__track{ animation: none; }
  .wm-scrollcue i::after{ animation: none; }
}
`;

/* ---------- HTML ---------- */
const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<meta name="description" content="${esc(site.description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="assets/css/style.css?v=9">
<link rel="stylesheet" href="assets/css/home.css?v=1">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23141010'/%3E%3Cpath d='M6 26V6h20v4H12v6h14v4H12v6z' fill='%23c08a3e'/%3E%3C/svg%3E">
</head>
<body>

<!-- ══════════ FIXED NAVBAR (Watermelon pattern) ══════════ -->
<header class="wm-nav" id="wmNav">
  <a class="wm-nav__brand" href="#top" aria-label="Trilux Design — home">
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><path d="M6 26V6h20v4H12v6h14v4H12v6z" fill="var(--brass-500)"/></svg>
    Trilux<em>&nbsp;Design</em>
  </a>
  <div class="wm-nav__center">
    <button class="wm-burger" id="wmBurger" aria-label="Open menu" aria-expanded="false" aria-controls="wmDrawer">
      <span></span><span></span>
    </button>
  </div>
  <a class="wm-nav__cta" href="#contact">Book a meeting</a>
</header>

<!-- ══════════ FULL-SCREEN MENU (drawer physics) ══════════ -->
<div class="wm-overlay" id="wmOverlay"></div>
<nav class="wm-drawer" id="wmDrawer" aria-label="Primary" aria-hidden="true">
  <button class="wm-drawer__close" id="wmClose" aria-label="Close menu"><i></i></button>
  <div class="wm-menu">
${navLinks}
  </div>
  <div class="wm-drawer__cta">
    <a class="wm-btn-outline" href="${attr(site.wa)}" target="_blank" rel="noopener">Whatsapp →</a>
  </div>
  <div class="wm-drawer__meta">
    <span>${esc(site.location)}</span>
    <span>${esc(site.email)}</span>
  </div>
</nav>

<main id="top">

  <!-- ══════════ HERO — split composition: calm copy left · framed shapes panel right ══════════ -->
  <section class="wm-hero" id="hero" aria-label="Trilux Design — hero">
    <div class="wm-hero__inner">
      <div class="wm-hero__copy">
        <p class="wm-eyebrow reveal">— Portfolio + Interior Design &amp; Architecture</p>
        <h1 class="reveal">Trilux<br><em>Design</em></h1>
        <p class="wm-hero__sub reveal"><strong style="font-weight:500;color:var(--text-on-ink)">${esc(about.title)}.</strong><br>${esc(about.intro)}</p>
        <div class="wm-hero__row reveal">
          <div class="wm-scrollcue"><i aria-hidden="true"></i><span>Scroll to explore</span></div>
          <a class="wm-btn-outline" href="/project">View Project →</a>
        </div>
      </div>
      <figure class="wm-hero__panel reveal">
        <div id="wmStage" aria-hidden="true"></div>
        <figcaption>Atelier massing study — 1:200</figcaption>
      </figure>
    </div>
  </section>

  <!-- ══════════ MARQUEE — drag-enabled gallery strip ══════════ -->
  <section class="wm-marquee" id="gallery" aria-label="Galeri tampak 3D proyek">
    <div class="wm-marquee__mask wm-marquee__mask--top" aria-hidden="true">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 0H1440V50C1440 50 1200 100 720 100C240 100 0 50 0 50V0Z" fill="var(--bone-100)"/></svg>
    </div>
    <div class="wm-marquee__mask wm-marquee__mask--bottom" aria-hidden="true">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 0H1440V50C1440 50 1200 100 720 100C240 100 0 50 0 50V0Z" fill="var(--bone-100)"/></svg>
    </div>
    <div class="wm-marquee__head reveal">
      <div>
        <p class="wm-eyebrow" style="color:var(--brass-700)">— Gallery</p>
        <h2>Tampak 3D Pilihan</h2>
      </div>
      <p>${esc(content.gallery.note)}</p>
    </div>
    <div class="wm-marquee__track" id="wmTrack">
${track}
    </div>
    <p class="wm-marquee__hint reveal">↔ Drag / geser untuk menjelajah · klik kartu untuk zoom · dummy per brief</p>
  </section>

  <!-- ══════════ ABOUT ══════════ -->
  <section class="wm-section wm-section--ink" id="about">
    <div class="wm-wrap">
      <header class="wm-sec-head reveal">
        <div>
          <p class="wm-eyebrow">— ${esc(about.eyebrow)}</p>
          <h2>${esc(about.title)}</h2>
        </div>
        <a class="wm-sec-more" href="/about">Profil lengkap →</a>
      </header>
      <div class="wm-about">
        <div class="reveal">
          <p class="wm-about__lede">${esc(about.title)}</p>
        </div>
        <div class="wm-about__body reveal">
          <p>${esc(about.intro)}</p>
          <div class="wm-vision">
            <h3>${esc(about.vision.label)}</h3>
            <p>${esc(about.vision.text)}</p>
          </div>
          <div class="wm-missions">
${missions}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ EXPERTISE (feature-1 pattern) ══════════ -->
  <section class="wm-section wm-section--bone" id="expertise">
    <div class="wm-wrap">
      <header class="wm-sec-head reveal">
        <div>
          <p class="wm-eyebrow" style="color:var(--brass-700)">— Expertise</p>
          <h2>Empat Disiplin, Satu Tanggung Jawab</h2>
        </div>
        <a class="wm-sec-more" href="/services">Layanan →</a>
      </header>
      <div class="wm-expertise reveal">
${expCells}
      </div>
    </div>
  </section>

  <!-- ══════════ SERVICES (bento-01 pattern) ══════════ -->
  <section class="wm-section wm-section--ink" id="services">
    <div class="wm-wrap">
      <header class="wm-sec-head reveal">
        <div>
          <p class="wm-eyebrow">— Services</p>
          <h2>Layanan Modern &amp; Minimal</h2>
        </div>
        <a class="wm-sec-more" href="/services">Semua layanan →</a>
      </header>
      <div class="wm-bento">
${svcCards}
      </div>
    </div>
  </section>

  <!-- ══════════ CLIENTS rail (dummy) ══════════ -->
  <section class="wm-section wm-section--bone" id="clients" style="padding-bottom:0">
    <div class="wm-wrap">
      <header class="wm-sec-head reveal">
        <div>
          <p class="wm-eyebrow" style="color:var(--brass-700)">— Clients</p>
          <h2>Dipercaya Oleh</h2>
        </div>
        <a class="wm-sec-more" href="/clients">Semua klien →</a>
      </header>
    </div>
    <div class="wm-clients reveal" aria-label="Client logo carousel">
      <div class="wm-clients__track">
${clientsTrack}
      </div>
    </div>
    <div class="wm-wrap">
      <p class="reveal" style="font-size:var(--body-s);opacity:.6;margin-top:1.5rem">${esc(content.clients.note)}</p>
    </div>
  </section>

  <!-- ══════════ NEWS (dummy) ══════════ -->
  <section class="wm-section wm-section--ink" id="news">
    <div class="wm-wrap">
      <header class="wm-sec-head reveal">
        <div>
          <p class="wm-eyebrow">— Article</p>
          <h2>Tulisan Terbaru</h2>
        </div>
        <a class="wm-sec-more" href="/news">Semua artikel →</a>
      </header>
      <div class="wm-news">
${newsCards}
      </div>
    </div>
  </section>

  <!-- ══════════ STUDIO pitch ══════════ -->
  <section class="wm-section wm-section--bone" id="studio">
    <div class="wm-wrap wm-studio">
      <div class="wm-studio__viz reveal" aria-label="Ilustrasi floorplan interaktif (dummy)">
        <svg viewBox="0 0 640 440" xmlns="http://www.w3.org/2000/svg" role="img">
          <rect width="640" height="440" fill="#efe9dc"/>
          <rect x="20" y="20" width="600" height="400" fill="none" stroke="#221c18" stroke-width="1.5"/>
          <g stroke="#221c18" stroke-opacity=".18">
            <line x1="95" y1="20" x2="95" y2="420"/><line x1="170" y1="20" x2="170" y2="420"/>
            <line x1="245" y1="20" x2="245" y2="420"/><line x1="320" y1="20" x2="320" y2="420"/>
            <line x1="395" y1="20" x2="395" y2="420"/><line x1="470" y1="20" x2="470" y2="420"/>
            <line x1="545" y1="20" x2="545" y2="420"/>
            <line x1="20" y1="87" x2="620" y2="87"/><line x1="20" y1="153" x2="620" y2="153"/>
            <line x1="20" y1="220" x2="620" y2="220"/><line x1="20" y1="287" x2="620" y2="287"/>
            <line x1="20" y1="353" x2="620" y2="353"/>
          </g>
          <rect x="95" y="153" width="225" height="134" fill="#c08a3e" fill-opacity=".18" stroke="#8a5f1e" stroke-width="1.5"/>
          <rect x="395" y="87" width="150" height="133" fill="#8a5f1e" fill-opacity=".12" stroke="#8a5f1e" stroke-width="1.5"/>
          <rect x="170" y="287" width="150" height="93" fill="#c08a3e" fill-opacity=".12" stroke="#8a5f1e" stroke-width="1.5"/>
          <line x1="320" y1="153" x2="320" y2="287" stroke="#8a5f1e" stroke-width="3"/>
          <circle cx="320" cy="153" r="6" fill="#c08a3e"/><circle cx="320" cy="287" r="6" fill="#c08a3e"/>
          <g font-family="ui-monospace,monospace" font-size="11" fill="#6b6259">
            <text x="160" y="210">600 cm</text><text x="330" y="210">partisi</text>
            <text x="430" y="150">kabinet</text><text x="230" y="215">sofa</text>
            <text x="220" y="340">meja tv</text>
          </g>
        </svg>
      </div>
      <div class="reveal">
        <p class="wm-eyebrow" style="color:var(--brass-700)">— Studio</p>
        <h2>Uji Ruang Sebelum Dibangun</h2>
        <p>${esc(content.studio.note)}</p>
        <div class="wm-studio__specs">
          <div><b>${esc(content.studio.room.w)} × ${esc(content.studio.room.d)}</b><span>Ruang uji (${esc(content.studio.room.unit)})</span></div>
          <div><b>${content.studio.furniture.length} + ${content.studio.partitions.length}</b><span>Furnitur + partisi</span></div>
          <div><b>40 cm</b><span>Grid dasar</span></div>
        </div>
        <div class="wm-contact__actions">
          <a class="wm-btn-solid" style="background:var(--ink-900);color:var(--text-on-ink)" href="/studio">Buka Studio →</a>
          <a class="wm-btn-outline" style="color:var(--text-on-bone);border-color:var(--rule-on-bone)" href="/simulasi">Simulator →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ CONTACT + FOOTER (footer-1 pattern) ══════════ -->
  <section class="wm-section wm-section--ink wm-contact" id="contact">
    <div class="wm-wrap wm-contact__grid">
      <div class="reveal">
        <p class="wm-eyebrow">— Contact</p>
        <h2>Ceritakan proyek Anda.<br><em>Kita mulai dari survei.</em></h2>
        <div class="wm-contact__actions">
          <a class="wm-btn-solid" href="${attr(site.wa)}" target="_blank" rel="noopener">Whatsapp →</a>
          <a class="wm-btn-outline" href="mailto:${esc(site.email)}">Email Us →</a>
        </div>
      </div>
      <div class="wm-contact__info reveal">
        <div>
          <h3>Studio</h3>
          <p>Trilux Design — Interior · Exterior · Building<br>${esc(site.location)}</p>
        </div>
        <div>
          <h3>Kami balas dalam 1×24 jam</h3>
          <a href="${attr(site.wa)}" target="_blank" rel="noopener">${esc(site.phone)} (WA)</a>
          <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
        </div>
      </div>
    </div>
  </section>
  <footer class="wm-foot wm-section--ink">
    <span>© 2026 Trilux Design · Interior · Exterior · Building</span>
    <nav aria-label="Footer">
      <a href="/about">About</a><a href="/project">Portfolio</a><a href="/news">News</a><a href="#top">Back to top ↑</a>
    </nav>
  </footer>

</main>

<!-- zoom lightbox (shared with marquee cards) -->
<div class="wm-lightbox" id="wmLightbox" role="dialog" aria-modal="true" aria-label="Zoom gambar galeri" aria-hidden="true">
  <button class="wm-lightbox__close" id="wmLbClose" aria-label="Tutup zoom">✕</button>
  <figure>
    <div id="wmLbFrame"></div>
    <figcaption id="wmLbCap"></figcaption>
  </figure>
</div>

<script src="assets/js/home.js?v=1"></script>
<script src="assets/js/main.js?v=3"></script>
<script src="assets/js/track.js?v=1"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html, "utf8");
fs.writeFileSync(path.join(root, "assets/css/home.css"), CSS, "utf8");
console.log("generate-home: index.html", html.length, "chars · home.css", CSS.length, "chars");
