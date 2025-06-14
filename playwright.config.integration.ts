import { defineConfig } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from Domain's .env file
config({ path: path.resolve(__dirname, 'apps/domain/.env') })

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
    ['line'],
    ['html', { 
      outputFolder: './tests/reports/html-report', 
      open: process.env.PLAYWRIGHT_OPEN_REPORT === 'true' ? 'on-failure' : 'never' 
    }],
    ['json', { outputFile: './tests/reports/results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'integration-domain',
      testMatch: /integration\/domain\/.*\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:8766'
      }
    },
    {
      name: 'integration-edge', 
      testMatch: /integration\/edge\/.*\.spec\.ts/,
      use: { 
        baseURL: 'http://localhost:8787'
      }
    },
    {
      name: 'e2e-cli',
      testMatch: /e2e\/cli\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:8787'
      }
    }
  ],

  webServer: [
    {
      command: 'pnpm domain:dev',
      url: 'http://localhost:8766/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'pnpm edge:dev',
      url: 'http://localhost:8787/health', 
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ]
})