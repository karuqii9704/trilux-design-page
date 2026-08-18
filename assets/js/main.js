(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Hero entrance stagger — see .js-anim rules in style.css
  // rAF is throttled/paused on background tabs, so pair it with a timeout
  // safety net — classList.add is idempotent, calling it twice is harmless.
  const showHero = () => document.documentElement.classList.add("hero-in");
  requestAnimationFrame(() => requestAnimationFrame(showHero));
  setTimeout(showHero, 500);

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

  // Magnetic buttons — subtle pointer-follow on fine-pointer devices only
  if (fineHover.matches && !reducedMotion.matches) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  // "View Project" chip follows the cursor over the featured project cover
  if (fineHover.matches) {
    document.querySelectorAll(".work__media").forEach((media) => {
      const chip = media.querySelector(".cursor-chip");
      if (!chip) return;
      media.addEventListener("pointermove", (e) => {
        const r = media.getBoundingClientRect();
        chip.style.left = `${e.clientX - r.left}px`;
        chip.style.top = `${e.clientY - r.top}px`;
      });
    });
  }

  // Count-up for tabular figures (e.g. project budget) — once, on scroll into view
  const countEls = document.querySelectorAll(".js-count");
  if (countEls.length) {
    const formatIDR = (n) => "$ " + n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.target);
      if (reducedMotion.matches || Number.isNaN(target)) return;
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatIDR(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) {
      countEls.forEach(animateCount);
    } else {
      const countIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach((el) => countIo.observe(el));
    }
  }
})();
