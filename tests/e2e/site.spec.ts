import { test, expect } from '@playwright/test';

test.describe('Humpback Hydro Site Verification', () => {

  test('Mobile and tablet navigation contains keyboard focus and restores scrolling', async ({ page }) => {
    for (const width of [390, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/', { waitUntil: 'networkidle' });
      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();
      await expect(page.locator('#mobile-navigation a').first()).toBeFocused();
      await expect(page.locator('main')).toHaveAttribute('inert', '');
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#mobile-navigation a').last()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('main')).not.toHaveAttribute('inert');
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    }
  });

  test('Application keyboard selection preserves partnership intent', async ({ page }) => {
    await page.goto('/applications', { waitUntil: 'networkidle' });
    const tabs = page.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', await tabs.nth(1).getAttribute('id') as string);
    await page.keyboard.press('End');
    await expect(tabs.last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.first()).toBeFocused();
    await page.getByRole('tabpanel').getByRole('link').click();
    await expect(page.locator('#pathway')).toHaveValue('Data-Center Power Opportunity');
    await expect(page.locator('#message')).toHaveValue(/data centers/i);
    await page.goto('/partners?interest=utilities');
    await expect(page.locator('#pathway')).toHaveValue('Utility Integration');
    await page.goto('/partners?interest=water');
    await expect(page.locator('#message')).toHaveValue(/water/i);
    await page.locator('#message').fill('A site-specific inquiry.');
    await expect(page.locator('#message')).toHaveValue('A site-specific inquiry.');
  });

  test('Homepage content remains visible without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hydropower. Reimagined.');
    expect(await page.locator('[data-reveal]').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1'))).toBe(true);
    await context.close();
  });

  test('Public routes reflow and serve canonical metadata', async ({ page }) => {
    test.setTimeout(120000);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ['/', '/technology', '/applications', '/impact', '/economics', '/evidence', '/company', '/partners']) {
        await page.goto(route);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://humpbackenergy.com${route}`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto('/company');
    expect(await page.locator('h1').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const sitemap = await page.request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(8);
  });

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

    await expect(page.getByRole('heading', { name: 'Hydropower. Reimagined.', level: 1 })).toBeVisible();
    await expect(page.getByText('Generation • Storage • Automated Dispatch')).toBeVisible();
    await expect(page.locator('.premium-digital-twin')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    await expect(page.locator('a[href="/technology"]').first()).toBeVisible();
    expect(errors.filter(error => !error.includes('404'))).toEqual([]);
  });

  test('V4 Digital Twin and SVG flow vectors', async ({ page }) => {
    await page.goto('/');

    const twin = page.locator('[data-v4-twin]');
    const autoCycle = page.getByRole('button', { name: 'Auto Cycle' });
    const lowerGen = page.getByRole('button', { name: 'Lower Generation' });
    const charging = page.getByRole('button', { name: 'Charging' });
    const upperGen = page.getByRole('button', { name: 'Upper Generation' });
    const cycleSummary = page.getByRole('button', { name: 'Cycle Summary' });
    const pausePlay = page.locator('.pause-control');

    await expect(autoCycle).toBeVisible();
    await expect(lowerGen).toBeVisible();
    await expect(page.locator('.premium-twin-flow-vectors')).toHaveAttribute('viewBox', '0 0 1600 900');
    await expect(page.locator('[data-flow-vector-route]')).toHaveCount(5);

    const canvas = page.locator('.premium-twin-stage canvas');
    await expect(canvas).toHaveAttribute('width', /^\d+$/);

    const activate = async (
      button: ReturnType<typeof page.getByRole>,
      operation: 'lower' | 'charge' | 'upper',
      expectedColor: string,
    ) => {
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(twin).toHaveAttribute('data-active-operation', operation);
      const groups = page.locator(`.premium-twin-flow-group.is-${operation}`);
      await expect(groups.first()).toHaveCSS('color', expectedColor);
      await expect.poll(async () => groups.first().evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.2);
      const transforms = await groups.locator('[data-vector-arrow]').evaluateAll(elements => elements.map(element => element.getAttribute('transform')));
      expect(transforms.length).toBeGreaterThan(0);
      expect(transforms.every(Boolean)).toBe(true);
    };

    await activate(lowerGen, 'lower', 'rgb(72, 185, 255)');
    await expect(page.getByText('LOWER GENERATION', { exact: true }).first()).toBeVisible();
    await activate(charging, 'charge', 'rgb(80, 227, 138)');
    await activate(upperGen, 'upper', 'rgb(183, 140, 255)');

    await cycleSummary.click();
    await expect(cycleSummary).toHaveAttribute('aria-pressed', 'true');
    await expect(twin).not.toHaveAttribute('data-active-operation', /.+/);

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
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('Company', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/company');

    await expect(page.locator('#leadership')).toBeVisible();
    await expect(page.locator('img[src*="humpback-team-vancouver.webp"]')).toBeVisible();

    const gustavoImg = page.locator('img[src*="gustavo-varela-latouche.webp"]');
    await gustavoImg.scrollIntoViewIfNeeded();
    await expect(gustavoImg).toBeVisible();
    await expect(page.locator('img[src*="chris-calvin.webp"]')).toBeVisible();

    const bryan = page.getByText('Bryan Green').first();
    await bryan.scrollIntoViewIfNeeded();
    await expect(bryan).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Bryce Huston', level: 2 })).toBeVisible();
    await expect(page.getByText('Information Security • AI Systems • Digital Infrastructure')).toBeVisible();
    await expect(page.getByText('FOUNDER & SYSTEMS ARCHITECT')).toBeVisible();
    await expect(page.locator('.leadership-credential dd')).toHaveText('HUSTON SOLUTION INC.');
    await expect(page.getByText('Founder • HUSTON SOLUTION INC.', { exact: true })).toBeVisible();
    await expect(page.locator('.bryce-profile .leadership-biography p')).toHaveText([
      'Bryce Huston is Chief Information Security Officer at Humpback Hydro and founder of HUSTON SOLUTION INC., a technology company focused on applied artificial intelligence, automation, software systems and digital infrastructure.',
      'A hands-on systems architect and technical operator, Bryce builds production platforms that combine real-time data acquisition, quantitative analysis, automated decision systems, secure cloud infrastructure and operational monitoring. His work spans high-frequency intelligence platforms, AI-enabled business automation, full-stack digital products and security research—turning complex technical concepts into deployed systems built for reliability, speed and measurable performance.',
      'At Humpback Hydro, Bryce leads information security and digital infrastructure strategy. His mandate is to establish the secure, scalable digital foundation supporting engineering collaboration, data integrity, operational continuity and future platform growth. He brings an execution-focused approach to the leadership team: architect the system, control the risk and build the infrastructure required to scale.',
    ]);

    const assertBryanNameTreatment = async () => {
      const metrics = await page.locator('.leadership-name-inline').evaluateAll(elements => elements.map(element => {
        const suffix = element.querySelector<HTMLElement>('.leadership-name-suffix');
        const parent = element.closest<HTMLElement>('h2, h3');
        if (!suffix || !parent) return null;
        const primarySize = Number.parseFloat(getComputedStyle(element).fontSize);
        const suffixSize = Number.parseFloat(getComputedStyle(suffix).fontSize);
        const rect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        return {
          ratio: suffixSize / primarySize,
          oneLine: rect.height <= primarySize * 1.25,
          withinViewport: rect.left >= 0 && rect.right <= window.innerWidth,
          withinHeading: rect.right <= parentRect.right + 1,
        };
      }));
      expect(metrics.length).toBe(2);
      expect(metrics.every(metric => metric && metric.ratio >= 0.48 && metric.ratio <= 0.55)).toBe(true);
      expect(metrics.every(metric => metric?.oneLine && metric.withinViewport && metric.withinHeading)).toBe(true);
    };

    const mark = page.getByText('Mark Legacy').first();
    await mark.scrollIntoViewIfNeeded();
    await expect(mark).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    const brokenImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth === 0).length;
    });
    expect(brokenImages).toBe(0);

    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await assertBryanNameTreatment();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
      const credit = page.locator('.footer-legal > span').last();
      await expect(credit).toHaveText('HUMPBACK HYDRO © 2026 | SITE BY HUSTON SOLUTION INC.');
      const creditLink = credit.getByRole('link', { name: 'HUSTON SOLUTION INC.', exact: true });
      await expect(creditLink).toHaveAttribute('href', 'https://www.brycehuston.com/solutions');
      await expect(creditLink).toHaveAttribute('target', '_blank');
      await expect(page.getByRole('link', { name: 'Current Website', exact: true })).toHaveCount(0);
      await creditLink.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(creditLink).toBeFocused();
      for (const [name, locator] of [
        ['leadership', page.locator('.leadership-list')],
        ['bryce-profile', page.locator('.bryce-profile')],
        ['footer', page.locator('.site-footer')],
      ] as const) {
        await locator.scrollIntoViewIfNeeded();
        await expect(locator).toBeVisible();
        // Exclude the fixed navigation from isolated component captures.
        await locator.screenshot({ path: `test-results/company-${name}-${width}.png`, animations: 'disabled', style: '.site-header { visibility: hidden !important; }' });
      }
    }
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

    await expect(page.getByRole('heading', { name: 'Net Positive Marine Infrastructure', exact: true })).toBeVisible();
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
    const lowerGen = page.getByRole('button', { name: 'Lower Generation' });
    await lowerGen.click();

    const arrows = page.locator('.premium-twin-flow-group.is-lower [data-vector-arrow]');
    await expect(arrows.first()).toHaveAttribute('transform', /translate/);
    const before = await arrows.evaluateAll(elements => elements.map(element => element.getAttribute('transform')));
    await page.waitForTimeout(150);
    const after = await arrows.evaluateAll(elements => elements.map(element => element.getAttribute('transform')));
    expect(after).toEqual(before);

    const pausePlay = page.locator('.pause-control');
    await expect(pausePlay).toBeVisible();
  });

});
