/* /project/ — dedicated portfolio page. Reads ?s=<slug>, fetches CMS JSON
   (Blob-backed via /api/admin?cms=1), renders single project or the index. */
(() => {
  "use strict";
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const root = document.getElementById("projRoot");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WA = (text) => "https://wa.me/6282287348422?text=" + encodeURIComponent(text);
  /* CMS stores paths relative to the site root ("assets/img/x.jpg") — this
     page lives one level deeper, so rebase them */
  const asset = (p) => !p ? p : (p.startsWith("assets/") ? "../" + p : p);

  function indexView(projects, featuredSlug) {
    if (!projects.length) {
      root.innerHTML = `<p class="proj-err">Belum ada proyek yang dipublikasikan. Cek halaman utama untuk featured project terbaru.</p>`;
      return;
    }
    root.innerHTML = `
      <section class="proj-hero">
        <p class="eyebrow">Portfolio</p>
        <h1>Proyek Kami</h1>
        <p style="max-width:60ch;color:var(--text-on-bone-muted)">Setiap proyek adalah kolaborasi — dari konsep, RAB, hingga serah terima kunci.</p>
      </section>
      <div class="idx-grid" style="padding-bottom:var(--sp-8)">
        ${projects.map((p) => `
          <a class="idx-card" href="?s=${esc(p.slug)}">
            ${p.slug === featuredSlug ? `<span class="badge" style="margin:12px 0 0 12px">Featured</span>` : ""}
            <img src="${esc(asset(p.cover))}" alt="${esc(p.coverAlt || p.name)}" loading="lazy" decoding="async">
            <div class="idx-body">
              <h2>${esc(p.name)}</h2>
              <p>${esc(p.location)} · ${esc(p.year)}</p>
            </div>
          </a>`).join("")}
      </div>`;
  }


  function detailView(p) {
    const gallery = Array.isArray(p.gallery) ? p.gallery : [];
    const highlights = Array.isArray(p.highlights) ? p.highlights : [];
    document.title = p.name + " — Trilux Design";
    root.innerHTML = `
      <section class="proj-hero">
        <p class="eyebrow">Portfolio</p>
        <h1>${esc(p.name)}</h1>
        <div class="proj-meta">
          <span>${esc(p.location)}</span><span>${esc(p.year)}</span>
          <span>${esc(p.type || "")}</span><span>${esc(p.client || "")}</span>
        </div>
      </section>
      <img class="proj-cover" id="projCover" src="${esc(asset(p.cover))}" alt="${esc(p.coverAlt || p.name)}">
      <div class="proj-body">
        <div>
          <p class="proj-desc">${esc(p.description)}</p>
          ${gallery.length ? `
            <div class="gal-grid" id="galGrid">
              ${gallery.map((g, i) => `
                <button type="button" data-full="${esc(asset(g.thumb))}" aria-label="Tampilkan ${esc(g.label)}" ${i === 0 ? 'aria-current="true"' : ""}>
                  <img src="${esc(asset(g.thumb))}" alt="" loading="lazy" decoding="async">
                </button>`).join("")}
            </div>` : ""}
        </div>
        <aside>
          ${highlights.length ? `
            <div class="proj-highlights">
              <h2>Sorotan Proyek</h2>
              <ul style="list-style:none;margin:0;padding:0">
                ${highlights.map((h) => `<li>${esc(h)}</li>`).join("")}
              </ul>
            </div>` : ""}
          <div class="proj-ctas">
            <a class="btn btn-brass" href="../simulasi">Hitung Estimasi Proyek Serupa →</a>
            <a class="btn btn-on-ink" style="color:var(--ink-900);border-color:var(--ink-700)" href="${WA("Halo Trilux Design, saya tertarik dengan proyek " + p.name + ".")}" target="_blank" rel="noopener">Tanya Proyek Ini via WhatsApp →</a>
          </div>
        </aside>
      </div>`;

    // gallery thumb -> main cover swap
    const grid = document.getElementById("galGrid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-full]");
        if (!btn) return;
        const cover = document.getElementById("projCover");
        grid.querySelectorAll("button").forEach((b) => b.removeAttribute("aria-current"));
        btn.setAttribute("aria-current", "true");
        const swap = () => { cover.src = btn.dataset.full; };
        if (reducedMotion) swap();
        else {
          cover.style.opacity = "0";
          cover.style.transition = "opacity 240ms";
          setTimeout(() => { swap(); cover.style.opacity = "1"; }, 240);
        }
      });
    }
  }

  async function boot() {
    const slug = new URLSearchParams(location.search).get("s");
    let data;
    try {
      const r = await fetch("/api/admin?cms=1");
      if (!r.ok) throw new Error(r.status);
      data = await r.json();
    } catch (_) {
      root.innerHTML = `<p class="proj-err">Gagal memuat data proyek. Coba muat ulang halaman.</p>`;
      return;
    }
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const featuredSlug = projects[0] && projects[0].slug;
    if (slug) {
      const p = projects.find((x) => x.slug === slug);
      if (p) { detailView(p); return; }
      root.innerHTML = `<p class="proj-err">Proyek tidak ditemukan. <a href="/project" style="color:var(--brass-700)">Lihat semua proyek →</a></p>`;
      return;
    }
    indexView(projects, featuredSlug);
  }

  boot();

  /* chrome: nav toggle + back-to-top (same pattern as simulasi) */
  const navToggle = document.getElementById("navToggle");
  const navOverlay = document.getElementById("navOverlay");
  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navOverlay.addEventListener("click", (e) => { if (e.target.tagName === "A") { document.body.classList.remove("nav-open"); navToggle.setAttribute("aria-expanded", "false"); } });
  document.getElementById("backToTop").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
})();
