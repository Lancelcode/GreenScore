import { expect, type Page } from '@playwright/test';

/** Demo accounts from database/gradedunit.sql. */
export const DEMO_USER = { email: 'hello@ecoventures.com', password: 'GreenDemo2026', name: 'EcoVentures' };
export const DEMO_ADMIN = { email: 'admin@greenscore.com', password: 'GreenAdmin2026', name: 'GreenScore Admin' };
export const DEACTIVATED_USER = { email: 'info@blueplanet.co.uk', password: 'GreenDemo2026' };

/** A unique suffix so tests can create fresh records on a shared database. */
export const unique = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/pages/auth/login.php');
  await page.getByLabel(/^Email:?$/).fill(email);
  await page.getByLabel(/^Password:?$/).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}

export async function loginAs(page: Page, account: { email: string; password: string; name: string }): Promise<void> {
  await login(page, account.email, account.password);
  await expect(page).toHaveURL(/\/index\.php$/);
  // On phones the greeting lives inside the collapsed menu, so check it exists rather than is visible.
  await expect(page.getByText(`Hello, ${account.name}`)).toBeAttached();
}

export async function logout(page: Page): Promise<void> {
  // On narrow screens the nav is collapsed behind the toggler.
  const toggler = page.getByRole('button', { name: 'Toggle navigation' });
  if (await toggler.isVisible()) {
    await toggler.click();
  }
  await page.getByRole('button', { name: 'Logout' }).click();
  // Role queries ignore links inside the collapsed mobile menu, so match by URL.
  await expect(page.locator('header a[href$="/pages/auth/login.php"]')).toBeAttached();
  await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
}

/** Answer every calculator measure with the given level labels, in order. */
export async function answerCalculator(page: Page, levels: Array<'Green' | 'Amber' | 'Red'>): Promise<void> {
  const selects = page.locator('select[name^="measure_"]');
  await expect(selects).toHaveCount(levels.length);
  for (let i = 0; i < levels.length; i++) {
    const value = { Green: '10', Amber: '5', Red: '0' }[levels[i]];
    await selects.nth(i).selectOption(value);
  }
}
