# Story 6: Testing Playbook & Documentation

## Objective
Create comprehensive testing guidelines, developer workflows, and documentation to ensure consistent testing practices across the team, enabling efficient onboarding and maintenance of the modernized testing infrastructure.

## Background
With the completion of the testing framework modernization, we need comprehensive documentation to guide developers in using the new testing tools effectively, establish best practices, and ensure consistent testing approaches across all future development.

## Scope

### In Scope
- Comprehensive testing strategy documentation
- Developer workflow guidelines and tutorials
- Testing best practices and patterns
- CI/CD optimization documentation
- Debugging and troubleshooting guides
- Performance benchmarking and monitoring
- Training materials and onboarding guides

### Out of Scope
- Code implementation (covered in previous stories)
- Tool configuration changes
- New testing features
- External documentation beyond testing

## Documentation Deliverables

### 1. Testing Strategy Playbook
```markdown
# Liminal Chat Testing Strategy Playbook

## Overview
This playbook defines our testing strategy across all tiers of the Liminal Chat application, providing guidance for developers on when, how, and what to test.

## Testing Pyramid

### Unit Tests (80% of tests)
- **Purpose**: Test individual functions/methods in isolation
- **Framework**: Vitest (unified across all tiers)
- **Coverage Target**: 80% overall, 90% for core domain logic
- **Execution Time**: <2 seconds per suite
- **When to Write**: For every new function, method, or business logic

### Integration Tests (15% of tests)  
- **Purpose**: Test API endpoints and cross-tier communication
- **Framework**: Playwright HTTP API testing
- **Coverage Target**: 100% of API endpoints
- **Execution Time**: <30 seconds per suite
- **When to Write**: For every new API endpoint or service integration

### E2E Tests (5% of tests)
- **Purpose**: Test complete user workflows
- **Framework**: Playwright + Node child_process
- **Coverage Target**: All critical user journeys
- **Execution Time**: <10 seconds per workflow
- **When to Write**: For every new user-facing feature

## Testing Layers by Tier

### Domain Tier Testing
- **Unit Tests**: Business logic, providers, validators
- **Integration Tests**: HTTP endpoints, database operations
- **Tools**: Vitest + @nestjs/testing, Playwright API
- **Mocking Strategy**: Mock external APIs, use real database for integration

### Edge Tier Testing  
- **Unit Tests**: Request/response transformation, validation
- **Integration Tests**: Proxy behavior, CORS, security headers
- **Tools**: Vitest, Playwright API
- **Mocking Strategy**: Mock Domain server for unit tests, real Domain for integration

### CLI Tier Testing
- **Unit Tests**: Command parsing, configuration, utilities
- **Integration Tests**: API client behavior
- **E2E Tests**: Complete CLI workflows
- **Tools**: Vitest, Playwright + child_process
- **Mocking Strategy**: Mock API calls for unit tests, real servers for E2E
```

### 2. Developer Workflow Guide
```markdown
# Testing Workflow Guide

## Daily Development Workflow

### 1. TDD Workflow (Recommended)
```bash
# 1. Write failing test
npm run test:watch -- tests/unit/my-feature.test.ts

# 2. Implement minimal code to pass
# 3. Refactor while keeping tests green
# 4. Add integration test
npm run test:integration -- --grep "my-feature"

# 5. Add E2E test if user-facing
npm run test:e2e -- --grep "my-feature"
```

### 2. Pre-Commit Workflow
```bash
# Run all tests locally before committing
npm run test:all

# Run linting and type checking
npm run lint && npm run typecheck

# Run coverage check
npm run test:coverage
```

### 3. Feature Development Workflow
1. **Start with E2E test** (if user-facing feature)
2. **Write integration tests** for API endpoints
3. **Write unit tests** for business logic
4. **Implement code** to make tests pass
5. **Refactor** while maintaining test coverage

## Test Organization Patterns

### File Naming Conventions
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e.spec.ts`
- Test utilities: `*.util.ts`
- Test fixtures: `*.fixture.ts`

### Test Structure Pattern
```typescript
describe('FeatureName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  })

  describe('happy path', () => {
    it('should handle normal case', () => {
      // Test implementation
    })
  })

  describe('error cases', () => {
    it('should handle validation errors', () => {
      // Error test implementation
    })
  })

  describe('edge cases', () => {
    it('should handle boundary conditions', () => {
      // Edge case implementation
    })
  })
})
```
```

### 3. Testing Best Practices Guide
```markdown
# Testing Best Practices

## Universal Principles

### 1. Test Naming
- Use descriptive test names that explain the scenario
- Follow "should [expected behavior] when [conditions]" pattern
- Include the word "should" in test descriptions

**Good:**
```typescript
it('should return 400 when prompt is empty')
it('should stream responses when stream=true')
```

**Bad:**
```typescript
it('test prompt validation')
it('streaming test')
```

### 2. Test Organization
- Group related tests with `describe()` blocks
- Use nested `describe()` for logical grouping
- Keep test files focused on single components/features

### 3. Assertions
- Use specific assertions over generic ones
- Test one concept per test
- Avoid multiple unrelated assertions in single test

