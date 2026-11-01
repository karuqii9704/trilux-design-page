#!/usr/bin/env node
/* CMS build step — injects data/*.json into index.html between CMS markers.
   Vercel runs this as the build command; admin edits via /api/admin + /api/content
   (Blob-backed), then triggers redeploy.

   Seeds injected:
   - CMS:NAV / CMS:NAV:MOBILE      ← content.json nav
   - CMS:ABOUT                     ← content.json about
   - CMS:EXPERTISE                 ← content.json expertise
   - CMS:SERVICES                  ← content.json services
   - CMS:CLIENTS (+NOTE)           ← content.json clients
   - CMS:NEWS                      ← content.json news
   - CMS:PROJECT                   ← projects.json featured (existing)
*/
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  renderNavItems, renderAbout, renderExpertise,
  renderServices, renderClients, renderNews,
} from "./scripts/render-content.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(root, "index.html");
const contentPath = path.join(root, "data", "content.json");
const projectsPath = path.join(root, "data", "projects.json");

/* Build-time CMS pull: latest admin edit lives in Vercel Blob (if token present). */
if (process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    const { head } = await import("@vercel/blob");
    for (const [remoteKey, localPath] of [
      ["cms/content.json", contentPath],
      ["cms/projects.json", projectsPath],
    ]) {
      try {
        const h = await head(remoteKey);
        const remote = await (await fetch(h.url)).text();
        JSON.parse(remote); // only overwrite with valid JSON
        fs.writeFileSync(localPath, remote);
        console.log("build: pulled " + remoteKey + " from Blob");
      } catch (_) { /* no remote copy yet — local seed stands */ }
    }
  } catch (_) { console.log("build: Blob pull skipped"); }
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = (s) => esc(s).replace(/'/g, "&#39;");

let html = fs.readFileSync(htmlPath, "utf8");

/* ---------- content.json seeds ---------- */
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

/* inject right AFTER the full opening marker comment (prefix match, tolerant of trailing text) */
const seed = (startPrefix, endMarker, block) => {
  const start = html.indexOf(startPrefix);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1) return; // marker absent (home baru: self-contained seed via generate-home.mjs) — skip
  const sEnd = html.indexOf("-->", start);
  if (sEnd === -1 || sEnd > end) throw new Error("Malformed CMS start marker: " + startPrefix);
  const insertAt = sEnd + 3;
  html = html.slice(0, insertAt) + "\n" + block + html.slice(insertAt);
};

/* remove previously injected seeds BETWEEN markers (markers stay intact) */
const clean = (startPrefix, endMarker) => {
  const s = html.indexOf(startPrefix);
  if (s === -1) return; // marker absent — nothing to clean
  const sEnd = html.indexOf("-->", s);
  if (sEnd === -1) return;
  const e = html.indexOf(endMarker, sEnd);
  if (e === -1) return;
  html = html.slice(0, sEnd + 3) + html.slice(e);
};
clean("<!-- CMS:NAV:START", "<!-- /CMS:NAV:END -->");
clean("<!-- CMS:NAV:MOBILE:START", "<!-- /CMS:NAV:MOBILE:END -->");
clean("<!-- CMS:ABOUT:START", "<!-- /CMS:ABOUT:END -->");
clean("<!-- CMS:EXPERTISE:START", "<!-- /CMS:EXPERTISE:END -->");
clean("<!-- CMS:SERVICES:START", "<!-- /CMS:SERVICES:END -->");
clean("<!-- CMS:CLIENTS:START", "<!-- /CMS:CLIENTS:END -->");
clean("<!-- CMS:CLIENTS:NOTE:START", "<!-- /CMS:CLIENTS:NOTE:END -->");
clean("<!-- CMS:NEWS:START", "<!-- /CMS:NEWS:END -->");

/* nav (desktop + mobile drawer share one source) */
const navLinks = renderNavItems(content);
seed("<!-- CMS:NAV:START", "<!-- /CMS:NAV:END -->", navLinks);
seed("<!-- CMS:NAV:MOBILE:START", "<!-- /CMS:NAV:MOBILE:END -->", navLinks);

