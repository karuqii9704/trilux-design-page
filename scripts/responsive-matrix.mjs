// responsive-matrix.mjs — matriks screenshot responsif Trilux Design.
// Diadaptasi dari versi origin/master (stage shapes) ke situs sekarang: hero
// beranda + halaman /studio/ (canvas ruangan). Screenshot masuk ke shots/.
//
// Jalankan:
//   python3 -m http.server 8790     (atau: npm run serve)
//   npm run qa:matrix               (butuh playwright: npm i -D playwright)
import { chromium } from "playwright";
import fs from "fs";

const base = "http://localhost:8790";
const shots = "shots";
fs.mkdirSync(shots, { recursive: true });

const sizes = [
  [2560, 1440, "4k"],      // 4K / zoom jauh
  [1920, 1080, "fhd"],
  [1440, 900, "lap"],
  [1280, 800, "lap-s"],
  [1024, 768, "tab-l"],
  [960, 600, "zoomed-in"], // 1440p @150% zoom browser ≈ viewport CSS ini
  [768, 900, "tab"],
  [390, 844, "phone"],
];

const pages = [
  ["/index.html", "home", ".hero"],
  ["/studio/", "studio", "#roomCanvas"],
];

const b = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
let overflow = 0;
for (const [w, h, name] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const [path, label, sel] of pages) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${shots}/rsp-${name}-${label}-${w}x${h}.png` });
    const ovf = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const box = await p.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), vh: window.innerHeight };
    }, sel);
    if (ovf > 0) overflow++;
    console.log(`${name} ${w}x${h} ${label}: overflowX=${ovf} ${sel}=${box ? `${box.w}x${box.h} vh=${box.vh}` : "TIDAK DITEMUKAN"}`);
  }
  await p.close();
}
await b.close();
console.log(overflow ? `SELESAI dengan ${overflow} viewport overflow` : "SELESAI tanpa overflow");
process.exit(overflow ? 1 : 0);
