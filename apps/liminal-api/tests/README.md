# Liminal API Integration Tests

Playwright-based integration tests for the Liminal Chat Convex backend.

## Prerequisites

1. **Local Dev Service Running**
   ```bash
   cd apps/local-dev-service
   npm run dev:start
   ```

2. **Environment Configuration**
   The local-dev-service needs WorkOS credentials in its `.env` file:
   ```env
   WORKOS_CLIENT_ID=your_client_id
   WORKOS_API_KEY=your_api_key
   DEV_USER_EMAIL=system@example.com
   DEV_USER_PASSWORD=your_password
   ```

3. **Convex Dev Server**
   ```bash
   cd apps/liminal-api
   npm run dev:start
   ```

## Running Tests

```bash
# Run all integration tests
npm run test

# Run with UI mode for debugging
npm run test:ui

# Run smoke tests only
npm run test:smoke
```

## Authentication Architecture

Tests authenticate via the local dev service at `http://127.0.0.1:8081/auth/token`:

1. Tests request JWT from local dev service
2. Local dev service authenticates with WorkOS
3. Token is cached for 50 minutes
4. All test requests include the JWT bearer token

This centralizes authentication logic and simplifies credential management.

## Test Structure

- `specs/` - Test specifications
  - `auth-comprehensive.spec.ts` - Authentication coverage
  - `agents.spec.ts` - Agent CRUD operations
  - `conversation-persistence.spec.ts` - Conversation management
  - `integration.spec.ts` - General integration tests

- `utils/` - Test utilities
  - `local-dev-auth.ts` - Local dev service auth client
  - `auth-fixture.ts` - Playwright auth fixture
  - `helpers.ts` - Test helper functions

## Writing Tests

Use the authenticated request fixture:

```typescript
import { test, expect } from '../utils/auth-fixture';

test('authenticated endpoint test', async ({ authenticatedRequest }) => {
  const response = await authenticatedRequest.get('/api/health');
  expect(response.status()).toBe(200);
});
```

## Troubleshooting

1. **"Local dev service not running"**
   - Start the service: `cd apps/local-dev-service && npm run dev:start`

2. **"Failed to get token: Failed to generate authentication token"**
   - Check WorkOS credentials in `apps/local-dev-service/.env`
   - Verify the system user exists in WorkOS

3. **Token validation warnings**
   - Ensure JWT template in WorkOS includes `system_user: "integration_testing"` claim