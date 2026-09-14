// Trilux hero — WebGL liquid-form ambience (adapted from ThreeUI community Liquid Form, MIT)
// Zero deps, plain WebGL1, ~7KB. Falls back to CSS if WebGL unavailable.
(function () {
  "use strict";
  var canvas = document.getElementById("heroFx");
  if (!canvas) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { canvas.style.display = "none"; return; }
  var gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" })
        || canvas.getContext("experimental-webgl");
  if (!gl) { canvas.style.display = "none"; return; }

  var FRAG = [
    "precision mediump float;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uMouse;",
    "uniform float uScroll;",

    // hash & noise (iq-style)
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",

    // fbm — soft organic field
    "float fbm(vec2 p){",
    "  float v = 0.0, a = 0.5;",
    "  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);",
    "  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.03; a *= 0.5; }",
    "  return v;",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);",

    // slow flowing field, gentle mouse & scroll influence
    "  float t = uTime * 0.045;",
    "  vec2 drift = vec2(t * 0.6, -t * 0.35);",
    "  vec2 m = (uMouse - 0.5) * 0.25;",
    "  float f1 = fbm(p * 1.35 + drift + m);",
    "  float f2 = fbm(p * 2.6 - drift * 1.4 + f1 * 0.9);",

    // curl-like distortion for silky edges
    "  float band = fbm(p * 1.8 + vec2(f2 * 0.55, f1 * 0.4) - drift);",
    "  float edge = smoothstep(0.42, 0.72, band);",

    // trilux gold on warm dark — glassy liquid highlight
    "  vec3 gold  = vec3(0.894, 0.749, 0.476);",   // #e4bf7a
    "  vec3 amber = vec3(0.729, 0.545, 0.298);",   // #ba8b4c
    "  vec3 deep  = vec3(0.055, 0.043, 0.039);",   // #0e0b0a

    "  vec3 col = mix(deep, amber, edge * 0.85);",
    "  float hi = smoothstep(0.62, 0.95, f2) * smoothstep(0.25, 0.0, edge);",
    "  col = mix(col, gold, hi * 0.9);",
    "  col += gold * smoothstep(0.75, 1.0, f1) * 0.18;",

    // vignette + scroll fade (calmer as you scroll away)
    "  float vig = smoothstep(1.25, 0.35, length(uv - vec2(0.62, 0.42)));",
    "  float alpha = vig * edge * (0.5 + 0.28 * f1) * (1.0 - clamp(uScroll, 0.0, 0.85));",
    "  col *= 1.0 - clamp(uScroll, 0.0, 0.6);",

    "  gl_FragColor = vec4(col, alpha * 0.66);",
    "}"
  ].join("\n");

  var VERT = [
    "attribute vec2 aPos;",
    "void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = "none"; return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "uRes");
  var uTime = gl.getUniformLocation(prog, "uTime");
  var uMouse = gl.getUniformLocation(prog, "uMouse");
  var uScroll = gl.getUniformLocation(prog, "uScroll");

  var W = 0, H = 0, dpr = 1;
  function fit() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width * dpr));
    H = Math.max(1, Math.floor(r.height * dpr));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
  }
  fit();
  window.addEventListener("resize", fit);

  var mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
  window.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = 1 - (e.clientY - r.top) / r.height;
  }, { passive: true });

  var raf = 0, running = true, t0 = performance.now(), frames = 0, slowAfter = 0;
  var visible = true;
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    if (visible) { running = true; raf = requestAnimationFrame(loop); }
  });

  function loop(now) {
    if (!running) return;
    if (!visible) { running = false; return; }
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    gl.uniform2f(uRes, W, H);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uScroll, Math.min(1, window.scrollY / window.innerHeight));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // lightweight throttle: after 6s at steady state, render at ~30fps
    if ((now - t0) > 6000) {
      frames++;
      if (frames % 2 === 0) { raf = requestAnimationFrame(loop); return; }
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
})();
