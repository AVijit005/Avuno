const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/auth'); 
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  console.log(content.slice(0, 500));
  
  // click create account
  await page.getByText("Create Account").click({force: true});
  await page.waitForTimeout(1000);
  
  const body = await page.evaluate(() => document.body.innerText);
  console.log("BODY TEXT:", body);
  
  await browser.close();
})();
