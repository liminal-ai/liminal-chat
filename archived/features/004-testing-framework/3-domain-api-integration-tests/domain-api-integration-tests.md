# Domain API Integration Tests with Playwright

## Objective
Migrate Domain API integration testing from Supertest to Playwright HTTP API testing, ensuring comprehensive coverage of all Domain endpoints with real HTTP validation and improved debugging capabilities.

## Background
Domain tier currently has limited integration testing using Supertest. This migration will modernize the testing approach, provide better debugging tools, and establish patterns for comprehensive API validation using Playwright's superior HTTP testing capabilities.

## Scope

### In Scope
- Migrate existing Supertest integration tests to Playwright
- Add comprehensive coverage for all Domain API endpoints
- Implement streaming endpoint testing 
- Add error scenario validation
- Real HTTP calls (no mocking at API level)
- Performance and timeout testing

### Out of Scope
- Unit test changes (covered in Story 1)
- E2E testing (covered in Story 5)
- Database integration testing
- External API mocking (provider level)

## Technical Requirements

### Domain API Endpoints to Test
```typescript
// All Domain endpoints requiring coverage
interface DomainEndpoints {
  health: 'GET /health'
  llmPrompt: 'POST /domain/llm/prompt'
  llmProviders: 'GET /domain/llm/providers'
  llmStream: 'POST /domain/llm/prompt (streaming)'
}
```

### Test Implementation Patterns

#### Basic API Test Pattern
```typescript
// tests/integration/domain/health.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Domain Health Endpoint', () => {
  test('should return healthy status', async ({ apiContext }) => {
    const response = await apiContext.get('/health')
    
    expect(response.status()).toBe(200)
    
    const health = await response.json()
    expect(health).toEqual({
      status: 'ok',
      service: 'liminal-chat-domain',
      timestamp: expect.any(String),
      database: 'connected'
    })
  })

  test('should respond within performance threshold', async ({ apiContext }) => {
    const start = Date.now()
    const response = await apiContext.get('/health')
    const duration = Date.now() - start
    
    expect(response.status()).toBe(200)
    expect(duration).toBeLessThan(100) // <100ms response time
  })
})
```

#### LLM Prompt Testing
```typescript
// tests/integration/domain/llm-prompt.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Domain LLM Prompt Endpoint', () => {
  test('should handle simple prompt request', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    const response = await apiContext.post('/domain/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    
    const result = await response.json()
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('model')
    expect(result).toHaveProperty('usage')
    expect(result.usage).toHaveProperty('promptTokens')
    expect(result.usage).toHaveProperty('completionTokens')
    expect(result.usage).toHaveProperty('totalTokens')
  })

  test('should handle messages array request', async ({ apiContext, testData }) => {
    const request = testData.createMessagesRequest()
    
    const response = await apiContext.post('/domain/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    
    const result = await response.json()
    expect(result.content).toBeTruthy()
    expect(typeof result.content).toBe('string')
  })

  test('should validate required fields', async ({ apiContext }) => {
    const response = await apiContext.post('/domain/llm/prompt', {
      data: {} // Empty request
    })
    
    expect(response.status()).toBe(400)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('prompt or messages required')
  })

  test('should handle provider selection', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest({
      provider: 'openrouter'
    })
    
    const response = await apiContext.post('/domain/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    
    const result = await response.json()
    expect(result.model).toContain('anthropic/claude') // OpenRouter model format
  })
})
```

#### Streaming Endpoint Testing
```typescript
// tests/integration/domain/llm-streaming.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Domain LLM Streaming', () => {
  test('should handle streaming request', async ({ apiContext, testData }) => {
    const request = testData.createStreamingRequest()
    
    const response = await apiContext.post('/domain/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/event-stream')
    
    // Collect streaming data
    const chunks: string[] = []
    const body = await response.body()
    const text = body.toString()
    
    // Validate SSE format
    expect(text).toContain('data: ')
    expect(text).toContain('[DONE]')
    
    // Parse streaming chunks
    const lines = text.split('\n')
    const dataLines = lines.filter(line => line.startsWith('data: '))
    
    expect(dataLines.length).toBeGreaterThan(0)
    
    // Validate chunk format
    const firstChunk = JSON.parse(dataLines[0].replace('data: ', ''))
    expect(firstChunk).toHaveProperty('delta')
    expect(firstChunk).toHaveProperty('model')
  })

  test('should handle streaming errors gracefully', async ({ apiContext }) => {
    const invalidRequest = {
      prompt: 'test',
      provider: 'invalid-provider',
      stream: true
    }
    
    const response = await apiContext.post('/domain/llm/prompt', {
      data: invalidRequest
    })
    
    expect(response.status()).toBe(400)
  })
})
```

