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

// ---- Home: cinema stage
await page.goto(base + "/index.html", { waitUntil: "networkidle" });
ok("home title", (await page.title()).includes("Trilux"));
ok("budget hidden", !(await page.content()).includes("100.593") && !(await page.content()).includes("js-count"));

const heroTitle = page.locator(".hero-title");
ok("cinema stage renders", await heroTitle.isVisible());
ok("stage height ~4600px", Math.abs(await page.locator(".cinema-scroll").evaluate((el) => el.offsetHeight - (window.innerHeight + 3700))) < 50,
  `h=${await page.locator(".cinema-scroll").evaluate((el) => el.offsetHeight)}`);

// scrub the scroll rig: mid-frame → bridge panel visible
await page.evaluate(() => window.scrollTo(0, 1100));
await page.waitForTimeout(900);
ok("frame2 bridge panel appears", parseFloat(
  await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--panel2-opacity"))
) > 0.3);

// end of rig → brick grid flies in, 5 cards in 2 offset rows
await page.evaluate(() => window.scrollTo(0, 3800));
await page.waitForTimeout(1400);
const enterX = parseFloat(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sights-enter-x")));
ok("cards flown in", enterX < 5, `enter-x=${enterX}vw`);
ok("5 sight cards (brick grid)", await page.locator(".sights-track .sight-card").count() === 5);
ok("cards entrance live", await page.locator(".sights-track.is-live").count() === 1);

// cards navigate: interior card -> simulasi page
const cardHref = await page.evaluate(() => document.querySelector(".sights-track .sight-card[data-href='simulasi']")?.dataset.href);
ok("cards carry simulasi link", cardHref === "simulasi");

// note-button scrolls to featured work
await page.evaluate(() => window.scrollTo(0, 2400));
await page.waitForTimeout(300);
const bazaarVisible = parseFloat(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--panel3-opacity")));
ok("frame3 bazaar panel appears", bazaarVisible > 0.3);
await page.evaluate(() => window.scrollTo(0, 2600));
await page.waitForTimeout(600);
if (bazaarVisible > 0.3) {
  // pointer-events are gated by .is-ready only for controls; the pill is always clickable when visible
  await page.evaluate(() => document.querySelector(".note-button").scrollIntoView({ block: "center" }));
}
await page.evaluate(() => window.scrollTo(0, 3800));
await page.waitForTimeout(500);
await page.evaluate(() => { document.querySelector(".note-button").click(); });
await page.waitForTimeout(1600);
const workTop = await page.evaluate(() => document.getElementById("selected-work").getBoundingClientRect().top);
ok("note-button scrolls to work", workTop >= -80 && workTop < 500, `top=${Math.round(workTop)}`);

// overflow checks after full pass
for (let y = 0; y < 6200; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(90); }
await page.waitForTimeout(600);
await page.screenshot({ path: `${shots}/01-home-full.png`, fullPage: true });
const overflowD = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok("no h-overflow 1440", overflowD <= 0, `delta=${overflowD}`);

// nav to simulasi link present?
ok("nav simulasi", await page.locator('a[href="simulasi"]').count() > 0);

// ---- Simulasi: interact
await page.goto(base + "/simulasi/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const t1 = await page.textContent("#totalOut");
ok("simulasi total renders", /Rp [\d.]+/.test(t1), t1);

await page.locator("#areaRange").evaluate((el) => { el.value = 300; el.dispatchEvent(new Event("input")); });
const t2 = await page.textContent("#totalOut");
ok("slider updates total", t1 !== t2, `${t1} → ${t2}`);

await page.locator('.tier-opt[data-cat="0"][data-tier="2"]').click();
const t3 = await page.textContent("#totalOut");
ok("tier switch updates total", parseFloat(t3.replace(/\D/g, "")) > parseFloat(t2.replace(/\D/g, "")));

await page.locator('input[data-addon="0"]').check();
const t4 = await page.textContent("#totalOut");
ok("addon adds cost", t3 !== t4);

const wa = await page.getAttribute("#waBtn", "href");
ok("wa link has estimate", wa.includes("Estimasi%20total") || decodeURIComponent(wa).includes("Estimasi total"));

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
await mob.screenshot({ path: `${shots}/03-cinema-mobile.png` });
for (let y = 0; y < 7200; y += 600) { await mob.evaluate((yy) => window.scrollTo(0, yy), y); await mob.waitForTimeout(70); }
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
