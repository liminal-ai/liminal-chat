# Feature 004: Testing Framework Modernization

## Overview
Modernize and consolidate testing architecture across all tiers, migrating to Vitest for unit tests and implementing Playwright for integration and E2E testing, creating a unified, high-performance testing strategy.

## Goals

1. **Framework Consolidation**: Single testing framework (Vitest) for all unit tests
2. **Performance Optimization**: Faster test execution and developer feedback loops
3. **Modern Tooling**: Latest testing best practices and tooling
4. **Comprehensive Coverage**: Systematic coverage across unit, integration, and E2E layers
5. **Developer Experience**: Streamlined testing workflow and debugging capabilities

## Architecture Evolution

### Current State
```
Domain:  Jest (123 unit tests) + Supertest integration
CLI:     Vitest (89 unit tests) + Custom integration  
Edge:    Vitest (6 unit tests) + Basic E2E
Total:   Mixed frameworks, incomplete coverage
```

### After Feature 004
```
All Tiers: Vitest (unified unit testing)
Integration: Playwright HTTP API testing (Edge + Domain)
E2E: Playwright + Node child_process (CLI workflows)
Total: Unified framework, comprehensive coverage
```

## Technical Foundation

### Framework Versions (2025)
- **Vitest**: v3.2.2+ (latest stable)
- **Playwright**: v1.50.0+ (latest stable)
- **SWC**: Latest for NestJS + Vitest compatibility
- **@testing-library/react**: v16.0+ for component testing

### Performance Targets
- **Unit test execution**: <2s per suite
- **Integration test startup**: <5s server boot
- **E2E test execution**: <10s per user workflow
- **Watch mode feedback**: <500ms change detection

## Implementation Stories

### Story 1: Domain Unit Test Migration
**Objective**: Migrate Domain tier from Jest to Vitest with SWC

**Scope**:
- Install Vitest + SWC configuration
- Migrate 123 existing Jest tests to Vitest syntax
- Maintain @nestjs/testing compatibility
- Preserve coverage thresholds

**Acceptance Criteria**:
- [ ] All 123 tests migrated and passing
- [ ] Coverage maintained at 75%+ (current level)
- [ ] Test execution time <2s (down from Jest baseline)
- [ ] @nestjs/testing module works correctly
- [ ] No breaking changes to CI pipeline

### Story 2: Playwright Framework Setup
**Objective**: Establish Playwright infrastructure for integration and E2E testing

**Scope**:
- Install and configure Playwright
- Set up test fixtures and utilities
- Configure CI/CD integration
- Establish test data patterns

**Acceptance Criteria**:
- [ ] Playwright installed and configured
- [ ] Local development server integration
- [ ] CI/CD pipeline configured
- [ ] Test fixture patterns established
- [ ] Debugging tools configured

### Story 3: Domain Integration Test Migration
**Objective**: Migrate Domain API testing to Playwright HTTP

**Scope**:
- Convert Supertest tests to Playwright API testing
- Test all Domain endpoints with real HTTP calls
- Implement error scenario testing
- Add streaming endpoint validation

**Acceptance Criteria**:
- [ ] All Domain endpoints covered
- [ ] Real HTTP validation (not mocked)
- [ ] Error scenarios tested
- [ ] Streaming endpoints validated
- [ ] Performance meets <5s startup target

### Story 4: Edge Integration Test Migration  
**Objective**: Implement comprehensive Edge API testing with Playwright

**Scope**:
- Test Edge proxy behavior
- Validate Edge → Domain communication
- Test error handling and timeouts
- Add load balancing scenario testing

**Acceptance Criteria**:
- [ ] All Edge endpoints covered
- [ ] Proxy behavior validated
- [ ] Cross-tier communication tested
- [ ] Error propagation verified
- [ ] Timeout scenarios covered

### Story 5: CLI E2E Test Implementation
**Objective**: Implement comprehensive CLI testing using Playwright + Node

**Scope**:
- CLI batch mode testing (non-interactive)
- CLI interactive mode testing
- Configuration and authentication flows
- Error handling and edge cases

**Acceptance Criteria**:
- [ ] All main CLI commands tested
- [ ] Interactive flows automated
- [ ] Configuration scenarios covered
- [ ] Authentication flows validated
- [ ] Error messages verified

### Story 6: Testing Playbook & Documentation
**Objective**: Create comprehensive testing guidelines and documentation

