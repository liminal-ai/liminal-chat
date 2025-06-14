import { test, expect } from './fixtures/base-fixtures'
import { expectValidResponse } from './utils/assertions'

test.describe('Edge Health Endpoint', () => {
  test('should return valid health status', async ({ apiContext }) => {
    const response = await apiContext.get('/health')
    
    expectValidResponse(response)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    
    // Validate response contract structure
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('service')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('domainUrl')
    
    // Validate status field
    expect(data.status).toBe('ok')
    
    // Validate service identification
    expect(data.service).toBe('liminal-chat-edge')
    
    // Validate timestamp is a valid ISO string
    expect(data.timestamp).toBeTruthy()
    expect(() => new Date(data.timestamp)).not.toThrow()
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
    
    // Validate domainUrl is present (value may vary by environment)
    expect(data.domainUrl).toBeTruthy()
    expect(typeof data.domainUrl).toBe('string')
  })

  test('should respond quickly', async ({ apiContext }) => {
    const startTime = Date.now()
    const response = await apiContext.get('/health')
    const endTime = Date.now()
    
    expectValidResponse(response)
    
    // Health endpoint should respond within 50ms as per requirements
    const responseTime = endTime - startTime
    expect(responseTime).toBeLessThan(50)
  })

  test('should include service identification', async ({ apiContext }) => {
    const response = await apiContext.get('/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    
    // Verify Edge service identifies itself correctly
    expect(data.service).toBe('liminal-chat-edge')
    expect(data.service).toMatch(/^liminal-chat-edge$/)
  })

  test('should handle concurrent health checks', async ({ apiContext }) => {
    // Create multiple concurrent health check requests
    const concurrentRequests = 5
    const requests = Array(concurrentRequests).fill(null).map(() => 
      apiContext.get('/health')
    )
    
    // Wait for all requests to complete
    const responses = await Promise.all(requests)
    
    // Verify all responses are successful
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200)
    })
    
    // Verify all responses have valid data
    const dataPromises = responses.map(response => response.json())
    const dataResults = await Promise.all(dataPromises)
    
    dataResults.forEach((data, index) => {
      expect(data.status).toBe('ok')
      expect(data.service).toBe('liminal-chat-edge')
      expect(data.timestamp).toBeTruthy()
      expect(data.domainUrl).toBeTruthy()
    })
  })

  test('should return consistent response structure', async ({ apiContext }) => {
    // Make multiple calls to ensure consistent response structure
    const response1 = await apiContext.get('/health')
    const response2 = await apiContext.get('/health')
    
    expectValidResponse(response1)
    expectValidResponse(response2)
    
    const data1 = await response1.json()
    const data2 = await response2.json()
    
    // Structure should be identical
    expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort())
    
    // Static values should be identical
    expect(data1.status).toBe(data2.status)
    expect(data1.service).toBe(data2.service)
    expect(data1.domainUrl).toBe(data2.domainUrl)
    
    // Timestamps should be different (but both valid)
    expect(data1.timestamp).not.toBe(data2.timestamp)
    expect(new Date(data1.timestamp).getTime()).toBeLessThanOrEqual(new Date(data2.timestamp).getTime())
  })

  test('should handle malformed health requests gracefully', async ({ apiContext }) => {
    // Test health endpoint with invalid methods
    const postResponse = await apiContext.post('/health', { data: {} })
    const putResponse = await apiContext.put('/health', { data: {} })
    
    // Edge should return 404 for non-GET requests to health endpoint
    // Based on the Hono implementation, only GET /health is defined
    expect(postResponse.status()).toBe(404)
    expect(putResponse.status()).toBe(404)
    
    // Verify error response structure
    const postData = await postResponse.json()
    const putData = await putResponse.json()
    
    expect(postData).toHaveProperty('error')
    expect(postData).toHaveProperty('code')
    expect(putData).toHaveProperty('error')
    expect(putData).toHaveProperty('code')
  })
}) 