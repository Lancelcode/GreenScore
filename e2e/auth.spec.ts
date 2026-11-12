import { test, expect } from '@playwright/test';
import { DEACTIVATED_USER, DEMO_USER, login, loginAs, logout, unique } from './helpers';

test.describe('sign-up and login', () => {
  test('a new organisation can register, log in and log out', async ({ page }) => {
    const id = unique();
    const email = `e2e-${id}@example.co.uk`;
    const name = `E2E Org ${id}`.slice(0, 50);

    await page.goto('/register');
    await page.getByLabel(/^Name:?$/).fill(name);
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Company Name').fill('E2E Testing Ltd');
    await page.getByLabel('Contact Person').fill('Alex Tester');
    await page.getByLabel('Phone Number').fill('07700 900123');
    await page.getByLabel(/^Password:?$/).fill('Greener2026!');
    await page.getByLabel('Confirm Password').fill('Greener2026!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Account created successfully')).toBeVisible();

    await loginAs(page, { email, password: 'Greener2026!', name });
    await logout(page);
  });

  test('registration enforces the password policy', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/^Name:?$/).fill('Weak Password Ltd');
    await page.getByLabel('Email address').fill(`weak-${unique()}@example.co.uk`);
    await page.getByLabel('Company Name').fill('Weak Password Ltd');
    await page.getByLabel('Contact Person').fill('Sam');
    await page.getByLabel('Phone Number').fill('07700 900124');
    await page.getByLabel(/^Password:?$/).fill('alllowercase1');
    await page.getByLabel('Confirm Password').fill('alllowercase1');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('Password must contain at least one uppercase letter.')).toBeVisible();
  });

  test('a wrong password is rejected', async ({ page }) => {
    await login(page, DEMO_USER.email, 'NotTheRightPassword1');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Incorrect password.')).toBeVisible();
  });

  test('a deactivated account cannot log in', async ({ page }) => {
    await login(page, DEACTIVATED_USER.email, DEACTIVATED_USER.password);
    await expect(page.getByText(/deactivated/)).toBeVisible();
  });

  test('forgotten password page does not allow anonymous resets', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText(/ask a GreenScore administrator/)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });
});
