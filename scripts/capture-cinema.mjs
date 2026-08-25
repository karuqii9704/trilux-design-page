// capture-cinema.mjs — viewport shots at key scrub points
import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:8790/index.html", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
const stops = [0, 400, 1100, 2000, 2600, 3800, 4400];
for (const y of stops) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1100); // let lerp settle + transitions finish
  await p.screenshot({ path: `shots/cinema-${String(y).padStart(4, "0")}.png` });
}
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:8790/index.html", { waitUntil: "networkidle" });
await m.waitForTimeout(600);
for (const y of [0, 1100, 3800]) {
  await m.evaluate((yy) => window.scrollTo(0, yy), y);
  await m.waitForTimeout(1100);
  await m.screenshot({ path: `shots/cinema-m-${String(y).padStart(4, "0")}.png` });
}
await b.close();
console.log("done");
