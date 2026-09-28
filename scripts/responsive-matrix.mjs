// responsive-matrix.mjs — capture the shapes stage across viewport sizes
// (browser zoom = smaller/larger CSS viewport, so this covers zoom too)
import { chromium } from "playwright";

const sizes = [
  [2560, 1440, "4k"],      // zoomed way out / 4K
  [1920, 1080, "fhd"],
  [1440, 900, "lap"],
  [1280, 800, "lap-s"],
  [1024, 768, "tab-l"],
  [960, 600, "zoomed-in"], // 1440p @150% browser zoom ≈ this CSS viewport
  [768, 900, "tab"],
  [390, 844, "phone"],
];

const b = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
for (const [w, h, name] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:8790/index.html", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `shots/rsp-${name}-${w}x${h}.png` });
  // overflow check
  const ovf = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  // stage vs viewport (sticky break check)
  const stage = await p.evaluate(() => {
    const s = document.querySelector(".stage").getBoundingClientRect();
    return { sh: Math.round(s.height), vh: window.innerHeight, diff: Math.round(s.height - window.innerHeight) };
  });
  console.log(`${name} ${w}x${h}: overflowX=${ovf} stageH=${stage.sh} vh=${stage.vh} diff=${stage.diff}`);
  await p.close();
}
await b.close();
console.log("done");
