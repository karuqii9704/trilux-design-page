// Local visual + functional check (skill: static-site-visual-audit recipes)
import { chromium } from "playwright";

const base = "http://localhost:8790";
const shots = "shots";
const results = [];
const ok = (name, cond, extra = "") => { results.push(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => results.push("PAGEERROR: " + e.message));
page.on("console", (m) => { if (m.type() === "error") results.push("CONSOLE-ERR: " + m.text().slice(0, 200)); });

// ---- Home
await page.goto(base + "/index.html", { waitUntil: "networkidle" });
ok("home title", (await page.title()).includes("Trilux"));
ok("budget hidden", !(await page.content()).includes("100.593") && !(await page.content()).includes("js-count"));

// scroll pass for lazy images + reveals
for (let y = 0; y < 6000; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
await page.waitForTimeout(800);
await page.screenshot({ path: `${shots}/01-home-full.png`, fullPage: true });

// nav to simulasi link present?
ok("nav simulasi", await page.locator('a[href="simulasi"]').count() > 0);

// overflow check desktop
const overflowD = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow 1440", overflowD <= 0, `delta=${overflowD}`);

// ---- Simulasi: interact
await page.goto(base + "/simulasi/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const t1 = await page.textContent("#totalOut");
ok("simulasi total renders", /Rp [\d.]+/.test(t1), t1);

// change area slider → total changes
await page.locator("#areaRange").evaluate((el) => { el.value = 300; el.dispatchEvent(new Event("input")); });
const t2 = await page.textContent("#totalOut");
ok("slider updates total", t1 !== t2, `${t1} → ${t2}`);

// pick Luxury on first category → total grows
await page.locator('.tier-opt[data-cat="0"][data-tier="2"]').click();
const t3 = await page.textContent("#totalOut");
ok("tier switch updates total", parseFloat(t3.replace(/\D/g, "")) > parseFloat(t2.replace(/\D/g, "")));

// add-on toggle
await page.locator('input[data-addon="0"]').check();
const t4 = await page.textContent("#totalOut");
ok("addon adds cost", t3 !== t4);

// WA link carries the summary
const wa = await page.getAttribute("#waBtn", "href");
ok("wa link has estimate", wa.includes("Total%20estimasi") || decodeURIComponent(wa).includes("Total estimasi"));

// scope switch
await page.locator('.seg[data-mult="1.15"]').click();
const t5 = await page.textContent("#totalOut");
ok("scope switch works", t5 !== t4);

await page.screenshot({ path: `${shots}/02-simulasi.png`, fullPage: true });
const overflowS = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow sim 1440", overflowS <= 0, `delta=${overflowS}`);

// ---- Mobile pass
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on("pageerror", (e) => results.push("MOB PAGEERROR: " + e.message));
await mob.goto(base + "/index.html", { waitUntil: "networkidle" });
for (let y = 0; y < 7000; y += 600) { await mob.evaluate((yy) => window.scrollTo(0, yy), y); await mob.waitForTimeout(80); }
await mob.screenshot({ path: `${shots}/03-home-mobile.png`, fullPage: true });
const overflowM = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow home 390", overflowM <= 0, `delta=${overflowM}`);
await mob.goto(base + "/simulasi/", { waitUntil: "networkidle" });
await mob.waitForTimeout(500);
await mob.screenshot({ path: `${shots}/04-simulasi-mobile.png`, fullPage: true });
const overflowSM = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow sim 390", overflowSM <= 0, `delta=${overflowSM}`);

// admin page loads login view
await page.goto(base + "/admin/", { waitUntil: "networkidle" });
ok("admin login visible", await page.locator("#loginView").isVisible());

console.log(results.join("\n"));
await browser.close();