**Good:**
```typescript
expect(response.status()).toBe(200)
expect(response.headers()['content-type']).toContain('application/json')
```

**Bad:**
```typescript
expect(response).toBeTruthy() // Too generic
```

### 4. Test Data
- Use factories for consistent test data creation
- Avoid hardcoded values when possible
- Make test data intention-revealing

## Framework-Specific Best Practices

### Vitest Unit Tests
- Use `vi.mock()` for external dependencies
- Prefer `vi.fn()` over manual mock implementations
- Use `beforeEach()` for test isolation
- Test error scenarios explicitly

### Playwright Integration Tests
- Use fixtures for common setup patterns
- Test both success and error scenarios
- Validate response structure completely
- Use appropriate timeouts

### CLI E2E Tests
- Test both batch and interactive modes
- Clean up processes in afterEach hooks
- Use realistic user input patterns
- Test cross-platform compatibility

## Anti-Patterns to Avoid

### Testing Anti-Patterns
- ❌ Testing implementation details instead of behavior
- ❌ Shared state between tests
- ❌ Overly complex test setup
- ❌ Testing multiple concerns in single test
- ❌ Brittle selectors in E2E tests

### Code Anti-Patterns
- ❌ Tight coupling between production and test code
- ❌ Hard-to-test code (static dependencies, global state)
- ❌ Insufficient error handling in production code
- ❌ Inconsistent API response formats
```

### 4. CI/CD Optimization Guide
```markdown
# CI/CD Testing Optimization

## GitHub Actions Configuration

### Test Pipeline Strategy
```yaml
name: Test Pipeline
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run Unit Tests
        run: npm run test:unit --coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - name: Start Services
        run: docker-compose up -d
      - name: Run Integration Tests
        run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E Tests
        run: npm run test:e2e
```

### Performance Optimization
- **Parallel Execution**: Run test suites in parallel
- **Dependency Caching**: Cache node_modules and Playwright browsers
- **Selective Testing**: Run only tests affected by changes
- **Fast Feedback**: Unit tests before integration tests
- **Artifact Collection**: Save test reports and screenshots

### Test Reliability
- **Retry Configuration**: Retry flaky tests automatically
- **Timeout Management**: Appropriate timeouts for CI environment
- **Environment Isolation**: Clean test environment for each run
- **Service Health Checks**: Ensure services are ready before testing
```

### 5. Debugging and Troubleshooting Guide
```markdown
# Test Debugging Guide

## Common Issues and Solutions

### Unit Test Debugging

#### Issue: Tests failing with mock errors
**Solution:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

// Verify mock calls
expect(mockFunction).toHaveBeenCalledWith(expectedArgs)
expect(mockFunction).toHaveBeenCalledTimes(1)
```

#### Issue: NestJS testing module errors
**Solution:**
```typescript
// Ensure proper module compilation
const module = await Test.createTestingModule({
  providers: [ServiceUnderTest]
}).compile()

// Use proper TypeScript setup for SWC
// Ensure vitest.config.ts has correct SWC configuration
```

### Integration Test Debugging

#### Issue: Server connection timeouts
**Solution:**
```typescript
// Add health check before tests
test.beforeAll(async ({ apiContext }) => {
  await apiContext.get('/health', { timeout: 10000 })
})

// Use appropriate retry configuration
const response = await apiContext.post('/endpoint', {
  data: payload,
  timeout: 5000
})
```

#### Issue: Streaming tests failing intermittently
**Solution:**
```typescript
// Ensure proper streaming data collection
const response = await apiContext.post('/stream', { data: request })
const body = await response.body()
const text = body.toString()

// Wait for complete stream
expect(text).toContain('[DONE]')
```

### E2E Test Debugging

#### Issue: CLI process hanging
**Solution:**
```typescript
// Set proper timeouts
const result = await cli.run(['command'], { timeout: 10000 })

// Ensure process cleanup
afterEach(async () => {
  await cli.cleanup()
})
```

#### Issue: Interactive mode not responding
**Solution:**
```typescript
// Add proper wait conditions
await session.waitForOutput('Expected prompt:', 5000)
await session.send('user input')
const response = await session.waitForResponse()
```

## Debug Tools and Techniques

### Playwright Debug Tools
```bash
# Run with debug mode
npx playwright test --debug

# Generate trace files
npx playwright test --trace on

# Run with headed browser
npx playwright test --headed

# View test results
npx playwright show-report
```

### Vitest Debug Tools
```bash
# Run with debugger
npx vitest --inspect-brk

# Run specific test with watch
npx vitest --watch specific-test

# Run with UI mode
npx vitest --ui
```

### General Debugging Tips
- Use `console.log()` strategically in tests
- Add `await page.pause()` in Playwright tests for inspection
- Use VS Code debugging with proper launch configurations
- Check test output artifacts (screenshots, traces, logs)
```

