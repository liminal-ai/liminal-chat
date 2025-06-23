# Liminal Chat Testing Guidelines

## 1. Overview

This document defines comprehensive testing strategies for Liminal Chat, adapted from proven TDD practices and optimized for our AI-augmented development workflow with complex multi-agent orchestration features.

## 2. Testing Philosophy

### 2.1 Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementing features
2. **Tests as Specifications**: Tests serve as executable specifications between human intent and AI implementation
3. **Vertical Slices Over Horizontal Layers**: Test complete features end-to-end rather than each layer in isolation
4. **Purpose-Driven Test Suites**: Organize tests by purpose (smoke, regression, critical path)
5. **AI-Augmented Testing**: Leverage AI strengths while maintaining human oversight

### 2.2 Testing Values

- **Test behavior, not implementation**: Focus on what the code does, not how it does it
- **Test isolation**: Each test should be independent and not rely on other tests
- **Meaningful tests**: Every test should validate actual business value or prevent real bugs
- **Progressive complexity**: Start with happy paths, then edge cases, then error scenarios

## 3. TDD with AI Assistants

### 3.1 The AI-Augmented TDD Cycle

```
1. Augment Agent: Write failing test defining desired behavior
   ↓
2. Claude Code: Write minimal code to make test pass
   ↓
3. Both: Refactor while keeping tests green
   ↓
4. Augment Agent: Review and approve implementation
```

### 3.2 Test-First Workflow

**Step 1: Augment Agent writes comprehensive test suite**
```typescript
// Example: Agent orchestration feature
describe('AgentOrchestrator', () => {
  describe('startRoundtable', () => {
    it('should create session with specified agents', async () => {
      // Arrange
      const request: RoundtableRequest = {
        prompt: 'Review this design',
        agentIds: ['architect', 'critic', 'qa']
      };
      
      // Act
      const session = await orchestrator.startRoundtable(request);
      
      // Assert
      expect(session.agents).toHaveLength(3);
      expect(session.status).toBe('active');
      expect(session.streams).toHaveLength(3);
    });
    
    it('should handle agent not found error', async () => {
      // Test error scenarios
    });
    
    it('should coordinate parallel agent streams', async () => {
      // Test complex orchestration
    });
  });
});
```

**Step 2: Claude Code implements to pass tests**
- Focuses on making tests pass efficiently
- Follows specifications defined in tests
- Reports any ambiguities or edge cases

**Step 3: Collaborative refactoring**
- Improve code quality while maintaining green tests
- Optimize performance and maintainability
- Ensure architectural compliance

## 4. Test Categories & Structure

### 4.1 Test Pyramid

```
    ┌─────────────────┐
    │   E2E Tests     │  Few, slow, high confidence
    │   (Playwright)  │  Complete user workflows
    └─────────────────┘
  ┌───────────────────────┐
  │  Integration Tests    │  Some, medium speed
  │  (Jest + TestBed)     │  Service + DB interactions
  └───────────────────────┘
┌─────────────────────────────┐
│      Unit Tests             │  Many, fast, focused
│      (Jest)                 │  Individual functions/classes
└─────────────────────────────┘
```

### 4.2 Unit Tests (Fast, Isolated)

**Purpose**: Test individual functions, classes, and components in isolation

**Characteristics:**
- Run in <100ms each
- Mock all external dependencies
- Focus on single responsibility
- High code coverage (>80%)

**Example Structure:**
```typescript
describe('ArtifactService', () => {
  let service: ArtifactService;
  let mockRepository: jest.Mocked<ArtifactRepository>;
  let mockLockService: jest.Mocked<LockService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ArtifactService,
        { provide: ArtifactRepository, useValue: createMockRepository() },
        { provide: LockService, useValue: createMockLockService() },
      ],
    }).compile();

    service = module.get<ArtifactService>(ArtifactService);
    mockRepository = module.get(ArtifactRepository);
    mockLockService = module.get(LockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createArtifact', () => {
    it('should create artifact with valid data', async () => {
      // Test implementation
    });

    it('should throw validation error for invalid data', async () => {
      // Test error handling
    });
  });
});
```

### 4.3 Integration Tests (Medium Speed, Component Level)

**Purpose**: Test interactions between services, databases, and external systems

**Characteristics:**
- Use real database connections (test database)
- Test service-to-service communication
- Validate data persistence and retrieval
- Test real-time features

