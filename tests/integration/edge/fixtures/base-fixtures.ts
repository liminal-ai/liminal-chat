import { test as base, expect } from '@playwright/test'
import type { APIRequestContext, Page, Route } from '@playwright/test'
import { EdgeTestDataFactory } from './edge-test-data'

type EdgeTestFixtures = {
  apiContext: APIRequestContext
  testData: EdgeTestDataFactory
  edgeApiContext: APIRequestContext
  edgeTestData: EdgeTestDataFactory
  networkInterceptor: NetworkInterceptor
  performanceMonitor: PerformanceMonitor
}

/**
 * Network interception utilities for simulating Edge proxy errors
 */
export class NetworkInterceptor {
  private routes: Route[] = []

  constructor(private page: Page) {}

  /**
   * Intercept requests to Domain service to simulate failures
   */
  async interceptDomainRequests(mockResponse: { status: number; body: any }) {
    await this.page.route('**/domain/llm/**', (route) => {
      this.routes.push(route)
      route.fulfill({
        status: mockResponse.status,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse.body)
      })
    })
  }

  /**
   * Simulate network timeout for Domain requests
   */
  async simulateNetworkTimeout(delayMs = 30000) {
    await this.page.route('**/domain/llm/**', async (route) => {
      this.routes.push(route)
      // Wait for timeout then abort
      await new Promise(resolve => setTimeout(resolve, delayMs))
      route.abort('timeout')
    })
  }

  /**
   * Simulate intermittent network failures
   */
  async simulateIntermittentFailures(failureRate = 0.5) {
    await this.page.route('**/domain/llm/**', (route) => {
      this.routes.push(route)
      if (Math.random() < failureRate) {
        route.abort('failed')
      } else {
        route.continue()
      }
    })
  }

  /**
   * Clean up all route interceptions
   */
  async cleanup() {
    // Note: Individual routes are automatically cleaned up when page context is disposed
    // This method is here for explicit cleanup if needed in the future
    this.routes = []
  }
}

/**
 * Performance monitoring utilities for Edge integration tests
 */
export class PerformanceMonitor {
  private measurements: Array<{ name: string; duration: number; timestamp: number }> = []

  /**
   * Time an async operation
   */
  async timeOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await operation()
      const duration = performance.now() - start
      this.measurements.push({
        name,
        duration,
        timestamp: Date.now()
      })
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.measurements.push({
        name: `${name} (failed)`,
        duration,
        timestamp: Date.now()
      })
      throw error
    }
  }

  /**
   * Get performance measurements
   */
  getMeasurements() {
    return [...this.measurements]
  }

  /**
   * Get average duration for operations with the same name
   */
  getAverageDuration(operationName: string): number {
    const matching = this.measurements.filter(m => m.name === operationName)
    if (matching.length === 0) return 0
    
    const total = matching.reduce((sum, m) => sum + m.duration, 0)
    return total / matching.length
  }

  /**
   * Clear all measurements
   */
  reset() {
    this.measurements = []
  }
}

/**
 * Edge Integration Test Fixtures
 * Extends Playwright fixtures with Edge-specific testing utilities
 */
export const test = base.extend<EdgeTestFixtures>({
  /**
   * API context configured specifically for Edge server testing (primary)
   */
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.EDGE_BASE_URL ?? 'http://localhost:8787',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Edge-Integration-Test/1.0'
      },
      timeout: 30000, // 30 second timeout for Edge operations
      ignoreHTTPSErrors: true // For development/testing environments
    })
    
    await use(context)
    await context.dispose()
  },

  /**
   * Edge-specific test data factory (primary)
   */
  testData: async ({}, use) => {
    const factory = new EdgeTestDataFactory()
    await use(factory)
    await factory.cleanup()
  },

  /**
   * API context configured specifically for Edge server testing (alias)
   */
  edgeApiContext: async ({ apiContext }, use) => {
    await use(apiContext)
  },

  /**
   * Edge-specific test data factory (alias)
   */
  edgeTestData: async ({ testData }, use) => {
    await use(testData)
  },

  /**
   * Network interception utilities for error simulation
   */
  networkInterceptor: async ({ page }, use) => {
    const interceptor = new NetworkInterceptor(page)
    await use(interceptor)
    await interceptor.cleanup()
  },

  /**
   * Performance monitoring utilities
   */
  performanceMonitor: async ({}, use) => {
    const monitor = new PerformanceMonitor()
    await use(monitor)
    // Optionally log performance data at the end of tests
    const measurements = monitor.getMeasurements()
    if (measurements.length > 0) {
      console.log('Performance measurements:', measurements)
    }
  }
})

