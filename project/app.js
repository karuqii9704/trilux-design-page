/* /project/ — dedicated portfolio page. Reads ?s=<slug>, fetches CMS JSON
   (Blob-backed via /api/admin?cms=1), renders single project or the index. */
(() => {
  "use strict";
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const root = document.getElementById("projRoot");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* PRD §18 — kirim event lewat beacon yang sudah ada di assets/js/track.js.
     Kalau track.js gagal dimuat, analitik mati tapi halaman tetap jalan. */
  const track = (type, props) => {
    try { if (window.triluxTrack) window.triluxTrack({ type, props }); } catch (_) {}
  };

  const WA = (text) => "https://wa.me/6282287348422?text=" + encodeURIComponent(text);
  /* CMS stores paths relative to the site root ("assets/img/x.jpg") — this
     page lives one level deeper, so rebase them */
  const asset = (p) => !p ? p : (p.startsWith("assets/") ? "../" + p : p);

  /* AC-2 — dimensi filter diambil dari field CMS (PRD §12.1): category
     (fallback ke `type` selama data lama belum punya category), location, year.
     Satu nilai per dimensi; antar dimensi digabung (AND). */
  const FACETS = [
    { key: "cat", label: "Kategori", value: (p) => String(p.category || p.type || "").trim() },
    { key: "loc", label: "Lokasi", value: (p) => String(p.location || "").trim() },
    { key: "year", label: "Tahun", value: (p) => (p.year == null ? "" : String(p.year).trim()) },
  ];

  /* State filter hidup di URL (?cat=&loc=&year=) supaya bisa dibagikan dan
     tombol back browser bekerja (AC-2). */
  function readState() {
    const q = new URLSearchParams(location.search);
    const s = {};
    FACETS.forEach((f) => { s[f.key] = q.get(f.key) || ""; });
    return s;
  }

  function indexView(projects, featuredSlug) {
    if (!projects.length) {
      root.innerHTML = `<p class="proj-err">Belum ada proyek yang dipublikasikan. Cek halaman utama untuk featured project terbaru.</p>`;
      return;
    }

    const facets = FACETS
      .map((f) => {
        const values = [...new Set(projects.map(f.value).filter(Boolean))];
        values.sort((a, b) => (f.key === "year" ? Number(b) - Number(a) : a.localeCompare(b)));
        return { ...f, values };
      })
      .filter((f) => f.values.length);

    const state = readState();
    const known = (f, v) => Boolean(v) && f.values.includes(v);
    facets.forEach((f) => { if (!known(f, state[f.key])) state[f.key] = ""; });

    root.innerHTML = `
      <section class="proj-hero">
        <p class="eyebrow">Portfolio</p>
        <h1>Proyek Kami</h1>
        <p class="proj-lead">Setiap proyek adalah kolaborasi — dari konsep, RAB, hingga serah terima kunci.</p>
      </section>
      <div class="idx-filters" id="idxFilters">
        ${facets.map((f) => `
          <div class="idx-filter">
            <span class="idx-filter__label" id="facet-${f.key}">${f.label}</span>
            <div class="fchips" role="group" aria-labelledby="facet-${f.key}" data-facet="${f.key}">
              ${f.values.map((v) => `<button class="fchip" type="button" data-value="${esc(v)}" aria-pressed="${state[f.key] === v ? "true" : "false"}">${esc(v)}</button>`).join("")}
            </div>
          </div>`).join("")}
        <button class="btn btn--tonal idx-reset" type="button" id="idxReset" hidden>Reset filter</button>
      </div>
      <p class="idx-count" id="idxCount" role="status"></p>
      <div class="idx-grid" id="idxGrid"></div>`;

    const filtersEl = document.getElementById("idxFilters");
    const gridEl = document.getElementById("idxGrid");
    const countEl = document.getElementById("idxCount");
    const resetEl = document.getElementById("idxReset");

    const card = (p) => `
      <a class="idx-card" href="?s=${encodeURIComponent(p.slug)}&amp;src=grid" data-slug="${esc(p.slug)}">
        ${p.slug === featuredSlug ? `<span class="badge" style="margin:12px 0 0 12px">Featured</span>` : ""}
        <img src="${esc(asset(p.cover))}" alt="${esc(p.coverAlt || p.name)}" loading="lazy" decoding="async">
        <div class="idx-body">
          <h2>${esc(p.name)}</h2>
          <p>${esc(p.location)} · ${esc(p.year)}</p>
        </div>
      </a>`;

    const syncChips = () => {
      filtersEl.querySelectorAll("[data-facet]").forEach((group) => {
        const key = group.dataset.facet;
        group.querySelectorAll(".fchip").forEach((chip) => {
          chip.setAttribute("aria-pressed", String(chip.dataset.value === state[key]));
        });
      });
    };

    const writeUrl = () => {
      const q = new URLSearchParams();
      facets.forEach((f) => { if (state[f.key]) q.set(f.key, state[f.key]); });
      const search = q.toString();
      history.pushState(null, "", location.pathname + (search ? "?" + search : ""));
    };

    const render = () => {
      const list = projects.filter((p) => facets.every((f) => !state[f.key] || f.value(p) === state[f.key]));
      const filtering = facets.some((f) => state[f.key]);
      resetEl.hidden = !filtering;
      countEl.textContent = filtering ? `${list.length} dari ${projects.length} proyek` : `${projects.length} proyek`;
      gridEl.classList.toggle("is-empty", list.length === 0);
      gridEl.innerHTML = list.length
        ? list.map(card).join("")
        : `<div class="idx-empty">
             <p>Tidak ada proyek yang cocok dengan filter ini.</p>
             <button class="btn btn--tonal" type="button" data-reset>Reset filter</button>
           </div>`;
    };

    const reset = () => {
      facets.forEach((f) => { state[f.key] = ""; });
      track("filter_apply", { filter_type: "reset", value: "all" });
      syncChips();
      writeUrl();
      render();
    };

    filtersEl.addEventListener("click", (e) => {
      const chip = e.target.closest(".fchip");
      if (chip) {
        const key = chip.closest("[data-facet]").dataset.facet;
        state[key] = state[key] === chip.dataset.value ? "" : chip.dataset.value;
        track("filter_apply", { filter_type: key, value: state[key] || "all" });
        syncChips();
        writeUrl();
        render();
        return;
      }
      if (e.target.closest("#idxReset")) reset();
    });

    gridEl.addEventListener("click", (e) => { if (e.target.closest("[data-reset]")) reset(); });

    addEventListener("popstate", () => {
      const next = readState();
      facets.forEach((f) => { state[f.key] = known(f, next[f.key]) ? next[f.key] : ""; });
      syncChips();
      render();
    });

    syncChips();
    render();
  }


  function detailView(p, source) {
    track("project_view", { project_slug: p.slug, source: source || "direct" });
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
            <a class="btn btn-brass" href="../#simulator">Hitung Estimasi Proyek Serupa →</a>
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
        track("gallery_thumb_click", { project_slug: p.slug, index: [...grid.querySelectorAll("button")].indexOf(btn) });
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
    const params = new URLSearchParams(location.search);
    const slug = params.get("s");
    const source = params.get("src") || "";
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
      if (p) { detailView(p, source); return; }
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
