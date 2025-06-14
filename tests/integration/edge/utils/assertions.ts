import { expect } from '@playwright/test'
import type { APIResponse } from '@playwright/test'

/**
 * Assertion utilities for Edge integration tests
 * These functions provide consistent validation patterns across Edge test suites
 */

/**
 * Assert that response is valid and successful
 */
export function expectValidResponse(response: APIResponse) {
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBeGreaterThanOrEqual(200)
  expect(response.status()).toBeLessThan(300)
}

/**
 * Assert that response contains valid LLM response structure
 */
export function expectValidLLMResponse(data: any) {
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
}

/**
 * Assert that error response follows expected error contract
 */
export function expectErrorResponse(response: APIResponse, expectedStatus?: number) {
  if (expectedStatus) {
    expect(response.status()).toBe(expectedStatus)
  } else {
    expect(response.status()).toBeGreaterThanOrEqual(400)
  }
  expect(response.ok()).toBeFalsy()
}

/**
 * Assert that error data contains valid error code
 */
export function expectValidErrorCode(data: any) {
  expect(data).toHaveProperty('code')
  expect(typeof data.code).toBe('string')
  expect(data.code).toBeTruthy()
  
  // Validate error code follows expected pattern (e.g., EDGE_* or DOMAIN_*)
  expect(data.code).toMatch(/^(EDGE_|DOMAIN_|VALIDATION_|PROVIDER_|NETWORK_|SECURITY_)[A-Z_]+$/)
}

/**
 * Assert that streaming response follows expected streaming contract
 */
export function expectValidStreamingResponse(response: APIResponse) {
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('text/event-stream')
}

/**
 * Assert that response time is within acceptable limits
 */
export function expectAcceptableResponseTime(duration: number, maxMs = 5000) {
  expect(duration).toBeLessThan(maxMs)
  expect(duration).toBeGreaterThan(0)
}

/**
 * Assert that security headers are properly set
 */
export function expectSecurityHeaders(response: APIResponse) {
  const headers = response.headers()
  expect(headers).toHaveProperty('content-type')
  expect(headers['content-type']).toContain('application/json')
  // Additional security headers can be added as they're implemented
}

/**
 * Assert that provider response follows expected provider contract
 */
export function expectValidProviderResponse(data: any) {
  expect(data).toHaveProperty('defaultProvider')
  expect(data).toHaveProperty('availableProviders')
  expect(data).toHaveProperty('providers')
  expect(Array.isArray(data.availableProviders)).toBeTruthy()
  expect(typeof data.providers).toBe('object')
  expect(typeof data.defaultProvider).toBe('string')
}

/**
 * Assert that health response follows expected health contract
 */
export function expectValidHealthResponse(data: any) {
  expect(data).toHaveProperty('status')
  expect(data).toHaveProperty('service')
  expect(data).toHaveProperty('timestamp')
  expect(data).toHaveProperty('domainUrl')
  expect(data.status).toBe('ok')
  expect(data.service).toBe('liminal-chat-edge')
  expect(typeof data.timestamp).toBe('string')
  expect(typeof data.domainUrl).toBe('string')
  
  // Validate timestamp is a valid ISO string
  expect(() => new Date(data.timestamp)).not.toThrow()
  expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
}