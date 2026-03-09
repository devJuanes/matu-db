import { expect, test } from '@playwright/test';

test.describe('mobile preview', () => {
  test('renders phone preview and iframe', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/preview/mobile/home', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /preview movil/i })).toBeVisible();
    await expect(page.locator('iframe[title="MatuSimulator"]')).toBeVisible();
  });
});
