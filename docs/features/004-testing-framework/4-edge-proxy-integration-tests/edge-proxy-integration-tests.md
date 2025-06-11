# Edge Proxy Integration Tests and Validation

## Objective
Implement comprehensive Edge API integration testing using Playwright, focusing on proxy behavior validation, cross-tier communication, and error handling across the Edge → Domain boundary.

## Background
Edge tier currently has minimal integration testing (6 basic unit tests). This story establishes comprehensive integration testing to validate the Edge tier's core responsibility as a proxy layer between CLI clients and the Domain server.

## Scope

### In Scope
- Comprehensive Edge API endpoint testing
- Edge → Domain proxy behavior validation
- Cross-tier communication testing
- Error handling and timeout scenarios
- Load balancing and failover testing (if applicable)
- CORS and security header validation

### Out of Scope
- Unit test changes
- CLI E2E testing (covered in Story 5)
- Cloudflare Workers deployment testing
- Performance/load testing

## Technical Requirements

### Edge API Endpoints to Test
```typescript
// All Edge endpoints requiring coverage
interface EdgeEndpoints {
  health: 'GET /health'
  llmPrompt: 'POST /api/v1/llm/prompt'
  llmProviders: 'GET /api/v1/llm/providers'
  llmStream: 'POST /api/v1/llm/prompt (streaming)'
  notFound: 'Any undefined route'
}
```

### Test Implementation Patterns

#### Edge Health Endpoint
```typescript
// tests/integration/edge/health.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Edge Health Endpoint', () => {
  test('should return edge health status', async ({ apiContext }) => {
    const response = await apiContext.get('/health')
    
    expect(response.status()).toBe(200)
    
    const health = await response.json()
    expect(health).toEqual({
      status: 'ok',
      service: 'liminal-chat-edge',
      domainUrl: 'http://localhost:8766',
      timestamp: expect.any(String)
    })
  })

  test('should include domain connectivity check', async ({ apiContext }) => {
    const response = await apiContext.get('/health')
    const health = await response.json()
    
    expect(health).toHaveProperty('domainUrl')
    expect(health.domainUrl).toBe('http://localhost:8766')
  })

  test('should respond quickly', async ({ apiContext }) => {
    const start = Date.now()
    const response = await apiContext.get('/health')
    const duration = Date.now() - start
    
    expect(response.status()).toBe(200)
    expect(duration).toBeLessThan(50) // Edge should be very fast
  })
})
```

#### Edge Proxy Behavior Testing
```typescript
// tests/integration/edge/proxy-behavior.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Edge Proxy Behavior', () => {
  test('should proxy LLM prompt to domain', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    
    const result = await response.json()
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('model')
    expect(result).toHaveProperty('usage')
  })

  test('should preserve request headers through proxy', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request,
      headers: {
        'X-Request-ID': 'test-request-123',
        'User-Agent': 'liminal-cli/1.0.0'
      }
    })
    
    expect(response.status()).toBe(200)
    // Verify that custom headers don't interfere with proxy
  })

  test('should handle domain server errors', async ({ apiContext }) => {
    // Test when domain returns error
    const invalidRequest = {
      prompt: '', // Empty prompt should cause validation error
      provider: 'openrouter'
    }
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: invalidRequest
    })
    
    expect(response.status()).toBe(400)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('prompt')
  })

  test('should proxy providers endpoint', async ({ apiContext }) => {
    const response = await apiContext.get('/api/v1/llm/providers')
    
    expect(response.status()).toBe(200)
    
    const providers = await response.json()
    expect(Array.isArray(providers)).toBe(true)
    expect(providers.length).toBeGreaterThan(0)
    
    // Verify provider structure is preserved through proxy
    const provider = providers[0]
    expect(provider).toHaveProperty('name')
    expect(provider).toHaveProperty('displayName')
  })
})
```

