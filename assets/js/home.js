/* Trilux home — interaksi (adaptasi pola RIVR glass template + Watermelon UI ke vanilla):
   - navbar in-panel di hero · pins fixed w/ scrim begitu panel hero scroll keluar
   - full-screen drawer menu (staggered links, morph X, body scroll lock)
   - drag-enabled marquee strip (rAF, velocity inertia, seamless loop)
   - click card → zoom lightbox (ESC/overlay close)
   - shapes-based hero stage full-bleed (cinema rig landscape, pointer parallax) — NO photo/video layers
*/
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);

  /* ══════════ 1. navbar — in-panel at top · pins fixed w/ scrim once hero panel scrolls out (RIVR template) ══════════ */
  const nav = $("#wmNav");
  if (nav) {
    const hero = $("#hero");
    const onScroll = () => {
      const limit = hero ? hero.offsetTop + hero.offsetHeight - nav.offsetHeight : 0;
      nav.classList.toggle("is-scrolled", window.scrollY > limit);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  /* ══════════ 2. full-screen drawer (Watermelon physics) ══════════ */
  const drawer = $("#wmDrawer"), overlay = $("#wmOverlay");
  const burger = $("#wmBurger"), closeBtn = $("#wmClose");
  let menuOpen = false;
  const setMenu = (open) => {
    menuOpen = open;
    drawer && drawer.classList.toggle("is-open", open);
    overlay && overlay.classList.toggle("is-open", open);
    drawer && drawer.setAttribute("aria-hidden", String(!open));
    burger && burger.setAttribute("aria-expanded", String(open));
    // single scroll-lock mechanism shared with lightbox (class on <html>)
    document.documentElement.classList.toggle("wm-menu-open", open);
    if (open) {
      const first = drawer && drawer.querySelector("a");
      first && first.focus({ preventScroll: true });
    } else {
      burger && burger.focus({ preventScroll: true });
    }
  };
  burger && burger.addEventListener("click", () => setMenu(true));
  closeBtn && closeBtn.addEventListener("click", () => setMenu(false));
  overlay && overlay.addEventListener("click", () => setMenu(false));
  drawer && drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOpen) setMenu(false);
  });

  /* ══════════ 3. drag-enabled marquee (rAF + momentum + seamless loop) ══════════ */
  const track = $("#wmTrack");
  if (track) {
    const SPEED = 0.8; // px per frame auto-crawl
    let offset = 0, dragging = false, startX = 0, startOffset = 0;
    let velocity = 0, lastX = 0, lastT = 0, raf = null;

    const halfWidth = () => track.scrollWidth / 2;
    const clampOffset = (o) => {
      const h = halfWidth();
      if (o <= -h) o += h;
      if (o > 0) o -= h;
      return o;
    };
    const apply = () => { track.style.transform = `translate3d(${offset}px,0,0)`; };

    const tick = () => {
      if (!dragging) {
        if (Math.abs(velocity) > 0.1) {
          offset += velocity;
          velocity *= 0.95; // inertial decay
        } else {
          velocity = 0;
          offset -= SPEED; // resume auto-crawl
        }
      }
      offset = clampOffset(offset);
      apply();
      raf = requestAnimationFrame(tick);
    };

    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
      startX = e.clientX; startOffset = offset;
      lastX = e.clientX; lastT = performance.now();
      velocity = 0;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    });
    track.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = ((e.clientX - lastX) / dt) * 16; // normalize ~60fps
      lastX = e.clientX; lastT = now;
      offset = clampOffset(startOffset + (e.clientX - startX));
      apply();
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    // click vs drag disambiguation for zoom
    track.addEventListener("click", (e) => {
      const fig = e.target.closest(".wm-slide");
      if (!fig) return;
      if (Math.abs(velocity) > 1.2) return; // was a fling, not a click
      openLightbox(fig);
    });
    // keyboard: Enter/Space on focused card opens zoom (a11y)
    track.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const fig = e.target.closest(".wm-slide");
      if (!fig) return;
      e.preventDefault();
      openLightbox(fig);
    });
    if (!reduced) raf = requestAnimationFrame(tick);
    else apply();
  }

  /* ══════════ 4. zoom lightbox ══════════ */
  const lightbox = $("#wmLightbox"), lbFrame = $("#wmLbFrame"), lbCap = $("#wmLbCap"), lbClose = $("#wmLbClose");
  let lbOpen = false;
  const openLightbox = (fig) => {
    if (!fig || !lightbox) return;
    const media = fig.querySelector("img") || fig.querySelector("svg");
    const cap = fig.querySelector("figcaption");
    if (!media) return;
    lbFrame.innerHTML = "";
    lbFrame.appendChild(media.cloneNode(true));
    lbCap.textContent = cap ? cap.textContent : "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("wm-menu-open");
    lbOpen = true;
    lbClose && lbClose.focus({ preventScroll: true });
  };
  const closeLightbox = () => {
    lightbox && lightbox.classList.remove("is-open");
    lightbox && lightbox.setAttribute("aria-hidden", "true");
    if (!menuOpen) document.documentElement.classList.remove("wm-menu-open");
    lbOpen = false;
  };
  lbClose && lbClose.addEventListener("click", closeLightbox);
  lightbox && lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lbOpen) closeLightbox();
  });

  /* ══════════ 5. hero shapes stage — full-bleed landscape rig (cinema scene, pointer parallax) ══════════ */
  const stage = $("#wmStage");
  if (stage) {
    // Full-bleed landscape stage behind the glass hero content (RIVR-glass pattern,
    // shapes-only per repo rule: no photo/video layers — replaces template video bg).
    // viewBox 1600×900.
    stage.innerHTML = `
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
        <defs>
          <linearGradient id="wmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#241c18"/><stop offset="1" stop-color="#141010"/>
          </linearGradient>
          <radialGradient id="wmGlow" cx="0.5" cy="0.42" r="0.75">
            <stop offset="0" stop-color="#e4c07a" stop-opacity=".22"/><stop offset="1" stop-color="#e4c07a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#wmSky)"/>
        <rect width="1600" height="900" fill="url(#wmGlow)"/>
        <g class="wm-rig" style="transform-origin:50% 96%">
          <!-- ground -->
          <rect x="0" y="740" width="1600" height="160" fill="#1b1512"/>
          <rect x="0" y="738" width="1600" height="2" fill="rgba(242,237,228,.14)"/>
          <!-- plinth -->
          <rect x="180" y="650" width="1240" height="90" fill="#2e241e"/>
          <!-- towers -->
          <rect x="300" y="380" width="220" height="270" fill="#2e241e"/>
          <rect x="300" y="376" width="220" height="4" fill="#c08a3e"/>
          <rect x="620" y="220" width="300" height="430" fill="#3a2d24"/>
          <rect x="620" y="216" width="300" height="4" fill="#c08a3e"/>
          <rect x="1010" y="430" width="190" height="220" fill="#2e241e"/>
          <!-- arch ring -->
          <circle cx="1030" cy="170" r="120" fill="none" stroke="#c08a3e" stroke-width="1.5" opacity=".8"/>
          <circle cx="1030" cy="170" r="120" fill="#e4c07a" opacity=".05"/>
          <!-- brass bridge deck -->
          <rect x="440" y="350" width="760" height="5" fill="#c08a3e" opacity=".85"/>
          <!-- lit windows -->
          <g fill="#e4c07a">
            <rect x="336" y="412" width="30" height="40"/><rect x="392" y="412" width="30" height="40"/>
            <rect x="336" y="492" width="30" height="40"/><rect x="392" y="492" width="30" height="40"/>
            <rect x="676" y="282" width="34" height="46"/><rect x="756" y="282" width="34" height="46"/>
            <rect x="676" y="368" width="34" height="46"/><rect x="756" y="368" width="34" height="46"/>
            <rect x="676" y="454" width="34" height="46"/><rect x="836" y="454" width="34" height="46"/>
            <rect x="1040" y="470" width="26" height="34"/><rect x="1096" y="470" width="26" height="34"/>
            <rect x="1040" y="540" width="26" height="34"/><rect x="1140" y="540" width="26" height="34"/>
          </g>
          <!-- ground grid hairlines -->
          <g stroke="rgba(242,237,228,.07)">
            <line x1="0" y1="780" x2="1600" y2="780"/><line x1="0" y1="825" x2="1600" y2="825"/>
            <line x1="0" y1="868" x2="1600" y2="868"/>
          </g>
        </g>
      </svg>`;
    if (fine && !reduced) {
      const rig = stage.querySelector(".wm-rig");
      let tx = 0, ty = 0, cx = 0, cy = 0;
      window.addEventListener("pointermove", (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 10;
        ty = (e.clientY / window.innerHeight - 0.5) * 7;
      }, { passive: true });
      const par = () => {
        cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
        rig.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        requestAnimationFrame(par);
      };
      requestAnimationFrame(par);
    }
  }
})();
