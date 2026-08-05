import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/new-landing', { waitUntil: 'networkidle' });
  
  // Wait a bit for animations
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  
  // Scroll a bit and take another
  await page.evaluate(() => window.scrollBy(0, 2000));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot2.png' });
  
  const scrollY = await page.evaluate(() => window.scrollY);
  console.log('Scroll Y after scroll:', scrollY);
  
  await browser.close();
})();
