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

  // Selected Work — thumbnail crossfade into main image.
  // (event delegation on the grid container; survives CMS hydration rebuilds)
  const thumbGrid = document.getElementById("thumbGrid");
  if (thumbGrid) {
    thumbGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-full]");
      const mainImage = document.getElementById("workMainImage");
      if (!btn || !mainImage) return;
      const nextSrc = btn.dataset.full;
      if (!mainImage.src.endsWith(nextSrc)) {
        thumbGrid.querySelectorAll("button[data-full]").forEach((b) => b.removeAttribute("aria-current"));
        btn.setAttribute("aria-current", "true");
        const swap = () => {
          mainImage.src = nextSrc;
          mainImage.alt = btn.getAttribute("aria-label").replace("Tampilkan foto ", "");
        };
        if (reducedMotion.matches) {
          swap();
        } else {
          mainImage.style.transition = "opacity 240ms";
          mainImage.style.opacity = "0";
          setTimeout(() => {
            swap();
            mainImage.style.opacity = "1";
          }, 240);
        }
      }
    });
  }

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

  // Back to top — the page now starts at the cinema stage (#cinema).
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    });
  }

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
})();
