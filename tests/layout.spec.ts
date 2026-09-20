import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1366x1024', width: 1366, height: 1024 },
  { name: '1024x1366', width: 1024, height: 1366 },
  { name: '800x1280', width: 800, height: 1280 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '360x800', width: 360, height: 800 },
  { name: '412x915', width: 412, height: 915 },
];

for (const vp of viewports) {
  test(Test , async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://127.0.0.1:5173/'); // vite default port
    await page.waitForTimeout(2000); // wait for load
    
    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    
    // Check overlap of sequence steps
    const overlaps = await page.evaluate(() => {
      const steps = Array.from(document.querySelectorAll('.premium-twin-sequence-step'));
      for(let i=0; i<steps.length; i++) {
        for(let j=i+1; j<steps.length; j++) {
          const r1 = steps[i].getBoundingClientRect();
          const r2 = steps[j].getBoundingClientRect();
          if (!(r2.left > r1.right || 
                r2.right < r1.left || 
                r2.top > r1.bottom ||
                r2.bottom < r1.top)) {
            return true;
          }
        }
      }
      return false;
    });
    
    // Check overlap of playback controls and sequence
    const railOverlaps = await page.evaluate(() => {
       const playback = document.querySelector('.premium-twin-playback-controls');
       const seq = document.querySelector('.premium-twin-sequence');
       if(!playback || !seq) return false;
       const r1 = playback.getBoundingClientRect();
       const r2 = seq.getBoundingClientRect();
       return !(r2.left > r1.right || 
                r2.right < r1.left || 
                r2.top > r1.bottom ||
                r2.bottom < r1.top);
    });
    
    console.log("[RESULT]  - Overflow: , SequenceOverlap: , RailOverlap: ");
  });
}
