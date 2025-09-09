import { defineConfig, devices } from '@playwright/test';
import { TestConfig } from './tests/config/test-config';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: TestConfig.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for each action */
    actionTimeout: TestConfig.TIMEOUTS.MEDIUM,
    
    /* Global timeout for navigation */
    navigationTimeout: TestConfig.TIMEOUTS.LONG,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: TestConfig.BROWSERS.CHROMIUM,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: TestConfig.VIEWPORTS.DESKTOP,
      },
    },

    // {
    //   name: TestConfig.BROWSERS.FIREFOX,
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     viewport: TestConfig.VIEWPORTS.DESKTOP,
    //   },
    // },

    // {
    //   name: TestConfig.BROWSERS.WEBKIT,
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     viewport: TestConfig.VIEWPORTS.DESKTOP,
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { 
    //     ...devices['Pixel 5'],
    //     viewport: TestConfig.VIEWPORTS.MOBILE,
    //   },
    // },

    // {
    //   name: 'Mobile Safari',
    //   use: { 
    //     ...devices['iPhone 12'],
    //     viewport: TestConfig.VIEWPORTS.MOBILE,
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: TestConfig.BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: TestConfig.TIMEOUTS.VERY_LONG,
  },

  /* Global test timeout */
  timeout: TestConfig.TIMEOUTS.VERY_LONG,
  
  /* Expect timeout */
  expect: {
    timeout: TestConfig.TIMEOUTS.MEDIUM,
  },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
  
  /* Test output directory */
  outputDir: 'test-results/',
  
  /* Metadata for test reports */
  metadata: {
    project: 'Language Jeopardy',
    version: '1.0.0',
    environment: process.env.NODE_ENV || TestConfig.ENVIRONMENT.DEV,
  },
}); 