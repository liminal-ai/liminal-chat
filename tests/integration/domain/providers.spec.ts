import { test, expect } from '../../fixtures/domain-fixtures'

// Performance thresholds for provider discovery
const PERFORMANCE_THRESHOLDS = {
  providerDiscovery: 1000, // ms - Provider listing response time
}


test.describe('Domain Provider Discovery', () => {
  test('should return available providers', async ({ domainApiContext }) => {
    const start = Date.now()
    
    const response = await domainApiContext.get('/domain/llm/providers')
    
    const duration = Date.now() - start
    expect(response.status()).toBe(200)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.providerDiscovery)
    console.log(`Provider discovery response time: ${duration}ms`)

    const providers = await response.json()
    
    // Validate response structure
    expect(providers).toHaveProperty('defaultProvider')
    expect(providers).toHaveProperty('availableProviders')
    expect(providers).toHaveProperty('providers')
    
    // Validate data types
    expect(typeof providers.defaultProvider).toBe('string')
    expect(Array.isArray(providers.availableProviders)).toBe(true)
    expect(typeof providers.providers).toBe('object')
    
    // Should have at least echo provider
    expect(providers.availableProviders).toContain('echo')
    expect(providers.providers).toHaveProperty('echo')
  })

  test('should include provider configuration status', async ({ domainApiContext }) => {
    const response = await domainApiContext.get('/domain/llm/providers')
    expect(response.status()).toBe(200)

    const providers = await response.json()
    
    // Validate provider object structure
    Object.entries(providers.providers).forEach(([name, provider]: [string, any]) => {
      expect(provider).toHaveProperty('available')
      expect(provider).toHaveProperty('status')
      expect(typeof provider.available).toBe('boolean')
      expect(['healthy', 'unhealthy']).toContain(provider.status)
      
      // Should have models array
      expect(provider).toHaveProperty('models')
      expect(Array.isArray(provider.models)).toBe(true)
    })
  })

  test('should show echo provider as always available', async ({ domainApiContext }) => {
    const response = await domainApiContext.get('/domain/llm/providers')
    expect(response.status()).toBe(200)

    const providers = await response.json()
    
    // Echo provider should always be available and healthy
    expect(providers.providers).toHaveProperty('echo')
    
    const echoProvider = providers.providers.echo
    expect(echoProvider.available).toBe(true)
    expect(echoProvider.status).toBe('healthy')
    expect(echoProvider.models).toContain('echo-1.0')
  })

  test('should reflect real provider configuration', async ({ domainApiContext }) => {
    const response = await domainApiContext.get('/domain/llm/providers')
    expect(response.status()).toBe(200)

    const providers = await response.json()
    
    // Check OpenRouter provider status - it may be available without API key in test env
    if (providers.providers.openrouter) {
      const openrouterProvider = providers.providers.openrouter
      
      // Provider should have consistent structure regardless of API key
      expect(typeof openrouterProvider.available).toBe('boolean')
      expect(['healthy', 'unhealthy']).toContain(openrouterProvider.status)
      expect(Array.isArray(openrouterProvider.models)).toBe(true)
      
      // If available, should have models
      if (openrouterProvider.available) {
        expect(openrouterProvider.models.length).toBeGreaterThan(0)
      }
    }
  })

  test('should include expected provider types', async ({ domainApiContext }) => {
    const response = await domainApiContext.get('/domain/llm/providers')
    expect(response.status()).toBe(200)

    const providers = await response.json()
    
    // Should include core providers (whether configured or not)
    const expectedProviders = ['echo', 'openrouter']
    
    expectedProviders.forEach(providerName => {
      expect(providers.availableProviders).toContain(providerName)
      expect(providers.providers).toHaveProperty(providerName)
    })
  })

  test('should handle provider health checks efficiently', async ({ domainApiContext }) => {
    // Make multiple concurrent requests to test caching/efficiency
    const promises = Array(3).fill(null).map(() => {
      const start = Date.now()
      return domainApiContext.get('/domain/llm/providers').then(response => {
        const duration = Date.now() - start
        return { response, duration }
      })
    })

    const results = await Promise.all(promises)
    
    // All should succeed
    results.forEach(({ response }) => {
      expect(response.status()).toBe(200)
    })
    
    // Response times should be reasonable
    const avgDuration = results.reduce((sum, { duration }) => sum + duration, 0) / results.length
    expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.providerDiscovery)
    
    console.log(`Concurrent provider discovery average duration: ${avgDuration.toFixed(1)}ms`)
  })

  test('should provide consistent provider information', async ({ domainApiContext }) => {
    // Make two requests and ensure consistency
    const response1 = await domainApiContext.get('/domain/llm/providers')
    expect(response1.status()).toBe(200)
    
    const response2 = await domainApiContext.get('/domain/llm/providers')
    expect(response2.status()).toBe(200)
    
    const providers1 = await response1.json()
    const providers2 = await response2.json()
    
    // Core structure should be identical
    expect(providers1.defaultProvider).toBe(providers2.defaultProvider)
    expect(providers1.availableProviders).toEqual(providers2.availableProviders)
    
    // Provider availability should be consistent (unless health changed)
    Object.keys(providers1.providers).forEach(providerName => {
      expect(providers2.providers).toHaveProperty(providerName)
      
      const provider1 = providers1.providers[providerName]
      const provider2 = providers2.providers[providerName]
      
      // Availability shouldn't change between quick successive calls
      expect(provider1.available).toBe(provider2.available)
    })
  })

  test('should handle malformed requests gracefully', async ({ domainApiContext }) => {
    // Test with invalid endpoint path
    const response = await domainApiContext.get('/domain/llm/providers/invalid')
    
    // Should return 404 for invalid endpoints, not crash
    expect(response.status()).toBe(404)
    
    // Should return structured error response
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})