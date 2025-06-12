import { test as setup } from '@playwright/test'
import { waitForServerHealth } from './fixtures/server-fixtures'

setup('ensure servers are running', async () => {
  // Verify that both servers are accessible
  await waitForServerHealth(`${process.env.EDGE_BASE_URL ?? 'http://localhost:8787'}/health`, 10000)
  await waitForServerHealth(`${process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766'}/health`, 10000)
})

setup('create auth state', async () => {
  // Placeholder for auth state creation
  // Will be implemented when authentication is added in Feature 003
  console.log('Auth state setup placeholder')
}) 