#### Error Handling Tests
```typescript
// tests/integration/domain/error-handling.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Domain Error Handling', () => {
  test('should handle malformed JSON', async ({ apiContext }) => {
    const response = await apiContext.post('/domain/llm/prompt', {
      data: 'invalid json',
      headers: { 'Content-Type': 'application/json' }
    })
    
    expect(response.status()).toBe(400)
  })

  test('should handle timeout scenarios', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest({
      prompt: 'Very long prompt that might timeout...'
    })
    
    // Set a short timeout to test timeout handling
    const response = await apiContext.post('/domain/llm/prompt', {
      data: request,
      timeout: 1000 // 1 second timeout
    })
    
    // Should either succeed quickly or handle timeout gracefully
    if (response.status() !== 200) {
      expect([408, 504]).toContain(response.status())
    }
  })

  test('should handle rate limiting', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    // Make multiple rapid requests
    const promises = Array(10).fill(null).map(() => 
      apiContext.post('/domain/llm/prompt', { data: request })
    )
    
    const responses = await Promise.all(promises)
    
    // At least one should succeed
    const successfulResponses = responses.filter(r => r.status() === 200)
    expect(successfulResponses.length).toBeGreaterThan(0)
    
    // Rate limited responses should return 429
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    // May or may not have rate limiting enabled
  })
})
```

### Provider Endpoint Testing
```typescript
// tests/integration/domain/providers.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Domain Providers Endpoint', () => {
  test('should return available providers', async ({ apiContext }) => {
    const response = await apiContext.get('/domain/llm/providers')
    
    expect(response.status()).toBe(200)
    
    const providers = await response.json()
    expect(Array.isArray(providers)).toBe(true)
    expect(providers.length).toBeGreaterThan(0)
    
    // Validate provider structure
    const provider = providers[0]
    expect(provider).toHaveProperty('name')
    expect(provider).toHaveProperty('displayName')
    expect(provider).toHaveProperty('description')
    expect(provider).toHaveProperty('configured')
  })

  test('should include configuration status', async ({ apiContext }) => {
    const response = await apiContext.get('/domain/llm/providers')
    const providers = await response.json()
    
    // Find echo provider (should always be available)
    const echoProvider = providers.find(p => p.name === 'echo')
    expect(echoProvider).toBeDefined()
    expect(echoProvider.configured).toBe(true)
    
    // Check OpenRouter provider status
    const openrouterProvider = providers.find(p => p.name === 'openrouter')
    expect(openrouterProvider).toBeDefined()
    expect(typeof openrouterProvider.configured).toBe('boolean')
  })
})
```

## Acceptance Criteria

### Endpoint Coverage
- [ ] **Health endpoint**: Basic health check and performance validation
- [ ] **LLM prompt endpoint**: Both prompt and messages request formats
- [ ] **LLM streaming**: SSE streaming validation and chunk parsing
- [ ] **Providers endpoint**: Available providers and configuration status
- [ ] **Error scenarios**: Comprehensive error handling validation

### Test Quality
- [ ] **Real HTTP calls**: No mocking at HTTP level
- [ ] **Response validation**: Complete response structure validation
- [ ] **Performance testing**: Response time thresholds validated
- [ ] **Error coverage**: All error scenarios tested
- [ ] **Streaming validation**: SSE format and chunk parsing tested

### Technical Integration
- [ ] **Playwright fixtures**: Using established fixture patterns
- [ ] **Test data factories**: Consistent test data generation
- [ ] **CI/CD compatibility**: Tests run successfully in CI
- [ ] **Parallel execution**: Tests run safely in parallel
- [ ] **Debug support**: Failed tests provide clear debugging info

### Performance Targets
- [ ] **Health endpoint**: <100ms response time
- [ ] **LLM endpoints**: <5s response time (with timeout handling)
- [ ] **Streaming startup**: <2s to first chunk
- [ ] **Test execution**: Complete suite <30s
- [ ] **Server startup**: <5s for test runs

### Documentation
- [ ] **Test patterns**: Common patterns documented
- [ ] **Error scenarios**: Known error conditions documented
- [ ] **Performance benchmarks**: Response time expectations documented
- [ ] **Debugging guide**: How to debug failed integration tests

## Implementation Notes

### Migration Strategy
1. **Identify existing tests**: Catalog current Supertest integration tests
2. **Create Playwright equivalents**: Convert test logic to Playwright patterns
3. **Add missing coverage**: Identify and add missing endpoint tests
4. **Validate in CI**: Ensure tests run reliably in CI environment
5. **Remove old tests**: Clean up Supertest dependencies

### Test Organization
```bash
tests/integration/domain/
├── health.spec.ts           # Health endpoint tests
├── llm-prompt.spec.ts       # Prompt endpoint tests  
├── llm-streaming.spec.ts    # Streaming tests
├── providers.spec.ts        # Provider endpoint tests
├── error-handling.spec.ts   # Error scenario tests
└── performance.spec.ts      # Performance validation
```

### Common Patterns
- **Test data factories**: Use established test data patterns
- **Error validation**: Consistent error response validation
- **Performance testing**: Response time validation
- **Streaming handling**: SSE parsing and validation
- **Authentication**: Handle auth tokens where needed

### CI/CD Considerations
- **Environment setup**: Ensure test environment variables
- **Server dependencies**: Domain server running with test config
- **Database state**: Clean test database state
- **Provider mocking**: Mock external provider calls appropriately
- **Timeouts**: Appropriate timeout settings for CI

## Dependencies
- **Upstream**: Story 2 (Playwright Framework Setup)
- **Downstream**: Can run in parallel with Story 4
- **Blocking**: None after Story 2 completion

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Legacy Supertest tests migrated or removed
- [ ] CI/CD pipeline integration validated
- [ ] Performance benchmarks established
- [ ] Documentation completed
- [ ] Code review completed 