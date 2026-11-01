/* Landing content hydration — renders brief-v0 sections from data/content.json.
   Build-time seed already in HTML (build.js); this fetch overrides at runtime
   so admin content edits go live without redeploy (same pattern as featured project). */
import { renderNavItems, renderAbout, renderExpertise, renderServices, renderClients, renderNews } from "/scripts/render-content.mjs";

(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setHTML(el, html) { if (el && html) el.innerHTML = html; }

  /* mobile nav drawer — event delegation survives re-render */
  const toggle = document.getElementById("navToggle");
  const overlay = document.getElementById("navOverlay");
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    overlay && overlay.classList.toggle("is-open", open);
    toggle && toggle.setAttribute("aria-expanded", String(open));
    overlay && overlay.setAttribute("aria-hidden", String(!open));
  };
  toggle && toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  overlay && overlay.addEventListener("click", (e) => {
    if (e.target.tagName === "A" || e.target === overlay) setNav(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setNav(false);
  });

  /* reveal observer (shared with main.js pattern — local instance for injected nodes) */
  let revealIO = null;
  if (!reducedMotion && "IntersectionObserver" in window) {
    revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); revealIO.unobserve(en.target); }
        });
      },
      { threshold: 0.15 }
    );
  }
  const observeReveals = () => {
    if (!reducedMotion && revealIO) {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        if (!el.__observed) { el.__observed = true; revealIO.observe(el); }
      });
    } else {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    }
  };

  function renderAll(c) {
    if (!c) return;
    // desktop nav + mobile drawer (both hydrated from one source)
    const desk = document.querySelector(".cinema-nav");
    const mob = document.querySelector(".nav-overlay__list");
    setHTML(desk, renderNavItems(c));
    setHTML(mob, renderNavItems(c));
    setHTML(document.getElementById("aboutBlock"), renderAbout(c));
    setHTML(document.getElementById("expertiseGrid"), renderExpertise(c));
    setHTML(document.getElementById("servicesGrid"), renderServices(c));
    setHTML(document.getElementById("clientRail"), renderClients(c));
    setHTML(document.getElementById("newsGrid"), renderNews(c));
    const note = document.getElementById("clientNote");
    if (note && c.clients?.note) note.textContent = c.clients.note;
    observeReveals();
  }

  /* fetch latest content; static seed already rendered on failure */
  fetch("/api/content")
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(renderAll)
    .catch(() => { /* build-time seed stays */ });
})();
