# Story 2: Playwright Framework Setup

## Objective
Establish Playwright testing infrastructure for integration and E2E testing, creating a robust foundation for cross-tier testing with proper fixtures, utilities, and CI/CD integration.

## Background
Currently, integration and E2E testing is fragmented across different tools (Supertest, custom integration tests). Playwright provides a unified platform for both API testing and CLI automation with superior debugging and reliability features.

## Scope

### In Scope
- Install and configure Playwright with latest best practices
- Set up test fixtures and utilities for reusable patterns
- Configure local development server integration
- Establish CI/CD pipeline integration
- Create test organization and naming conventions
- Configure debugging and reporting tools

### Out of Scope
- Actual test implementation (covered in Stories 3-5)
- Legacy test migration
- Performance testing setup
- Visual regression testing

## Technical Requirements

### Dependencies to Install
```json
{
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@playwright/experimental-ct-react": "^1.50.0"
  }
}
```

### Project Structure
```
tests/
├── playwright.config.ts          # Main configuration
├── fixtures/                     # Test utilities and fixtures  
│   ├── base-fixtures.ts          # Common test fixtures
│   ├── auth-fixtures.ts          # Authentication helpers
│   └── server-fixtures.ts        # Server management
├── integration/                  # API integration tests
│   ├── domain/                   # Domain API tests
│   └── edge/                     # Edge API tests
├── e2e/                         # End-to-end tests
│   └── cli/                     # CLI workflow tests
├── utils/                       # Shared utilities
│   ├── test-data.ts             # Test data factories
│   ├── assertions.ts            # Custom assertions
│   └── helpers.ts               # Common helpers
└── reports/                     # Test artifacts
    ├── html-report/
    ├── traces/
    └── screenshots/
```

### Playwright Configuration
```typescript
// tests/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/reports/test-results',
  
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
```

### Base Fixtures
```typescript
// tests/fixtures/base-fixtures.ts
import { test as base, expect } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

type TestFixtures = {
  apiContext: APIRequestContext
  authToken: string
  testData: TestDataFactory
}

export const test = base.extend<TestFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: 'http://localhost:8787',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    await use(context)
    await context.dispose()
  },

  authToken: async ({ apiContext }, use) => {
    // Setup authentication if needed
    const response = await apiContext.post('/auth/login', {
      data: { username: 'test', password: 'test' }
    })
    const { token } = await response.json()
    await use(token)
  },

  testData: async ({}, use) => {
    const factory = new TestDataFactory()
    await use(factory)
    await factory.cleanup()
  }
})

export { expect }
```

### CLI Testing Fixtures
```typescript
// tests/fixtures/cli-fixtures.ts
import { test as base } from './base-fixtures'
import { spawn, ChildProcess } from 'child_process'

type CLIFixtures = {
  cli: CLITestHelper
}

export const cliTest = base.extend<CLIFixtures>({
  cli: async ({}, use) => {
    const helper = new CLITestHelper()
    await use(helper)
    await helper.cleanup()
  }
})

class CLITestHelper {
  private processes: ChildProcess[] = []

  async run(args: string[], options: { timeout?: number; input?: string } = {}) {
    return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve, reject) => {
      const child = spawn('node', ['apps/cli/dist/index.js', ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
      })
      
      this.processes.push(child)
      
      let stdout = ''
      let stderr = ''
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })
      
      if (options.input) {
        child.stdin?.write(options.input)
        child.stdin?.end()
      }
      
      const timeout = setTimeout(() => {
        child.kill()
        reject(new Error(`CLI command timed out after ${options.timeout || 10000}ms`))
      }, options.timeout || 10000)
      
      child.on('close', (exitCode) => {
        clearTimeout(timeout)
        resolve({ stdout, stderr, exitCode: exitCode || 0 })
      })
    })
  }

  async cleanup() {
    for (const process of this.processes) {
      if (!process.killed) {
        process.kill()
      }
    }
    this.processes = []
  }
}
```

