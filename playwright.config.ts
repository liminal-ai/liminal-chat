import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/reports/test-results',
  
  // Only include playwright test files
  testMatch: /tests\/.+\.(spec|setup)\.ts$/,
  
  // Global test settings
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporting
  reporter: [
    ['html', { outputFolder: './tests/reports/html-report' }],
    ['json', { outputFile: './tests/reports/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'integration-domain',
      testMatch: /integration\/domain\/.*\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:8766',
        storageState: 'tests/fixtures/auth-state.json'
      },
      dependencies: ['setup']
    },
    {
      name: 'integration-edge', 
      testMatch: /integration\/edge\/.*\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:8787',
        storageState: 'tests/fixtures/auth-state.json'
      },
      dependencies: ['setup']
    },
    {
      name: 'e2e-cli',
      testMatch: /e2e\/cli\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:8787',
        storageState: 'tests/fixtures/auth-state.json'
      },
      dependencies: ['setup']
    }
  ],

  webServer: [
    {
      command: 'cd apps/edge && pnpm dev',
      url: 'http://localhost:8787/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'cd apps/domain && pnpm start:dev',
      url: 'http://localhost:8766/health', 
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ]
}) 