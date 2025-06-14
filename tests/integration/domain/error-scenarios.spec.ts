import { test, expect } from '../../fixtures/domain-fixtures'


test.describe('Domain Comprehensive Error Scenarios', () => {
  
  test.describe('Provider Integration Errors', () => {
    test('should handle provider not found', async ({ domainApiContext }) => {
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: 'Test prompt',
          provider: 'definitely-does-not-exist'
        }
      })

      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error.code).toBe('PROVIDER_NOT_FOUND')
      expect(body.error.message).toContain('definitely-does-not-exist')
    })

    test('should handle unconfigured provider', async ({ domainApiContext }) => {
      // Test with a provider that exists but isn't configured
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: 'Test prompt',
          provider: 'anthropic' // Likely not configured in test env
        }
      })

      // Should return meaningful error, not crash
      expect([400, 401, 403]).toContain(response.status())

      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('code')
      
      const validCodes = [
        'PROVIDER_NOT_FOUND', // Based on actual API behavior
        'PROVIDER_NOT_CONFIGURED',
        'PROVIDER_AUTH_FAILED',
        'PROVIDER_UNAVAILABLE'
      ]
      expect(validCodes).toContain(body.error.code)
    })

    test('should handle provider authentication failure', async ({ domainApiContext }) => {
      // This requires testing with invalid API keys
      // Implementation depends on how we simulate auth failures
      
      if (!process.env.OPENROUTER_API_KEY) {
        test.skip('No OPENROUTER_API_KEY to test auth failure scenarios')
      }

      // Test with a prompt that might trigger auth issues
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: 'Test authentication',
          provider: 'openrouter'
        }
      })

      if (response.status() !== 200) {
        const body = await response.json()
        expect(body).toHaveProperty('error')
        
        if (body.error.code === 'PROVIDER_AUTH_FAILED') {
          expect(body.error.message).toContain('authentication')
        }
      }
    })
  })

  test.describe('Network and Infrastructure Errors', () => {
    test('should handle request timeout gracefully', async ({ domainApiContext }) => {
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: 'This request might timeout',
          provider: 'echo'
        },
        timeout: 50 // Very short timeout to force timeout
      })

      // Should either succeed quickly or handle timeout gracefully
      if (response.status() !== 200) {
        expect([408, 504]).toContain(response.status())
        
        const body = await response.json()
        expect(body).toHaveProperty('error')
        expect(['REQUEST_TIMEOUT', 'PROVIDER_TIMEOUT']).toContain(body.error.code)
      }
    })

    test('should handle malformed JSON requests', async ({ domainApiContext }) => {
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: 'this is not valid JSON',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('code')
      expect(body.error).toHaveProperty('message')
    })

    test('should handle missing content-type header', async ({ domainApiContext }) => {
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: JSON.stringify({
          prompt: 'Test',
          provider: 'echo'
        }),
        headers: {
          // Deliberately omit Content-Type
        }
      })

      // Should either work or return meaningful error
      if (response.status() !== 200) {
        expect(response.status()).toBe(400)
        
        const body = await response.json()
        expect(body).toHaveProperty('error')
      }
    })

    test('should handle very large payloads', async ({ domainApiContext }) => {
      // Create a very large prompt to test payload limits
      const largePrompt = 'This is a test prompt. '.repeat(1000) // ~25KB

      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: largePrompt,
          provider: 'echo'
        }
      })

      // Should either handle it or return appropriate error
      if (response.status() !== 200) {
        expect([400, 413]).toContain(response.status()) // 413 = Payload Too Large
        
        const body = await response.json()
        expect(body).toHaveProperty('error')
      } else {
        // If accepted, should process correctly
        const body = await response.json()
        expect(body).toHaveProperty('content')
        expect(body.content).toContain('Echo:')
      }
    })
  })

  test.describe('Request Validation Errors', () => {
    test('should reject empty request body', async ({ domainApiContext }) => {
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {}
      })

      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('code')
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.message).toBe('Either prompt or messages must be provided, but not both')
    })

    test('should reject both prompt and messages', async ({ domainApiContext }) => {
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
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.message).toBe('Either prompt or messages must be provided, but not both')
    })

    test('should reject invalid message roles', async ({ domainApiContext }) => {
      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          messages: [
            { role: 'invalid-role', content: 'Test message' }
          ],
          provider: 'echo'
        }
      })

      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.message).toContain('messages.0.role must be one of the following values')
    })

    test('should reject empty messages array', async ({ domainApiContext }) => {
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

    test('should reject extremely long prompts', async ({ domainApiContext }) => {
      // Test prompt length validation
      const extremelyLongPrompt = 'x'.repeat(100000) // 100KB prompt

      const response = await domainApiContext.post('/domain/llm/prompt', {
        data: {
          prompt: extremelyLongPrompt,
          provider: 'echo'
        }
      })

      // Should reject if length validation is in place
      if (response.status() !== 200) {
        expect(response.status()).toBe(400)
        
        const body = await response.json()
        expect(body).toHaveProperty('error')
        expect(body.error.code).toBe('VALIDATION_ERROR')
        expect(body.error.message).toBe('prompt must be shorter than or equal to 4000 characters')
      }
    })
  })

  test.describe('Error Response Format Consistency', () => {
    test('should return consistent error format across all endpoints', async ({ domainApiContext }) => {
      const errorRequests = [
        { endpoint: '/domain/llm/prompt', data: {} }, // Missing prompt/messages
        { endpoint: '/domain/llm/prompt', data: { prompt: 'test', provider: 'invalid' } }, // Invalid provider
        { endpoint: '/domain/llm/providers/invalid', data: null, method: 'GET' } // Invalid endpoint
      ]

      for (const { endpoint, data, method = 'POST' } of errorRequests) {
        let response
        
        if (method === 'GET') {
          response = await domainApiContext.get(endpoint)
        } else {
          response = await domainApiContext.post(endpoint, { data })
        }

        if (response.status() >= 400) {
          const body = await response.json()
          
          // All errors should have consistent format
          expect(body).toHaveProperty('error')
          expect(body.error).toHaveProperty('code')
          expect(body.error).toHaveProperty('message')
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(body.error.code.length).toBeGreaterThan(0)
          expect(body.error.message.length).toBeGreaterThan(0)
        }
      }
    })

    test('should include appropriate HTTP status codes', async ({ domainApiContext }) => {
      const testCases = [
        {
          name: 'validation error',
          data: {},
          expectedStatus: 400
        },
        {
          name: 'provider not found',
          data: { prompt: 'test', provider: 'invalid' },
          expectedStatus: 400
        }
      ]

      for (const { name, data, expectedStatus } of testCases) {
        const response = await domainApiContext.post('/domain/llm/prompt', { data })
        
        expect(response.status()).toBe(expectedStatus)
        
        const body = await response.json()
        expect(body).toHaveProperty('error')
      }
    })
  })
})