### Test Data Factory
```typescript
// tests/utils/test-data.ts
export class TestDataFactory {
  private createdResources: string[] = []

  createPromptRequest(overrides = {}) {
    return {
      prompt: 'Hello, AI assistant!',
      provider: 'openrouter',
      model: 'anthropic/claude-3.5-sonnet',
      ...overrides
    }
  }

  createMessagesRequest(overrides = {}) {
    return {
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello!' }
      ],
      provider: 'openrouter', 
      ...overrides
    }
  }

  createStreamingRequest(overrides = {}) {
    return {
      ...this.createPromptRequest(),
      stream: true,
      ...overrides
    }
  }

  async cleanup() {
    // Cleanup any created test resources
    this.createdResources = []
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "test:playwright": "playwright test",
    "test:integration": "playwright test --project=integration-domain --project=integration-edge",
    "test:e2e": "playwright test --project=e2e-cli",
    "test:playwright:ui": "playwright test --ui",
    "test:playwright:debug": "playwright test --debug",
    "test:playwright:headed": "playwright test --headed",
    "test:playwright:report": "playwright show-report tests/reports/html-report"
  }
}
```

## Acceptance Criteria

### Installation & Configuration
- [ ] **Playwright installed**: Latest stable version configured correctly
- [ ] **Project structure**: Organized test directories and utilities
- [ ] **TypeScript support**: Full type safety and IntelliSense working
- [ ] **Configuration validated**: All config options working as expected

### Local Development Integration
- [ ] **Server auto-start**: Development servers start automatically for tests
- [ ] **Fast feedback**: Test execution starts within 5 seconds
- [ ] **Hot reload**: Test re-runs when test files change
- [ ] **Debug support**: VS Code debugging and Playwright inspector working

### Test Fixtures & Utilities
- [ ] **Base fixtures**: Common patterns abstracted into reusable fixtures
- [ ] **API context**: HTTP client configured with proper defaults
- [ ] **CLI helpers**: Command execution and output capture working
- [ ] **Test data**: Factory patterns for creating test data

### CI/CD Integration
- [ ] **GitHub Actions**: Playwright runs successfully in CI
- [ ] **Artifact collection**: Screenshots, traces, and reports saved
- [ ] **Parallel execution**: Tests run efficiently across workers
- [ ] **Retry logic**: Flaky tests automatically retried

### Reporting & Debugging
- [ ] **HTML reports**: Rich test reports with timeline and details
- [ ] **Trace viewer**: Full execution traces for failed tests
- [ ] **Screenshots**: Automatic capture on failures
- [ ] **Console output**: Clear test execution feedback

## Implementation Notes

### Development Workflow
1. **Setup verification**: Test Playwright installation with example test
2. **Server integration**: Ensure servers start/stop cleanly
3. **Fixture development**: Build reusable patterns incrementally
4. **CI validation**: Test pipeline integration early

### Best Practices Implementation
- **Page Object Model**: Consider for complex UI interactions
- **Fixture inheritance**: Layer fixtures for different test types
- **Custom assertions**: Create domain-specific assertion helpers
- **Test isolation**: Ensure tests can run independently
- **Parallelization**: Design for safe parallel execution

### Common Patterns
```typescript
// API testing pattern
test('domain endpoint validation', async ({ apiContext }) => {
  const response = await apiContext.post('/domain/llm/prompt', {
    data: { prompt: 'test' }
  })
  expect(response.status()).toBe(200)
  const data = await response.json()
  expect(data).toHaveProperty('content')
})

// CLI testing pattern  
test('CLI command execution', async ({ cli }) => {
  const result = await cli.run(['chat', 'hello'])
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toContain('Response')
})
```

### Performance Considerations
- **Parallel execution**: Configure appropriate worker count
- **Resource cleanup**: Ensure proper cleanup to prevent leaks
- **Server management**: Efficient server startup/shutdown
- **Test isolation**: Minimal setup/teardown overhead

## Dependencies
- **Upstream**: None (can start immediately)
- **Downstream**: Required for Stories 3, 4, 5
- **Blocking**: None

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Example tests created and passing
- [ ] CI/CD pipeline configured and tested
- [ ] Documentation completed
- [ ] Team training on Playwright patterns
- [ ] Performance benchmarks established 