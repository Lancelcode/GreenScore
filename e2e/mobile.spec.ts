import { test, expect, type Page } from '@playwright/test';
import { DEMO_USER, answerCalculator, loginAs, logout } from './helpers';

/** The page must not be wider than the viewport (no sideways scrolling). */
async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `page is ${overflow}px wider than the viewport`).toBeLessThanOrEqual(1);
}

const pages = [
  '/',
  '/login',
  '/register',
  '/community',
  '/about',
  '/partners',
  '/resources',
];

test.describe('mobile layout', () => {
  for (const path of pages) {
    test(`no horizontal scroll: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectNoHorizontalScroll(page);
    });
  }

  test('navigation collapses behind a menu button', async ({ page }) => {
    await page.goto('/');
    const toggler = page.getByRole('button', { name: 'Toggle navigation' });
    await expect(toggler).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeHidden();
    await toggler.click();
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
  });

  test('the calculator and its result fit on a phone', async ({ page }) => {
    await loginAs(page, DEMO_USER);
    await page.goto('/calculator');
    await expectNoHorizontalScroll(page);
    await answerCalculator(page, Array(10).fill('Green'));
    await page.getByRole('button', { name: /Calculate My Score/ }).click();
    await expect(page.getByRole('dialog')).toContainText('100 / 100');
    await expectNoHorizontalScroll(page);
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await logout(page);
  });

  test('member pages fit on a phone', async ({ page }) => {
    await loginAs(page, DEMO_USER);
    for (const path of ['/certificates', '/impact', '/account', '/account/cards']) {
      await test.step(path, async () => {
        await page.goto(path);
        await expectNoHorizontalScroll(page);
      });
    }
  });
});