### 6. Performance Benchmarking Guide
```markdown
# Testing Performance Benchmarks

## Target Performance Metrics

### Test Execution Time
- **Unit tests**: <2s per suite, <500ms per test
- **Integration tests**: <30s per suite, <5s per test
- **E2E tests**: <60s per suite, <10s per test

### CI/CD Pipeline Performance
- **Total pipeline time**: <10 minutes
- **Unit test stage**: <3 minutes
- **Integration test stage**: <5 minutes
- **E2E test stage**: <3 minutes

### Resource Usage
- **Memory usage**: <2GB peak during test runs
- **CPU usage**: <80% average during parallel test execution
- **Disk usage**: <1GB for test artifacts

## Monitoring and Optimization

### Performance Monitoring
```typescript
// Add performance tracking to critical tests
test('performance benchmark', async ({ apiContext }) => {
  const start = Date.now()
  
  const response = await apiContext.post('/api/endpoint', {
    data: testData
  })
  
  const duration = Date.now() - start
  expect(duration).toBeLessThan(1000) // 1 second max
})
```

### Optimization Strategies
- **Parallel execution**: Configure appropriate worker counts
- **Test data optimization**: Use minimal test data sets
- **Setup optimization**: Minimize test setup/teardown time
- **Resource sharing**: Share expensive setup between tests
- **Selective testing**: Run only relevant tests for changes

### Performance Regression Detection
- Track test execution times over time
- Alert on significant performance degradation
- Regular performance review and optimization
- Benchmark against previous releases
```

## Acceptance Criteria

### Documentation Completeness
- [ ] **Testing Strategy Playbook**: Complete strategy documented
- [ ] **Developer Workflow Guide**: Step-by-step workflows defined
- [ ] **Best Practices Guide**: Comprehensive patterns and anti-patterns
- [ ] **CI/CD Optimization**: Pipeline configuration and optimization
- [ ] **Debugging Guide**: Troubleshooting for common issues
- [ ] **Performance Benchmarks**: Metrics and monitoring guidelines

### Developer Experience
- [ ] **Onboarding Guide**: New developers can start testing in <30 minutes
- [ ] **Quick Reference**: Easy-to-find command references
- [ ] **Examples**: Real examples for each testing pattern
- [ ] **Troubleshooting**: Solutions for common problems
- [ ] **Performance Guidelines**: Clear performance expectations

### Process Integration
- [ ] **Review Process**: Testing requirements in code review checklist
- [ ] **Definition of Done**: Testing criteria for feature completion
- [ ] **Quality Gates**: Automated quality checks in CI/CD
- [ ] **Maintenance Process**: Regular review and update procedures
- [ ] **Training Schedule**: Regular team training on testing practices

### Knowledge Transfer
- [ ] **Team Training**: All team members trained on new practices
- [ ] **Documentation Access**: Easy access to all testing documentation
- [ ] **Update Process**: Process for keeping documentation current
- [ ] **Feedback Loop**: Mechanism for improving testing practices
- [ ] **Success Metrics**: Tracking adoption and effectiveness

## Implementation Notes

### Documentation Organization
```bash
docs/testing/
├── README.md                    # Testing overview and quick start
├── strategy/
│   ├── testing-pyramid.md      # Testing strategy overview
│   ├── tier-strategies.md      # Per-tier testing approaches
│   └── coverage-targets.md     # Coverage goals and metrics
├── workflows/
│   ├── developer-guide.md      # Daily development workflow
│   ├── tdd-workflow.md         # Test-driven development guide
│   └── feature-workflow.md     # Feature development process
├── best-practices/
│   ├── unit-testing.md         # Unit testing best practices
│   ├── integration-testing.md  # Integration testing best practices
│   ├── e2e-testing.md          # E2E testing best practices
│   └── anti-patterns.md        # Common mistakes to avoid
├── tools/
│   ├── vitest-guide.md         # Vitest usage and configuration
│   ├── playwright-guide.md     # Playwright usage and patterns
│   └── debugging-guide.md      # Debug tools and techniques
├── ci-cd/
│   ├── pipeline-config.md      # CI/CD configuration
│   ├── optimization.md         # Performance optimization
│   └── monitoring.md           # Test monitoring and alerts
└── examples/
    ├── unit-test-examples.md   # Unit test code examples
    ├── integration-examples.md # Integration test examples
    └── e2e-examples.md         # E2E test examples
```

### Training Materials
- **Workshop slides**: Interactive training presentation
- **Video tutorials**: Screen recordings of common workflows
- **Code examples**: Runnable examples for each pattern
- **Checklists**: Quick reference cards for developers
- **FAQ**: Frequently asked questions and answers

### Maintenance Process
- **Quarterly reviews**: Regular documentation updates
- **Feedback collection**: Developer feedback on documentation
- **Metric tracking**: Adoption and effectiveness metrics
- **Continuous improvement**: Iterative refinement based on usage
- **Version control**: Proper versioning of documentation changes

## Dependencies
- **Upstream**: Stories 1-5 (all testing implementation completed)
- **Downstream**: None (final story)
- **Blocking**: None

## Definition of Done
- [ ] All documentation deliverables completed
- [ ] Team training conducted and completed
- [ ] Documentation review and approval completed
- [ ] Knowledge base integrated with existing documentation
- [ ] Feedback collection process established
- [ ] Success metrics tracking implemented
- [ ] Maintenance schedule established 