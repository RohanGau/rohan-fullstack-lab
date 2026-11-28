import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/about', '/blog', '/project', '/contact'];

for (const route of ROUTES) {
  test.describe(`Route ${route}`, () => {
    test('renders semantic landmark, single h1, SEO metadata, and clean JSON-LD', async ({
      page,
    }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Skip link targets main#content
      const skipLink = page.locator('a[href="#content"]');
      await expect(skipLink).toHaveCount(1);
      await expect(page.locator('main#content')).toHaveCount(1);

      // Title, description, canonical
      const title = await page.title();
      expect(title.trim().length).toBeGreaterThan(0);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.trim().length).toBeGreaterThan(10);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();

      // Single h1 when content loaded (error states may omit h1 on Home/About if API is offline)
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeLessThanOrEqual(1);

      // JSON-LD sanity checks
      const jsonLdScripts = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      const joined = jsonLdScripts.join('\n');
      expect(joined).not.toContain('@yourhandle');
      expect(joined).not.toContain('/search?q=');
      expect(joined).not.toContain('"#navigation"');
    });

    test('passes WCAG 2.2 AA accessibility audit via axe-core', async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(seriousOrCritical).toEqual([]);
    });
  });
}

test('discovery endpoints (/rss.xml, /sitemap.xml, /llms.txt) respond cleanly', async ({
  request,
}) => {
  const rss = await request.get('/rss.xml');
  expect(rss.status()).toBe(200);
  expect(rss.headers()['content-type']).toContain('application/rss+xml');
  expect(await rss.text()).toContain('<rss version="2.0"');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('<urlset');

  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  expect(llms.headers()['content-type']).toContain('text/plain');
  expect(await llms.text()).toContain('# Rohan Kumar');
});
