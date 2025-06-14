import { test as base, expect } from './base-fixtures'
import type { APIRequestContext } from '@playwright/test'

type DomainTestFixtures = {
  domainApiContext: APIRequestContext
}

/**
 * Domain-specific test fixtures for integration tests
 * Provides a pre-configured API context pointing to the Domain service (port 8766)
 */
export const test = base.extend<DomainTestFixtures>({
  domainApiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    await use(context)
    await context.dispose()
  }
})

export { expect }