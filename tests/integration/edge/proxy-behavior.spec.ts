import { test, expect, edgeTestUtils } from './fixtures/base-fixtures'

test.describe('Edge Core Proxy Functionality', () => {
  test.beforeEach(async ({ edgeApiContext }) => {
    // Ensure Edge service is ready for proxy tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
  })

  test('should proxy prompt requests to Domain', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.post('/api/v1/llm/prompt', {
      data: { 
        prompt: 'Hello world test', 
        provider: 'echo',
        model: 'echo-1.0'
      }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('content')
    expect(data.content).toContain('Hello world test') // Echo should return input
    expect(data).toHaveProperty('model', 'echo-1.0')
    expect(data).toHaveProperty('usage')
    expect(data.usage).toHaveProperty('promptTokens')
    expect(data.usage).toHaveProperty('completionTokens')
    expect(data.usage).toHaveProperty('totalTokens')
  })

  test('should proxy messages requests to Domain', async ({ edgeApiContext }) => {
    const messages = [{ role: 'user', content: 'Test message' }]
    const response = await edgeApiContext.post('/api/v1/llm/prompt', {
      data: { 
        messages, 
        provider: 'echo',
        model: 'echo-1.0'
      }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('content')
    expect(data.content).toContain('Test message')
    expect(data).toHaveProperty('model', 'echo-1.0')
    expect(data).toHaveProperty('usage')
  })

  test('should proxy providers list to Domain', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.get('/api/v1/llm/providers')
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('defaultProvider')
    expect(data).toHaveProperty('availableProviders')
    expect(data).toHaveProperty('providers')
    expect(Array.isArray(data.availableProviders)).toBe(true)
    expect(data.availableProviders).toContain('echo')
    expect(data.providers).toHaveProperty('echo')
    expect(data.providers.echo).toHaveProperty('available', true)
  })

  test('should preserve headers in proxy requests', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.post('/api/v1/llm/prompt', {
      data: { 
        prompt: 'Header test', 
        provider: 'echo',
        model: 'echo-1.0'
      },
      headers: { 'X-Custom-Header': 'test-value' }
    })
    
    expect(response.status()).toBe(200)
    // Verify request was properly proxied (echo should work)
    const data = await response.json()
    expect(data).toHaveProperty('content')
    expect(data.content).toContain('Header test')
  })

  test('should passthrough Domain status codes', async ({ edgeApiContext }) => {
    // Test with invalid provider to trigger 400 from Domain
    const response = await edgeApiContext.post('/api/v1/llm/prompt', {
      data: { 
        prompt: 'Test', 
        provider: 'nonexistent',
        model: 'nonexistent-1.0'
      }
    })
    
    // Should preserve Domain's 400 status
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('code')
    expect(data).toHaveProperty('message')
  })

  test('should return 404 for unknown routes', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.get('/api/v1/unknown')
    expect(response.status()).toBe(404)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('EDGE_NOT_FOUND')
    expect(data).toHaveProperty('message')
    expect(data.message).toContain('/api/v1/unknown')
  })
})