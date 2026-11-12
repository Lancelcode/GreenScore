import { test, expect } from '@playwright/test';
import { DEMO_ADMIN, DEMO_USER, loginAs, unique } from './helpers';

test.describe('community board', () => {
  test('a member can post, edit and delete a tip', async ({ page }) => {
    await loginAs(page, DEMO_USER);
    await page.goto('/community');

    const text = `Fitted motion-sensor lighting in meeting rooms (${unique()})`;
    await page.getByLabel('Share a tip').fill(text);
    await page.getByRole('button', { name: /Post Tip/ }).click();

    const tip = page.locator('[id^="tip-"]', { hasText: text });
    await expect(tip).toBeVisible();

    await tip.getByRole('button', { name: /Edit/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit Tip' });
    const edited = `${text} — edited`;
    await dialog.getByLabel('Your tip').fill(edited);
    await dialog.getByRole('button', { name: /Save Changes/ }).click();

    const editedTip = page.locator('[id^="tip-"]', { hasText: edited });
    await expect(editedTip).toBeVisible();

    await editedTip.getByRole('button', { name: /Delete/ }).click();
    await expect(editedTip).toHaveCount(0);
    await page.reload();
    await expect(page.locator('[id^="tip-"]', { hasText: edited })).toHaveCount(0);
  });

  test('search filters the tips', async ({ page }) => {
    await page.goto('/community');
    await page.getByRole('searchbox', { name: 'Search tips' }).fill('solar');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText(/result/)).toBeVisible();
    await expect(page.locator('[id^="tip-"]').first()).toContainText(/solar/i);
  });
});

test.describe('admin area', () => {
  test('an admin can open user management and feedback moderation', async ({ page }) => {
    await loginAs(page, DEMO_ADMIN);
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /Manage Users/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /Active Users/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: DEMO_USER.email })).toBeVisible();

    await page.goto('/admin/feedback');
    await expect(page.getByRole('heading', { name: /Admin Feedback Panel/ })).toBeVisible();
  });

  test('a normal member is refused admin pages', async ({ page }) => {
    await loginAs(page, DEMO_USER);
    const response = await page.goto('/admin/users');
    expect(response?.status()).toBe(403);
  });
});
