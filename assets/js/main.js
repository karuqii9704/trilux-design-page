(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  // M3 scroll progress bar
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onProgress, { passive: true });
  onProgress();

  // Hero parallax + slow zoom (rAF-throttled; none on reduced motion)
  const heroBg = document.querySelector(".hero__bg");
  if (heroBg && !reducedMotion.matches) {
    let ticking = false;
    const parallax = () => {
      const y = Math.min(scrollY, innerHeight);
      heroBg.style.transform = `translateY(${y * 0.25}px) scale(${1 + y * 0.0004})`;
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  }

  // Spotlight lens on the featured-project media (fine pointers only)
  if (fineHover.matches) {
    document.querySelectorAll(".work__media").forEach((media) => {
      if (!media.querySelector(".lens")) {
        const lens = document.createElement("span");
        lens.className = "lens";
        lens.setAttribute("aria-hidden", "true");
        media.appendChild(lens);
      }
      media.addEventListener("pointermove", (e) => {
        const r = media.getBoundingClientRect();
        media.style.setProperty("--lens-x", `${((e.clientX - r.left) / r.width) * 100}%`);
        media.style.setProperty("--lens-y", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });
  }

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

  // M3 ripple — bounded, from pointer origin; skip on reduced motion / coarse pointers
  if (!reducedMotion.matches && matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointerdown", (e) => {
      const target = e.target.closest(".btn, .icon-btn, .pagination__dot, .thumb-grid button, .nav__link");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = `${d}px`;
      span.style.left = `${e.clientX - rect.left - d / 2}px`;
      span.style.top = `${e.clientY - rect.top - d / 2}px`;
      target.appendChild(span);
      setTimeout(() => span.remove(), 520);
    });
  }

  // Scrollspy — highlight the nav link of the section in view
  const spySections = ["welcome", "mission", "simulator", "selected-work", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const spyLinks = [...document.querySelectorAll('.nav__link[href^="#"]')];
  if (spySections.length && spyLinks.length) {
    const spyIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((l) => l.classList.remove("is-scrolled-active"));
          const match = spyLinks.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
          if (match) match.classList.add("is-scrolled-active");
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    spySections.forEach((s) => spyIo.observe(s));
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

  // Design Simulator — live estimate, WA deep-link, /api/lead submit, snackbar
  const segScope = document.getElementById("segScope");
  if (segScope) {
    const RATES = {
      interior: { lo: 3.5, hi: 6, label: "Interior" },
      exterior: { lo: 4.5, hi: 8, label: "Eksterior" },
      architecture: { lo: 6.5, hi: 12, label: "Arsitektur" },
    };
    const PKG_LABEL = { "0.85": "Essential", "1": "Premium", "1.3": "Luxury" };

    const areaRange = document.getElementById("areaRange");
    const areaOut = document.getElementById("areaOut");
    const estOut = document.getElementById("estOut");
    const rateOut = document.getElementById("rateOut");
    const waBtn = document.getElementById("waBtn");
    const quoteBtn = document.getElementById("quoteBtn");
    const quoteForm = document.getElementById("quoteForm");
    const quoteSend = document.getElementById("quoteSend");

    const state = { scope: "interior", area: 120, mult: 1 };

    const estimate = () => {
      const r = RATES[state.scope];
      const lo = state.area * r.lo * state.mult;
      const hi = state.area * r.hi * state.mult;
      const fm = (x) =>
        x >= 1000
          ? `Rp ${(x / 1000).toFixed(x / 1000 >= 10 ? 0 : 1)} miliar`
          : `Rp ${x.toFixed(0)} juta`;
      return { lo, hi, text: `${fm(lo)} – ${fm(hi)}` };
    };
    const render = () => {
      areaOut.textContent = `${state.area} m²`;
      areaRange.style.setProperty(
        "--m3-fill",
        `${((state.area - areaRange.min) / (areaRange.max - areaRange.min)) * 100}%`
      );
      const est = estimate();
      estOut.textContent = est.text;
      const r = RATES[state.scope];
      rateOut.textContent = `${r.label} · Rp ${r.lo * state.mult}–${r.hi * state.mult} juta/m² · ${PKG_LABEL[String(state.mult)]}`;
      const msg = `Halo Trilux Design! Saya tertarik ${r.label} — ${state.area} m², paket ${PKG_LABEL[String(state.mult)]}. Estimasi di web: ${est.text}. Boleh diskusi lanjut?`;
      waBtn.href = `https://wa.me/6282287348422?text=${encodeURIComponent(msg)}`;
    };

    segScope.addEventListener("click", (e) => {
      const b = e.target.closest(".seg__btn");
      if (!b) return;
      segScope.querySelectorAll(".seg__btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.scope = b.dataset.scope;
      render();
    });
    document.getElementById("pkgChips").addEventListener("click", (e) => {
      const b = e.target.closest(".fchip");
      if (!b) return;
      document.querySelectorAll(".fchip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.mult = parseFloat(b.dataset.mult);
      render();
    });
    areaRange.addEventListener("input", () => {
      state.area = parseInt(areaRange.value, 10);
      render();
    });

    // snackbar
    const snack = document.createElement("div");
    snack.className = "snackbar";
    snack.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">check_circle</span><span id="snackMsg"></span>';
    document.body.appendChild(snack);
    let snackTimer = null;
    const showSnack = (msg) => {
      snack.querySelector("#snackMsg").textContent = msg;
      snack.classList.add("is-open");
      clearTimeout(snackTimer);
      snackTimer = setTimeout(() => snack.classList.remove("is-open"), 4200);
    };

    quoteBtn.addEventListener("click", () => {
      quoteForm.hidden = !quoteForm.hidden;
      if (!quoteForm.hidden) document.getElementById("quoteContact").focus();
    });
    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const contact = document.getElementById("quoteContact").value.trim();
      if (!contact) return;
      quoteSend.disabled = true;
      try {
        const r = RATES[state.scope];
        const est = estimate();
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact,
            scope: r.label,
            area: state.area,
            total: est.text,
            config: `Simulator · ${PKG_LABEL[String(state.mult)]} · ${new Date().toISOString()}`,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        quoteForm.hidden = true;
        document.getElementById("quoteContact").value = "";
        showSnack("Terkirim! Tim Trilux akan menghubungi kamu soon. ✓");
      } catch (err) {
        showSnack("Gagal kirim — coba lagi atau chat WhatsApp ya.");
      } finally {
        quoteSend.disabled = false;
      }
    });

    render();
  }
})();

