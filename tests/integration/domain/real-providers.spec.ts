import { test, expect } from '../../fixtures/domain-fixtures'

// Performance thresholds for real provider calls
const PERFORMANCE_THRESHOLDS = {
  llmPrompt: 5000, // ms - LLM endpoints must respond within 5s per spec
}


test.describe('Domain Real Provider Integration', () => {
  // Skip tests if no API keys are available
  test.beforeEach(async () => {
    if (!process.env.OPENROUTER_API_KEY) {
      test.skip('OPENROUTER_API_KEY not available - skipping real provider tests')
    }
  })

  test('should handle OpenRouter provider with real API', async ({ domainApiContext }) => {
    const start = Date.now()
    
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Hello, respond with exactly "Real API Success"',
        provider: 'openrouter'
      }
    })

    const duration = Date.now() - start

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('content')
    expect(body).toHaveProperty('model')
    expect(body).toHaveProperty('usage')
    expect(body.usage).toHaveProperty('promptTokens')
    expect(body.usage).toHaveProperty('completionTokens')
    expect(body.usage).toHaveProperty('totalTokens')
    
    // Validate performance
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.llmPrompt)
    console.log(`OpenRouter API response time: ${duration}ms`)
    
    // Content should be a non-empty string
    expect(typeof body.content).toBe('string')
    expect(body.content.length).toBeGreaterThan(0)
    
    // Model should be OpenRouter format
    expect(body.model).toContain('/')
  })

  test('should handle messages format with real provider', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        messages: [
          { role: 'system', content: 'You are a test assistant. Respond briefly.' },
          { role: 'user', content: 'Say "Message format works"' }
        ],
        provider: 'openrouter'
      }
    })

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('content')
    expect(typeof body.content).toBe('string')
    expect(body.content.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('usage')
  })

  test('should handle provider authentication errors', async ({ domainApiContext }) => {
    // This test requires a way to simulate auth failure
    // We'll test with a provider that requires API key but isn't configured
    
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Test prompt',
        provider: 'anthropic' // Assume this isn't configured in test env
      }
    })

    // Should get a provider error, not a 500
    expect([400, 401, 403]).toContain(response.status())

    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toHaveProperty('code')
    
    // Should be a meaningful error code
    const validErrorCodes = [
      'PROVIDER_AUTH_FAILED',
      'PROVIDER_NOT_CONFIGURED',
      'PROVIDER_UNAVAILABLE',
      'PROVIDER_NOT_FOUND'
    ]
    expect(validErrorCodes).toContain(body.error.code)
  })

  test('should handle provider service unavailable', async ({ domainApiContext }) => {
    // Test timeout behavior with a very short timeout
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'This is a test prompt that might timeout',
        provider: 'openrouter'
      },
      timeout: 5000 // 5 second timeout to potentially trigger timeout
    })

    // Should either succeed or handle timeout gracefully
    if (response.status() !== 200) {
      expect([408, 504, 400]).toContain(response.status())
      
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('code')
      
      const validTimeoutCodes = [
        'PROVIDER_TIMEOUT',
        'PROVIDER_UNAVAILABLE',
        'REQUEST_TIMEOUT'
      ]
      expect(validTimeoutCodes).toContain(body.error.code)
    }
  })

  test('should handle rate limiting gracefully', async ({ domainApiContext }) => {
    // Make multiple rapid requests to potentially trigger rate limiting
    const promises = Array(3).fill(null).map((_, i) => 
      domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: `Rate limit test ${i}`,
          provider: 'openrouter'
        }
      })
    )

    const responses = await Promise.all(promises)
    
    // At least one should succeed
    const successfulResponses = responses.filter(r => r.status() === 200)
    expect(successfulResponses.length).toBeGreaterThan(0)
    
    // If any are rate limited, they should return appropriate error
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    for (const response of rateLimitedResponses) {
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error.code).toBe('PROVIDER_RATE_LIMITED')
    }
  })

  test('should validate real provider configuration', async ({ domainApiContext }) => {
    // Test that we can detect properly configured vs unconfigured providers
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Configuration test',
        provider: 'openrouter'
      }
    })

    // Should succeed if properly configured
    expect(response.status()).toBe(200)
    
    // Or return meaningful configuration error
    if (response.status() !== 200) {
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(['PROVIDER_NOT_CONFIGURED', 'PROVIDER_AUTH_FAILED']).toContain(body.error.code)
    }
  })
})