**Example Structure:**
```typescript
describe('OrchestrationService Integration', () => {
  let app: INestApplication;
  let orchestrationService: OrchestrationService;
  let database: Database;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [OrchestrationModule, TestDatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orchestrationService = app.get<OrchestrationService>(OrchestrationService);
    database = app.get<Database>('ARANGODB_CONNECTION');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase(database);
    await seedTestData(database);
  });

  describe('roundtable orchestration', () => {
    it('should persist session and stream data', async () => {
      // Test with real database
      const request: RoundtableRequest = {
        prompt: 'Test prompt',
        agentIds: ['agent1', 'agent2']
      };

      const session = await orchestrationService.startRoundtable(request);

      // Verify data persisted in database
      const savedSession = await database.collection('OrchestrationSessions')
        .document(session.id);
      
      expect(savedSession).toBeDefined();
      expect(savedSession.agents).toHaveLength(2);
    });
  });
});
```

### 4.4 End-to-End Tests (Slow, Full Stack)

**Purpose**: Test complete user workflows from UI to database

**Characteristics:**
- Test real user scenarios
- Use actual browser automation (Playwright)
- Test CLI + API integration
- Validate complete feature functionality

**Example Structure:**
```typescript
describe('Roundtable E2E', () => {
  let page: Page;
  let apiContext: APIRequestContext;

  beforeAll(async () => {
    // Setup test environment
    await startTestServer();
    page = await browser.newPage();
    apiContext = await request.newContext({
      baseURL: 'http://localhost:3000',
    });
  });

  afterAll(async () => {
    await page.close();
    await stopTestServer();
  });

  test('should complete roundtable workflow', async () => {
    // 1. Navigate to roundtable page
    await page.goto('/roundtable');

    // 2. Configure agents
    await page.fill('[data-testid=agent-selector]', 'architect,critic');

    // 3. Enter prompt
    await page.fill('[data-testid=prompt-input]', 'Review this design');

    // 4. Start roundtable
    await page.click('[data-testid=start-button]');

    // 5. Verify streaming responses
    await expect(page.locator('[data-testid=agent-response]')).toBeVisible();
    
    // 6. Verify session created via API
    const response = await apiContext.get('/api/orchestration/sessions');
    const sessions = await response.json();
    expect(sessions).toHaveLength(1);
  });
});
```

## 5. Testing Patterns for Liminal Chat Features

### 5.1 Agent Orchestration Testing

**Key Test Scenarios:**
```typescript
describe('Agent Orchestration', () => {
  // Happy path
  it('should coordinate multiple agents successfully');
  
  // Error handling
  it('should handle agent unavailability gracefully');
  it('should recover from stream interruptions');
  it('should timeout long-running operations');
  
  // Edge cases
  it('should handle concurrent session limits');
  it('should manage rate limiting across providers');
  it('should handle malformed agent responses');
});
```

### 5.2 Real-time Collaboration Testing

**WebSocket Testing Patterns:**
```typescript
describe('Real-time Collaboration', () => {
  let wsClient: WebSocket;
  
  beforeEach(async () => {
    wsClient = new WebSocket('ws://localhost:3000/collaboration');
    await waitForConnection(wsClient);
  });

  it('should broadcast lock acquisitions', async () => {
    // Test lock coordination
    const lockMessage = {
      type: 'request_lock',
      artifactId: 'test-artifact'
    };
    
    wsClient.send(JSON.stringify(lockMessage));
    
    const response = await waitForMessage(wsClient);
    expect(response.type).toBe('lock_acquired');
  });
});
```

### 5.3 Artifact Graph Testing

**Graph Operations Testing:**
```typescript
describe('Artifact Graph Operations', () => {
  it('should create artifact with relationships', async () => {
    // Test graph node creation
    const artifact = await artifactService.create({
      title: 'Test Artifact',
      content: 'Test content',
      parentId: 'parent-artifact-id'
    });

    // Verify graph relationships
    const relationships = await graphService.getRelationships(artifact.id);
    expect(relationships).toContainEqual({
      type: 'parent-child',
      fromId: 'parent-artifact-id',
      toId: artifact.id
    });
  });

  it('should traverse artifact lineage', async () => {
    // Test graph traversal
    const lineage = await graphService.getLineage('artifact-id');
    expect(lineage).toHaveLength(3); // artifact + 2 ancestors
  });
});
```

### 5.4 Transience Management Testing

**Lifecycle Testing:**
```typescript
describe('Transience Management', () => {
  it('should transition untouched artifacts to archived', async () => {
    // Create artifact with old timestamp
    const artifact = await createTestArtifact({
      transience: {
        state: 'untouched',
        lastAccessedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    });

    // Run decay job
    await transitionService.processDecayJobs();

    // Verify state transition
    const updated = await artifactService.findById(artifact.id);
    expect(updated.transience.state).toBe('archived');
  });
});
```

