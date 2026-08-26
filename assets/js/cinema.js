/* cinema.js — Mostar-spec scroll engine, Trilux adaptation.
   Exact math from the reference: smoothstep segments, lerp smoothing,
   CSS-var driven layers, 3-set infinite sight slider. */
(() => {
  "use strict";

  const section = document.querySelector(".cinema-scroll");
  const docEl = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const track = document.querySelector(".sights-track");
  const controls = document.querySelector(".sights-controls");
  const prevBtn = document.querySelector(".sight-prev");
  const nextBtn = document.querySelector(".sight-next");
  const originals = track ? Array.from(track.querySelectorAll(".sight-card")) : [];
  const originalSightCount = originals.length;

  if (!section) return;

  const setVar = (name, value) => docEl.style.setProperty(name, value);
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = (e0, e1, v) => {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const segmentInOut = (s, a, b, c, d) => {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter, exit, active: enter * (1 - exit) };
  };
  const getScrollDistance = () =>
    clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);

  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetScroll = 0;
  let smoothScroll = 0;
  let initialized = false;
  let rafPending = false;
  let sightCards = originals.map((card, i) => card);
  let activeSight = originalSightCount;

  /* ---------- infinite slider (3 identical sets, instant-jump normalize) ---------- */
  function setupSightSlider() {
    if (!track || !originalSightCount) return;
    const frag = document.createDocumentFragment();
    for (let setIndex = 0; setIndex < 3; setIndex += 1) {
      originals.forEach((card, cardIndex) => {
        const clone = card.cloneNode(true);
        clone.dataset.sightIndex = String(setIndex * originalSightCount + cardIndex);
        frag.appendChild(clone);
      });
    }
    track.replaceChildren(frag);
    sightCards = Array.from(track.querySelectorAll(".sight-card"));
    activeSight = originalSightCount;
    sightCards.forEach((card) => {
      card.addEventListener("click", () => {
        const target = card.dataset.href;
        selectSightCard(card);
        if (target) {
          if (target.startsWith("#")) {
            const el = document.querySelector(target);
            if (el) el.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
          } else {
            window.location.href = target;
          }
        }
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectSightCard(card);
        }
      });
    });
    track.addEventListener("transitionend", normalizeSightSlider);
    updateSightSlider();
  }

  function updateSightSlider() {
    if (!sightCards.length) return;
    const cardWidth = sightCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    setVar("--sights-shift", `${-(cardWidth + gap) * activeSight}px`);
    sightCards.forEach((card, i) => card.classList.toggle("is-active", i === activeSight));
  }

  function moveSightSlider(dir) {
    activeSight += dir;
    updateSightSlider();
  }

  function selectSightCard(card) {
    const idx = Number(card.dataset.sightIndex);
    if (Number.isFinite(idx)) activeSight = idx;
    updateSightSlider();
  }

  function jumpSightSlider(i) {
    track.classList.add("is-jumping");
    activeSight = i;
    updateSightSlider();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => track.classList.remove("is-jumping"));
    });
  }

  function normalizeSightSlider() {
    if (activeSight >= originalSightCount * 2) jumpSightSlider(activeSight - originalSightCount);
    else if (activeSight < originalSightCount) jumpSightSlider(activeSight + originalSightCount);
  }

  /* ---------- per-frame update ---------- */
  function update() {
    rafPending = false;
    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

    const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
    const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
    const progress = clamp(smoothScroll / 2700);
    const introExit = smoothstep(90, 650, smoothScroll);
    const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
    const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
    const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
    const blurActive = clamp(frame2.active + frame3.active);
    const frame2Opacity = frame2.active * (1 - frame3.enter);
    const splitDrift = Math.pow(frame2.enter, 1.5);
    const panel2Opacity = frame2.active * (1 - frame2.exit);
    const panel3Opacity = frame3.active * (1 - frame3.exit);
    const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
    const sharedHeroY = progress * -74;
    const sharedHeroScale = progress * 0.23;
    const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
    const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

    setVar("--mx", reduceMotion.matches ? "0" : mouseX.toFixed(4));
    setVar("--my", reduceMotion.matches ? "0" : mouseY.toFixed(4));

    setVar("--back-opacity", String(1 - frame2.active * 0.06));
    setVar("--back-x", `${mouseX * -12}px`);
    setVar("--back-y", `${mouseY * -4}px`);
    setVar("--back-scale", String(backScale));
    setVar("--four-y", `${10 + progress * 10}vh`);
    setVar("--four-scale", String(0.78 + progress * 0.16));
    setVar("--bazaar-y", `${20 - progress * 8}vh`);
    setVar("--blur-px", `${blurActive * 14}px`);
    setVar("--back-brightness", String(1 - blurActive * 0.255));
    setVar("--bazaar-blur-px", `${frame2.active * 14}px`);
    setVar("--bazaar-brightness", String(1 - frame2.active * 0.255 - frame3.active * 0.06));
    setVar("--bazaar-saturation", String(1 + frame3.active * 0.18));
    setVar("--shade-opacity", "1");
    setVar("--shade-z", frame2.active > 0.02 ? "2" : "0");
    setVar("--shade-top-alpha", String(blurActive * 0.465));
    setVar("--shade-mid-alpha", String(blurActive * 0.42));
    setVar("--shade-bottom-alpha", String(blurActive * 0.51));

    setVar("--title-y", `${introExit * -210}px`);
    setVar("--title-scale", String(1 - introExit * 0.08));
    setVar("--title-opacity", String(1 - introExit));

    setVar("--bridge-x", `calc(-50% + ${mouseX * 18}px)`);
    setVar("--bridge-y", `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`);
    setVar("--bridge-bottom", `${5 - frame2.enter * 13}vh`);
    setVar("--bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
    setVar("--bridge-scale", String(1.02 + sharedHeroScale + frame2.exit * 0.46));

    setVar("--split-left-x", `calc(-50% + ${-splitDrift * 170}vw + ${mouseX * 22}px)`);
    setVar("--split-left-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
    setVar("--split-left-scale", String(1 + sharedHeroScale + frame2.enter * 0.74));
    setVar("--split-right-x", `calc(-50% + ${splitDrift * 170}vw + ${mouseX * 22}px)`);
    setVar("--split-right-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
    setVar("--split-right-scale", String(1 + sharedHeroScale + frame2.enter * 0.74));

    setVar("--frame2-opacity", String(frame2Opacity));
    setVar("--frame2-x", `calc(-50% + ${mouseX * 10}px)`);
    setVar("--frame2-y", `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`);
    setVar("--frame2-scale", String(1.06 + frame2.enter * 0.08 + frame2.exit * 0.08));

    setVar("--intro-copy-y", `${introExit * 90}px`);
    setVar("--intro-copy-opacity", String(1 - introExit));
    setVar("--panel2-opacity", String(panel2Opacity));
    setVar("--panel2-y", `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`);
    setVar("--panel3-opacity", String(panel3Opacity));
    setVar("--panel3-y", `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`);

    setVar("--sights-opacity", String(sightsEnter));
    setVar("--sights-controls-opacity", String(sightsControlsEnter));
    if (controls) controls.classList.toggle("is-ready", sightsControlsEnter > 0.98);
    setVar("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
    setVar("--sights-y", "0px");
    setVar("--sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
    setVar("--sights-scale", String(1 / backScale));
    setVar("--sights-top", `${sightsParentTop}px`);
    setVar("--sights-screen-top", `${sightsScreenTop}px`);

    if (
      Math.abs(smoothScroll - targetScroll) > 0.08 ||
      Math.abs(mouseX - targetMouseX) > 0.001 ||
      Math.abs(mouseY - targetMouseY) > 0.001
    ) {
      requestTick();
    }
  }

  function requestTick() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }

  /* ---------- listeners ---------- */
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => { updateSightSlider(); requestTick(); }, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    },
    { passive: true }
  );
  if (prevBtn) prevBtn.addEventListener("click", () => moveSightSlider(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => moveSightSlider(1));
  const noteBtn = document.querySelector(".note-button");
  if (noteBtn) {
    noteBtn.addEventListener("click", () => {
      const work = document.getElementById("selected-work");
      if (work) work.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }

  setupSightSlider();
  requestTick();
})();
