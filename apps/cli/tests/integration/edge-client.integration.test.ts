import { describe, it, expect, beforeAll } from 'vitest';
import { EdgeClient } from '../../src/api/edge-client';

describe('EdgeClient Integration Tests', () => {
  let client: EdgeClient;
  let serverAvailable = false;

  beforeAll(async () => {
    // Skip in CI environment
    if (process.env.CI) {
      console.log('CI environment detected, skipping integration tests');
      return;
    }

    // Check if server is already running
    try {
      const testClient = new EdgeClient('http://localhost:8787');
      await testClient.health();
      serverAvailable = true;
      client = testClient;
      console.log('Edge server detected on port 8787, running integration tests');
    } catch (error) {
      // Server not running, skip integration tests
      console.log('Edge server not running on port 8787, skipping integration tests');
      console.log('To run integration tests, start the Edge server with: cd ../edge-server && npm run dev');
    }
  });

  it('should successfully call the health endpoint', async () => {
    // Skip if no server
    if (!serverAvailable) {
      console.log('Skipping test - server not available');
      return;
    }

    const health = await client.health();
    expect(health).toBeDefined();
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
    
    // Edge server response includes domainUrl
    expect(health.domainUrl).toBeDefined();
    expect(typeof health.domainUrl).toBe('string');
  });

  it('should successfully call the prompt endpoint', async () => {
    // Skip if no server
    if (!serverAvailable) {
      console.log('Skipping test - server not available');
      return;
    }

    const response = await client.prompt('Hello');
    expect(response).toBeDefined();
    expect(response.content).toBe('Echo: Hello');
    expect(response.model).toBe('echo-1.0');
    expect(response.usage).toBeDefined();
    expect(response.usage.promptTokens).toBeGreaterThan(0);
    expect(response.usage.completionTokens).toBeGreaterThan(0);
    expect(response.usage.totalTokens).toBe(response.usage.promptTokens + response.usage.completionTokens);
  });

  it('should handle empty prompt error', async () => {
    // Skip if no server
    if (!serverAvailable) {
      console.log('Skipping test - server not available');
      return;
    }

    await expect(client.prompt('')).rejects.toThrow();
  });

  it('should handle very long prompts', async () => {
    // Skip if no server
    if (!serverAvailable) {
      console.log('Skipping test - server not available');
      return;
    }

    const longPrompt = 'This is a test prompt. '.repeat(100);
    const response = await client.prompt(longPrompt);
    expect(response).toBeDefined();
    expect(response.content).toContain('Echo: This is a test prompt.');
    expect(response.usage.promptTokens).toBeGreaterThan(100);
  });

  it('should respect timeout settings', async () => {
    // Skip if no server
    if (!serverAvailable) {
      console.log('Skipping test - server not available');
      return;
    }

    // Test that normal timeouts work - this is more of a unit test
    // since we can't reliably force a timeout in integration tests
    const normalClient = new EdgeClient({
      baseUrl: 'http://localhost:8787',
      timeout: 30000 // Normal timeout
    });

    // Should work fine with normal timeout
    const response = await normalClient.prompt('Timeout test');
    expect(response).toBeDefined();
    expect(response.content).toBe('Echo: Timeout test');
  });
});