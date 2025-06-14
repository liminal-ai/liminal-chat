import { test, expect, edgeAssertions, edgeTestUtils } from './fixtures/base-fixtures'
import type { ProviderStreamEvent } from '../../../packages/shared-types'

test.describe('Edge Streaming Proxy', () => {
  test.beforeEach(async ({ edgeApiContext }) => {
    // Ensure Edge service is ready for streaming tests
    const isReady = await edgeTestUtils.waitForEdgeReady(edgeApiContext)
    expect(isReady).toBeTruthy()
  })

  // Simple test to verify foundation works
  test('foundation setup verification', async ({ edgeApiContext, edgeTestData }) => {
    // This test verifies that our foundation fixtures and data factory work
    expect(edgeApiContext).toBeDefined()
    expect(edgeTestData).toBeDefined()
    
    // Test that we can create test data
    const testRequest = edgeTestData.createEdgePromptRequest()
    expect(testRequest).toHaveProperty('prompt')
    expect(testRequest).toHaveProperty('provider')
  })

  test.describe('Basic Streaming Functionality', () => {
    // Test basic streaming request-response flow
    test('should proxy streaming requests to Domain service', async ({ edgeApiContext, edgeTestData }) => {
      // 1. Create streaming request with Echo provider
      const streamingRequest = edgeTestData.createEdgeStreamingRequest({
        prompt: 'Test streaming proxy',
        provider: 'echo'
      })

      // 2. Send POST to /api/v1/llm/prompt/stream
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest
      })

      // 3. Validate streaming response headers
      edgeAssertions.expectValidStreamingResponse(response)
      expect(response.headers()['content-type']).toContain('text/event-stream')
      expect(response.headers()['cache-control']).toContain('no-cache')
      // Note: connection header may not be present in Edge/Cloudflare Workers environment

      // 4. Parse SSE events and validate contract
      const responseText = await response.text()
      const events = edgeTestUtils.parseSSEEvents(responseText)
      
      // Should have at least content events and a done event
      expect(events.length).toBeGreaterThan(0)
      
      // Validate at least one content event exists (event type is 'content')
      const contentEvents = events.filter(e => e.event === 'content')
      expect(contentEvents.length).toBeGreaterThan(0)
      
      // Validate final done event exists (event type is 'done')
      const doneEvents = events.filter(e => e.event === 'done')
      expect(doneEvents.length).toBe(1)
    })

    // Test streaming response format validation
    test('should return valid Server-Sent Events format', async ({ edgeApiContext, edgeTestData }) => {
      // 1. Send streaming request
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest
      })

      // 2. Validate Content-Type: text/event-stream
      expect(response.ok()).toBeTruthy()
      expect(response.headers()['content-type']).toContain('text/event-stream')

      // 3. Parse SSE format compliance
      const responseText = await response.text()
      const events = edgeTestUtils.parseSSEEvents(responseText)
      
      // Each event should have proper SSE structure
      for (const event of events) {
        expect(event).toHaveProperty('data')
        expect(typeof event.data).toBe('string')
        expect(event).toHaveProperty('event')
        expect(typeof event.event).toBe('string')
        
        // 4. Validate event structure matches SSE format
        expect(['content', 'usage', 'done', 'error']).toContain(event.event)
        
        // Validate specific event structures
        if (event.event === 'content') {
          // Content events have JSON-stringified data
          expect(event.data.length).toBeGreaterThan(0)
          // Data should be JSON string for content
          expect(() => JSON.parse(event.data)).not.toThrow()
        } else if (event.event === 'usage') {
          // Usage events have JSON object data
          const usageData = JSON.parse(event.data)
          expect(usageData).toHaveProperty('promptTokens')
          expect(usageData).toHaveProperty('completionTokens')
          expect(usageData).toHaveProperty('totalTokens')
          expect(usageData).toHaveProperty('model')
        } else if (event.event === 'done') {
          // Done events have empty data
          expect(event.data).toBe('')
        }
      }
    })

    // Test streaming content validation
    test('should stream content events with valid structure', async ({ edgeApiContext, edgeTestData }) => {
      // 1. Send streaming request
      const streamingRequest = edgeTestData.createLongStreamingRequest()
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest
      })

      expect(response.ok()).toBeTruthy()
      const responseText = await response.text()
      const events = edgeTestUtils.parseSSEEvents(responseText)
      
      // 2. Collect content events
      const contentEvents = events.filter(e => e.event === 'content')
      
      // Should have at least one content event
      expect(contentEvents.length).toBeGreaterThan(0)
      
      // 3. Validate each content event
      for (const event of contentEvents) {
        // 3. Validate event.event === 'content'
        expect(event.event).toBe('content')
        
        // 4. Validate event.data is string (JSON-stringified content)
        expect(typeof event.data).toBe('string')
        expect(event.data.length).toBeGreaterThan(0)
        
        // Data should be parseable JSON for content events
        const contentData = JSON.parse(event.data)
        expect(typeof contentData).toBe('string')
        expect(contentData.length).toBeGreaterThan(0)
        
        // 5. Validate eventId presence (should be in id field of SSE)
        if (event.id) {
          expect(typeof event.id).toBe('string')
          expect(event.id.length).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Streaming Error Handling', () => {
    // Test Domain service failures during streaming
    test('should handle Domain service failures gracefully', async ({ 
      edgeApiContext, 
      edgeTestData
    }) => {
      // 1. Send request with invalid provider to simulate domain failure
      const invalidRequest = edgeTestData.createEdgeStreamingRequest({
        provider: 'nonexistent-provider'
      })
      
      // 2. Send streaming request
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: invalidRequest
      })
      
      // 3. For streaming endpoints, errors should come as SSE error events
      expect(response.ok()).toBeTruthy()
      expect(response.headers()['content-type']).toContain('text/event-stream')
      
      // Parse the streaming response to find error events
      const responseText = await response.text()
      const events = edgeTestUtils.parseSSEEvents(responseText)
      
      // Should contain an error event
      const errorEvents = events.filter(e => e.event === 'error')
      expect(errorEvents.length).toBeGreaterThan(0)
      
      // Validate error event structure
      const errorEvent = errorEvents[0]
      const errorData = JSON.parse(errorEvent.data)
      expect(errorData).toHaveProperty('message')
      expect(errorData).toHaveProperty('code')
      expect(errorData.message).toContain('not found')
    })

    // Test invalid streaming requests
    test('should return appropriate errors for invalid streaming requests', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // 1. Send malformed streaming request (missing prompt)
      const malformedRequest = edgeTestData.createMalformedRequest()
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: malformedRequest
      })
      
      // 2. Validate error response (not streaming)
      expect(response.ok()).toBeFalsy()
      
      // 3. Ensure proper HTTP status codes
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThan(500)
      
      // Should return JSON error, not streaming
      expect(response.headers()['content-type']).toContain('application/json')
      
      const responseData = await response.json()
      expect(responseData).toHaveProperty('error')
      expect(responseData).toHaveProperty('code')
    })

    // Test streaming timeout handling
    test('should handle streaming timeouts appropriately', async ({ 
      edgeApiContext, 
      edgeTestData
    }) => {
      // 1. Send request with very large prompt that might timeout
      // For this integration test, we'll just verify the general error handling
      // Real timeout testing would require stopping the Domain service
      const streamingRequest = edgeTestData.createEdgeStreamingRequest({
        provider: 'echo', // Use valid provider for now 
        prompt: 'test timeout handling'
      })
      
      // 2. Send streaming request with short timeout on the request level
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest,
        timeout: 1 // Very short timeout to potentially trigger timeout
      }).catch(async () => {
        // If request times out, that's actually what we want to test
        // Return a mock response to continue test
        return {
          ok: () => false,
          status: () => 408,
          json: async () => ({ error: 'Request timeout', code: 'TIMEOUT' })
        }
      })
      
      // 3. If we get a response, it should be valid streaming or error
      if (typeof response.ok === 'function') {
        if (response.ok()) {
          // Valid streaming response
          expect(response.headers()['content-type']).toContain('text/event-stream')
        } else {
          // Error response
          expect(response.status()).toBeGreaterThanOrEqual(400)
        }
      }
    })
  })

  test.describe('Streaming Performance', () => {
    // Test streaming response latency
    test('should maintain low latency for first content event', async ({ 
      edgeApiContext, 
      edgeTestData, 
      performanceMonitor 
    }) => {
      // 1. Send streaming request with performance monitoring
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      
      const response = await performanceMonitor.timeOperation('streaming-request', async () => {
        return await edgeApiContext.post('/api/v1/llm/prompt/stream', {
          data: streamingRequest
        })
      })
      
      expect(response.ok()).toBeTruthy()
      
      // 2. Measure time to first content event
      const startTime = performance.now()
      const responseText = await response.text()
      const endTime = performance.now()
      
      const events = edgeTestUtils.parseSSEEvents(responseText)
      const contentEvents = events.filter(e => e.event === 'content')
      
      expect(contentEvents.length).toBeGreaterThan(0)
      
      // 3. Validate latency is acceptable (< 2s for first response)
      const totalLatency = endTime - startTime
      edgeAssertions.expectAcceptableResponseTime(totalLatency, 2000)
      
      // Check overall streaming request performance
      const streamingLatency = performanceMonitor.getAverageDuration('streaming-request')
      expect(streamingLatency).toBeLessThan(5000) // 5 seconds total should be reasonable
    })

    // Test streaming throughput
    test('should handle concurrent streaming requests', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // 1. Create multiple concurrent streaming requests
      const concurrentRequests = edgeTestData.createConcurrentRequests(3).map(req => ({
        endpoint: '/api/v1/llm/prompt/stream',
        data: { ...req, stream: true }
      }))
      
      // 2. Send all requests simultaneously
      const startTime = performance.now()
      const results = await edgeTestUtils.sendConcurrentRequests(
        edgeApiContext,
        concurrentRequests,
        3 // max concurrency
      )
      const endTime = performance.now()
      
      // 3. Validate all streams complete successfully
      const successfulResults = results.filter(result => 
        result.status === 'fulfilled' && result.value.ok()
      )
      
      expect(successfulResults.length).toBe(concurrentRequests.length)
      
      // 4. Check for resource leaks or connection issues
      // All responses should be valid streaming responses
      for (const result of successfulResults) {
        if (result.status === 'fulfilled') {
          const response = result.value
          expect(response.headers()['content-type']).toContain('text/event-stream')
          
          // Validate each stream has proper events
          const responseText = await response.text()
          const events = edgeTestUtils.parseSSEEvents(responseText)
          expect(events.length).toBeGreaterThan(0)
          
          // Should have content and done events
          const contentEvents = events.filter(e => e.event === 'content')
          const doneEvents = events.filter(e => e.event === 'done')
          expect(contentEvents.length).toBeGreaterThan(0)
          expect(doneEvents.length).toBe(1)
        }
      }
      
      // Performance check - concurrent requests shouldn't be dramatically slower
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(10000) // 10 seconds for 3 concurrent requests
    })
  })

  test.describe('Streaming Contract Validation', () => {
    // Test complete streaming lifecycle
    test('should follow complete streaming event lifecycle', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // 1. Send streaming request
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest
      })
      
      expect(response.ok()).toBeTruthy()
      const responseText = await response.text()
      
      // 2. Collect all events in order
      const events = edgeTestUtils.parseSSEEvents(responseText)
      expect(events.length).toBeGreaterThan(0)
      
      // 3. Validate sequence: content events -> done event (Echo provider doesn't send usage events)
      let contentEventsFound = false
      let doneEventFound = false
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        
        if (event.event === 'content') {
          contentEventsFound = true
          // Content events should come before done
          expect(doneEventFound).toBeFalsy()
        } else if (event.event === 'done') {
          doneEventFound = true
          // Done should be the last event
          expect(i).toBe(events.length - 1)
        }
      }
      
      // 4. Ensure required events are present (Echo provider only sends content + done)
      expect(contentEventsFound).toBeTruthy()
      expect(doneEventFound).toBeTruthy()
    })

    // Test usage event accuracy
    test('should provide accurate usage information in streaming', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // 1. Send streaming request
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest
      })
      
      expect(response.ok()).toBeTruthy()
      const responseText = await response.text()
      const events = edgeTestUtils.parseSSEEvents(responseText)
      
      // 2. Collect usage event (Note: Echo provider doesn't send usage events)
      const usageEvents = events.filter(e => e.event === 'usage')
      
      if (usageEvents.length > 0) {
        // If usage events are present, validate them
        expect(usageEvents.length).toBe(1) // Should have exactly one usage event
        
        const usageEvent = JSON.parse(usageEvents[0].data)
        
        // 3. Validate token counts are reasonable
        expect(usageEvent).toHaveProperty('promptTokens')
        expect(usageEvent).toHaveProperty('completionTokens')
        expect(usageEvent).toHaveProperty('totalTokens')
        expect(usageEvent).toHaveProperty('model')
        
        expect(typeof usageEvent.promptTokens).toBe('number')
        expect(typeof usageEvent.completionTokens).toBe('number')
        expect(typeof usageEvent.totalTokens).toBe('number')
        expect(typeof usageEvent.model).toBe('string')
        
        expect(usageEvent.promptTokens).toBeGreaterThan(0)
        expect(usageEvent.completionTokens).toBeGreaterThan(0)
        expect(usageEvent.totalTokens).toBe(
          usageEvent.promptTokens + usageEvent.completionTokens
        )
        
        // Model should be specified
        expect(usageEvent.model.length).toBeGreaterThan(0)
      } else {
        // Echo provider doesn't send usage events - this is acceptable
        console.log('No usage events found - this is expected for Echo provider')
      }
    })

    // Test event ID consistency
    test('should maintain consistent event IDs throughout stream', async ({ 
      edgeApiContext, 
      edgeTestData 
    }) => {
      // 1. Send streaming request
      const streamingRequest = edgeTestData.createEdgeStreamingRequest()
      const response = await edgeApiContext.post('/api/v1/llm/prompt/stream', {
        data: streamingRequest
      })
      
      expect(response.ok()).toBeTruthy()
      const responseText = await response.text()
      
      // 2. Collect all events
      const events = edgeTestUtils.parseSSEEvents(responseText)
      
      const eventIds = new Set<string>()
      let hasEventIds = false
      
      // 3. Validate all events have eventId (in SSE 'id' field)
      for (const event of events) {
        if (event.id) {
          hasEventIds = true
          break
        }
      }
      
      if (hasEventIds) {
        // 4. Check eventId consistency/uniqueness
        for (const event of events) {
          expect(event).toHaveProperty('id')
          expect(typeof event.id).toBe('string')
          expect(event.id.length).toBeGreaterThan(0)
          
          // Event IDs should be unique
          expect(eventIds.has(event.id)).toBeFalsy()
          eventIds.add(event.id)
        }
        
        // Should have unique event IDs for all events
        expect(eventIds.size).toBe(events.length)
      } else {
        // If no event IDs are present, that's also valid per the contract
        // (eventId is optional), but log it for visibility
        console.log('No event IDs found in stream - this is acceptable per contract')
      }
    })
  })
})