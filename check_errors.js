import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[Browser Console ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => console.log(`[Browser Error] ${error.message}`));
  
  await page.goto('http://localhost:5173/new-landing', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
