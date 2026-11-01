/* Sub-page interactive wiring — Trilux Design (brief v0).
   - Gallery: swipe/drag carousel + zoom lightbox (Watermelon embla + dialog
     patterns, adapted to vanilla JS, no build step).
   - Studio: floorplan — adjustable partitions, furniture drag, cm dimensions
     (Watermelon dnd-kit pattern adapted to Pointer Events).
   - Clients: auto-scroll rail.
   - Shared: scroll reveal, back-to-top, footer year. */
(() => {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ============ scroll reveal (delegates to main.js: .reveal → .is-visible) ============ */
  const revealEls = $$(".reveal:not(.is-visible)");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ============ GALLERY — carousel + zoom lightbox ============ */
  const viewport = $("#galleryViewport");
  if (viewport) {
    const track = $("#galleryTrack");
    const slides = $$(".gallery-slide", track);
    const thumbs = $$("#galleryThumbs button");
    const prev = $("#galPrev"), next = $("#galNext"), count = $("#galCount");
    const n = slides.length;
    let index = 0;

    const go = (i, animate = true) => {
      if (!n) return;
      index = ((i % n) + n) % n;
      track.style.transition = animate ? "transform .45s cubic-bezier(.22,1,.36,1)" : "none";
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, k) => s.setAttribute("aria-hidden", k === index ? "false" : "true"));
      thumbs.forEach((t, k) => {
        t.classList.toggle("is-active", k === index);
        if (k === index) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
      });
      if (count) count.textContent = `${index + 1} / ${n}`;
    };
    go(0, false);

    /* drag/swipe (embla-style) */
    let startX = 0, curX = 0, dragging = false, moved = 0;
    viewport.addEventListener("pointerdown", (e) => {
      dragging = true; startX = curX = e.clientX; moved = 0;
      track.style.transition = "none";
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      curX = e.clientX; moved = curX - startX;
      track.style.transform = `translateX(${-index * viewport.clientWidth + moved}px)`;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(moved) > viewport.clientWidth * 0.12) go(index + (moved < 0 ? 1 : -1));
      else go(index);
    };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    });

    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));
    thumbs.forEach((t, k) => t.addEventListener("click", () => go(k)));

    let auto = setInterval(() => { if (!document.hidden) go(index + 1); }, 6000);
    const pauseAuto = () => clearInterval(auto);
    const resumeAuto = () => { clearInterval(auto); auto = setInterval(() => { if (!document.hidden) go(index + 1); }, 6000); };
    viewport.addEventListener("pointerenter", pauseAuto);
    viewport.addEventListener("pointerleave", resumeAuto);
    viewport.addEventListener("focusin", pauseAuto);
    viewport.addEventListener("focusout", resumeAuto);

    /* zoom lightbox (Watermelon dialog pattern) */
    const openLightbox = (startIndex) => {
      const lb = document.createElement("div");
      lb.className = "lightbox";
      lb.setAttribute("role", "dialog");
      lb.setAttribute("aria-modal", "true");
      lb.setAttribute("aria-label", "Zoom gambar galeri");
      lb.innerHTML = `
        <button class="lightbox__close" type="button" aria-label="Tutup zoom">✕</button>
        <button class="lightbox__nav prev" type="button" aria-label="Gambar sebelumnya">←</button>
        <figure class="lightbox__stage"><img src="" alt=""></figure>
        <button class="lightbox__nav next" type="button" aria-label="Gambar berikutnya">→</button>
        <p class="lightbox__hint">Esc tutup · klik gambar zoom in/out · scroll untuk zoom · ← → untuk berpindah</p>`;
      document.body.appendChild(lb);
      document.body.style.overflow = "hidden";
      const img = $(".lightbox__stage img", lb);
      let li = startIndex, scale = 1;
      const show = () => {
        const s = slides[li];
        const full = s ? (s.dataset.full || ($("img", s) || {}).src || "") : "";
        img.src = full;
        const cap = s ? ($(".g-cap", s) || {}).textContent : "";
        img.alt = cap || "Galeri Trilux";
        scale = 1; img.style.transform = "scale(1)";
        $(".lightbox__caption", lb);
      };
      // caption element
      const capEl = document.createElement("figcaption");
      capEl.className = "lightbox__caption";
      $(".lightbox__stage", lb).appendChild(capEl);
      const showCap = () => {
        const s = slides[li];
        capEl.textContent = s ? (($(".g-cap", s) || {}).textContent || "") : "";
      };
      const applyScale = () => { img.style.transform = `scale(${scale})`; };
      const show2 = () => { show(); showCap(); };
      show2();
      const close = () => { lb.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", onKey, true); };
      const onKey = (e) => {
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") { li = (li - 1 + n) % n; show2(); }
        else if (e.key === "ArrowRight") { li = (li + 1) % n; show2(); }
        else if (e.key === "+" || e.key === "=") { scale = Math.min(4, scale + 0.25); applyScale(); }
        else if (e.key === "-") { scale = Math.max(1, scale - 0.25); applyScale(); }
      };
      document.addEventListener("keydown", onKey, true);
      $(".lightbox__close", lb).addEventListener("click", close);
      lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
      $(".lightbox__nav.prev", lb).addEventListener("click", () => { li = (li - 1 + n) % n; show2(); });
      $(".lightbox__nav.next", lb).addEventListener("click", () => { li = (li + 1) % n; show2(); });
      img.addEventListener("click", () => { scale = scale === 1 ? 2.5 : 1; applyScale(); });
      lb.addEventListener("wheel", (e) => {
        e.preventDefault();
        scale = Math.min(4, Math.max(1, scale + (e.deltaY < 0 ? 0.15 : -0.15)));
        applyScale();
      }, { passive: false });
      /* touch pinch-zoom */
      let lastDist = 0;
      lb.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          if (lastDist) { scale = Math.min(4, Math.max(1, scale + (d - lastDist) / 200)); applyScale(); }
          lastDist = d;
        }
      }, { passive: false });
      lb.addEventListener("touchend", () => { lastDist = 0; });
    };
    slides.forEach((s, i) => {
      const img = $("img", s);
      if (img) img.addEventListener("click", () => openLightbox(i));
      s.style.cursor = "zoom-in";
    });
  }

  /* ============ STUDIO — floorplan (dnd-kit pattern → Pointer Events) ============ */
  const studioRoot = $("#studioRoot, .studio-canvas-wrap");
  if (studioRoot) {
    const svg = $("#studioCanvas");
    if (svg) {
      const ns = "http://www.w3.org/2000/svg";
      let roomW = Number(svg.dataset.roomW) || 600;
      let roomD = Number(svg.dataset.roomD) || 420;
      /* fallback: read from first room rect */
      if (!svg.dataset.roomW) {
        const wall = $(".st-room-wall", svg);
        if (wall) { roomW = Number(wall.getAttribute("width")); roomD = Number(wall.getAttribute("height")); }
      }
      svg.dataset.roomW = roomW; svg.dataset.roomD = roomD;

      const wOut = $("#roomWOut"), dOut = $("#roomDOut");
      const furnList = $("#furnList"), partList = $("#partList");
      const furnOut = $("#furnWOut"), furnNote = $("#furnDimNote");

      /* --- furniture elements (from renderStudio: g.st-furn[data-id], rect w×h, label in data via text) --- */
      const furnEls = $$(".st-furn", svg).map((g) => {
        const rect = $("rect", g);
        const g2 = g;
        g2._w = Number(rect.getAttribute("width"));
        g2._h = Number(rect.getAttribute("height"));
        const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(g2.getAttribute("transform") || "");
        g2._x = m ? Number(m[1]) : 0;
        g2._y = m ? Number(m[2]) : 0;
        const labelTxt = $$("text", g2).map((t) => t.textContent).join(" ");
        g2._label = labelTxt.split("—")[0].trim() || "Furnitur";
        return g2;
      });

      /* --- partitions (line.st-part + circle handle) --- */
      const partEls = $$(".st-part", svg).map((line) => {
        const handle = $(`.st-part-handle[data-id="${line.dataset.id}"]`, svg);
        line._handle = handle || null;
        line._isV = line.getAttribute("x1") === line.getAttribute("x2");
        if (line._isV) {
          line._x = Number(line.getAttribute("x1"));
          line._from = Number(line.getAttribute("y1"));
          line._len = Math.abs(Number(line.getAttribute("y2")) - line._from);
        } else {
          line._y = Number(line.getAttribute("y1"));
          line._from = Number(line.getAttribute("x1"));
          line._len = Math.abs(Number(line.getAttribute("x2")) - line._from);
        }
        return line;
      });

      const svgPoint = (e) => {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        return ctm ? pt.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
      };

      /* --- room dimension steppers --- */
      $$("[data-room]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const axis = btn.dataset.room;
          const delta = Number(btn.dataset.delta) || 20;
          if (axis === "w") {
            roomW = Math.min(1200, Math.max(200, roomW + delta));
            svg.dataset.roomW = roomW;
            svg.setAttribute("viewBox", `-30 -30 ${roomW + 60} ${roomD + 60}`);
            const wall = $(".st-room", svg); if (wall) wall.setAttribute("width", roomW);
            const wallLine = $(".st-room-wall", svg); if (wallLine) wallLine.setAttribute("width", roomW);
            if (wOut) wOut.textContent = roomW;
          } else {
            roomD = Math.min(1200, Math.max(200, roomD + delta));
            svg.dataset.roomD = roomD;
            svg.setAttribute("viewBox", `-30 -30 ${roomW + 60} ${roomD + 60}`);
            const wall = $(".st-room", svg); if (wall) wall.setAttribute("height", roomD);
            const wallLine = $(".st-room-wall", svg); if (wallLine) wallLine.setAttribute("height", roomD);
            if (dOut) dOut.textContent = roomD;
          }
          updateRoomLabels();
        });
      });
      const updateRoomLabels = () => {
        $$(".st-dim-label", svg).forEach((t) => {
          if (t.getAttribute("transform")) t.textContent = `${roomD} cm`;
          else if (t.getAttribute("text-anchor") === "middle" && Number(t.getAttribute("x")) > roomW / 2 - 10) t.textContent = `${roomW} cm`;
        });
      };

      /* --- furniture drag --- */
      let dragState = null;
      furnEls.forEach((el) => {
        el.style.cursor = "grab";
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          selectFurn(el);
          const pt = svgPoint(e);
          dragState = { el, dx: pt.x - el._x, dy: pt.y - el._y };
          el.style.cursor = "grabbing";
          try { svg.setPointerCapture(e.pointerId); } catch (_) {}
        });
      });
      svg.addEventListener("pointermove", (e) => {
        if (!dragState) return;
        const pt = svgPoint(e);
        const nx = Math.max(0, Math.min(roomW - dragState.el._w, pt.x - dragState.dx));
        const ny = Math.max(0, Math.min(roomD - dragState.el._h, pt.y - dragState.dy));
        dragState.el._x = nx; dragState.el._y = ny;
        dragState.el.setAttribute("transform", `translate(${nx} ${ny})`);
      });
      const endDrag = () => { if (dragState) { dragState.el.style.cursor = "grab"; dragState = null; } };
      svg.addEventListener("pointerup", endDrag);
      svg.addEventListener("pointercancel", endDrag);

      /* --- furniture list panel --- */
      const rebuildFurnList = () => {
        if (!furnList) return;
        furnList.innerHTML = "";
        furnEls.forEach((el) => {
          const li = document.createElement("li");
          li.className = "st-furn-item";
          const btn = document.createElement("button");
          btn.type = "button";
          btn.dataset.furnId = el.dataset.id;
          btn.innerHTML = `<strong>${esc(el._label)}</strong><span>${el._w} × ${el._h} cm</span>`;
          btn.addEventListener("click", () => selectFurn(el));
          li.appendChild(btn);
          furnList.appendChild(li);
        });
      };
      rebuildFurnList();

      let selected = null;
      function selectFurn(el) {
        selected = el;
        furnEls.forEach((f) => f.classList.remove("is-selected"));
        el.classList.add("is-selected");
        if (furnOut) furnOut.textContent = `${el._w} × ${el._h} cm`;
        if (furnNote) furnNote.textContent = `${el._label} — geser stepper untuk mengubah lebar (cm).`;
      }

      /* --- furniture resize (width stepper) --- */
      const stepFurn = (delta) => {
        if (!selected) return;
        const el = selected;
        el._w = Math.max(20, Math.min(roomW, el._w + delta));
        const rect = $("rect", el);
        if (rect) rect.setAttribute("width", el._w);
        const texts = $$("text", el);
        if (texts[1]) texts[1].textContent = `${el._w} × ${el._h} cm`;
        if (furnOut) furnOut.textContent = `${el._w} × ${el._h} cm`;
        const li = $(`#furnList [data-furn-id="${el.dataset.id}"] span`);
        if (li) li.textContent = `${el._w} × ${el._h} cm`;
      };
      const fMinus = $("#furnMinus"), fPlus = $("#furnPlus");
      if (fMinus) fMinus.addEventListener("click", () => stepFurn(-20));
      if (fPlus) fPlus.addEventListener("click", () => stepFurn(20));

      /* --- partitions: drag handle to resize, click line to delete --- */
      const syncPartVisual = (line) => {
        if (line._isV) {
          line.setAttribute("y2", line._from + line._len);
          if (line._handle) { line._handle.setAttribute("cx", line._x); line._handle.setAttribute("cy", line._from + line._len); }
        } else {
          line.setAttribute("x2", line._from + line._len);
          if (line._handle) { line._handle.setAttribute("cx", line._from + line._len); line._handle.setAttribute("cy", line._y); }
        }
      };
      const updatePartList = () => {
        if (!partList) return;
        partList.innerHTML = "";
        $$(".st-part", svg).forEach((line, i) => {
          const li = document.createElement("li");
          li.className = "st-furn-item";
          li.innerHTML = `<span>Partisi ${line._isV ? "vertikal" : "horizontal"} #${i + 1} — ${Math.round(line._len)} cm</span>`;
          partList.appendChild(li);
        });
      };
      updatePartList();

      partEls.forEach((line) => {
        syncPartVisual(line);
        const handle = line._handle;
        const startResize = (e) => {
          e.preventDefault(); e.stopPropagation();
          const start = svgPoint(e);
          const origLen = line._len;
          const move = (ev) => {
            const pt = svgPoint(ev);
            const d = line._isV ? pt.y - start.y : pt.x - start.x;
            line._len = Math.max(40, Math.min(line._isV ? roomD : roomW, origLen + d));
            syncPartVisual(line);
            updatePartList();
          };
          const up = () => {
            svg.removeEventListener("pointermove", move);
            svg.removeEventListener("pointerup", up);
          };
          svg.addEventListener("pointermove", move);
          svg.addEventListener("pointerup", up);
        };
        if (handle) {
          handle.style.cursor = line._isV ? "ns-resize" : "ew-resize";
          handle.addEventListener("pointerdown", startResize);
        }
        line.style.cursor = "pointer";
        line.addEventListener("click", () => {
          line.remove();
          if (line._handle) line._handle.remove();
          updatePartList();
        });
      });

      /* --- add partition --- */
      const addPart = (orientation) => {
        const id = "p" + Date.now();
        const line = document.createElementNS(ns, "line");
        line.setAttribute("class", "st-part");
        line.setAttribute("data-id", id);
        line.setAttribute("stroke", "var(--brass-700, #8a5a20)");
        line.setAttribute("stroke-width", "3");
        line.setAttribute("stroke-dasharray", "8 4");
        const handle = document.createElementNS(ns, "circle");
        handle.setAttribute("class", "st-part-handle");
        handle.setAttribute("data-id", id);
        handle.setAttribute("r", "7");
        handle.setAttribute("fill", "var(--brass-500, #c08a3e)");
        handle.style.cursor = orientation === "v" ? "ns-resize" : "ew-resize";
        let isV, x, y, from, len;
        if (orientation === "v") {
          isV = true; x = roomW / 2; from = 40; len = Math.max(40, roomD * 0.4);
          line.setAttribute("x1", x); line.setAttribute("y1", from);
          line.setAttribute("x2", x); line.setAttribute("y2", from + len);
          handle.setAttribute("cx", x); handle.setAttribute("cy", from + len);
        } else {
          isV = false; y = roomD / 2; from = 40; len = Math.max(40, roomW * 0.4);
          line.setAttribute("x1", from); line.setAttribute("y1", y);
          line.setAttribute("x2", from + len); line.setAttribute("y2", y);
          handle.setAttribute("cx", from + len); handle.setAttribute("cy", y);
        }
        svg.appendChild(line); svg.appendChild(handle);
        line._isV = isV;
        line._x = isV ? x : 0; line._y = isV ? 0 : y;
        line._from = from; line._len = len; line._handle = handle;
        syncPartVisual(line);
        /* bind interactions (same as initial partitions) */
        const startResize = (e) => {
          e.preventDefault(); e.stopPropagation();
          const start = svgPoint(e);
          const origLen = line._len;
          const move = (ev) => {
            const pt = svgPoint(ev);
            const d = line._isV ? pt.y - start.y : pt.x - start.x;
            line._len = Math.max(40, Math.min(line._isV ? roomD : roomW, origLen + d));
            syncPartVisual(line);
            updatePartList();
          };
          const up = () => { svg.removeEventListener("pointermove", move); svg.removeEventListener("pointerup", up); };
          svg.addEventListener("pointermove", move);
          svg.addEventListener("pointerup", up);
        };
        handle.addEventListener("pointerdown", startResize);
        line.addEventListener("click", () => { line.remove(); handle.remove(); updatePartList(); });
        updatePartList();
      };
      const pv = $("#partAddV"), ph = $("#partAddH");
      if (pv) pv.addEventListener("click", () => addPart("v"));
      if (ph) ph.addEventListener("click", () => addPart("h"));
    }
  }

  /* ============ clients rail (marquee pause on hover) ============ */
  const rail = $("#clientRail");
  if (rail) {
    rail.addEventListener("pointerenter", () => rail.classList.add("is-paused"));
    rail.addEventListener("pointerleave", () => rail.classList.remove("is-paused"));
  }

  /* ============ shared helpers ============ */
  function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ============ back-to-top + footer year ============ */
  const btt = $("#backToTop");
  if (btt) btt.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  $$(".footer-copy").forEach((el) => { el.textContent = el.textContent.replace(/© \d{4}/, "© " + new Date().getFullYear()); });
})();
