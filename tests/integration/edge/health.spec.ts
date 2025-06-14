import { test, expect } from '../../fixtures/base-fixtures'
import { expectValidResponse } from '../../utils/assertions'

test.describe('Edge Health Endpoint', () => {
  test('should return healthy status', async ({ apiContext }) => {
    const response = await apiContext.get('/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('ok')
  })

  test('should respond quickly', async ({ apiContext }) => {
    const startTime = Date.now()
    const response = await apiContext.get('/health')
    const endTime = Date.now()
    
    expectValidResponse(response)
    expect(endTime - startTime).toBeLessThan(100) // Should respond within 100ms per spec
    
    // Log performance for baseline data collection
    console.log(`Edge health endpoint response time: ${endTime - startTime}ms`)
  })
}) 