#### Streaming Proxy Testing
```typescript
// tests/integration/edge/streaming-proxy.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Edge Streaming Proxy', () => {
  test('should proxy streaming responses', async ({ apiContext, testData }) => {
    const request = testData.createStreamingRequest()
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/event-stream')
    
    // Validate streaming data is properly proxied
    const body = await response.body()
    const text = body.toString()
    
    expect(text).toContain('data: ')
    expect(text).toContain('[DONE]')
    
    // Verify SSE format is preserved
    const lines = text.split('\n')
    const dataLines = lines.filter(line => line.startsWith('data: '))
    expect(dataLines.length).toBeGreaterThan(0)
  })

  test('should handle streaming errors through proxy', async ({ apiContext }) => {
    const invalidStreamRequest = {
      prompt: 'test',
      provider: 'invalid-provider',
      stream: true
    }
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: invalidStreamRequest
    })
    
    expect(response.status()).toBe(400)
    // Should not be text/event-stream for errors
    expect(response.headers()['content-type']).not.toContain('text/event-stream')
  })

  test('should maintain streaming connection stability', async ({ apiContext, testData }) => {
    const request = testData.createStreamingRequest({
      prompt: 'Generate a longer response to test streaming stability'
    })
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(200)
    
    const body = await response.body()
    const text = body.toString()
    
    // Should have multiple chunks for longer response
    const dataLines = text.split('\n').filter(line => line.startsWith('data: '))
    expect(dataLines.length).toBeGreaterThan(2)
    
    // Should end with [DONE] 
    expect(text.trim()).toEndWith('data: [DONE]')
  })
})
```

#### Error Handling and Resilience
```typescript
// tests/integration/edge/error-handling.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Edge Error Handling', () => {
  test('should handle domain server unavailable', async ({ apiContext, testData }) => {
    // This test assumes we can simulate domain server being down
    // Implementation might vary based on test infrastructure
    
    const request = testData.createPromptRequest()
    
    // Could use network interception to simulate domain server down
    await apiContext.route('**/domain/**', route => {
      route.abort('connectionrefused')
    })
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request
    })
    
    expect(response.status()).toBe(503) // Service Unavailable
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('Domain server')
  })

  test('should handle malformed requests', async ({ apiContext }) => {
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: 'invalid json string',
      headers: { 'Content-Type': 'application/json' }
    })
    
    expect(response.status()).toBe(400)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.code).toBe('EDGE_INVALID_REQUEST')
  })

  test('should handle undefined routes', async ({ apiContext }) => {
    const response = await apiContext.get('/undefined/route')
    
    expect(response.status()).toBe(404)
    
    const error = await response.json()
    expect(error).toEqual({
      error: 'Not found',
      code: 'EDGE_NOT_FOUND'
    })
  })

  test('should handle timeout scenarios', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    // Set very short timeout to force timeout scenario
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request,
      timeout: 100 // 100ms timeout
    })
    
    // Should either succeed quickly or timeout gracefully
    if (response.status() !== 200) {
      expect([408, 504]).toContain(response.status())
    }
  })
})
```

#### CORS and Security Headers
```typescript
// tests/integration/edge/security.spec.ts
import { test, expect } from '../../fixtures/base-fixtures'

test.describe('Edge Security Headers', () => {
  test('should include proper CORS headers', async ({ apiContext }) => {
    const response = await apiContext.options('/api/v1/llm/prompt', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST'
      }
    })
    
    expect(response.status()).toBe(200)
    expect(response.headers()).toHaveProperty('access-control-allow-origin')
    expect(response.headers()).toHaveProperty('access-control-allow-methods')
  })

  test('should include security headers', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request
    })
    
    const headers = response.headers()
    
    // Verify security headers are present
    expect(headers).toHaveProperty('x-content-type-options')
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  test('should handle cross-origin requests', async ({ apiContext, testData }) => {
    const request = testData.createPromptRequest()
    
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: request,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    })
    
    expect(response.status()).toBe(200)
    expect(response.headers()).toHaveProperty('access-control-allow-origin')
  })
})
```

## Acceptance Criteria