**Scope**:
- Testing strategy documentation
- Developer workflow guidelines  
- CI/CD best practices
- Debugging and troubleshooting guides

**Acceptance Criteria**:
- [ ] Testing playbook completed
- [ ] Developer onboarding guide
- [ ] CI/CD optimization documented
- [ ] Debugging workflows established
- [ ] Performance benchmarks documented

## Success Criteria

### Functional Requirements
- [ ] Single testing framework (Vitest) for all unit tests
- [ ] Comprehensive integration test coverage
- [ ] Complete E2E test automation
- [ ] Cross-tier test validation
- [ ] Unified CI/CD pipeline

### Technical Requirements
- [ ] 80% unit test coverage across all tiers
- [ ] 100% API endpoint coverage
- [ ] All main CLI workflows covered
- [ ] Performance targets met
- [ ] Zero flaky tests

### Operational Requirements
- [ ] Developer onboarding <30 minutes
- [ ] Test execution in CI <5 minutes
- [ ] Clear failure debugging
- [ ] Automated test maintenance
- [ ] Documentation completeness

## Configuration

### Vitest Configuration (Unified)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
})
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'integration',
      testMatch: '**/*.integration.spec.ts',
      use: { baseURL: 'http://localhost:8787' }
    },
    {
      name: 'e2e',
      testMatch: '**/*.e2e.spec.ts',
      use: { baseURL: 'http://localhost:8787' }
    }
  ],
  webServer: [
    {
      command: 'pnpm dev:edge',
      url: 'http://localhost:8787',
      reuseExistingServer: true
    },
    {
      command: 'pnpm dev:domain', 
      url: 'http://localhost:8766',
      reuseExistingServer: true
    }
  ]
})
```

## Testing Strategy

### Test Organization
```
tests/
├── unit/           # Vitest unit tests (all tiers)
├── integration/    # Playwright API tests
├── e2e/           # Playwright E2E tests  
├── fixtures/      # Test data and utilities
└── utils/         # Shared testing utilities
```

### Test Execution Modes
```bash
# Unit tests only (fast feedback)
pnpm test:unit

# Integration tests (API validation)
pnpm test:integration

# E2E tests (full workflows)
pnpm test:e2e

# All tests (CI pipeline)
pnpm test:all

# Watch mode (development)
pnpm test:watch
```

### CI/CD Optimization
- **Parallel execution**: Tests run in parallel across tiers
- **Dependency caching**: Node modules and Playwright browsers cached
- **Selective execution**: Only relevant tests run based on changes
- **Failure isolation**: Individual test failures don't block others
- **Artifact collection**: Screenshots, traces, and coverage reports

## Technical Implementation Notes

### SWC Integration for NestJS
```typescript
// Domain tier vitest.config.ts
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' }
    })
  ],
  test: {
    globals: true,
    environment: 'node'
  }
})
```

### Playwright Fixtures
```typescript
// test-fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup authentication
    await page.goto('/auth/login')
    // ... auth flow
    await use(page)
  }
})
```

### CLI Testing Pattern
```typescript
// CLI E2E test example
import { test, expect } from '@playwright/test'
import { spawn } from 'child_process'

test('CLI chat command', async () => {
  const cli = spawn('node', ['dist/index.js', 'chat', 'Hello'])
  
  let output = ''
  cli.stdout.on('data', (data) => {
    output += data.toString()
  })
  
  await new Promise(resolve => cli.on('close', resolve))
  expect(output).toContain('Response from AI')
})
```

## Migration Path
1. **Story 1**: Migrate Domain unit tests to Vitest
2. **Story 2**: Set up Playwright infrastructure  
3. **Stories 3-4**: Migrate integration tests tier by tier
4. **Story 5**: Implement CLI E2E automation
5. **Story 6**: Document and optimize

## Risk Mitigation
- **Breaking changes**: Thorough testing at each migration step
- **Performance regression**: Benchmark before/after migration
- **CI/CD disruption**: Parallel implementation with existing tests
- **Developer adoption**: Clear documentation and training
- **Test maintenance**: Automated test health monitoring

## Non-Goals
- **Visual regression testing**: Not included in this feature
- **Load/performance testing**: Separate future initiative
- **Cross-browser testing**: Focus on Node.js environments
- **Test generation**: Manual test writing for now 