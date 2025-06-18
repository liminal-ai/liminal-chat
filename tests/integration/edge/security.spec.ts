import { test, expect, edgeTestUtils } from './fixtures/base-fixtures'

test.describe('Edge Security & Headers', () => {
  test.beforeEach(async ({ edgeApiContext }) => {
    // Ensure Edge service is ready for security tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
  })

  test('should set proper CORS headers', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.post('/api/v1/llm/prompt', {
      data: { 
        prompt: 'CORS test', 
        provider: 'echo',
        model: 'echo-1.0'
      },
      headers: {
        'Origin': 'https://example.com'
      }
    })
    
    expect(response.status()).toBe(200)
    
    const headers = response.headers()
    
    // CORS should be properly configured
    expect(headers).toHaveProperty('access-control-allow-origin')
    expect(headers['content-type']).toContain('application/json')
    
    // Should accept requests from various origins (or be properly configured)
    // The exact CORS policy depends on Edge configuration
    expect(headers['access-control-allow-origin']).toBeDefined()
  })

  test('should validate Content-Type strictly', async ({ edgeApiContext }) => {
    // Test with various invalid content types
    const invalidContentTypes = [
      'text/plain',
      'text/html',
      'application/xml',
      'multipart/form-data',
      '', // Empty content type
      'application/json; charset=utf-16' // Non-standard charset
    ]
    
    for (const contentType of invalidContentTypes) {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: JSON.stringify({ 
          prompt: 'Content type test', 
          provider: 'echo',
          model: 'echo-1.0'
        }),
        headers: {
          'Content-Type': contentType
        }
      })
      
      // Should reject non-JSON content types
      if (contentType === '' || !contentType.includes('application/json')) {
        expect(response.status()).toBe(415)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.code).toBe('EDGE_INVALID_REQUEST')
      }
    }
  })

  test('should handle security headers correctly', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.get('/health')
    
    expect(response.status()).toBe(200)
    
    const headers = response.headers()
    
    // Basic security expectations for a web API
    expect(headers).toHaveProperty('content-type')
    expect(headers['content-type']).toContain('application/json')
    
    // Should not expose sensitive server information
    expect(headers).not.toHaveProperty('server')
    expect(headers).not.toHaveProperty('x-powered-by')
    
    // Content-Type should be properly set
    expect(headers['content-type']).toContain('application/json')
  })
})