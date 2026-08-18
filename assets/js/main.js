(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Nav — solid background after scroll > 80px
  const nav = document.getElementById("siteNav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 80);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav overlay
  const navToggle = document.getElementById("navToggle");
  const navOverlay = document.getElementById("navOverlay");
  let lastFocused = null;

  function openNav() {
    lastFocused = document.activeElement;
    document.body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    navOverlay.querySelector("a").focus();
  }
  function closeNav() {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    if (lastFocused) lastFocused.focus();
  }
  navToggle.addEventListener("click", () => {
    document.body.classList.contains("nav-open") ? closeNav() : openNav();
  });
  navOverlay.addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeNav();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeNav();
  });

  // Focus trap inside the mobile overlay
  navOverlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusable = navOverlay.querySelectorAll("a, button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Selected Work — thumbnail crossfade into main image
  const mainImage = document.getElementById("workMainImage");
  const thumbButtons = document.querySelectorAll(".thumb-grid button[data-full]");
  thumbButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextSrc = btn.dataset.full;
      if (!mainImage || mainImage.src.endsWith(nextSrc)) return;
      thumbButtons.forEach((b) => b.removeAttribute("aria-current"));
      btn.setAttribute("aria-current", "true");
      const swap = () => {
        mainImage.src = nextSrc;
        mainImage.alt = btn.getAttribute("aria-label").replace("Tampilkan foto ", "");
      };
      if (reducedMotion.matches) {
        swap();
      } else {
        mainImage.style.transition = `opacity var(--dur-base) var(--ease-out)`;
        mainImage.style.transition = "opacity 240ms";
        mainImage.style.opacity = "0";
        setTimeout(() => {
          swap();
          mainImage.style.opacity = "1";
        }, 240);
      }
    });
  });

  // Scroll reveal — IntersectionObserver, fires once
  const revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Back to top
  document.getElementById("backToTop").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
})();
