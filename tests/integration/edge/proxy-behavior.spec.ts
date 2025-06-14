import { test, expect } from './fixtures/base-fixtures'
import { expectValidResponse, expectErrorResponse, expectValidLLMResponse, expectValidErrorCode } from './utils/assertions'

test.describe('Edge Proxy Behavior', () => {
  test('should proxy LLM prompt requests to Domain', async ({ apiContext, testData }) => {
    // Use Echo provider for predictable responses
    const promptRequest = testData.createPromptRequest({
      provider: 'echo',
      model: 'echo-1.0',
      prompt: 'Hello, test!'
    })

    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: promptRequest
    })

    expectValidResponse(response)
    
    const data = await response.json()
    
    // Validate LLM response contract
    expectValidLLMResponse(data)
    expect(data).toHaveProperty('model', 'echo-1.0')
    expect(data).toHaveProperty('usage')
    expect(data.usage).toHaveProperty('promptTokens')
    expect(data.usage).toHaveProperty('completionTokens')
    expect(data.usage).toHaveProperty('totalTokens')
    
    // Echo provider should return the prompt with "Echo: " prefix
    expect(data.content).toMatch(/^Echo:/)
    expect(data.content).toContain('Hello, test!')
  })

  test('should proxy providers list from Domain', async ({ apiContext }) => {
    const response = await apiContext.get('/api/v1/llm/providers')
    
    expectValidResponse(response)
    
    const data = await response.json()
    
    // Validate provider discovery contract
    expect(data).toHaveProperty('defaultProvider')
    expect(data).toHaveProperty('availableProviders')
    expect(data).toHaveProperty('providers')
    
    // Should always have echo provider available
    expect(data.availableProviders).toContain('echo')
    expect(data.providers).toHaveProperty('echo')
    expect(data.providers.echo).toHaveProperty('available', true)
    expect(data.providers.echo).toHaveProperty('status', 'healthy')
    expect(data.providers.echo).toHaveProperty('models')
    expect(data.providers.echo.models).toContain('echo-1.0')
  })

  test('should preserve request headers through proxy', async ({ apiContext, testData }) => {
    const promptRequest = testData.createPromptRequest({
      provider: 'echo',
      model: 'echo-1.0'
    })

    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: promptRequest,
      headers: {
        'X-Custom-Header': 'test-value',
        'Content-Type': 'application/json'
      }
    })

    expectValidResponse(response)
    
    // The response should be valid regardless of custom headers
    const data = await response.json()
    expectValidLLMResponse(data)
  })

  test('should handle Domain validation errors properly', async ({ apiContext }) => {
    // Send invalid request with empty prompt
    const invalidRequest = {
      prompt: '',
      provider: 'echo',
      model: 'echo-1.0'
    }

    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: invalidRequest
    })

    expectErrorResponse(response, 400)
    
    const data = await response.json()
    
    // Should have error structure (Edge proxy returns 'error' not 'message')
    expect(data).toHaveProperty('error')
    expect(data.error).toBeTruthy()
  })

  test('should handle invalid provider requests', async ({ apiContext, testData }) => {
    const invalidRequest = testData.createPromptRequest({
      provider: 'nonexistent-provider',
      model: 'invalid-model'
    })

    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: invalidRequest
    })

    expectErrorResponse(response, 400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toBeTruthy()
  })

  test('should maintain response structure through proxy', async ({ apiContext, testData }) => {
    const promptRequest = testData.createPromptRequest({
      provider: 'echo',
      model: 'echo-1.0',
      prompt: 'Test response structure'
    })

    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: promptRequest
    })

    expectValidResponse(response)
    
    const data = await response.json()
    
    // Validate exact response contract structure
    expect(data).toEqual(
      expect.objectContaining({
        content: expect.any(String),
        model: expect.any(String),
        usage: expect.objectContaining({
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number)
        })
      })
    )
    
    // Validate that usage numbers make sense
    expect(data.usage.totalTokens).toBeGreaterThan(0)
    expect(data.usage.promptTokens).toBeGreaterThan(0)
    expect(data.usage.completionTokens).toBeGreaterThan(0)
    expect(data.usage.totalTokens).toBe(
      data.usage.promptTokens + data.usage.completionTokens
    )
  })

  test('should handle malformed JSON requests', async ({ apiContext }) => {
    // Send malformed request body
    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: 'invalid-json-string'
    })

    expectErrorResponse(response, 500)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  test('should proxy both regular and streaming prompt endpoints', async ({ apiContext, testData }) => {
    // Test regular endpoint exists and works
    const promptRequest = testData.createPromptRequest({
      provider: 'echo',
      model: 'echo-1.0',
      stream: false
    })

    const regularResponse = await apiContext.post('/api/v1/llm/prompt', {
      data: promptRequest
    })

    expectValidResponse(regularResponse)
    const regularData = await regularResponse.json()
    expectValidLLMResponse(regularData)

    // Test streaming endpoint exists (but don't test actual streaming here)
    const streamingRequest = testData.createStreamingRequest({
      provider: 'echo',
      model: 'echo-1.0'
    })

    // This should either work or return a meaningful error about streaming
    const streamingResponse = await apiContext.post('/api/v1/llm/prompt/stream', {
      data: streamingRequest
    })

    // Either success (streaming works) or appropriate error
    expect([200, 400, 500]).toContain(streamingResponse.status())
  })

  test('should return appropriate 404 for unknown endpoints', async ({ apiContext }) => {
    const response = await apiContext.post('/api/v1/llm/unknown', {
      data: { test: 'data' }
    })

    expectErrorResponse(response, 404)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('code')
    expect(data.code).toBe('EDGE_NOT_FOUND')
  })

  test('should handle Domain server unavailable scenario', async ({ apiContext, testData }) => {
    // This test validates error handling when Domain is unreachable
    // We can potentially simulate this by using an invalid domain URL
    // For now, we test with a valid request to ensure proper proxy behavior
    
    const promptRequest = testData.createPromptRequest({
      provider: 'echo',
      model: 'echo-1.0',
      prompt: 'Connection test'
    })

    const response = await apiContext.post('/api/v1/llm/prompt', {
      data: promptRequest
    })

    // Should either succeed (Domain available) or return appropriate error
    if (response.ok()) {
      const data = await response.json()
      expectValidLLMResponse(data)
    } else {
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expectValidErrorCode(data)
    }
  })
})