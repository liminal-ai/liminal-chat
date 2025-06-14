import { test, expect } from '../../fixtures/domain-fixtures'

// Performance thresholds from specification requirements
const PERFORMANCE_THRESHOLDS = {
  llmPrompt: 5000, // ms - LLM endpoints must respond within 5s per spec
}


test.describe('Domain LLM Prompt Endpoint', () => {
  test('should process prompt with echo provider', async ({ domainApiContext }) => {
    const start = Date.now()
    
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Hello, world!',
        provider: 'echo'
      }
    })

    const duration = Date.now() - start

    expect(response.status()).toBe(200)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.llmPrompt)
    console.log(`LLM prompt response time: ${duration}ms`)

    const body = await response.json()
    expect(body).toHaveProperty('content', 'Echo: Hello, world!')
    expect(body).toHaveProperty('model', 'echo-1.0')
    expect(body).toHaveProperty('usage')
    expect(body.usage).toHaveProperty('promptTokens')
    expect(body.usage).toHaveProperty('completionTokens')
    expect(body.usage).toHaveProperty('totalTokens')
  })

  test('should process messages with echo provider', async ({ domainApiContext }) => {
    const start = Date.now()
    
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' }
        ],
        provider: 'echo'
      }
    })

    const duration = Date.now() - start

    expect(response.status()).toBe(200)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.llmPrompt)
    console.log(`LLM messages response time: ${duration}ms`)

    const body = await response.json()
    expect(body).toHaveProperty('content', 'Echo: Hello')
    expect(body).toHaveProperty('model', 'echo-1.0')
    expect(body).toHaveProperty('usage')
  })

  test('should return 400 for validation errors', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        // Missing both prompt and messages
        provider: 'echo'
      }
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toHaveProperty('code')
    expect(body.error).toHaveProperty('message')
  })

  test('should return proper error for missing provider', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Test',
        provider: 'non-existent'
      }
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error.code).toBe('PROVIDER_NOT_FOUND')
    expect(body.error.message).toContain("Provider 'non-existent' not found")
  })

  test('should handle both prompt and messages validation', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Test message' }],
        provider: 'echo'
      }
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error')
    // Should reject when both prompt and messages are provided
  })

  test('should validate empty prompt', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: '',
        provider: 'echo'
      }
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('should validate empty messages array', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        messages: [],
        provider: 'echo'
      }
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('should handle malformed JSON gracefully', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: 'invalid json string',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})