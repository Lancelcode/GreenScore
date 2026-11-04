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
  '/pages/auth/login.php',
  '/pages/auth/register.php',
  '/pages/auth/forgot_password.php',
  '/pages/community/community.php',
  '/pages/info/about.php',
  '/pages/info/partner.php',
  '/pages/info/green_resources.php',
  '/pages/info/privacy.php',
  '/pages/info/terms.php',
  '/pages/info/greenscore_copyright.php',
];

const memberPages = [
  '/pages/calculator/green_calculator.php',
  '/pages/calculator/certificate_history.php',
  '/pages/user/my_impact.php',
  '/pages/user/user_account.php',
  '/pages/user/view_cards.php',
  '/pages/info/feedback.php',
];

const adminPages = [
  '/pages/admin/manage_users.php',
  '/pages/admin/admin_feedback.php',
  '/pages/admin/public_feedback.php',
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
    await page.goto('/pages/auth/login.php');
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
