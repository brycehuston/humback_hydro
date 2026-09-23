import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to localhost:5173...");
  await page.goto('http://localhost:5173/');

  // wait for the application-stage to be available
  await page.waitForSelector('.application-tabs button');

  const getDiagnostics = async () => {
    return page.evaluate(() => {
      const img = document.querySelector('.application-stage > img');
      if (!img) return null;
      const comp = window.getComputedStyle(img);
      return {
        dataAppId: img.getAttribute('data-application-id'),
        transform: comp.transform,
        animationName: comp.animationName,
        animationDuration: comp.animationDuration
      };
    });
  };

  const tabs = await page.locator('.application-tabs button').all();

  console.log("\n--- Testing UTILITIES ---");
  await tabs[0].click();
  const u_0s = await getDiagnostics();
  await page.waitForTimeout(5500);
  const u_5s = await getDiagnostics();
  await page.waitForTimeout(5500);
  const u_11s = await getDiagnostics();
  
  console.log("At 0s:", u_0s);
  console.log("At 5.5s:", u_5s);
  console.log("At 11.0s:", u_11s);

  console.log("\n--- Testing AI ---");
  await tabs[1].click();
  const a_0s = await getDiagnostics();
  await page.waitForTimeout(5500);
  const a_5s = await getDiagnostics();
  await page.waitForTimeout(5500);
  const a_11s = await getDiagnostics();

  console.log("At 0s:", a_0s);
  console.log("At 5.5s:", a_5s);
  console.log("At 11.0s:", a_11s);

  await browser.close();
})();
