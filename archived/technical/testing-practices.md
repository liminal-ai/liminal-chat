# Testing Practices Guide

This document consolidates all testing practices for the Liminal Type Chat platform, providing a comprehensive guide for both human developers and AI coding assistants.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Test Coverage Requirements](#test-coverage-requirements)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [CLI Testing](#cli-testing)
- [Test File Organization](#test-file-organization)
- [Mock Strategies](#mock-strategies)
- [Test Utilities](#test-utilities)
- [CI/CD Requirements](#cicd-requirements)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Testing Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementing features
2. **Vertical Slices Over Horizontal Layers**: Test complete features end-to-end rather than each architectural layer in isolation
3. **Tests as Specifications**: Tests serve as executable specifications and primary communication between human intent and AI implementation
4. **Purpose-Driven Test Suites**: Organize tests by purpose (smoke, regression, critical path) rather than just technical tier
5. **Balance**: Provide confidence without hindering development velocity

### Key Testing Values

- **Test behavior, not implementation**: Focus on what the code does, not how it does it
- **Test isolation**: Each test should be independent and not rely on other tests
- **Meaningful tests**: Every test should validate actual business value or prevent real bugs
- **Progressive complexity**: Start with happy paths, then edge cases, then error scenarios

## Test-Driven Development (TDD)

### The TDD Cycle

1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code quality while keeping tests green

### TDD with AI Assistants

When working with AI coding assistants:

1. **Define behavior through tests first**: This gives AI clear specifications
2. **Progressive test complexity**:
   - Happy path first (basic functionality)
   - Edge cases second (boundary conditions)
   - Error scenarios third (exception handling)
   - Complex interactions last (multi-component flows)
3. **Test granularity**: Not too small (myopic) or too large (overwhelming)

## Test Coverage Requirements

### Tiered Coverage Strategy

We implement tiered coverage thresholds based on component criticality:

#### Global Baseline
- **Statements**: 85%
- **Branches**: 70%
- **Functions**: 85%
- **Lines**: 85%

#### Component-Specific Requirements

| Component Type | Statements | Branches | Functions | Lines | Rationale |
|----------------|------------|----------|-----------|-------|-----------|
| **Domain Services** | 80% | 70% | 80% | 80% | Core business logic |
| **Utility Functions** | 90% | 80% | 90% | 90% | Reusable, critical code |
| **Repositories/Providers** | 80% | 45% | 75% | 80% | Data access layer |
| **API Routes** | 75% | 45% | 75% | 75% | HTTP handling |
| **Client Adapters** | 85% | 70% | 80% | 85% | Service interfaces |

#### Coverage Exclusions
- Server entry points (`app.ts`, `server.ts`)
- Swagger middleware configuration
- Generated code
- Third-party integrations that can't be meaningfully unit tested

## Unit Testing

### Scope
Unit tests verify individual functions, classes, or modules in isolation.

### Target Components
- Service methods and business rules
- Data transformations and validations
- Error handling and edge cases
- Utility functions
- Domain logic

### Unit Test Patterns

```typescript
describe('ContextThreadService', () => {
  describe('createContextThread', () => {
    // Arrange-Act-Assert pattern
    it('should create thread with valid parameters', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      const service = new ContextThreadService(mockRepository);
      const params = { title: 'Test Thread' };
      
      // Act
      const result = await service.createContextThread(params);
      
      // Assert
      expect(result.title).toBe('Test Thread');
      expect(mockRepository.createContextThread).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Thread' })
      );
    });
    
    it('should throw ValidationError when title exceeds max length', async () => {
      // Test edge cases
      const service = new ContextThreadService(mockRepository);
      
      await expect(
        service.createContextThread({ title: 'x'.repeat(256) })
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### Unit Test Best Practices

1. **Test both success and failure paths**
2. **Mock all external dependencies**
3. **Use descriptive test names**: `should [expected behavior] when [condition]`
4. **Keep tests focused on single behaviors**
5. **Test edge cases thoroughly**:
   - Empty inputs
   - Null/undefined values
   - Maximum/minimum values
   - Invalid formats

## Integration Testing

### Scope
Integration tests verify that different components work together correctly.

### Target Areas
- API endpoint behavior
- Service-to-repository interactions
- External service integrations
- Database operations
- Cross-component workflows

### Integration Test Example

```typescript
describe('Conversations API', () => {
  let app: Express;
  let testDb: Database;
  
  beforeEach(async () => {
    testDb = await setupTestDatabase();
    app = createApp(testDb);
  });
  
  afterEach(async () => {
    await testDb.close();
  });
  
  it('should create and retrieve conversation', async () => {
    // Create conversation
    const createRes = await request(app)
      .post('/api/v1/conversations')
      .send({ title: 'Test Conversation' })
      .expect(201);
    
    expect(createRes.body).toMatchObject({
      id: expect.any(String),
      title: 'Test Conversation'
    });
    
    // Retrieve conversation
    const getRes = await request(app)
      .get(`/api/v1/conversations/${createRes.body.id}`)
      .expect(200);
    
    expect(getRes.body).toEqual(createRes.body);
  });
});
```

## CLI Testing

### Overview
CLI testing requires specialized approaches to handle interactive prompts, streaming output, and terminal control sequences.

### Testing Tools

#### Core Libraries
- **mock-stdin**: Mock user input for interactive prompts
- **strip-ansi**: Remove ANSI color codes for output assertions
- **execa**: Modern process execution with promise support
- **tempy**: Create temporary directories for config testing

#### Supporting Libraries
- **ora** (mockable): Test loading spinners and progress indicators
- **nock**: Mock HTTP requests to Edge API
- **chalk**: Terminal color support (disable in tests)

### Testing Interactive Mode

Interactive CLI sessions require careful handling of stdin/stdout:

```typescript
import { MockSTDIN, stdin } from 'mock-stdin';

describe('Interactive Chat Mode', () => {
  let mockStdin: MockSTDIN;
  
  beforeEach(() => {
    mockStdin = stdin();
  });
  
  afterEach(() => {
    mockStdin.restore();
  });
  
  it('should handle multi-turn conversation', async () => {
    const cli = spawn('liminal', ['chat', '--interactive']);
    
    // Wait for prompt
    await waitForOutput(cli, 'Enter message:');
    
    // Send first message
    mockStdin.send('Hello\n');
    await waitForOutput(cli, 'Echo: Hello');
    
    // Send follow-up
    mockStdin.send('How are you?\n');
    await waitForOutput(cli, 'Echo: How are you?');
    
    // Exit
    mockStdin.send('\x03'); // Ctrl+C
  });
});
```

### Testing Streaming Output

SSE streaming responses require testing incremental output:

```typescript
describe('Streaming Output', () => {
  it('should display tokens as they arrive', async () => {
    const output: string[] = [];
    const cli = spawn('liminal', ['echo', 'Hello world']);
    
    cli.stdout.on('data', (chunk) => {
      output.push(chunk.toString());
    });
    
    await new Promise(resolve => cli.on('close', resolve));
    
    // Verify incremental output
    expect(output.length).toBeGreaterThan(1); // Multiple chunks
    expect(output.join('')).toContain('Echo: Hello world');
  });
  
  it('should show progress indicators', async () => {
    const cli = spawn('liminal', ['chat', 'Long prompt', '--show-progress']);
    const output = await collectOutput(cli);
    
    // Should see spinner/progress
    expect(output).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/); // Spinner chars
    expect(stripAnsi(output)).toContain('Thinking...');
  });
});
```

### Output Validation with ANSI Codes

Handle terminal colors and formatting:

```typescript
import stripAnsi from 'strip-ansi';

describe('Colored Output', () => {
  it('should display errors in red', async () => {
    const cli = await runCLI(['chat', '--api-key', 'invalid']);
    
    // Test content without colors
    expect(stripAnsi(cli.stderr)).toContain('Invalid API key');
    
    // Test that colors are applied
    expect(cli.stderr).toContain('\u001b[31m'); // Red ANSI code
  });
  
  it('should respect NO_COLOR environment variable', async () => {
    const cli = await runCLI(['chat', 'test'], {
      env: { ...process.env, NO_COLOR: '1' }
    });
    
    expect(cli.stdout).not.toMatch(/\u001b\[\d+m/); // No ANSI codes
  });
});
```

### E2E Testing Framework

Create a reusable test harness for CLI testing:

```typescript
import { execa, ExecaChildProcess } from 'execa';

class CLITestHarness {
  private process: ExecaChildProcess;
  private output: string[] = [];
  private errors: string[] = [];
  
  async start(args: string[], options = {}) {
    this.process = execa('node', ['./cli.js', ...args], {
      env: { ...process.env, FORCE_COLOR: '0' }, // Disable colors in tests
      ...options
    });
    
    this.process.stdout?.on('data', (data) => {
      this.output.push(data.toString());
    });
    
    this.process.stderr?.on('data', (data) => {
      this.errors.push(data.toString());
    });
  }
  
  async waitForText(text: string, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (this.getOutput().includes(text)) return;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for: ${text}`);
  }
  
  async sendInput(input: string) {
    this.process.stdin?.write(input + '\n');
  }
  
  getOutput(): string {
    return this.output.join('');
  }
  
  getErrors(): string {
    return this.errors.join('');
  }
  
  async kill() {
    this.process.kill();
    await this.process;
  }
}
```

### Testing Different CLI Scenarios

#### Piped Input
```typescript
it('should accept piped input', async () => {
  const result = await execa`echo "Hello" | node cli.js echo`;
  expect(result.stdout).toContain('Echo: Hello');
});
```

#### Non-TTY Environment
```typescript
it('should work in CI environment', async () => {
  const result = await execa('node', ['cli.js', 'echo', 'test'], {
    env: { CI: 'true' },
    stdin: 'pipe'
  });
  expect(result.stdout).not.toContain('\u001b['); // No ANSI codes
});
```

#### Error Handling
```typescript
it('should handle network errors gracefully', async () => {
  const cli = new CLITestHarness();
  await cli.start(['chat', 'Hello', '--api-url', 'http://invalid']);
  await cli.waitForText('Connection failed');
  expect(cli.getErrors()).toContain('ENOTFOUND');
});
```

#### Configuration Testing
```typescript
it('should load config from multiple sources', async () => {
  const tempDir = await tempy.directory();
  
  // Create config file
  await fs.writeFile(
    path.join(tempDir, '.liminalrc'),
    JSON.stringify({ apiUrl: 'http://custom.api' })
  );
  
  const result = await execa('node', ['cli.js', 'config', 'show'], {
    cwd: tempDir
  });
  
  expect(result.stdout).toContain('http://custom.api');
});
```

### Performance Testing

```typescript
describe('CLI Performance', () => {
  it('should achieve TTFT < 100ms', async () => {
    const start = Date.now();
    const cli = spawn('liminal', ['echo', 'test', '--timing']);
    
    await waitForFirstOutput(cli);
    const ttft = Date.now() - start;
    
    expect(ttft).toBeLessThan(100);
  });
  
  it('should handle large outputs efficiently', async () => {
    const largeText = 'x'.repeat(10000);
    const result = await execa('node', ['cli.js', 'echo', largeText]);
    
    expect(result.stdout).toContain(largeText);
    expect(result.exitCode).toBe(0);
  });
});
```

### Testing Interactive Streaming Chat

The most complex scenario - interactive streaming chat:

```typescript
describe('Interactive Streaming Chat', () => {
  let mockServer: MockSSEServer;
  let cli: CLITestHarness;
  
  beforeEach(async () => {
    mockServer = await createMockSSEServer();
    cli = new CLITestHarness();
  });
  
  afterEach(async () => {
    await mockServer.close();
    await cli.kill();
  });
  
  it('should stream responses character by character', async () => {
    await cli.start(['chat', '--interactive', '--api-url', mockServer.url]);
    await cli.waitForText('> '); // Prompt
    
    // Send message
    await cli.sendInput('Hello');
    
    // Mock server sends tokens incrementally
    mockServer.sendToken('Hel');
    await cli.waitForText('Hel');
    
    mockServer.sendToken('lo ');
    await cli.waitForText('Hello ');
    
    mockServer.sendToken('world');
    await cli.waitForText('Hello world');
    
    mockServer.complete();
    await cli.waitForText('> '); // Back to prompt
  });
  
  it('should handle connection interruption', async () => {
    await cli.start(['chat', '--interactive']);
    await cli.sendInput('Test message');
    
    // Simulate network interruption
    mockServer.disconnect();
    
    await cli.waitForText('Connection lost. Retrying...');
    
    // Restore connection
    mockServer.reconnect();
    await cli.waitForText('Reconnected');
  });
});
```

### CLI Test Organization

```
cli-client/
├── src/
│   ├── commands/
│   ├── utils/
│   └── index.ts
└── tests/
    ├── unit/
    │   ├── commands/
    │   └── utils/
    ├── integration/
    │   ├── api-client.test.ts
    │   └── config.test.ts
    ├── e2e/
    │   ├── chat-flow.test.ts
    │   ├── streaming.test.ts
    │   └── error-handling.test.ts
    ├── fixtures/
    │   ├── mock-responses.ts
    │   └── test-configs.ts
    └── helpers/
        ├── cli-harness.ts
        ├── mock-server.ts
        └── assertions.ts
```

### CLI Testing Best Practices

1. **Disable Colors in Tests**: Use `FORCE_COLOR=0` or `NO_COLOR=1`
2. **Mock External Dependencies**: Never make real API calls in tests
3. **Test Exit Codes**: Verify proper exit codes for success/failure
4. **Test Help Output**: Ensure help text is accurate and complete
5. **Test Version Output**: Verify version command works
6. **Clean Up Processes**: Always kill spawned processes in afterEach
7. **Use Timeouts**: Set reasonable timeouts for async operations
8. **Test Signal Handling**: Verify Ctrl+C and other signals work correctly

### Common CLI Testing Pitfalls

1. **Not waiting for output**: Always use proper wait mechanisms
2. **Forgetting to clean up**: Spawned processes can hang test runner
3. **ANSI code pollution**: Always strip ANSI codes for content assertions
4. **Platform differences**: Test on multiple platforms (Windows line endings)
5. **Environment pollution**: Reset environment variables after tests
6. **Timing issues**: Don't rely on exact timing, use flexible assertions

## Test File Organization

### Directory Structure

```
server/
├── src/
│   ├── services/
│   │   ├── core/
│   │   │   ├── ContextThreadService.ts
│   │   │   └── __tests__/
│   │   │       ├── ContextThreadService.test.ts
│   │   │       ├── ContextThreadService.standardized.test.ts
│   │   │       └── ContextThreadService.coverage.test.ts
│   └── routes/
│       └── __tests__/
├── test/
│   ├── unit/               # Additional unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Shared test data

client/
├── src/
│   ├── components/
│   │   └── __tests__/
│   └── pages/
│       └── __tests__/
```

### Test Naming Conventions

1. **Basic test files**: `[SourceFile].test.ts`
2. **Specialized test files**:
   - `.standardized.test.ts` - Standardized test patterns
   - `.coverage.test.ts` - Tests focused on coverage gaps
   - `.edge-cases.test.ts` - Edge case testing
   - `.extended.test.ts` - Extended test scenarios

## Mock Strategies

### Mock Hierarchy

1. **Jest Mock Functions**: For simple function mocks
2. **Mock Classes**: For complex dependencies with state
3. **Spies**: For monitoring calls while preserving implementation
4. **Manual Mocks**: For external modules

### Mock Implementation Examples

#### Simple Mock Function
```typescript
const mockGetThread = jest.fn().mockResolvedValue({
  id: '123',
  title: 'Test Thread'
});
```

#### Mock Class Implementation
```typescript
class MockContextThreadRepository implements IContextThreadRepository {
  private threads: Map<string, ContextThread> = new Map();
  
  async createContextThread(thread: ContextThread): Promise<void> {
    this.threads.set(thread.id, thread);
  }
  
  async getContextThread(id: string): Promise<ContextThread | null> {
    return this.threads.get(id) || null;
  }
}
```

#### Using Spies
```typescript
const logSpy = jest.spyOn(console, 'error').mockImplementation();

// After test
expect(logSpy).toHaveBeenCalledWith(
  expect.stringContaining('JSON parsing error')
);
```

### What to Mock

Always mock:
- Database connections and queries
- External API calls (LLM providers, third-party services)
- File system operations
- Network requests
- Environment variables
- Time-dependent operations

## Test Utilities

### Factory Functions

Create reusable factory functions for test data:

```typescript
// test/fixtures/factories.ts
export function createMockThread(overrides?: Partial<ContextThread>): ContextThread {
  return {
    id: 'thread-' + Math.random(),
    title: 'Test Thread',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    metadata: {},
    ...overrides
  };
}

export function createMockMessage(overrides?: Partial<Message>): Message {
  return {
    id: 'msg-' + Math.random(),
    content: 'Test message content',
    role: 'user',
    createdAt: Date.now(),
    ...overrides
  };
}
```

### Test Helpers

Common test setup helpers:

```typescript
// test/helpers/database.ts
export async function setupTestDatabase(): Promise<Database> {
  const db = new SQLiteProvider(':memory:');
  await db.init();
  return db;
}

// test/helpers/app.ts
export function createTestApp(db: Database): Express {
  return createApp({
    database: db,
    llmProvider: new MockLLMProvider()
  });
}
```

### Custom Matchers

Define custom Jest matchers for domain-specific assertions:

```typescript
// test/matchers/thread.ts
expect.extend({
  toBeValidThread(received: any) {
    const pass = 
      received &&
      typeof received.id === 'string' &&
      typeof received.title === 'string' &&
      typeof received.createdAt === 'number' &&
      Array.isArray(received.messages);
    
    return {
      pass,
      message: () => 
        pass 
          ? `expected ${received} not to be a valid thread`
          : `expected ${received} to be a valid thread`
    };
  }
});

// Usage
expect(result).toBeValidThread();
```

## CI/CD Requirements

### Test Execution Strategy

#### On Every Commit
1. Unit tests (all)
2. Smoke tests (@smoke tagged tests)
3. Affected integration tests

#### On Pull Request
1. All unit tests
2. All integration tests  
3. Coverage verification
4. Linting checks

#### Pre-Release
1. Full test suite
2. E2E tests (when implemented)
3. Performance benchmarks
4. Manual exploratory testing

### Test Commands

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create thread"

# Run tests in watch mode
npm test -- --watch

# Run only changed tests
npm test -- --onlyChanged
```

### Coverage Reporting

Coverage reports are generated in multiple formats:
- **HTML**: For human review (`coverage/lcov-report/index.html`)
- **LCOV**: For CI integration
- **JSON**: For programmatic access
- **Console**: Summary in terminal

## Best Practices

### General Testing Principles

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Keep tests focused
3. **Descriptive Names**: Test names should explain what and why
4. **DRY Test Code**: Extract common setup to helpers
5. **Fast Tests**: Optimize for speed to encourage frequent runs

### Async Testing

```typescript
// Always use async/await for clarity
it('should handle async operations', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});

// Test error cases with rejects
it('should reject with validation error', async () => {
  await expect(
    service.createThread({ title: '' })
  ).rejects.toThrow(ValidationError);
});
```

### Test Isolation

```typescript
describe('Service', () => {
  let service: Service;
  let mockDep: MockDependency;
  
  beforeEach(() => {
    // Fresh instances for each test
    mockDep = new MockDependency();
    service = new Service(mockDep);
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up any side effects
    jest.restoreAllMocks();
  });
});
```

### Testing Error Scenarios

```typescript
it('should handle repository errors gracefully', async () => {
  // Arrange
  mockRepository.getThread.mockRejectedValue(
    new Error('Database connection failed')
  );
  
  // Act & Assert
  await expect(service.getThread('123'))
    .rejects.toThrow('Database connection failed');
  
  expect(logger.error).toHaveBeenCalledWith(
    expect.stringContaining('Database error'),
    expect.any(Error)
  );
});
```

## Common Patterns

### Testing Streaming Responses

```typescript
it('should stream response chunks', async () => {
  const chunks: string[] = [];
  const stream = service.streamResponse('prompt');
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  expect(chunks).toHaveLength(3);
  expect(chunks.join('')).toBe('Complete response');
});
```

### Testing with Time

```typescript
// Use fake timers for time-dependent tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('should timeout after 5 seconds', async () => {
  const promise = service.longOperation();
  
  jest.advanceTimersByTime(5000);
  
  await expect(promise).rejects.toThrow('Operation timed out');
});
```

### Testing Event Emitters

```typescript
it('should emit progress events', async () => {
  const events: any[] = [];
  
  service.on('progress', (data) => events.push(data));
  
  await service.processWithProgress();
  
  expect(events).toEqual([
    { stage: 'start', progress: 0 },
    { stage: 'processing', progress: 50 },
    { stage: 'complete', progress: 100 }
  ]);
});
```

### Testing Validation

```typescript
describe('input validation', () => {
  const invalidInputs = [
    { input: null, error: 'Input required' },
    { input: '', error: 'Input cannot be empty' },
    { input: 'x'.repeat(1001), error: 'Input too long' }
  ];
  
  invalidInputs.forEach(({ input, error }) => {
    it(`should reject input: ${JSON.stringify(input)}`, async () => {
      await expect(service.process(input))
        .rejects.toThrow(error);
    });
  });
});
```

## Anti-Patterns to Avoid

1. **Testing Implementation Details**: Don't test private methods or internal state
2. **Excessive Mocking**: Use real implementations where reasonable
3. **Test Interdependence**: Never rely on test execution order
4. **Ignoring Test Maintenance**: Refactor tests alongside code
5. **Coverage Worship**: 100% coverage doesn't mean bug-free code
6. **Slow Tests**: Keep unit tests under 100ms each
7. **Flaky Tests**: Fix or remove unreliable tests immediately

## Troubleshooting

### Common Issues and Solutions

1. **Async tests timing out**
   - Ensure all promises are awaited
   - Check for unresolved mocks
   - Increase timeout for legitimately slow operations

2. **Mock not being called**
   - Verify mock is properly injected
   - Check mock implementation returns expected values
   - Ensure code path actually calls the mock

3. **Test pollution**
   - Always use `beforeEach` for setup
   - Clear/restore mocks between tests
   - Don't use global variables in tests

4. **Coverage gaps**
   - Run coverage report with `--verbose`
   - Look for untested error paths
   - Add tests for edge cases

### Debugging Tests

```bash
# Run single test with debugging
node --inspect-brk node_modules/.bin/jest path/to/test.ts

# Run with verbose output
npm test -- --verbose

# Show individual test results
npm test -- --verbose --expand
```

## Conclusion

This testing practices guide provides a comprehensive framework for maintaining quality in the Liminal Type Chat platform. By following these practices, we ensure reliable, maintainable code that supports both human developers and AI coding assistants in building robust software.

Remember: Tests are not just about preventing bugs—they're about designing better software through clear specifications and enabling confident refactoring.