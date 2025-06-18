import { test, expect, edgeTestUtils } from './fixtures/base-fixtures'

test.describe('Edge Error-Handling Matrix', () => {
  test.beforeEach(async ({ edgeApiContext }) => {
    // Ensure Edge service is ready for error handling tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
  })

  test.describe('Validation Errors', () => {
    test('should reject empty prompt', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: '', 
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_VALIDATION_ERROR')
      expect(data.error).toMatch(/invalid.*prompt|prompt.*invalid/i)
    })

    test('should reject malformed messages', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          messages: [{ invalid: 'structure' }], 
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      // Edge returns DOMAIN_INVALID_RESPONSE when Domain validation fails
      expect(data.code).toBe('DOMAIN_INVALID_RESPONSE')
    })

    test('should reject malformed JSON', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: 'invalid json string'
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_INVALID_REQUEST')
      expect(data.error).toMatch(/invalid.*json|json.*invalid/i)
    })

    test('should reject oversized payload', async ({ edgeApiContext }) => {
      const largePrompt = 'x'.repeat(1024 * 1024 + 100) // >1MB
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: largePrompt, 
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      
      expect(response.status()).toBe(413)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_INVALID_REQUEST')
      expect(data.error).toMatch(/request.*too.*large|too.*large.*request/i)
    })
  })

  test.describe('Domain Error Passthrough', () => {
    test('should passthrough 400 from Domain (both prompt and messages)', async ({ edgeApiContext }) => {
      // Trigger Domain 400 with invalid request structure (both prompt and messages)
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: 'test', 
          messages: [{ role: 'user', content: 'test' }],
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_INVALID_REQUEST')
    })

    test('should passthrough provider not found errors', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: 'test', 
          provider: 'nonexistent',
          model: 'nonexistent-1.0'
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
    })

    test('should handle empty messages array', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          messages: [], 
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_VALIDATION_ERROR')
      // Edge returns "Invalid prompt" for empty messages array
      expect(data.error).toMatch(/invalid.*prompt|prompt.*invalid/i)
    })

    test('should handle missing required fields', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          provider: 'echo',
          model: 'echo-1.0'
          // Missing both prompt and messages
        }
      })
      
      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_INVALID_REQUEST')
    })
  })

  test.describe('Content-Type Validation', () => {
    test('should reject non-JSON content type', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: '{"prompt": "test", "provider": "echo", "model": "echo-1.0"}',
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      
      expect(response.status()).toBe(415)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(data.code).toBe('EDGE_INVALID_REQUEST')
      expect(data.error).toMatch(/invalid.*content.*type|content.*type.*invalid/i)
    })

    test('should accept application/json content type', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: 'test', 
          provider: 'echo',
          model: 'echo-1.0'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      expect(response.status()).toBe(200)
    })
  })

  test.describe('Error Response Contract', () => {
    test('should return consistent error response structure', async ({ edgeApiContext }) => {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: '', 
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      
      const data = await response.json()
      
      // Verify consistent error structure
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('code')
      expect(data).toHaveProperty('message')
      expect(typeof data.error).toBe('string')
      expect(typeof data.code).toBe('string')
      expect(typeof data.message).toBe('string')
      expect(data.error.length).toBeGreaterThan(0)
      expect(data.code.length).toBeGreaterThan(0)
      expect(data.message.length).toBeGreaterThan(0)
    })

    test('should use consistent error codes across scenarios', async ({ edgeApiContext }) => {
      // Test multiple validation errors to ensure consistent code usage
      const scenarios = [
        { data: { prompt: '', provider: 'echo', model: 'echo-1.0' }, expectedCode: 'EDGE_VALIDATION_ERROR' },
        { data: { messages: [], provider: 'echo', model: 'echo-1.0' }, expectedCode: 'EDGE_VALIDATION_ERROR' },
        { data: { provider: 'echo', model: 'echo-1.0' }, expectedCode: 'EDGE_INVALID_REQUEST' }
      ]
      
      for (const scenario of scenarios) {
        const response = await edgeApiContext.post('/api/v1/llm/prompt', {
          data: scenario.data
        })
        
        expect(response.status()).toBeGreaterThanOrEqual(400)
        const data = await response.json()
        expect(data.code).toBe(scenario.expectedCode)
      }
    })
  })
})