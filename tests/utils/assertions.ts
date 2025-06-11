import { expect } from '@playwright/test'

export function expectValidResponse(response: any) {
  expect(response.status()).toBeGreaterThanOrEqual(200)
  expect(response.status()).toBeLessThan(300)
}

export function expectErrorResponse(response: any, expectedStatus?: number) {
  if (expectedStatus) {
    expect(response.status()).toBe(expectedStatus)
  } else {
    expect(response.status()).toBeGreaterThanOrEqual(400)
  }
}

export function expectStreamingContent(content: string) {
  expect(content).toBeTruthy()
  expect(typeof content).toBe('string')
  expect(content.length).toBeGreaterThan(0)
}

export function expectValidLLMResponse(data: any) {
  expect(data).toHaveProperty('content')
  expect(data.content).toBeTruthy()
  expect(typeof data.content).toBe('string')
}

export function expectValidErrorCode(data: any) {
  expect(data).toHaveProperty('errorCode')
  expect(data.errorCode).toMatch(/^[A-Z_]+$/)
} 