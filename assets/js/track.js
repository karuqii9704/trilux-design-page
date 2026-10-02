/* Lightweight privacy-friendly analytics — no cookies, no fingerprinting.
   Sends one page-view beacon per load + CTA click events to /api/track. */
(() => {
  "use strict";
  const send = (payload) => {
    try {
      navigator.sendBeacon("/api/track", JSON.stringify(payload));
    } catch (_) { /* tracking must never break the page */ }
  };

  /* API untuk halaman lain: window.triluxTrack({ type, props }) — dipakai
     /project/ untuk filter_apply dan project_view (PRD §18). Nama event di
     luar daftar §18 tetap aman dikirim; server yang memutuskan penyimpanannya. */
  window.triluxTrack = (payload) => {
    if (!payload || typeof payload !== "object") return;
    send({ path: location.pathname, ...payload });
  };

  send({ type: "view", path: location.pathname });

  // CTA click attribution
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    let label = null;
    if (href.startsWith("https://wa.me/")) label = "whatsapp";
    else if (href.startsWith("mailto:")) label = "email";
    else if (href.startsWith("tel:")) label = "phone";
    else if (a.classList.contains("btn") || a.closest(".contact__ctas")) label = "cta:" + (a.textContent.trim().slice(0, 30) || href);
    else if (href.endsWith("#simulator")) label = "nav-simulator";
    else if (href.includes("/studio/")) label = "nav-studio";
    if (label) send({ type: "click", label, path: location.pathname });
  }, { passive: true });
})();
