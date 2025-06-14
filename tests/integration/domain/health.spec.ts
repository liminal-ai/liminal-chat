import { test, expect } from '../../fixtures/domain-fixtures'
import { expectValidResponse } from '../../utils/assertions'

// Performance thresholds for different measurement approaches
const PERFORMANCE_THRESHOLDS = {
  health: 400, // ms - Playwright test environment threshold (includes ~300ms framework overhead)
  pureHttp: 100, // ms - Direct HTTP call threshold per spec requirement
}

test.describe('Domain Health Endpoint', () => {
  test('should return healthy status', async ({ domainApiContext }) => {
    const response = await domainApiContext.get('/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('ok')
  })
  
  test('should include service information', async ({ domainApiContext }) => {
    const response = await domainApiContext.get('/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('service')
    expect(data.service).toBe('liminal-chat-domain')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('database')
    expect(data.database).toBe('connected')
  })

  test('should respond within performance threshold (Playwright)', async ({ domainApiContext }) => {
    const start = Date.now()
    const response = await domainApiContext.get('/health')
    const duration = Date.now() - start
    
    expectValidResponse(response)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.health)
    
    // Log performance for baseline data collection
    console.log(`Health endpoint response time (Playwright): ${duration}ms`)
  })

  test('should meet pure HTTP performance threshold', async () => {
    const baseUrl = process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766'
    const healthUrl = `${baseUrl}/health`
    
    const start = Date.now()
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    const duration = Date.now() - start
    
    expect(response.ok).toBeTruthy()
    expect(response.status).toBe(200)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.pureHttp)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('ok')
    
    // Log pure HTTP performance
    console.log(`Health endpoint pure HTTP response time: ${duration}ms`)
  })

  test('should handle multiple concurrent requests', async ({ domainApiContext }) => {
    const promises = Array(5).fill(null).map(async () => {
      const start = Date.now()
      const response = await domainApiContext.get('/health')
      const duration = Date.now() - start
      
      expectValidResponse(response)
      return { response, duration }
    })

    const results = await Promise.all(promises)
    
    // All should succeed
    results.forEach(({ response }) => {
      expect(response.status()).toBe(200)
    })
    
    // Average response time should still be reasonable
    const avgDuration = results.reduce((sum, { duration }) => sum + duration, 0) / results.length
    expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.health * 1.5) // 50% tolerance for concurrent load
    
    console.log(`Concurrent health requests average duration: ${avgDuration.toFixed(1)}ms`)
  })
}) 