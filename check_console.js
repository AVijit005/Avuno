import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log('Navigating to http://localhost:5173/new-landing ...');
  await page.goto('http://localhost:5173/new-landing', { waitUntil: 'networkidle' });
  
  console.log('Page loaded.');
  await browser.close();
})();
