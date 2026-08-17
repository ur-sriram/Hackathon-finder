import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36" });
const responses = [];
page.on('response', response => { const url = response.url(); if (/api|hack|opportun|competition|graphql/i.test(url)) responses.push({ status: response.status(), url }); });
await page.goto("https://unstop.com/hackathons?oppstatus=open", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => undefined);
await page.waitForTimeout(12000);
console.log(JSON.stringify({ title: await page.title(), cards: await page.locator('a[id^="i_"]').count(), responses }, null, 2));
await browser.close();
