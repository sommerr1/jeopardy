import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // СПОСОБ 1: Оставить только Chromium (текущий подход)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // СПОСОБ 2: Использовать переменную окружения для выбора браузера
  // projects: process.env.BROWSER === 'firefox' ? [
  //   {
  //     name: 'firefox',
  //     use: { ...devices['Desktop Firefox'] },
  //   },
  // ] : process.env.BROWSER === 'webkit' ? [
  //   {
  //     name: 'webkit',
  //     use: { ...devices['Desktop Safari'] },
  //   },
  // ] : [
  //   {
  //     name: 'chromium',
  //     use: { ...devices['Desktop Chrome'] },
  //   },
  // ],

  // СПОСОБ 3: Использовать теги для выбора браузеров
  // projects: [
  //   {
  //     name: 'chromium',
  //     use: { ...devices['Desktop Chrome'] },
  //     grep: /@chromium/,
  //   },
  //   {
  //     name: 'firefox',
  //     use: { ...devices['Desktop Firefox'] },
  //     grep: /@firefox/,
  //   },
  // ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
}); 