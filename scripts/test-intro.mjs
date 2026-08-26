// test-intro.mjs — verify loader paints, animates, and fades away
import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());

// 1. throttled load: loader must be visible during asset loading
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto("http://localhost:8790/index.html", { waitUntil: "commit" });
await p.waitForTimeout(350);
const visibleEarly = await p.evaluate(() => {
  const el = document.getElementById("intro-loader");
  if (!el) return "MISSING";
  const cs = getComputedStyle(el);
  return { opacity: cs.opacity, z: cs.zIndex, bg: cs.backgroundColor };
});
console.log("early state:", JSON.stringify(visibleEarly));
await p.screenshot({ path: "shots/intro-mid.png" });

// wait for load + fade
await p.waitForLoadState("load");
await p.waitForTimeout(1300);
const afterState = await p.evaluate(() => {
  const el = document.getElementById("intro-loader");
  return el ? "STILL IN DOM" : "removed";
});
console.log("after load:", afterState);
await p.screenshot({ path: "shots/intro-after.png" });
await ctx.close();

// 2. safety cap: block a resource so load never fires; loader must self-dismiss at 3s
const ctx2 = await b.newContext();
const p2 = await ctx2.newPage();
await p2.route("**/cover.jpg", r => {}); // hang this request
await p2.goto("http://localhost:8790/index.html", { waitUntil: "commit" });
await p2.waitForTimeout(3600);
const capped = await p2.evaluate(() => {
  const el = document.getElementById("intro-loader");
  return el ? getComputedStyle(el).opacity : "removed";
});
console.log("after safety cap (hung resource):", JSON.stringify(capped));
await ctx2.close();

// 3. reduced motion: near-instant dismissal
const ctx3 = await b.newContext({ reducedMotion: "reduce" });
const p3 = await ctx3.newPage();
await p3.goto("http://localhost:8790/index.html", { waitUntil: "commit" });
await p3.waitForTimeout(700);
const rm = await p3.evaluate(() => {
  const el = document.getElementById("intro-loader");
  return el ? getComputedStyle(el).opacity : "removed";
});
console.log("reduced motion:", JSON.stringify(rm));
await ctx3.close();

await b.close();
console.log("done");
