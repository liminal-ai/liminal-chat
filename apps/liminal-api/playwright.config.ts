import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';
import { findProjectRoot } from './lib/utils/project-root';

// Load environment variables from project root
const rootDir = findProjectRoot(__dirname);
config({ path: path.join(rootDir, '.env') });

/**
 * Playwright configuration for Convex backend integration tests
 * Focused on wide coverage with minimal maintenance burden
 */
export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'line',

  use: {
    // Base URL for Convex backend HTTP endpoints
    baseURL: process.env.CONVEX_HTTP_URL || 'https://modest-squirrel-498.convex.site',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Single test suite for lean testing */
  projects: [
    {
      name: 'integration',
      testMatch: '*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Convex runs separately - no need for webServer config */
  // webServer: process.env.CI ? undefined : {
  //   command: 'cd .. && npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
