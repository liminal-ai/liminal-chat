# CLI Health Endpoint Fix

## Problem
The CLI is failing to start because:
1. It's calling `/api/v1/health` but the Edge server only has `/api/v1/edge/health`
2. The automated tests didn't catch this because they mock all HTTP responses
3. There are no integration tests that actually call the real server

## Your Task

### 1. Fix the Health Endpoint URL
In `cli-client/src/api/edge-client.ts`, update the health method:

```typescript
async health(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${this.baseUrl}/api/v1/edge/health`, {  // Changed from /api/v1/health
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    // ... rest of the method stays the same
  }
}
```

### 2. Update the Unit Test
In `cli-client/src/api/edge-client.test.ts`, update the health test to verify the correct URL:

```typescript
it('should return health status on success', async () => {
  const mockResponse = {
    status: 'healthy',
    timestamp: '2025-01-20T10:00:00Z',
    domain_status: 'connected'
  };

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse
  } as any);

  const result = await client.health();
  expect(result).toEqual(mockResponse);
  expect(mockFetch).toHaveBeenCalledWith(
    'http://localhost:8765/api/v1/edge/health',  // Updated URL
    expect.objectContaining({
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
  );
});
```

### 3. Add an Integration Test (IMPORTANT)
Create a new file `cli-client/tests/integration/edge-client.integration.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EdgeClient } from '../../src/api/edge-client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('EdgeClient Integration Tests', () => {
  let client: EdgeClient;
  let serverProcess: any;

  beforeAll(async () => {
    // Skip in CI environment
    if (process.env.CI) {
      return;
    }

    // Check if server is already running
    try {
      const testClient = new EdgeClient('http://localhost:8765');
      await testClient.health();
      // Server is already running, use it
    } catch {
      // Server not running, skip integration tests
      console.log('Edge server not running, skipping integration tests');
      return;
    }

    client = new EdgeClient('http://localhost:8765');
  });

  it('should successfully call the health endpoint', async () => {
    // Skip if no server
    if (!client) return;

    const health = await client.health();
    expect(health).toBeDefined();
    expect(health.status).toBe('healthy');
    expect(health.timestamp).toBeDefined();
  });

  it('should successfully call the prompt endpoint', async () => {
    // Skip if no server
    if (!client) return;

    const response = await client.prompt('Hello');
    expect(response).toBeDefined();
    expect(response.content).toBe('Echo: Hello');
    expect(response.model).toBe('echo-1.0');
    expect(response.usage).toBeDefined();
    expect(response.usage.totalTokens).toBeGreaterThan(0);
  });
});
```

### 4. Update package.json Scripts
Add integration test scripts to `cli-client/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:integration": "vitest run tests/integration",
    "test:all": "npm run test:run && npm run test:integration",
    // ... other scripts
  }
}
```

### 5. Test Your Fix
1. Make sure the Edge server is running on port 8765
2. Run the unit tests: `npm test`
3. Run the integration test: `npm run test:integration`
4. Test the CLI manually: `npm run dev chat`

## Expected Results
- Unit tests should pass (36 tests)
- Integration tests should pass when server is running
- CLI should start successfully and show "Connected to server"

## Important Notes
- The integration test gracefully skips if the server isn't running (for CI)
- This prevents future endpoint mismatches from going unnoticed
- Consider adding more integration tests for the chat command flow

## Definition of Done
- [ ] Health endpoint URL corrected to `/api/v1/edge/health`
- [ ] Unit test updated to check correct URL
- [ ] Integration test added and passing
- [ ] CLI manually tested and working
- [ ] All tests passing