import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] });
const page = await browser.newPage({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36" });
await page.goto("https://unstop.com/hackathons?oppstatus=open", { waitUntil: "domcontentloaded", timeout: 30000 });
for (const delay of [2500, 5000, 10000]) {
  await page.waitForTimeout(delay);
  console.log(JSON.stringify({ delay, url: page.url(), title: await page.title(), anchors: await page.locator('a[href*="/hackathons/"]').count(), cards: await page.locator('a[id^="i_"]').count(), body: (await page.locator('body').innerText()).slice(0, 180) }));
}
await browser.close();
