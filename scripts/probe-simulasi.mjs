// probe-simulasi-overflow.mjs — find elements causing horizontal overflow
import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp });
  await p.goto("http://localhost:8790/simulasi/", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const bad = await p.evaluate(() => {
    const dw = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > dw + 1 || r.left < -1) {
        out.push(el.tagName + "." + String(el.className).slice(0, 60) + " L=" + Math.round(r.left) + " R=" + Math.round(r.right) + " w=" + Math.round(r.width));
      }
    });
    return { scrollW: document.documentElement.scrollWidth, clientW: dw, els: out.slice(0, 14) };
  });
  console.log("viewport", vp.width, JSON.stringify(bad, null, 1));
  if (vp.width === 1440) {
    const wa = await p.getAttribute("#waBtn", "href");
    console.log("WA:", decodeURIComponent(wa).slice(0, 300));
    console.log("totalOut:", await p.textContent("#totalOut"));
  }
  await p.close();
}
await b.close();
