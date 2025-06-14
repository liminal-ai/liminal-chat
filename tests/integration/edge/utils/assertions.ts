import { expect } from '@playwright/test'
import type { APIResponse } from '@playwright/test'

/**
 * Assertion utilities for Edge integration tests
 * These functions provide consistent validation patterns across Edge test suites
 */

/**
 * Asserts that the API response is successful with a status code in the 2xx range.
 *
 * @param response - The API response to validate.
 */
export function expectValidResponse(response: APIResponse) {
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBeGreaterThanOrEqual(200)
  expect(response.status()).toBeLessThan(300)
}

/**
 * Asserts that the provided data object matches the expected structure and types of a valid LLM response.
 *
 * Validates the presence and types of `content`, `model`, and `usage` properties, and checks that token counts are numeric and consistent.
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
 * Asserts that an API response represents an error, optionally matching a specific status code.
 *
 * If {@link expectedStatus} is provided, the response status must equal this value; otherwise, the status must be 400 or higher. Also asserts that the response is not successful.
 *
 * @param expectedStatus - Optional HTTP status code to match against the response.
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
 * Asserts that the error data object contains a valid error code property.
 *
 * The `code` property must be a non-empty string matching one of the allowed prefixes:
 * `EDGE_`, `DOMAIN_`, `VALIDATION_`, `PROVIDER_`, `NETWORK_`, or `SECURITY_`, followed by uppercase letters or underscores.
 */
export function expectValidErrorCode(data: any) {
  expect(data).toHaveProperty('code')
  expect(typeof data.code).toBe('string')
  expect(data.code).toBeTruthy()
  
  // Validate error code follows expected pattern (e.g., EDGE_* or DOMAIN_*)
  expect(data.code).toMatch(/^(EDGE_|DOMAIN_|VALIDATION_|PROVIDER_|NETWORK_|SECURITY_)[A-Z_]+$/)
}

/**
 * Asserts that the API response is successful and uses the `text/event-stream` content type for streaming.
 *
 * @param response - The API response to validate.
 */
export function expectValidStreamingResponse(response: APIResponse) {
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('text/event-stream')
}

/**
 * Asserts that the response duration is greater than zero and less than the specified maximum.
 *
 * @param duration - The measured response time in milliseconds.
 * @param maxMs - The maximum acceptable response time in milliseconds. Defaults to 5000.
 */
export function expectAcceptableResponseTime(duration: number, maxMs = 5000) {
  expect(duration).toBeLessThan(maxMs)
  expect(duration).toBeGreaterThan(0)
}

/**
 * Asserts that the response includes required security-related headers.
 *
 * Validates that the `content-type` header is present and contains `application/json`.
 *
 * @param response - The API response to check.
 *
 * @remark Additional security header checks can be added as needed.
 */
export function expectSecurityHeaders(response: APIResponse) {
  const headers = response.headers()
  expect(headers).toHaveProperty('content-type')
  expect(headers['content-type']).toContain('application/json')
  // Additional security headers can be added as they're implemented
}

/**
 * Asserts that the provider response object contains the required properties and types.
 *
 * Validates that {@link data} includes a string `defaultProvider`, an array `availableProviders`, and an object `providers`.
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
 * Asserts that the health check response object contains required fields with correct values and formats.
 *
 * Validates that {@link data} includes `status`, `service`, `timestamp`, and `domainUrl` properties. Ensures `status` is `'ok'`, `service` is `'liminal-chat-edge'`, and both `timestamp` and `domainUrl` are strings. Also verifies that `timestamp` is a valid ISO date string.
 *
 * @param data - The health check response object to validate.
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