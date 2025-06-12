import { test as base } from './base-fixtures'
import { waitForCondition } from '../utils/helpers'

type ServerFixtures = {
  ensureServersRunning: () => Promise<void>
}

export const serverTest = base.extend<ServerFixtures>({
  ensureServersRunning: async (_unused, use) => {
    const ensureRunning = async () => {
      // Check if servers are running by hitting health endpoints
      const edgeHealthUrl = 'http://localhost:8787/health'
      const domainHealthUrl = 'http://localhost:8766/health'
      
      try {
        const edgeResponse = await fetch(edgeHealthUrl)
        const domainResponse = await fetch(domainHealthUrl)
        
        if (!edgeResponse.ok || !domainResponse.ok) {
          throw new Error('Servers are not healthy. Please check server status.')
        }
      } catch (error) {
        throw new Error('Servers are not running. Please start them with: pnpm dev')
      }
    }
    
    await use(ensureRunning)
  }
})

export async function waitForServerHealth(url: string, timeoutMs: number = 30000): Promise<void> {
  await waitForCondition(async () => {
    try {
      const response = await fetch(url)
      return response.ok
    } catch {
      return false
    }
  }, timeoutMs)
} 