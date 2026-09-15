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
    await expect(page.getByRole('button', { name: 'Open Calculator' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Full Economics' })).toHaveAttribute('href', '/economics');
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

  test('Economics scenario views and calculator preserve the model boundary', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/economics', { waitUntil: 'networkidle' });

    const scenarioTabs = page.locator('[data-economics-scenario-selector]').getByRole('tab');
    await expect(scenarioTabs).toHaveCount(3);
    await scenarioTabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(scenarioTabs.nth(1)).toBeFocused();
    await expect(scenarioTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('No numeric storage or arbitrage output is published');
    await page.keyboard.press('End');
    await expect(scenarioTabs.last()).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('Generation, Storage & Dispatch');

    const calculator = page.locator('[data-economics-calculator] [data-opsh-calculator="embedded"]');
    await expect(calculator).toBeVisible();
    await expect(page.locator('[data-opsh-calculator-trigger]')).toHaveCount(0);
    await expect(calculator.getByText('Annual Post-Debt Retained Cash Flow')).toHaveCount(0);
    await expect(calculator.getByText('Illustrative Simple Payback')).toHaveCount(0);
    await expect(calculator.getByText('Modeled Annual Generation')).toHaveCount(0);
    await expect(calculator.getByText('Pre-Debt Retained Cash Flow')).toHaveCount(0);
    await expect(page.getByText('9.6 Years')).toHaveCount(0);
    await expect(page.getByText('retained by client')).toHaveCount(0);
    await expect(page.getByText('tCO₂')).toHaveCount(0);

    await expect(calculator.getByText('Annual Energy Sensitivity', { exact: true })).toBeVisible();
    await expect(calculator.getByText('Gross Electricity-Sale Sensitivity', { exact: true })).toBeVisible();
    await expect(calculator.getByText('Before Charging Energy and All Project Costs', { exact: true })).toBeVisible();
    await calculator.getByText('Model Details & Assumptions', { exact: true }).click();
    await expect(calculator.getByText('Annual Energy Formula', { exact: true })).toBeVisible();
    await expect(calculator.getByText('No Return or Carbon Result', { exact: true })).toBeVisible();

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await calculator.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
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
    await expect(page.getByText('Generation • Storage • Dispatch Architecture')).toBeVisible();
    await expect(page.locator('.premium-digital-twin')).toBeVisible();
    await expect(page.locator('#platform + #economics')).toBeVisible();
    await expect(page.locator('#economics [data-opsh-calculator="embedded"]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open Calculator' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.home-economics-teaser')).toContainText('Generation · Storage · Integrated');
    await expect(page.locator('#economics').getByRole('link', { name: 'Explore Full Economics' })).toHaveAttribute('href', '/economics');
    await expect(page.locator('.site-footer').getByRole('link', { name: 'Calculator', exact: true })).toHaveAttribute('href', '/#economics');

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
    const cycleSummary = page.getByRole('button', { name: 'Sequence Summary' });
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

    await expect(page.locator('#economics [data-opsh-calculator="embedded"]')).toBeHidden();
  });

  test('Homepage calculator progressively discloses and explains the shared model accessibly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.locator('.home-calculator-toggle');
    await expect(toggle).toHaveAccessibleName('Open Calculator');
    const calculator = page.locator('#homepage-economics-calculator');
    await expect(calculator).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(calculator).toBeVisible();

    const explainerTrigger = page.getByRole('button', { name: 'How This Model Works' });
    await explainerTrigger.click();
    const explainer = page.getByRole('dialog', { name: 'How This Model Works' });
    await expect(explainer).toBeVisible();
    await expect(explainer.getByText('Energy In', { exact: true })).toBeVisible();
    await expect(explainer.getByText('Store', { exact: true })).toBeVisible();
    await expect(explainer.getByText('Generate', { exact: true })).toBeVisible();
    await expect(explainer.getByText('Dispatch', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close how this model works' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(explainer).toHaveCount(0);
    await expect(explainerTrigger).toBeFocused();

    await page.getByRole('button', { name: 'Collapse', exact: true }).click();
    await expect(calculator).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('Hero, footer and direct URL open the same homepage calculator', async ({ page }) => {
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const heroLink = page.locator('.home-hero').getByRole('link', { name: 'Open Calculator' });
      await heroLink.click();
      await expect(page).toHaveURL(/\/#economics$/);
      await expect(page.locator('#homepage-economics-calculator')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.getByRole('button', { name: 'Collapse', exact: true }).click();
      const footerLink = page.locator('.site-footer').getByRole('link', { name: 'Calculator', exact: true });
      await footerLink.scrollIntoViewIfNeeded();
      await footerLink.click();
      await expect(page).toHaveURL(/\/#economics$/);
      await expect(page.locator('#homepage-economics-calculator')).toBeVisible();
      const section = page.locator('#economics');
      await expect(section).toBeVisible();
      await expect.poll(async () => section.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(69);
      await expect.poll(async () => section.evaluate(element => element.getBoundingClientRect().top)).toBeLessThanOrEqual(90);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.goto('/#economics');
      await expect(page.locator('#homepage-economics-calculator')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }

    await page.goto('/partners');
    await page.locator('.site-footer').getByRole('link', { name: 'Calculator', exact: true }).click();
    await expect(page).toHaveURL(/\/#economics$/);
    await expect(page.locator('#homepage-economics-calculator')).toBeVisible();
    await expect(page.locator('.footer-grid')).not.toContainText('Vancouver, Canada');
    await expect(page.locator('.footer-legal')).toContainText('Vancouver, Canada');
  });

  test('Company', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/company');

    await expect(page.locator('#leadership')).toBeVisible();
    await expect(page.locator('img[src*="humpback-team-vancouver.webp"]')).toBeVisible();

    const bryceImg = page.locator('img[src*="bryce-huston.webp"]');
    await bryceImg.scrollIntoViewIfNeeded();
    await expect(bryceImg).toBeVisible();
    await expect(page.locator('img[src*="mark-legacy.webp"]')).toBeVisible();

    const bryan = page.getByText('Bryan Green').first();
    await bryan.scrollIntoViewIfNeeded();
    await expect(bryan).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Bryce Huston', level: 2 })).toBeVisible();
    await expect(page.getByText('Information Security • AI Systems • Digital Infrastructure')).toBeVisible();
    await expect(page.getByText('FOUNDER & SYSTEMS ARCHITECT')).toBeVisible();
    await expect(page.locator('#bryce-huston-profile').locator('..').getByRole('link', { name: 'HUSTON SOLUTION INC.', exact: true })).toBeVisible();
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
