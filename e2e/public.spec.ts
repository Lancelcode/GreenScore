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
    ['/pages/info/about.php', /Why GreenScore/],
    ['/pages/info/partner.php', /Partners/],
    ['/pages/info/green_resources.php', /Green Resources/],
    ['/pages/info/privacy.php', /Privacy/],
    ['/pages/info/terms.php', /Terms/],
  ] as const) {
    test(`${path} renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });
  }

  test('community board is readable without logging in and hides emails', async ({ page }) => {
    await page.goto('/pages/community/community.php');
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
    for (const path of ['/pages/calculator/green_calculator.php', '/pages/user/my_impact.php', '/pages/user/user_account.php']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/pages\/auth\/login\.php$/);
    }
  });

  test('internal files are not served', async ({ request }) => {
    for (const path of ['/database/gradedunit.sql', '/includes/connect_db.php', '/src/Scoring.php', '/composer.json']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(403);
    }
  });

  test('health endpoint reports ok', async ({ request }) => {
    const response = await request.get('/health.php');
    expect(response.ok()).toBeTruthy();
    expect((await response.text()).trim()).toBe('ok');
  });
});
