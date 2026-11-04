import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against a running GreenScore stack — by default the
 * docker compose stack on http://localhost:8080. Override with E2E_BASE_URL.
 *
 *   docker compose up -d --wait
 *   npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  // Tests share one database, so keep them in a predictable order.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
});
