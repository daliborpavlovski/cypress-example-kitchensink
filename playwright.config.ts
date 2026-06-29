/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './playwright-tests/tests',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,

  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false }],
  ],

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
})
