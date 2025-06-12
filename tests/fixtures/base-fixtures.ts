import { test as base, expect } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'
import { TestDataFactory } from '../utils/test-data'

type TestFixtures = {
  apiContext: APIRequestContext
  authToken: string
  testData: TestDataFactory
}

export const test = base.extend<TestFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: 'http://localhost:8787',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    await use(context)
    await context.dispose()
  },

  authToken: async ({ apiContext }, use) => {
    // Setup authentication if needed
    const response = await apiContext.post('/auth/login', {
      data: { username: 'test', password: 'test' }
    })
    const { token } = await response.json()
    await use(token)
  },

  testData: async (_unused, use) => {
    const factory = new TestDataFactory()
    await use(factory)
    await factory.cleanup()
  }
})

export { expect } 