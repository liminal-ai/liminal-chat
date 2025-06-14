import { test, expect, edgeTestUtils } from './fixtures/base-fixtures'

test.describe('Edge Performance & Concurrency', () => {
  test.beforeEach(async ({ edgeApiContext }) => {
    // Ensure Edge service is ready for performance tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
  })

  test('should handle concurrent requests efficiently', async ({ edgeApiContext, performanceMonitor }) => {
    const concurrentRequests = 5
    const requestPromises = Array(concurrentRequests).fill(null).map((_, i) =>
      performanceMonitor.timeOperation(`concurrent-${i}`, () =>
        edgeApiContext.post('/api/v1/llm/prompt', {
          data: { 
            prompt: `Concurrent request ${i}`, 
            provider: 'echo',
            model: 'echo-1.0'
          }
        })
      )
    )
    
    const responses = await Promise.all(requestPromises)
    
    // All requests should succeed
    responses.forEach((response, i) => {
      expect(response.status()).toBe(200)
    })
    
    // Performance should be reasonable (all within 2 seconds)
    const measurements = performanceMonitor.getMeasurements()
    const concurrentMeasurements = measurements.filter(m => m.name.startsWith('concurrent-'))
    
    expect(concurrentMeasurements.length).toBe(concurrentRequests)
    concurrentMeasurements.forEach(m => {
      expect(m.duration).toBeLessThan(2000) // 2 seconds max per request
    })
  })

  test('should maintain low proxy overhead', async ({ edgeApiContext, performanceMonitor }) => {
    // Measure multiple requests to get average overhead
    const numRequests = 3
    const results = []
    
    for (let i = 0; i < numRequests; i++) {
      const result = await performanceMonitor.timeOperation(`proxy-overhead-${i}`, () =>
        edgeApiContext.post('/api/v1/llm/prompt', {
          data: { 
            prompt: `Overhead test ${i}`, 
            provider: 'echo',
            model: 'echo-1.0'
          }
        })
      )
      
      expect(result.status()).toBe(200)
      results.push(result)
    }
    
    // Calculate average response time
    const measurements = performanceMonitor.getMeasurements()
    const overheadMeasurements = measurements.filter(m => m.name.startsWith('proxy-overhead-'))
    const averageTime = overheadMeasurements.reduce((sum, m) => sum + m.duration, 0) / overheadMeasurements.length
    
    // Edge proxy overhead should be minimal (under 500ms for echo provider in test env)
    expect(averageTime).toBeLessThan(500)
  })

  test('should handle rapid sequential requests', async ({ edgeApiContext }) => {
    const numRequests = 10
    const responses = []
    
    // Send requests in rapid succession (not concurrent, but sequential)
    for (let i = 0; i < numRequests; i++) {
      const response = await edgeApiContext.post('/api/v1/llm/prompt', {
        data: { 
          prompt: `Sequential request ${i}`, 
          provider: 'echo',
          model: 'echo-1.0'
        }
      })
      responses.push(response)
    }
    
    // All requests should succeed
    responses.forEach((response, i) => {
      expect(response.status()).toBe(200)
    })
    
    // Verify responses are correct and in order
    const responseData = await Promise.all(responses.map(r => r.json()))
    responseData.forEach((data, i) => {
      expect(data.content).toContain(`Sequential request ${i}`)
    })
  })

  test('should handle mixed request types concurrently', async ({ edgeApiContext }) => {
    const requests = [
      // Prompt request
      edgeApiContext.post('/api/v1/llm/prompt', {
        data: { prompt: 'Mixed test 1', provider: 'echo', model: 'echo-1.0' }
      }),
      // Messages request
      edgeApiContext.post('/api/v1/llm/prompt', {
        data: { messages: [{ role: 'user', content: 'Mixed test 2' }], provider: 'echo', model: 'echo-1.0' }
      }),
      // Providers request
      edgeApiContext.get('/api/v1/llm/providers'),
      // Health check
      edgeApiContext.get('/health'),
      // Streaming request
      edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: { prompt: 'Mixed stream test', provider: 'echo', model: 'echo-1.0', stream: true }
      })
    ]
    
    const responses = await Promise.all(requests)
    
    // All requests should succeed
    responses.forEach((response, i) => {
      expect(response.status()).toBe(200)
    })
  })

  test('should maintain performance under sustained load', async ({ edgeApiContext, performanceMonitor }) => {
    const sustainedRequests = 15
    const results = []
    
    // Send sustained load (with small delays to simulate real usage)
    for (let i = 0; i < sustainedRequests; i++) {
      const result = await performanceMonitor.timeOperation(`sustained-${i}`, () =>
        edgeApiContext.post('/api/v1/llm/prompt', {
          data: { 
            prompt: `Sustained request ${i}`, 
            provider: 'echo',
            model: 'echo-1.0'
          }
        })
      )
      
      expect(result.status()).toBe(200)
      results.push(result)
      
      // Small delay between requests to simulate real usage pattern
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    // Analyze performance stability
    const measurements = performanceMonitor.getMeasurements()
    const sustainedMeasurements = measurements.filter(m => m.name.startsWith('sustained-'))
    
    expect(sustainedMeasurements.length).toBe(sustainedRequests)
    
    // Calculate first half vs second half performance
    const firstHalf = sustainedMeasurements.slice(0, Math.floor(sustainedRequests / 2))
    const secondHalf = sustainedMeasurements.slice(Math.floor(sustainedRequests / 2))
    
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length
    
    // Performance should remain stable (second half shouldn't be significantly slower)
    // Allow for some degradation but keep it reasonable
    expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 2) // Max 100% increase
  })

  test('should handle error recovery efficiently', async ({ edgeApiContext }) => {
    // Send a mix of valid and invalid requests to test error handling performance
    const requests = [
      // Valid request
      edgeApiContext.post('/api/v1/llm/prompt', {
        data: { prompt: 'Valid request', provider: 'echo', model: 'echo-1.0' }
      }),
      // Invalid request (should fail fast)
      edgeApiContext.post('/api/v1/llm/prompt', {
        data: { prompt: '', provider: 'echo', model: 'echo-1.0' }
      }),
      // Another valid request (should work normally after error)
      edgeApiContext.post('/api/v1/llm/prompt', {
        data: { prompt: 'Recovery test', provider: 'echo', model: 'echo-1.0' }
      })
    ]
    
    const responses = await Promise.all(requests)
    
    // Check responses are as expected
    expect(responses[0].status()).toBe(200) // Valid
    expect(responses[1].status()).toBe(400) // Invalid
    expect(responses[2].status()).toBe(200) // Recovery
    
    // Verify the service recovered properly
    const recoveryData = await responses[2].json()
    expect(recoveryData.content).toContain('Recovery test')
  })
})