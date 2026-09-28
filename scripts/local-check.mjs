// Local visual + functional check — Trilux Design (static site di :8790).
//
// Diadaptasi dari versi origin/master (yang menargetkan situs lama:
// cinema/shapes stage + /simulasi/) ke situs sekarang: hero WebGL + /studio/
// + /admin/. Asumsi: server statis polos di :8790, jadi beacon /api/* 404 —
// itu wajar untuk server tanpa handler, bukan error halaman, dan diabaikan.
//
// Jalankan:
//   python3 -m http.server 8790     (atau: npm run serve)
//   npm run qa:check                (butuh playwright: npm i -D playwright)
import { chromium } from "playwright";
import fs from "fs";

const base = "http://localhost:8790";
const shots = "shots";
fs.mkdirSync(shots, { recursive: true });

const results = [];
const ok = (name, cond, extra = "") => { results.push(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };
const IGNORE = /\/api\/|favicon\.ico|Failed to load resource|net::ERR_/i;

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => { if (!IGNORE.test(e.message)) results.push("PAGEERROR: " + e.message); });
page.on("console", (m) => { if (m.type() === "error" && !IGNORE.test(m.text())) results.push("CONSOLE-ERR: " + m.text().slice(0, 200)); });

// ---- Home: hero
await page.goto(base + "/index.html", { waitUntil: "networkidle" });
ok("home title", (await page.title()).includes("Trilux"));
ok("hero h1 visible", await page.locator("h1.hero-anim").isVisible());
// Regresi LCP: hero copy tidak boleh mulai dari opacity 0 (commit 44add8c).
const heroOp = parseFloat(await page.locator(".hero__inner .hero-anim").first().evaluate((el) => getComputedStyle(el).opacity));
ok("hero copy opacity 1 (LCP fix)", heroOp === 1, `opacity=${heroOp}`);
ok("hero WebP disajikan", (await page.locator("picture source[type='image/webp']").count()) > 0);
ok("skip-link ada", (await page.locator("a.skip-link").count()) === 1);
ok("nav ke /studio/", (await page.locator('a[href="/studio/"]').count()) > 0);
ok("nav ke #contact", (await page.locator('a[href="#contact"]').count()) > 0);
ok("og:title ada", (await page.locator('meta[property="og:title"]').count()) === 1);
await page.screenshot({ path: `${shots}/01-home.png`, fullPage: true });
const ovfHome = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow home 1440", ovfHome <= 0, `delta=${ovfHome}`);

// ---- Studio: struktur + interaksi aman (tanpa menyentuh kuota tersimpan)
await page.goto(base + "/studio/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
ok("studio title", (await page.title()).includes("Studio"));
ok("canvas ruangan visible", await page.locator("#roomCanvas").isVisible());
const cats = await page.locator("#catGrid > *").count();
ok("katalog furnitur terisi", cats >= 4, `items=${cats}`);
ok("langkah (steps) visible", await page.locator("#steps").isVisible());
ok("gate Pro ada", (await page.locator("#catLock").count()) === 1);
const est = (await page.textContent("#estOut")).trim();
ok("estimasi renders", /Rp|\d/.test(est), est);

const snapBefore = await page.getAttribute("#snapBtn", "aria-pressed");
await page.locator("#snapBtn").click();
const snapAfter = await page.getAttribute("#snapBtn", "aria-pressed");
const snapMsg = (await page.textContent("#snackMsg")).trim();
ok("toggle snap mengubah state", snapBefore !== snapAfter, `${snapBefore} → ${snapAfter}`);
ok("snack memberi umpan balik", /snap/i.test(snapMsg), snapMsg);

const wBefore = (await page.textContent("#wOut")).trim();
await page.locator("#wRange").evaluate((el) => {
  const v = Number(el.value), max = Number(el.max || 0), min = Number(el.min || 0);
  el.value = String(v === max ? min : max);
  el.dispatchEvent(new Event("input"));
});
const wAfter = (await page.textContent("#wOut")).trim();
ok("slider lebar update label", wBefore !== wAfter, `${wBefore} → ${wAfter}`);

await page.screenshot({ path: `${shots}/02-studio.png`, fullPage: true });
const ovfStudio = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow studio 1440", ovfStudio <= 0, `delta=${ovfStudio}`);

// ---- Mobile pass
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on("pageerror", (e) => { if (!IGNORE.test(e.message)) results.push("MOB PAGEERROR: " + e.message); });
for (const [path, name] of [["/index.html", "home"], ["/studio/", "studio"]]) {
  await mob.goto(base + path, { waitUntil: "networkidle" });
  await mob.waitForTimeout(500);
  await mob.screenshot({ path: `${shots}/03-${name}-mobile.png`, fullPage: true });
  const ovf = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`no h-overflow ${name} 390`, ovf <= 0, `delta=${ovf}`);
}

// ---- Admin: halaman login tampil (tanpa token)
await page.goto(base + "/admin/", { waitUntil: "networkidle" });
ok("admin login visible", await page.locator("#loginView").isVisible());

console.log(results.join("\n"));
await browser.close();
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