## 6. Mock Strategies

### 6.1 Service Mocking

**Mock Factories:**
```typescript
// test/factories/agent.factory.ts
export function createMockAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: faker.string.uuid(),
    name: faker.person.firstName(),
    handle: faker.internet.userName(),
    systemPrompt: 'You are a helpful assistant',
    modelProvider: 'openai',
    modelName: 'gpt-4',
    parameters: {
      temperature: 0.7,
      maxTokens: 1000,
    },
    teamId: 'test-team',
    ...overrides,
  };
}

export function createMockAgentService(): jest.Mocked<AgentService> {
  return {
    findById: jest.fn(),
    findByIds: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
```

### 6.2 External Service Mocking

**LLM Provider Mocking:**
```typescript
// Mock Vercel AI SDK
jest.mock('ai', () => ({
  streamText: jest.fn().mockImplementation(({ onToken, onFinish }) => {
    // Simulate streaming
    setTimeout(() => onToken('Hello'), 100);
    setTimeout(() => onToken(' world'), 200);
    setTimeout(() => onFinish({ text: 'Hello world' }), 300);
    
    return {
      abort: jest.fn(),
    };
  }),
}));
```

### 6.3 Database Mocking

**ArangoDB Test Utilities:**
```typescript
export class TestDatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: TestDatabaseModule,
      providers: [
        {
          provide: 'ARANGODB_CONNECTION',
          useFactory: async () => {
            const db = new Database({
              url: process.env.TEST_ARANGODB_URL,
              databaseName: `test_${Date.now()}`,
            });
            
            await setupTestDatabase(db);
            return db;
          },
        },
      ],
      exports: ['ARANGODB_CONNECTION'],
    };
  }
}

export async function cleanupDatabase(db: Database): Promise<void> {
  const collections = ['Artifacts', 'Relationships', 'OrchestrationSessions'];
  
  for (const collection of collections) {
    try {
      await db.collection(collection).truncate();
    } catch (error) {
      // Collection might not exist
    }
  }
}
```

## 7. Test Utilities & Helpers

### 7.1 Custom Matchers

```typescript
// test/matchers/artifact.matchers.ts
expect.extend({
  toBeValidArtifact(received: any) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.title === 'string' &&
      typeof received.content === 'string' &&
      received.createdAt instanceof Date;

    return {
      message: () => `expected ${received} to be a valid artifact`,
      pass,
    };
  },

  toHaveTransienceState(received: any, expectedState: TransienceState) {
    const pass = received?.transience?.state === expectedState;
    
    return {
      message: () => `expected artifact to have transience state ${expectedState}`,
      pass,
    };
  },
});
```

### 7.2 Test Data Builders

```typescript
// test/builders/orchestration-session.builder.ts
export class OrchestrationSessionBuilder {
  private session: Partial<OrchestrationSession> = {
    type: 'roundtable',
    status: 'active',
    agents: [],
    streams: [],
  };

  withAgents(agents: Agent[]): this {
    this.session.agents = agents;
    return this;
  }

  withStatus(status: SessionStatus): this {
    this.session.status = status;
    return this;
  }

  build(): OrchestrationSession {
    return {
      id: faker.string.uuid(),
      teamId: 'test-team',
      initiatedBy: 'test-user',
      context: {
        prompt: 'Test prompt',
        sharedContext: '',
      },
      createdAt: new Date(),
      ...this.session,
    } as OrchestrationSession;
  }
}

// Usage
const session = new OrchestrationSessionBuilder()
  .withAgents([agent1, agent2])
  .withStatus('active')
  .build();
```

## 8. Coverage Requirements

### 8.1 Coverage Targets

**Minimum Coverage:**
- Unit tests: >80%
- Integration tests: >70%
- Critical paths: 100%

**Coverage by Component:**
- Services: >85%
- Controllers: >75%
- Utilities: >90%
- Error handling: 100%

### 8.2 Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/modules/orchestration/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
};
```

## 9. CI/CD Integration

### 9.1 Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 9.2 Test Commands

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=spec.ts",
    "test:integration": "jest --testPathPattern=integration.spec.ts",
    "test:e2e": "jest --testPathPattern=e2e.spec.ts",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

This testing guidelines document provides a comprehensive framework for maintaining quality in Liminal Chat through systematic testing practices optimized for our AI-augmented development workflow.
