import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { DEMO_USER, answerCalculator, loginAs } from './helpers';

test.describe('Green Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, DEMO_USER);
  });

  test('scores an assessment, awards a certificate and records it in history', async ({ page }) => {
    // Reduced motion skips the result dialog's zoom-in, so axe sees final colours.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/pages/calculator/green_calculator.php');
    await expect(page.getByRole('heading', { level: 1, name: /Green Calculator/ })).toBeVisible();

    // 7 Green + 2 Amber + 1 Red = 80 → Gold
    await answerCalculator(page, ['Green', 'Green', 'Green', 'Green', 'Green', 'Green', 'Green', 'Amber', 'Amber', 'Red']);
    await page.getByRole('button', { name: /Calculate My Score/ }).click();

    const result = page.getByRole('dialog');
    await expect(result).toBeVisible();
    await expect(result).toContainText('80 / 100');
    await expect(result.getByRole('heading', { name: /Certificate of Gold/ })).toBeVisible();

    const axe = await new AxeBuilder({ page }).include('#resultModal').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 80)} ${n.any[0]?.message ?? ''}`))).toEqual([]);

    await result.getByRole('link', { name: /Download Certificate/ }).click();
    await expect(page.getByText('This certifies that')).toBeVisible();
    await expect(page.getByText('Assessment Score: 80 / 100')).toBeVisible();
    await expect(page.getByText(/GS-\d{4}-\d{6}/).first()).toBeVisible();

    await page.getByRole('link', { name: /Back to History/ }).click();
    await expect(page.getByRole('heading', { name: /Certificate History/ })).toBeVisible();
    await expect(page.locator('.cert-card').first()).toContainText('Certificate of Gold');
  });

  test('a lower score offers Buy Points, which upgrades the latest certificate', async ({ page }) => {
    await page.goto('/pages/calculator/green_calculator.php');
    // 5 Green + 5 Amber = 75 → Silver, 25 points short
    await answerCalculator(page, ['Green', 'Green', 'Green', 'Green', 'Green', 'Amber', 'Amber', 'Amber', 'Amber', 'Amber']);
    await page.getByRole('button', { name: /Calculate My Score/ }).click();

    const result = page.getByRole('dialog');
    await expect(result.getByRole('heading', { name: /Certificate of Silver/ })).toBeVisible();
    await expect(result).toContainText('25 points');

    // Tampering with the URL must not change the price.
    await page.goto('/pages/calculator/buy_points.php?shortfall=1');
    await expect(page.getByText(/25 points/)).toBeVisible();
    await page.getByRole('button', { name: /Confirm £250\.00 Contribution/ }).click();
    await expect(page.getByText(/updated to/)).toContainText('Certificate of Gold');
  });

  test('incomplete answers are not accepted', async ({ page }) => {
    await page.goto('/pages/calculator/green_calculator.php');
    // Bypass the browser's own "required" check to exercise the server-side validation.
    await page.locator('form', { has: page.locator('select') }).evaluate((form) => form.setAttribute('novalidate', ''));
    await page.getByRole('button', { name: /Calculate My Score/ }).click();
    await expect(page.getByRole('alert')).toContainText('Please choose Green, Amber or Red for every measure.');
  });

  test('My Impact shows a badge level', async ({ page }) => {
    await page.goto('/pages/user/my_impact.php');
    await expect(page.getByRole('heading', { level: 1, name: /My Sustainability Impact/ })).toBeVisible();
    await expect(page.getByText(/Current Badge:\s*Level \d+/)).toBeVisible();
  });
});