### Endpoint Coverage
- [ ] **Health endpoint**: Edge-specific health check with domain connectivity
- [ ] **LLM prompt proxy**: Both prompt and messages format proxying
- [ ] **LLM streaming proxy**: SSE streaming through Edge → Domain
- [ ] **Providers proxy**: Provider list proxying with structure preservation
- [ ] **Error routing**: 404 handling for undefined routes

### Proxy Behavior Validation
- [ ] **Request proxying**: All request data properly forwarded to Domain
- [ ] **Response proxying**: All response data properly returned to client
- [ ] **Header preservation**: Important headers maintained through proxy
- [ ] **Status code mapping**: Domain status codes properly proxied
- [ ] **Error translation**: Domain errors properly formatted for clients

### Cross-Tier Communication
- [ ] **Success scenarios**: All happy path flows Edge → Domain working
- [ ] **Error propagation**: Domain errors properly bubbled up through Edge
- [ ] **Timeout handling**: Long-running requests handled appropriately
- [ ] **Connection resilience**: Network issues handled gracefully
- [ ] **Performance preservation**: Minimal overhead added by Edge layer

### Security and Headers
- [ ] **CORS configuration**: Cross-origin requests handled properly
- [ ] **Security headers**: Appropriate security headers included
- [ ] **Request validation**: Malformed requests rejected at Edge
- [ ] **Authentication passthrough**: Auth headers forwarded appropriately
- [ ] **Content-Type handling**: Proper content type validation

### Performance and Reliability
- [ ] **Response times**: Edge adds <50ms overhead to Domain calls
- [ ] **Concurrent requests**: Multiple simultaneous requests handled
- [ ] **Memory efficiency**: No memory leaks in proxy operations
- [ ] **Error recovery**: Graceful handling of Domain server issues
- [ ] **Streaming performance**: Streaming latency minimized

## Implementation Notes

### Test Organization
```bash
tests/integration/edge/
├── health.spec.ts              # Edge health endpoint
├── proxy-behavior.spec.ts      # Basic proxy functionality
├── streaming-proxy.spec.ts     # Streaming proxy tests
├── error-handling.spec.ts      # Error scenarios
├── security.spec.ts           # CORS and security headers
└── performance.spec.ts        # Performance validation
```

### Proxy Testing Patterns
- **Request validation**: Ensure requests reach Domain unchanged
- **Response validation**: Ensure Domain responses reach client unchanged
- **Error mapping**: Verify error codes and messages are preserved
- **Header handling**: Validate header forwarding and CORS
- **Performance monitoring**: Track proxy overhead

### Environment Considerations
- **Cloudflare Workers**: Edge runs in Cloudflare Workers locally
- **Domain connectivity**: Ensure reliable Domain server for testing
- **Network simulation**: Consider network condition simulation
- **Concurrency**: Test multiple simultaneous proxy operations
- **Resource limits**: Validate behavior under resource constraints

### Common Edge-Specific Patterns
```typescript
// Proxy validation pattern
test('proxy validation', async ({ apiContext, testData }) => {
  const request = testData.createPromptRequest()
  
  // Make request through Edge
  const edgeResponse = await apiContext.post('/api/v1/llm/prompt', {
    data: request
  })
  
  // Validate proxy behavior
  expect(edgeResponse.status()).toBe(200)
  
  const result = await edgeResponse.json()
  expect(result).toHaveProperty('content')
  // Verify Edge didn't modify Domain response
})
```

### CI/CD Considerations
- **Edge server startup**: Cloudflare Workers dev server
- **Domain dependency**: Ensure Domain server available
- **Network reliability**: Account for network variability in CI
- **Parallel execution**: Safe concurrent proxy testing
- **Resource cleanup**: Proper cleanup of proxy resources

## Dependencies
- **Upstream**: Story 2 (Playwright Framework Setup)
- **Downstream**: Can run in parallel with Story 3
- **Blocking**: None after Story 2 completion

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Edge proxy behavior fully validated
- [ ] Cross-tier communication tested
- [ ] Security and CORS properly validated
- [ ] Performance benchmarks established
- [ ] CI/CD integration completed
- [ ] Documentation updated
- [ ] Code review completed 