import { test, expect } from '../../fixtures/base-fixtures'
import { expectValidResponse } from '../../utils/assertions'

test.describe('Domain Health Endpoint', () => {
  test('should return healthy status', async ({ apiContext }) => {
    // Use domain base URL for this test
    const domainContext = await apiContext.request.newContext({
      baseURL: 'http://localhost:8766'
    })
    
    const response = await domainContext.get('/domain/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('healthy')
    
    await domainContext.dispose()
  })
  
  test('should include service information', async ({ apiContext }) => {
    const domainContext = await apiContext.request.newContext({
      baseURL: 'http://localhost:8766'
    })
    
    const response = await domainContext.get('/domain/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('service')
    expect(data.service).toBe('domain-server')
    
    await domainContext.dispose()
  })
}) 