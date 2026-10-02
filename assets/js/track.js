/* Lightweight privacy-friendly analytics — no cookies, no fingerprinting.
   Mengirim beacon page-view + klik CTA + event terstruktur ke /api/track.
   Nama event mengikuti kosakata PRD §18 (daftar resminya di api/track.js).

   Halaman lain bisa mengirim event lewat window.triluxTrack({ type, props })
   — dipakai /project/ untuk filter_apply, project_view, gallery_thumb_click. */
(() => {
  "use strict";
  const path = location.pathname;
  /* Proyek yang sedang dibuka (halaman /project/?s=slug) — properti
     project_slug untuk whatsapp_click (PRD §18). */
  const projectSlug = path.startsWith("/project") ? (new URLSearchParams(location.search).get("s") || "") : "";

  const send = (payload) => {
    try {
      navigator.sendBeacon("/api/track", JSON.stringify(payload));
    } catch (_) { /* tracking must never break the page */ }
  };

  window.triluxTrack = (payload) => {
    if (!payload || typeof payload !== "object") return;
    send({ path, ...payload });
  };

  send({ type: "view", path });

  /* Label tombol tanpa teks ikon Material (ligatur ikut terbaca textContent) */
  const labelOf = (a) => {
    const clone = a.cloneNode(true);
    clone.querySelectorAll(".material-symbols-rounded, .btn__icon").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
  };

  /* Klik CTA. WhatsApp/Email jadi event §18 (punya props source_page +
     project_slug); sisa CTA masuk stream click yang dibaca tabel "Klik CTA
     Teratas". Satu klik = satu beacon. */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";

    if (href.startsWith("https://wa.me/")) {
      window.triluxTrack({ type: "whatsapp_click", props: { source_page: path, project_slug: projectSlug } });
      return;
    }
    if (href.startsWith("mailto:")) {
      window.triluxTrack({ type: "email_click", props: { source_page: path } });
      return;
    }
    if (a.closest(".hero") && a.classList.contains("btn")) {
      window.triluxTrack({ type: "hero_cta_click", props: { label: labelOf(a) } });
      return;
    }
    if (href.startsWith("tel:") || a.classList.contains("btn") || a.closest(".contact__ctas")) {
      send({ type: "click", path, label: href.startsWith("tel:") ? "phone" : "cta:" + (labelOf(a) || href) });
    }
  }, { passive: true });

  /* scroll_depth — 25/50/75/100, sekali per ambang per pemuatan halaman. */
  const MARKS = [25, 50, 75, 100];
  let deepest = 0;
  let queued = false;
  const checkDepth = () => {
    queued = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    const pct = max <= 0 ? 100 : ((scrollY + innerHeight) / doc.scrollHeight) * 100;
    for (const m of MARKS) {
      if (pct >= m && m > deepest) {
        deepest = m;
        window.triluxTrack({ type: "scroll_depth", props: { depth: m } });
      }
    }
  };
  addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(checkDepth);
  }, { passive: true });
  addEventListener("load", checkDepth);

  /* web_vitals — LCP/CLS/INP dikirim sekali saat halaman ditinggalkan.
     INP di sini pendekatan (durasi interaksi terburuk, bukan persentil
     sebenarnya) — cukup untuk menangkap regresi tanpa menambah dependency. */
  const vitals = { lcp: null, cls: 0, inp: null };
  try {
    if ("PerformanceObserver" in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) vitals.lcp = Math.round(last.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) vitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const d = Math.round(entry.duration || 0);
          if (d > 0 && (vitals.inp === null || d > vitals.inp)) vitals.inp = d;
        }
      }).observe({ type: "event", durationThreshold: 40, buffered: true });
    }
  } catch (_) { /* browser tanpa PerformanceObserver: lanjut tanpa vitals */ }

  let vitalsSent = false;
  const reportVitals = () => {
    if (vitalsSent) return;
    vitalsSent = true;
    window.triluxTrack({
      type: "web_vitals",
      props: { lcp: vitals.lcp, cls: Number(vitals.cls.toFixed(3)), inp: vitals.inp },
    });
  };
  addEventListener("pagehide", reportVitals);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") reportVitals();
  });
})();
