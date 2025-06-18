import { test, expect, edgeTestUtils } from './fixtures/base-fixtures'

test.describe('Edge Health Endpoint', () => {
  test.beforeEach(async ({ edgeApiContext }) => {
    // Ensure Edge service is ready for health tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
  })

  test('should return healthy status', async ({ edgeApiContext }) => {
    const response = await edgeApiContext.get('/health')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    
    // Validate health response structure
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('service', 'liminal-chat-edge')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('domainUrl')
    
    // Validate timestamp is a valid ISO string
    expect(() => new Date(data.timestamp)).not.toThrow()
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
    
    // Domain URL should be configured
    expect(typeof data.domainUrl).toBe('string')
    expect(data.domainUrl.length).toBeGreaterThan(0)
    expect(data.domainUrl).toMatch(/^https?:\/\//)
  })

  test('should respond quickly to health checks', async ({ edgeApiContext, performanceMonitor }) => {
    const response = await performanceMonitor.timeOperation('health-check', () =>
      edgeApiContext.get('/health')
    )
    
    expect(response.status()).toBe(200)
    
    const measurements = performanceMonitor.getMeasurements()
    const healthMeasurement = measurements.find(m => m.name === 'health-check')
    
    expect(healthMeasurement).toBeDefined()
    // Health check should be very fast (under 100ms)
    expect(healthMeasurement!.duration).toBeLessThan(100)
  })

  test('should handle multiple concurrent health checks', async ({ edgeApiContext }) => {
    const numHealthChecks = 10
    const healthPromises = Array(numHealthChecks).fill(null).map(() =>
      edgeApiContext.get('/health')
    )
    
    const responses = await Promise.all(healthPromises)
    
    // All health checks should succeed
    responses.forEach((response, i) => {
      expect(response.status()).toBe(200)
    })
    
    // Verify all responses are consistent
    const healthData = await Promise.all(responses.map(r => r.json()))
    healthData.forEach(data => {
      expect(data.status).toBe('ok')
      expect(data.service).toBe('liminal-chat-edge')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('domainUrl')
    })
  })
})