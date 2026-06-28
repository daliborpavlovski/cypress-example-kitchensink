import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Directory where test files live
  testDir: './playwright-tests/tests',

  // Timeout per test (ms)
  timeout: 30_000,

  // Stop on first failure in CI; run all locally
  fullyParallel: false,
  retries: 0,

  reporter: [
    ['list'],
    // Allure reporter — generates raw results in allure-results/
    // Run: npx allure generate allure-results --clean && npx allure open
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false }],
  ],

  use: {
    baseURL: 'http://localhost:8080',
    // Keep traces on failure to aid debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
