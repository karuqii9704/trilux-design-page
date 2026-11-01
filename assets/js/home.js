/* Trilux home — interaksi (adaptasi pola Watermelon UI ke vanilla):
   - fixed navbar + scrolled state
   - full-screen drawer menu (staggered links, morph X, body scroll lock)
   - drag-enabled marquee strip (rAF, velocity inertia, seamless loop)
   - click card → zoom lightbox (ESC/overlay close)
   - shapes-based hero stage (cinema rig, pointer parallax) — NO photo layers
*/
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);

  /* ══════════ 1. navbar scrolled state ══════════ */
  const nav = $("#wmNav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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

  /* ══════════ 5. hero shapes panel (cinema rig, pointer parallax) ══════════ */
  const stage = $("#wmStage");
  if (stage) {
    // Rig drawn for the 4:5 framed panel on the right — calm, no full-bleed glow.
    stage.innerHTML = `
      <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
        <defs>
          <linearGradient id="wmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#241c18"/><stop offset="1" stop-color="#141010"/>
          </linearGradient>
          <radialGradient id="wmGlow" cx="0.62" cy="0.24" r="0.6">
            <stop offset="0" stop-color="#e4c07a" stop-opacity=".16"/><stop offset="1" stop-color="#e4c07a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="800" height="1000" fill="url(#wmSky)"/>
        <rect width="800" height="1000" fill="url(#wmGlow)"/>
        <g class="wm-rig" style="transform-origin:50% 92%">
          <!-- ground -->
          <rect x="0" y="820" width="800" height="180" fill="#1b1512"/>
          <rect x="0" y="818" width="800" height="2" fill="rgba(242,237,228,.14)"/>
          <!-- plinth block -->
          <rect x="90" y="700" width="620" height="120" fill="#2e241e"/>
          <!-- towers -->
          <rect x="150" y="420" width="130" height="280" fill="#2e241e"/>
          <rect x="150" y="416" width="130" height="4" fill="#c08a3e"/>
          <rect x="330" y="280" width="170" height="420" fill="#3a2d24"/>
          <rect x="330" y="276" width="170" height="4" fill="#c08a3e"/>
          <rect x="550" y="500" width="110" height="220" fill="#2e241e"/>
          <!-- arch ring -->
          <circle cx="560" cy="240" r="90" fill="none" stroke="#c08a3e" stroke-width="1.5" opacity=".8"/>
          <circle cx="560" cy="240" r="90" fill="#e4c07a" opacity=".05"/>
          <!-- brass bridge deck -->
          <rect x="240" y="392" width="430" height="5" fill="#c08a3e" opacity=".85"/>
          <!-- lit windows -->
          <g fill="#e4c07a">
            <rect x="172" y="452" width="20" height="26"/><rect x="212" y="452" width="20" height="26"/>
            <rect x="172" y="512" width="20" height="26"/><rect x="212" y="512" width="20" height="26"/>
            <rect x="360" y="320" width="24" height="32"/><rect x="412" y="320" width="24" height="32"/>
            <rect x="360" y="392" width="24" height="32"/><rect x="412" y="392" width="24" height="32"/>
            <rect x="360" y="464" width="24" height="32"/><rect x="466" y="464" width="24" height="32"/>
            <rect x="572" y="540" width="18" height="24"/><rect x="610" y="540" width="18" height="24"/>
          </g>
          <!-- ground grid hairlines -->
          <g stroke="rgba(242,237,228,.07)">
            <line x1="0" y1="860" x2="800" y2="860"/><line x1="0" y1="900" x2="800" y2="900"/>
            <line x1="0" y1="940" x2="800" y2="940"/>
          </g>
        </g>
      </svg>`;
    if (fine && !reduced) {
      const rig = stage.querySelector(".wm-rig");
      let tx = 0, ty = 0, cx = 0, cy = 0;
      window.addEventListener("pointermove", (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 8;
        ty = (e.clientY / window.innerHeight - 0.5) * 6;
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
