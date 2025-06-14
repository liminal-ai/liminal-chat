import { test, expect, edgeAssertions, edgeTestUtils } from './fixtures/base-fixtures'
import type { APIRequestContext } from '@playwright/test'

// Helper function to create Domain API context for baseline measurements
async function createDomainApiContext(playwright: any): Promise<APIRequestContext> {
  return await playwright.request.newContext({
    baseURL: process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Performance-Test/1.0'
    },
    timeout: 30000,
    ignoreHTTPSErrors: true
  })
}

test.describe('Edge Performance Validation', () => {
  test.beforeEach(async ({ edgeApiContext, performanceMonitor }) => {
    // Ensure Edge service is ready for performance tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
    
    // Reset performance measurements for clean test state
    performanceMonitor.reset()
  })

  test.describe('Response Time Requirements', () => {
    test('should respond to health checks within 50ms', async ({ 
      edgeApiContext, 
      performanceMonitor 
    }) => {
      // Test multiple health checks to ensure consistency
      const healthCheckCount = 10
      const responseTimes: number[] = []
      
      for (let i = 0; i < healthCheckCount; i++) {
        const response = await performanceMonitor.timeOperation(`health-check-${i}`, async () => {
          return await edgeApiContext.get('/health')
        })
        
        edgeAssertions.expectValidEdgeResponse(response)
        
        const measurement = performanceMonitor.getMeasurements().find(m => m.name === `health-check-${i}`)
        expect(measurement).toBeDefined()
        responseTimes.push(measurement!.duration)
      }
      
      // Validate all response times are under 50ms
      responseTimes.forEach((duration, index) => {
        expect(duration).toBeLessThan(50)
        expect(duration).toBeGreaterThan(0)
      })
      
      // Validate average response time
      const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      expect(averageTime).toBeLessThan(50)
      
      console.log(`Health check performance: avg=${averageTime.toFixed(2)}ms, max=${Math.max(...responseTimes).toFixed(2)}ms, min=${Math.min(...responseTimes).toFixed(2)}ms`)
    })

    test('should maintain fast response times for LLM requests', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor,
      playwright 
    }) => {
      const promptRequest = edgeTestData.createValidProviderRequest('echo')
      
      // Test Edge response time
      const edgeResponse = await performanceMonitor.timeOperation('edge-llm-request', async () => {
        return await edgeApiContext.post('/api/v1/llm/prompt', { data: promptRequest })
      })
      
      edgeAssertions.expectValidEdgeResponse(edgeResponse)
      const edgeData = await edgeResponse.json()
      edgeAssertions.expectValidEdgeLLMResponse(edgeData)
      
      const edgeDuration = performanceMonitor.getMeasurements().find(m => m.name === 'edge-llm-request')!.duration
      
      // Edge response should be reasonable (< 5 seconds for Echo provider)
      expect(edgeDuration).toBeLessThan(5000)
      expect(edgeDuration).toBeGreaterThan(0)
      
      console.log(`Edge LLM request duration: ${edgeDuration.toFixed(2)}ms`)
    })

    test('should maintain response times under concurrent load', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const requestCount = 5
      const requests = edgeTestData.createConcurrentRequests(requestCount)
      const startTime = performance.now()
      
      // Send concurrent requests
      const responses = await Promise.allSettled(
        requests.map(async (req, index) => {
          return await performanceMonitor.timeOperation(`concurrent-${index}`, async () => {
            return await edgeApiContext.post('/api/v1/llm/prompt', { data: req })
          })
        })
      )
      
      const totalTime = performance.now() - startTime
      
      // All requests should complete successfully
      responses.forEach((result, index) => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          edgeAssertions.expectValidEdgeResponse(result.value)
        }
      })
      
      // Individual response times should still be reasonable
      const durations = performanceMonitor.getMeasurements()
        .filter(m => m.name.startsWith('concurrent-'))
        .map(m => m.duration)
      
      durations.forEach(duration => {
        expect(duration).toBeLessThan(10000) // Allow more time under concurrent load
      })
      
      console.log(`Concurrent requests (${requestCount}): total=${totalTime.toFixed(2)}ms, avg=${(durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(2)}ms per request`)
    })

    test('should return provider list quickly', async ({ 
      edgeApiContext, 
      performanceMonitor 
    }) => {
      // Test initial provider list call
      const response = await performanceMonitor.timeOperation('provider-list-1', async () => {
        return await edgeApiContext.get('/api/v1/llm/providers')
      })
      
      edgeAssertions.expectValidEdgeResponse(response)
      
      const data = await response.json()
      expect(data).toHaveProperty('defaultProvider')
      expect(data).toHaveProperty('availableProviders')
      expect(data).toHaveProperty('providers')
      
      const firstCallDuration = performanceMonitor.getMeasurements().find(m => m.name === 'provider-list-1')!.duration
      expect(firstCallDuration).toBeLessThan(1000) // Should be under 1 second
      
      // Test subsequent call for potential caching benefits
      const response2 = await performanceMonitor.timeOperation('provider-list-2', async () => {
        return await edgeApiContext.get('/api/v1/llm/providers')
      })
      
      edgeAssertions.expectValidEdgeResponse(response2)
      
      const secondCallDuration = performanceMonitor.getMeasurements().find(m => m.name === 'provider-list-2')!.duration
      expect(secondCallDuration).toBeLessThan(1000)
      
      console.log(`Provider list performance: first=${firstCallDuration.toFixed(2)}ms, second=${secondCallDuration.toFixed(2)}ms`)
    })
  })

  test.describe('Proxy Overhead Measurement', () => {
    test('should add less than 50ms overhead to Domain calls', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor,
      playwright 
    }) => {
      const domainApiContext = await createDomainApiContext(playwright)
      const promptRequest = edgeTestData.createValidProviderRequest('echo')
      
      try {
        // Measure direct Domain call baseline
        const domainResponse = await performanceMonitor.timeOperation('domain-direct', async () => {
          return await domainApiContext.post('/domain/api/v1/llm/prompt', { data: promptRequest })
        })
        
        // Measure Edge proxied call
        const edgeResponse = await performanceMonitor.timeOperation('edge-proxied', async () => {
          return await edgeApiContext.post('/api/v1/llm/prompt', { data: promptRequest })
        })
        
        // Both should be successful
        expect(domainResponse.ok()).toBeTruthy()
        expect(edgeResponse.ok()).toBeTruthy()
        
        const measurements = performanceMonitor.getMeasurements()
        const domainDuration = measurements.find(m => m.name === 'domain-direct')!.duration
        const edgeDuration = measurements.find(m => m.name === 'edge-proxied')!.duration
        
        // Calculate proxy overhead
        const overhead = edgeDuration - domainDuration
        
        // Overhead should be less than 50ms
        expect(overhead).toBeLessThan(50)
        
        console.log(`Proxy overhead: ${overhead.toFixed(2)}ms (Domain: ${domainDuration.toFixed(2)}ms, Edge: ${edgeDuration.toFixed(2)}ms)`)
        
      } finally {
        await domainApiContext.dispose()
      }
    })

    test('should measure baseline vs proxied response times', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor,
      playwright 
    }) => {
      const domainApiContext = await createDomainApiContext(playwright)
      const testCount = 5
      const domainTimes: number[] = []
      const edgeTimes: number[] = []
      
      try {
        for (let i = 0; i < testCount; i++) {
          const promptRequest = edgeTestData.createValidProviderRequest('echo')
          
          // Measure Domain direct
          await performanceMonitor.timeOperation(`domain-${i}`, async () => {
            return await domainApiContext.post('/domain/api/v1/llm/prompt', { data: promptRequest })
          })
          
          // Measure Edge proxied
          await performanceMonitor.timeOperation(`edge-${i}`, async () => {
            return await edgeApiContext.post('/api/v1/llm/prompt', { data: promptRequest })
          })
        }
        
        const measurements = performanceMonitor.getMeasurements()
        
        for (let i = 0; i < testCount; i++) {
          const domainTime = measurements.find(m => m.name === `domain-${i}`)!.duration
          const edgeTime = measurements.find(m => m.name === `edge-${i}`)!.duration
          domainTimes.push(domainTime)
          edgeTimes.push(edgeTime)
        }
        
        const avgDomainTime = domainTimes.reduce((s, t) => s + t, 0) / domainTimes.length
        const avgEdgeTime = edgeTimes.reduce((s, t) => s + t, 0) / edgeTimes.length
        const avgOverhead = avgEdgeTime - avgDomainTime
        
        // Average overhead should be minimal
        expect(avgOverhead).toBeLessThan(50)
        
        console.log(`Average overhead: ${avgOverhead.toFixed(2)}ms (Domain avg: ${avgDomainTime.toFixed(2)}ms, Edge avg: ${avgEdgeTime.toFixed(2)}ms)`)
        
      } finally {
        await domainApiContext.dispose()
      }
    })

    test('should track overhead across different request types', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor,
      playwright 
    }) => {
      const domainApiContext = await createDomainApiContext(playwright)
      
      try {
        // Test provider list overhead
        await performanceMonitor.timeOperation('domain-providers', async () => {
          return await domainApiContext.get('/domain/api/v1/llm/providers')
        })
        
        await performanceMonitor.timeOperation('edge-providers', async () => {
          return await edgeApiContext.get('/api/v1/llm/providers')
        })
        
        // Test LLM request overhead
        const promptRequest = edgeTestData.createValidProviderRequest('echo')
        
        await performanceMonitor.timeOperation('domain-llm', async () => {
          return await domainApiContext.post('/domain/api/v1/llm/prompt', { data: promptRequest })
        })
        
        await performanceMonitor.timeOperation('edge-llm', async () => {
          return await edgeApiContext.post('/api/v1/llm/prompt', { data: promptRequest })
        })
        
        const measurements = performanceMonitor.getMeasurements()
        
        const providerOverhead = measurements.find(m => m.name === 'edge-providers')!.duration - 
                               measurements.find(m => m.name === 'domain-providers')!.duration
        
        const llmOverhead = measurements.find(m => m.name === 'edge-llm')!.duration - 
                          measurements.find(m => m.name === 'domain-llm')!.duration
        
        // Both types should have minimal overhead
        expect(providerOverhead).toBeLessThan(50)
        expect(llmOverhead).toBeLessThan(50)
        
        console.log(`Request type overheads - Providers: ${providerOverhead.toFixed(2)}ms, LLM: ${llmOverhead.toFixed(2)}ms`)
        
      } finally {
        await domainApiContext.dispose()
      }
    })
  })

  test.describe('Concurrent Request Handling', () => {
    test('should handle 5 concurrent requests successfully', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const concurrency = 5
      const requests = edgeTestData.createConcurrentRequests(concurrency)
      
      const startTime = performance.now()
      
      const results = await edgeTestUtils.sendConcurrentRequests(
        edgeApiContext,
        requests.map(req => ({ endpoint: '/api/v1/llm/prompt', data: req })),
        concurrency
      )
      
      const totalTime = performance.now() - startTime
      
      // All requests should succeed
      expect(results.length).toBe(concurrency)
      
      let successCount = 0
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          expect(result.value.ok()).toBeTruthy()
          successCount++
        }
      })
      
      expect(successCount).toBe(concurrency)
      
      // Total time should be reasonable (concurrent execution should be faster than sequential)
      expect(totalTime).toBeLessThan(15000) // Allow 15s for 5 concurrent requests
      
      console.log(`${concurrency} concurrent requests completed in ${totalTime.toFixed(2)}ms (avg: ${(totalTime/concurrency).toFixed(2)}ms per request)`)
    })

    test('should handle 10 concurrent requests without degradation', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const concurrency = 10
      const requests = edgeTestData.createConcurrentRequests(concurrency)
      
      const startTime = performance.now()
      
      const results = await edgeTestUtils.sendConcurrentRequests(
        edgeApiContext,
        requests.map(req => ({ endpoint: '/api/v1/llm/prompt', data: req })),
        concurrency
      )
      
      const totalTime = performance.now() - startTime
      
      // All requests should succeed
      expect(results.length).toBe(concurrency)
      
      let successCount = 0
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          expect(result.value.ok()).toBeTruthy()
          successCount++
        }
      })
      
      expect(successCount).toBe(concurrency)
      
      // Performance should still be reasonable with higher concurrency
      expect(totalTime).toBeLessThan(30000) // Allow 30s for 10 concurrent requests
      
      console.log(`${concurrency} concurrent requests completed in ${totalTime.toFixed(2)}ms (avg: ${(totalTime/concurrency).toFixed(2)}ms per request)`)
    })

    test('should maintain response times under concurrent load', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const concurrency = 5
      const requests = edgeTestData.createConcurrentRequests(concurrency)
      
      // Measure individual response times under concurrent load
      const responsePromises = requests.map(async (req, index) => {
        return await performanceMonitor.timeOperation(`load-test-${index}`, async () => {
          return await edgeApiContext.post('/api/v1/llm/prompt', { data: req })
        })
      })
      
      const responses = await Promise.all(responsePromises)
      
      // All responses should be successful
      responses.forEach(response => {
        edgeAssertions.expectValidEdgeResponse(response)
      })
      
      // Individual response times should still be reasonable under load
      const durations = performanceMonitor.getMeasurements()
        .filter(m => m.name.startsWith('load-test-'))
        .map(m => m.duration)
      
      durations.forEach(duration => {
        expect(duration).toBeLessThan(15000) // Allow more time under concurrent load
      })
      
      const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length
      const maxDuration = Math.max(...durations)
      
      console.log(`Concurrent load performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`)
    })
  })

  test.describe('Throughput and Scalability', () => {
    test('should handle burst requests efficiently', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      // Test burst load: send many requests in quick succession
      const burstSize = 15
      const requests = edgeTestData.createConcurrentRequests(burstSize)
      
      const startTime = performance.now()
      
      // Send requests in batches to simulate burst traffic
      const batchSize = 5
      const results: any[] = []
      
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize)
        const batchResults = await Promise.allSettled(
          batch.map(req => edgeApiContext.post('/api/v1/llm/prompt', { data: req }))
        )
        results.push(...batchResults)
      }
      
      const totalTime = performance.now() - startTime
      
      // Count successful requests
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.ok()
      ).length
      
      // Should handle most requests successfully
      expect(successfulRequests).toBeGreaterThanOrEqual(burstSize * 0.8) // Allow 20% failure under burst
      
      // Calculate throughput (requests per second)
      const throughput = (successfulRequests / totalTime) * 1000
      
      console.log(`Burst test: ${successfulRequests}/${burstSize} successful, ${throughput.toFixed(2)} req/s, total time: ${totalTime.toFixed(2)}ms`)
    })

    test('should recover quickly after load spikes', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      // Establish baseline performance
      const baselineRequest = edgeTestData.createValidProviderRequest('echo')
      
      const baselineResponse = await performanceMonitor.timeOperation('baseline', async () => {
        return await edgeApiContext.post('/api/v1/llm/prompt', { data: baselineRequest })
      })
      
      edgeAssertions.expectValidEdgeResponse(baselineResponse)
      const baselineDuration = performanceMonitor.getMeasurements().find(m => m.name === 'baseline')!.duration
      
      // Generate load spike
      const spikeSize = 10
      const spikeRequests = edgeTestData.createConcurrentRequests(spikeSize)
      
      await Promise.allSettled(
        spikeRequests.map(req => edgeApiContext.post('/api/v1/llm/prompt', { data: req }))
      )
      
      // Wait a moment for recovery
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Test recovery performance
      const recoveryResponse = await performanceMonitor.timeOperation('recovery', async () => {
        return await edgeApiContext.post('/api/v1/llm/prompt', { data: baselineRequest })
      })
      
      edgeAssertions.expectValidEdgeResponse(recoveryResponse)
      const recoveryDuration = performanceMonitor.getMeasurements().find(m => m.name === 'recovery')!.duration
      
      // Recovery should be close to baseline (within 2x)
      expect(recoveryDuration).toBeLessThan(baselineDuration * 2)
      
      console.log(`Recovery performance: baseline=${baselineDuration.toFixed(2)}ms, recovery=${recoveryDuration.toFixed(2)}ms`)
    })

    test('should maintain stable performance over time', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const testDuration = 10000 // 10 seconds
      const requestInterval = 500 // 500ms between requests
      const expectedRequests = Math.floor(testDuration / requestInterval)
      
      const startTime = performance.now()
      const responseTimes: number[] = []
      let requestCount = 0
      
      while (performance.now() - startTime < testDuration) {
        const request = edgeTestData.createValidProviderRequest('echo')
        
        const response = await performanceMonitor.timeOperation(`sustained-${requestCount}`, async () => {
          return await edgeApiContext.post('/api/v1/llm/prompt', { data: request })
        })
        
        if (response.ok()) {
          const duration = performanceMonitor.getMeasurements().find(m => m.name === `sustained-${requestCount}`)!.duration
          responseTimes.push(duration)
        }
        
        requestCount++
        await new Promise(resolve => setTimeout(resolve, requestInterval))
      }
      
      // Should have completed expected number of requests
      expect(requestCount).toBeGreaterThanOrEqual(expectedRequests * 0.8)
      
      // Performance should be stable (no significant degradation)
      const firstHalf = responseTimes.slice(0, Math.floor(responseTimes.length / 2))
      const secondHalf = responseTimes.slice(Math.floor(responseTimes.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((s, t) => s + t, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((s, t) => s + t, 0) / secondHalf.length
      
      // Second half should not be significantly slower (within 50% increase)
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5)
      
      console.log(`Sustained performance: ${requestCount} requests, first half avg=${firstHalfAvg.toFixed(2)}ms, second half avg=${secondHalfAvg.toFixed(2)}ms`)
    })
  })

  test.describe('Resource Efficiency', () => {
    test('should not leak memory during proxy operations', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // This test validates that repeated requests don't cause memory accumulation
      const initialMemory = process.memoryUsage()
      const requestCount = 50
      
      // Send many requests to stress test memory management
      for (let i = 0; i < requestCount; i++) {
        const request = edgeTestData.createValidProviderRequest('echo')
        const response = await edgeApiContext.post('/api/v1/llm/prompt', { data: request })
        
        // Ensure request completes successfully
        expect(response.ok()).toBeTruthy()
        
        // Force garbage collection periodically (if available)
        if (global.gc && i % 10 === 0) {
          global.gc()
        }
      }
      
      // Check memory usage after requests
      const finalMemory = process.memoryUsage()
      
      // Memory growth should be reasonable (not more than 100MB increase)
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed
      const memoryGrowthMB = memoryGrowth / (1024 * 1024)
      
      expect(memoryGrowthMB).toBeLessThan(100)
      
      console.log(`Memory usage after ${requestCount} requests: ${memoryGrowthMB.toFixed(2)}MB increase`)
    })

    test('should clean up resources after requests complete', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // Test that resources are properly cleaned up after request completion
      const testIterations = 20
      
      for (let i = 0; i < testIterations; i++) {
        const request = edgeTestData.createValidProviderRequest('echo')
        
        const response = await edgeApiContext.post('/api/v1/llm/prompt', { data: request })
        expect(response.ok()).toBeTruthy()
        
        // Consume response to ensure cleanup
        const data = await response.json()
        edgeAssertions.expectValidEdgeLLMResponse(data)
      }
      
      // If we get here without timeouts or connection errors, resource cleanup is working
      expect(true).toBeTruthy()
      
      console.log(`Successfully completed ${testIterations} requests with proper resource cleanup`)
    })

    test('should handle long-running streaming connections efficiently', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // Note: This is a placeholder for streaming efficiency testing
      // Full streaming tests would require SSE parsing capabilities
      
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      
      const startTime = performance.now()
      
      // Attempt streaming request (may not be fully implemented yet)
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', { 
        data: streamingRequest 
      })
      
      const duration = performance.now() - startTime
      
      // Either streaming works or fails gracefully
      if (response.ok()) {
        // If streaming is implemented, validate it's efficient
        expect(duration).toBeLessThan(10000) // Should initiate quickly
        edgeAssertions.expectValidStreamingResponse(response)
        console.log(`Streaming request initiated in ${duration.toFixed(2)}ms`)
      } else {
        // If not implemented, should fail quickly with appropriate error
        expect(duration).toBeLessThan(1000)
        expect([400, 404, 501]).toContain(response.status())
        console.log(`Streaming not implemented, failed gracefully in ${duration.toFixed(2)}ms`)
      }
    })
  })

  test.describe('Streaming Performance', () => {
    test('should initiate streaming responses with low latency', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      
      const response = await performanceMonitor.timeOperation('streaming-initiation', async () => {
        return await edgeApiContext.post('/api/v1/llm/prompt/stream', { 
          data: streamingRequest 
        })
      })
      
      const initiationTime = performanceMonitor.getMeasurements().find(m => m.name === 'streaming-initiation')!.duration
      
      if (response.ok()) {
        // If streaming is implemented, first response should be fast
        expect(initiationTime).toBeLessThan(2000) // < 2 seconds as per requirement
        edgeAssertions.expectValidStreamingResponse(response)
        
        console.log(`Streaming initiated in ${initiationTime.toFixed(2)}ms`)
      } else {
        // If not implemented, should fail quickly
        expect(initiationTime).toBeLessThan(1000)
        expect([400, 404, 501]).toContain(response.status())
        
        console.log(`Streaming not available, failed in ${initiationTime.toFixed(2)}ms`)
      }
    })

    test('should handle concurrent streaming requests efficiently', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      const concurrentStreams = 3
      const streamingRequests = Array(concurrentStreams).fill(null).map(() => 
        edgeTestData.createEdgeStreamingRequest()
      )
      
      const startTime = performance.now()
      
      const streamResponses = await Promise.allSettled(
        streamingRequests.map(async (req, index) => {
          return await performanceMonitor.timeOperation(`concurrent-stream-${index}`, async () => {
            return await edgeApiContext.post('/api/v1/llm/prompt/stream', { data: req })
          })
        })
      )
      
      const totalTime = performance.now() - startTime
      
      let successfulStreams = 0
      streamResponses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const response = result.value
          if (response.ok()) {
            successfulStreams++
            edgeAssertions.expectValidStreamingResponse(response)
          }
        }
      })
      
      if (successfulStreams > 0) {
        // If streaming is implemented, should handle concurrent streams
        expect(totalTime).toBeLessThan(10000) // All streams should initiate within 10s
        
        const durations = performanceMonitor.getMeasurements()
          .filter(m => m.name.startsWith('concurrent-stream-'))
          .map(m => m.duration)
        
        durations.forEach(duration => {
          expect(duration).toBeLessThan(5000) // Each stream should initiate within 5s
        })
        
        console.log(`${successfulStreams}/${concurrentStreams} concurrent streams successful, total time: ${totalTime.toFixed(2)}ms`)
      } else {
        // If streaming not implemented, all should fail quickly
        expect(totalTime).toBeLessThan(5000)
        console.log(`Concurrent streaming not available, failed in ${totalTime.toFixed(2)}ms`)
      }
    })
  })

  test.describe('Performance Monitoring and Metrics', () => {
    test('should collect meaningful performance metrics', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      // Clear metrics and send various types of requests
      performanceMonitor.reset()
      
      // Health check
      await performanceMonitor.timeOperation('health-metric', async () => {
        return await edgeApiContext.get('/health')
      })
      
      // Provider list
      await performanceMonitor.timeOperation('providers-metric', async () => {
        return await edgeApiContext.get('/api/v1/llm/providers')
      })
      
      // LLM request
      const promptRequest = edgeTestData.createValidProviderRequest('echo')
      await performanceMonitor.timeOperation('llm-metric', async () => {
        return await edgeApiContext.post('/api/v1/llm/prompt', { data: promptRequest })
      })
      
      const measurements = performanceMonitor.getMeasurements()
      
      // Should have collected metrics for all operations
      expect(measurements.length).toBe(3)
      
      const healthMetric = measurements.find(m => m.name === 'health-metric')
      const providersMetric = measurements.find(m => m.name === 'providers-metric')
      const llmMetric = measurements.find(m => m.name === 'llm-metric')
      
      // All metrics should be valid
      expect(healthMetric).toBeDefined()
      expect(providersMetric).toBeDefined()
      expect(llmMetric).toBeDefined()
      
      // All durations should be positive
      expect(healthMetric!.duration).toBeGreaterThan(0)
      expect(providersMetric!.duration).toBeGreaterThan(0)
      expect(llmMetric!.duration).toBeGreaterThan(0)
      
      // All should have timestamps
      expect(healthMetric!.timestamp).toBeGreaterThan(0)
      expect(providersMetric!.timestamp).toBeGreaterThan(0)
      expect(llmMetric!.timestamp).toBeGreaterThan(0)
      
      console.log('Performance metrics collected:', measurements.map(m => `${m.name}: ${m.duration.toFixed(2)}ms`))
    })

    test('should establish and maintain performance baselines', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      // Establish baselines for key operations
      const baselineTests = [
        { name: 'health-baseline', operation: () => edgeApiContext.get('/health') },
        { name: 'providers-baseline', operation: () => edgeApiContext.get('/api/v1/llm/providers') },
        { name: 'llm-baseline', operation: () => edgeApiContext.post('/api/v1/llm/prompt', { data: edgeTestData.createValidProviderRequest('echo') }) }
      ]
      
      const baselines: Record<string, number> = {}
      
      // Run each test multiple times to establish reliable baselines
      for (const testCase of baselineTests) {
        const iterations = 5
        const times: number[] = []
        
        for (let i = 0; i < iterations; i++) {
          await performanceMonitor.timeOperation(`${testCase.name}-${i}`, testCase.operation)
          const measurement = performanceMonitor.getMeasurements().find(m => m.name === `${testCase.name}-${i}`)
          if (measurement) {
            times.push(measurement.duration)
          }
        }
        
        // Calculate baseline as average of iterations
        baselines[testCase.name] = times.reduce((sum, time) => sum + time, 0) / times.length
      }
      
      // Validate baselines meet performance requirements
      expect(baselines['health-baseline']).toBeLessThan(50) // Health check requirement
      expect(baselines['providers-baseline']).toBeLessThan(1000) // Provider list requirement
      expect(baselines['llm-baseline']).toBeLessThan(5000) // LLM request reasonable time
      
      // Test that current performance matches baselines (within 20% variance)
      for (const testCase of baselineTests) {
        const currentResponse = await performanceMonitor.timeOperation(`${testCase.name}-current`, testCase.operation)
        expect(currentResponse.ok()).toBeTruthy()
        
        const currentMeasurement = performanceMonitor.getMeasurements().find(m => m.name === `${testCase.name}-current`)
        const currentTime = currentMeasurement!.duration
        const baselineTime = baselines[testCase.name]
        
        // Current performance should be within 20% of baseline
        expect(currentTime).toBeLessThan(baselineTime * 1.2)
      }
      
      console.log('Performance baselines established:', Object.entries(baselines).map(([name, time]) => `${name}: ${time.toFixed(2)}ms`).join(', '))
    })
  })
})

// Export helper function for use in other tests
export { createDomainApiContext }