seed("<!-- CMS:ABOUT:START", "<!-- /CMS:ABOUT:END -->", renderAbout(content));
seed("<!-- CMS:EXPERTISE:START", "<!-- /CMS:EXPERTISE:END -->", renderExpertise(content));
seed("<!-- CMS:SERVICES:START", "<!-- /CMS:SERVICES:END -->", renderServices(content));
seed("<!-- CMS:CLIENTS:START", "<!-- /CMS:CLIENTS:END -->", renderClients(content));
seed("<!-- CMS:CLIENTS:NOTE:START", "<!-- /CMS:CLIENTS:NOTE:END -->", esc(content.clients?.note || ""));
seed("<!-- CMS:NEWS:START", "<!-- /CMS:NEWS:END -->", renderNews(content));

/* ---------- projects.json featured block (existing behavior) ---------- */
const data = JSON.parse(fs.readFileSync(projectsPath, "utf8"));
const p = data.featured;

const gallery = p.gallery.map((g, i) => `          <button type="button"${i === 0 ? ' aria-current="true"' : ''} aria-label="${attr(g.label)}" data-full="${attr(g.thumb)}">
            <img src="${attr(g.thumb)}" alt="" loading="lazy" decoding="async">
          </button>`).join("\n");

const block = `<!-- CMS:PROJECT:START — rendered by build.js from data/projects.json -->
      <p class="eyebrow reveal">Featured Project</p>
      <div class="work__head reveal">
        <div>
          <div class="work__title-row">
            <span class="work__index" id="workIndex">${attr(p.index)}</span>
            <h2 class="work__name" id="workName">${esc(p.name)}</h2>
          </div>
          <p class="work__location"><span id="workLocation">${esc(p.location)}</span> <span class="work__year" id="workYear">— ${esc(p.year)}</span></p>
        </div>
        <div class="pagination" role="group" aria-label="Featured projects">
          <button class="pagination__dot" type="button" aria-current="true" aria-label="Lihat proyek 1"><span>1</span></button>
          <button class="pagination__dot" type="button" disabled aria-label="Proyek 2 — segera hadir"><span>2</span></button>
          <button class="pagination__dot" type="button" disabled aria-label="Proyek 3 — segera hadir"><span>3</span></button>
          <button class="pagination__dot" type="button" disabled aria-label="Proyek 4 — segera hadir"><span>4</span></button>
        </div>
      </div>

      <dl class="meta-row reveal">
        <div>
          <dt>Project Specifics</dt>
          <dd id="workSpecs">${esc(p.specifics)}</dd>
        </div>
        <div>
          <dt>Project Type</dt>
          <dd id="workType">${esc(p.type)}</dd>
        </div>
        <div>
          <dt>Client Description</dt>
          <dd id="workClient">${esc(p.client)}</dd>
        </div>
      </dl>

      <div class="work__media reveal">
        <img id="workMainImage" src="${attr(p.cover)}" alt="${attr(p.coverAlt)}" loading="lazy" decoding="async">
        <span class="cursor-chip" aria-hidden="true">View Project →</span>
      </div>

      <div class="work__bottom reveal">
        <p class="work__desc" id="workDesc">${esc(p.description)}</p>
        <div class="thumb-grid" id="thumbGrid" role="group" aria-label="Project gallery">
${gallery}
        </div>
      </div>
    <!-- /CMS:PROJECT:END -->`;

{
  const start = html.indexOf("<!-- CMS:PROJECT:START");
  const end = html.indexOf("<!-- /CMS:PROJECT:END -->");
  if (start === -1 || end === -1) {
    // home baru (Watermelon-ified, generated by scripts/generate-home.mjs) is
    // self-contained — featured project lives on the /project page + landing
    // marquee. Skip injection; do not fail the build.
    console.log("build: no CMS:PROJECT markers (new home) — featured block skipped");
  } else {
    html = html.slice(0, start) + block + html.slice(end + "<!-- /CMS:PROJECT:END -->".length);
  }
}

fs.writeFileSync(htmlPath, html);
console.log(
  "build: injected seeds OK — nav:" + content.nav.length +
  " expertise:" + content.expertise.length +
  " services:" + content.services.length +
  " news:" + content.news.items.length +
  " featured:" + p.name
);
