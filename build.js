#!/usr/bin/env node
/* CMS build step — injects data/projects.json into index.html between the
   CMS:PROJECT markers. Vercel runs this as the build command; admin edits
   data/projects.json via /api/admin, then triggers redeploy. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(root, "index.html");
const dataPath = path.join(root, "data", "projects.json");

// Build-time CMS pull: latest admin edit lives in Vercel Blob (if token present).
if (process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    const { head } = await import("@vercel/blob");
    const h = await head("cms/projects.json");
    const remote = await (await fetch(h.url)).text();
    JSON.parse(remote); // only overwrite with valid JSON
    fs.writeFileSync(dataPath, remote);
    console.log("build: pulled cms/projects.json from Blob");
  } catch (_) { console.log("build: no Blob CMS copy yet, using local data"); }
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const p = data.featured;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = (s) => esc(s).replace(/'/g, "&#39;");

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
          <p class="work__location"><span id="workLocation">${attr(p.location)}</span> <span class="work__year" id="workYear">— ${attr(p.year)}</span></p>
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
          <dd id="workSpecs">${attr(p.specifics)}</dd>
        </div>
        <div>
          <dt>Project Type</dt>
          <dd id="workType">${attr(p.type)}</dd>
        </div>
        <div>
          <dt>Client Description</dt>
          <dd id="workClient">${attr(p.client)}</dd>
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

let html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf("<!-- CMS:PROJECT:START");
const end = html.indexOf("<!-- /CMS:PROJECT:END -->");
if (start === -1 || end === -1) {
  console.error("CMS markers not found in index.html");
  process.exit(1);
}
html = html.slice(0, start) + block + html.slice(end + "<!-- /CMS:PROJECT:END -->".length);
fs.writeFileSync(htmlPath, html);
console.log("build: injected project data OK (" + p.name + ")");
