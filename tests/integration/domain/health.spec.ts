import { test, expect } from '../../fixtures/base-fixtures'
import { expectValidResponse } from '../../utils/assertions'

test.describe('Domain Health Endpoint', () => {
  test('should return healthy status', async ({ }) => {
    // Use domain base URL for this test
    const domainContext = await test.request.newContext({
      baseURL: process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766'
    })
    
    const response = await domainContext.get('/domain/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('healthy')
    
    await domainContext.dispose()
  })
  
  test('should include service information', async ({ }) => {
    const domainContext = await test.request.newContext({
      baseURL: process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766'
    })
    
    const response = await domainContext.get('/domain/health')
    
    expectValidResponse(response)
    
    const data = await response.json()
    expect(data).toHaveProperty('service')
    expect(data.service).toBe('domain-server')
    
    await domainContext.dispose()
  })
}) 