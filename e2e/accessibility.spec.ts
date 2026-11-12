import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { DEMO_ADMIN, DEMO_USER, loginAs } from './helpers';

/** Run axe against WCAG 2.1 A/AA rules and fail on any violation. */
async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`,
  );
  expect(summary, summary.join('\n')).toEqual([]);
}

const publicPages = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/community',
  '/about',
  '/partners',
  '/resources',
  '/privacy',
  '/terms',
  '/copyright',
];

const memberPages = [
  '/calculator',
  '/certificates',
  '/impact',
  '/account',
  '/account/cards',
  '/feedback',
];

const adminPages = [
  '/admin/users',
  '/admin/feedback',
  '/admin/public-feedback',
];

test.describe('accessibility (axe, WCAG 2.1 AA)', () => {
  for (const path of publicPages) {
    test(`public: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectNoA11yViolations(page);
    });
  }

  test('member pages', async ({ page }) => {
    await loginAs(page, DEMO_USER);
    for (const path of memberPages) {
      await test.step(path, async () => {
        await page.goto(path);
        await expectNoA11yViolations(page);
      });
    }
  });

  test('admin pages', async ({ page }) => {
    await loginAs(page, DEMO_ADMIN);
    for (const path of adminPages) {
      await test.step(path, async () => {
        await page.goto(path);
        await expectNoA11yViolations(page);
      });
    }
  });
});

test.describe('keyboard navigation', () => {
  test('a skip link moves focus to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('the login form can be completed with the keyboard alone', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^Email:?$/).focus();
    await page.keyboard.type(DEMO_USER.email);
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/^Password:?$/)).toBeFocused();
    await page.keyboard.type(DEMO_USER.password);
    await page.keyboard.press('Enter');
    await expect(page.getByText(`Hello, ${DEMO_USER.name}`)).toBeVisible();
  });

  test('every page has exactly one level-one heading', async ({ page }) => {
    for (const path of publicPages) {
      await page.goto(path);
      await expect(page.locator('h1'), path).toHaveCount(1);
    }
  });
});
