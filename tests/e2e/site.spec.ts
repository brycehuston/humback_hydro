import { test, expect } from '@playwright/test';

test.describe('Humpback Hydro Site Verification', () => {

  test('Homepage Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('response', response => {
      if (response.status() >= 500) {
        console.error('500 ERROR URL:', response.url());
      }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Modular Pumped-Storage Hydroelectric Generation and Energy Storage Infrastructure', level: 1 })).toBeVisible();
    await expect(page.getByText('Generation • Storage • Automated Dispatch')).toBeVisible();
    await expect(page.locator('.premium-digital-twin')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    // Some navigation structure (like footer or header links)
    await expect(page.locator('a[href="/technology"]').first()).toBeVisible();

    if (errors.length > 0) {
      console.log('Homepage Desktop Errors:', errors);
    }
    // Only fail if there are non-404 errors (or we can see what the 404s are).
    expect(errors.filter(e => !e.includes('404'))).toEqual([]);
  });

  test('V4 Digital Twin', async ({ page }) => {
    await page.goto('/');

    const autoCycle = page.getByRole('button', { name: 'Auto Cycle' });
    const lowerGen = page.getByRole('button', { name: 'Lower Generation' });
    const charging = page.getByRole('button', { name: 'Charging' });
    const upperGen = page.getByRole('button', { name: 'Upper Generation' });
    const cycleSummary = page.getByRole('button', { name: 'Cycle Summary' });
    const pausePlay = page.locator('.pause-control');

    await expect(autoCycle).toBeVisible();
    await expect(lowerGen).toBeVisible();

    // The canvas width attribute is only set via JS after React hydration (in useEffect)
    const canvas = page.locator('.premium-twin-stage canvas');
    await expect(canvas).toHaveAttribute('width', /^\d+$/);

    await lowerGen.click();
    await expect(lowerGen).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('LOWER GENERATION', { exact: true }).first()).toBeVisible();

    await expect(pausePlay).toHaveText('Pause');
    await pausePlay.click();
    await expect(pausePlay).toHaveText('Play');
    await expect(pausePlay).toHaveAttribute('aria-pressed', 'true');
    await pausePlay.click();
    await expect(pausePlay).toHaveText('Pause');
  });

  test('Homepage Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const twin = page.locator('.premium-digital-twin');
    await twin.scrollIntoViewIfNeeded();
    await expect(twin).toBeVisible();

    const autoCycle = page.getByRole('button', { name: 'Auto Cycle' });
    await expect(autoCycle).toBeVisible();
    const box = await autoCycle.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(24);
  });

  test('Company', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/company');

    await expect(page.locator('#leadership')).toBeVisible();

    await expect(page.locator('img[src*="humpback-team-vancouver.jpeg"]')).toBeVisible();

    const gustavoImg = page.locator('img[src*="gustavo-varela-latouche.jpg"]');
    await gustavoImg.scrollIntoViewIfNeeded();
    await expect(gustavoImg).toBeVisible();

    await expect(page.locator('img[src*="chris-calvin.jpg"]')).toBeVisible();

    const bryan = page.getByText('Bryan Green').first();
    await bryan.scrollIntoViewIfNeeded();
    await expect(bryan).toBeVisible();

    const mark = page.getByText('Mark Legacy').first();
    await mark.scrollIntoViewIfNeeded();
    await expect(mark).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    // Test images load
    const brokenImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth === 0).length;
    });
    expect(brokenImages).toBe(0);
  });

  test('Roadmap / Technology', async ({ page }) => {
    await page.goto('/');

    const roadmap = page.getByText('Engineering & Operational Roadmap');
    await roadmap.scrollIntoViewIfNeeded();
    await expect(roadmap).toBeVisible();

    const standards = page.getByText('Standards Roadmap');
    await standards.scrollIntoViewIfNeeded();
    await expect(standards).toBeVisible();

    const pillars = page.getByText('Core Engineering Pillars');
    await pillars.scrollIntoViewIfNeeded();
    await expect(pillars).toBeVisible();

    await page.goto('/technology');
    await expect(page.getByRole('heading', { level: 1, name: 'The Mountain, Rebuilt at Sea.' })).toBeVisible();
  });

  test('Impact', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/impact');

    await expect(page.getByText('Net Positive Marine Infrastructure')).toBeVisible();
    await expect(page.getByText('Established Design Mechanisms')).toBeVisible();
    await expect(page.getByText('Research Hypotheses')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    const brokenImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth === 0).length;
    });
    expect(brokenImages).toBe(0);

    expect(errors).toEqual([]);
  });

  test('Reduced Motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.locator('.premium-digital-twin')).toBeVisible();

    const pausePlay = page.locator('.pause-control');
    await expect(pausePlay).toBeVisible();
  });

});