export { expect }

/**
 * Edge-specific assertion helpers
 */
export const edgeAssertions = {
  /**
   * Assert that response matches Edge API contract
   */
  expectValidEdgeResponse(response: any) {
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBeGreaterThanOrEqual(200)
    expect(response.status()).toBeLessThan(300)
  },

  /**
   * Assert that response contains valid LLM response structure
   */
  expectValidEdgeLLMResponse(data: any) {
    expect(data).toHaveProperty('content')
    expect(data).toHaveProperty('model')
    expect(data).toHaveProperty('usage')
    expect(data.usage).toHaveProperty('promptTokens')
    expect(data.usage).toHaveProperty('completionTokens')
    expect(data.usage).toHaveProperty('totalTokens')
    expect(typeof data.content).toBe('string')
    expect(typeof data.model).toBe('string')
    expect(typeof data.usage.promptTokens).toBe('number')
    expect(typeof data.usage.completionTokens).toBe('number')
    expect(typeof data.usage.totalTokens).toBe('number')
    expect(data.usage.totalTokens).toBe(data.usage.promptTokens + data.usage.completionTokens)
  },

  /**
   * Assert that error response follows Edge error contract
   */
  expectValidEdgeErrorResponse(response: any, expectedStatus?: number) {
    if (expectedStatus) {
      expect(response.status()).toBe(expectedStatus)
    } else {
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }
    expect(response.ok()).toBeFalsy()
  },

  /**
   * Assert that streaming response follows Edge streaming contract
   */
  expectValidStreamingResponse(response: any) {
    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toContain('text/event-stream')
  },

  /**
   * Assert that response time is within acceptable limits
   */
  expectAcceptableResponseTime(duration: number, maxMs = 5000) {
    expect(duration).toBeLessThan(maxMs)
    expect(duration).toBeGreaterThan(0)
  },

  /**
   * Assert that security headers are properly set
   */
  expectSecurityHeaders(response: any) {
    const headers = response.headers()
    // Add specific security header expectations based on Edge implementation
    expect(headers).toHaveProperty('content-type')
    expect(headers['content-type']).toContain('application/json')
    // Additional security headers can be added as they're implemented
  }
}

/**
 * Utility functions for Edge integration testing
 */
export const edgeTestUtils = {
  /**
   * Wait for Edge service to be ready
   */
  async waitForEdgeReady(apiContext: APIRequestContext, maxAttempts = 10): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await apiContext.get('/health')
        if (response.ok()) {
          return true
        }
      } catch (error) {
        // Service not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    return false
  },

  /**
   * Create concurrent requests for load testing
   */
  async sendConcurrentRequests(
    apiContext: APIRequestContext,
    requests: Array<{ endpoint: string; data: any }>,
    maxConcurrency = 5
  ) {
    const results = []
    const batches = []
    
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      batches.push(requests.slice(i, i + maxConcurrency))
    }

    for (const batch of batches) {
      const batchPromises = batch.map(req => 
        apiContext.post(req.endpoint, { data: req.data })
      )
      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
    }

    return results
  },

  /**
   * Parse Server-Sent Events from streaming response
   */
  parseSSEEvents(data: string): Array<{ event?: string; data: string; id?: string }> {
    const events = []
    const lines = data.split('\n')
    let currentEvent: any = {}

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent.event = line.substring(6).trim()
      } else if (line.startsWith('data:')) {
        currentEvent.data = line.substring(5).trim()
      } else if (line.startsWith('id:')) {
        currentEvent.id = line.substring(3).trim()
      } else if (line === '') {
        if (currentEvent.event) {
          // Push events that have an event type, regardless of data content
          // (done events have empty data)
          events.push(currentEvent)
        }
        currentEvent = {}
      }
    }

    // Handle case where stream doesn't end with empty line
    if (currentEvent.event) {
      events.push(currentEvent)
    }

    return events
  }
}