# System User Setup for Integration Testing

This guide explains how to set up a WorkOS system user for integration testing with JWT authentication.

## Overview

The system user approach allows integration tests to authenticate with WorkOS using a dedicated user account and JWT templates, providing a clean separation between test authentication and regular user authentication.

## Environment Variables

Add these environment variables to your `.env` files:

```bash
# WorkOS Configuration (should already be set)
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id

# System User Credentials
SYSTEM_USER_EMAIL=system-test@your-domain.com
SYSTEM_USER_PASSWORD=your_secure_password_32_chars_minimum
```

## Setup Steps

### 1. Set Environment Variables

Create a system user email and secure password (minimum 32 characters):

```bash
# Add to apps/liminal-api/.env.local
SYSTEM_USER_EMAIL="system-test@your-domain.com"
SYSTEM_USER_PASSWORD="your-very-secure-password-at-least-32-characters-long"
```

### 2. Create System User

Run the system user creation script:

```bash
cd apps/liminal-api
npx tsx scripts/create-system-user.ts
```

This script will:

- Create a WorkOS user with system metadata
- Test authentication with the credentials
- Display the user ID and configuration details

### 3. Configure JWT Template in WorkOS Dashboard

1. Go to your WorkOS Dashboard
2. Navigate to **Authentication → JWT Template**
3. Create or edit your JWT template to include custom claims:

```json
{
  "system_user": "{{ user.metadata.purpose == 'integration_testing' }}",
  "test_context": "{{ user.metadata.environment }}",
  "permissions": ["api_access", "test_operations"],
  "environment": "{{ user.metadata.environment }}"
}
```

### 4. Update Test Configuration

The test framework will automatically use the SystemAuthHelper for authenticated requests:

```typescript
import { getSystemAuthHelper } from '../lib/test/system-auth-helper';

// In your test files
const authHelper = await getSystemAuthHelper();
const response = await authHelper.get('/api/your-endpoint');
```

## Usage in Tests

### Basic Authentication

```typescript
import { getSystemAuthHelper } from '../lib/test/system-auth-helper';

test('authenticated endpoint access', async () => {
  const authHelper = await getSystemAuthHelper();

  // Make authenticated requests
  const response = await authHelper.get('/api/health');
  expect(response.status).toBe(200);
});
```

### Token Validation

```typescript
test('system user token validation', async () => {
  const authHelper = await getSystemAuthHelper();

  // Verify token claims
  const claims = await authHelper.getTokenClaims();
  expect(claims.system_user).toBe(true);
  expect(claims.environment).toBe('development');
});
```

### Custom Headers

```typescript
test('custom authenticated request', async () => {
  const authHelper = await getSystemAuthHelper();

  const response = await authHelper.authenticatedFetch('/api/custom', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' }),
    headers: {
      'X-Custom-Header': 'value',
    },
  });
});
```

## Troubleshooting

### Authentication Fails

1. Verify environment variables are set correctly
2. Check that the system user was created successfully
3. Ensure JWT template is configured in WorkOS dashboard

### Token Claims Missing

If `system_user` claim is not present:

1. Update JWT template to include the custom claims
2. Refresh the token: `await authHelper.refreshToken()`
3. Verify user metadata in WorkOS dashboard

### Integration Test Failures

1. Ensure endpoints require authentication
2. Check Convex auth configuration includes WorkOS OIDC
3. Verify test environment variables match WorkOS configuration

## Security Notes

- System user credentials should be stored securely
- Use different system users for different environments
- Rotate system user passwords regularly
- Monitor system user access in WorkOS dashboard
