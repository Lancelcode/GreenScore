import { test, expect } from '@playwright/test';

test.describe('public pages', () => {
  test('home page introduces GreenScore and links to sign-up', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GreenScore/);
    await expect(page.getByRole('heading', { level: 1, name: /Welcome to GreenScore/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Join the Movement/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Badge Levels/ })).toBeVisible();
  });

  for (const [path, heading] of [
    ['/about', /Why GreenScore/],
    ['/partners', /Partners/],
    ['/resources', /Green Resources/],
    ['/privacy', /Privacy/],
    ['/terms', /Terms/],
  ] as const) {
    test(`${path} renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });
  }

  test('community board is readable without logging in and hides emails', async ({ page }) => {
    await page.goto('/community');
    await expect(page.getByRole('heading', { name: /Community Board/ })).toBeVisible();
    await expect(page.locator('[id^="tip-"]').first()).toBeVisible();
    await expect(page.locator('[id^="tip-"]').first()).toContainText(/^\s*🟢/);
    // Author email addresses must never be shown publicly.
    await expect(page.locator('main')).not.toContainText(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });

  test('unknown pages return the custom 404', async ({ page }) => {
    const response = await page.goto('/does-not-exist.php');
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/not found/i).first()).toBeVisible();
  });

  test('members-only pages redirect to login', async ({ page }) => {
    for (const path of ['/calculator', '/impact', '/account']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test('internal files are not served', async ({ request }) => {
    // Only the public/ folder is served; source, config and the database dump never are.
    for (const path of ['/database/gradedunit.sql', '/src/lib/scoring.ts', '/package.json', '/.env', '/next.config.ts']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    }
  });

  test('old PHP addresses redirect to their new pages', async ({ page }) => {
    for (const [legacy, current] of [
      ['/index.php', '/'],
      ['/pages/info/about.php', '/about'],
      ['/pages/community/community.php?search=solar', '/community?search=solar'],
    ] as const) {
      const response = await page.request.get(legacy, { maxRedirects: 0 });
      expect(response.status(), legacy).toBe(308);
      expect(response.headers()['location'], legacy).toBe(current);
    }
  });

  test('health endpoint reports ok', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    expect((await response.text()).trim()).toBe('ok');
  });
});
