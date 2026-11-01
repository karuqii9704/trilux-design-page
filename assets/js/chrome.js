/* Shared chrome JS — sub-page mobile drawer (same pattern as landing).
   Works on any page that includes #subNavToggle + #subNavOverlay. */
(() => {
  "use strict";
  const toggle = document.getElementById("subNavToggle");
  const overlay = document.getElementById("subNavOverlay");
  if (!toggle || !overlay) return;
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    overlay.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    overlay.setAttribute("aria-hidden", String(!open));
    if (open) {
      const first = overlay.querySelector("a");
      first && setTimeout(() => first.focus(), 120);
    }
  };
  toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  overlay.addEventListener("click", (e) => {
    if (e.target.tagName === "A" || e.target === overlay) setNav(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setNav(false);
  });
})();
