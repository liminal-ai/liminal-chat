# WorkOS Authentication Setup for Liminal Chat

This document describes the WorkOS authentication setup for the Liminal Chat Convex backend.

## Overview

The authentication is configured to use WorkOS (https://workos.com) with the following setup:

- **WorkOS Client**: Configured with SSO/OIDC
- **Authentication Provider**: WorkOS with OAuth providers configured
- **Integration**: Direct JWT validation using WorkOS JWKS endpoint

## Environment Variables

## Database Schema

User information is stored in the agents table with WorkOS user IDs:

```typescript
agents: {
  userId: string          // WorkOS user ID from JWT
  // ... other agent fields
}

// Note: No dedicated users table - WorkOS manages user data
```

## Available Functions

### Authentication Functions (`convex/node/auth.ts`)

1. **`requireAuth`** - Action to validate WorkOS JWT and return user info
2. **`optionalAuth`** - Action for optional authentication
3. **`validateWorkOSToken`** - Internal function to verify WorkOS tokens

### HTTP Endpoints (`convex/http.ts`)

1. **`/health`** - Health check endpoint (requires authentication)
2. **`/api/chat`** - Chat endpoints (require authentication)
3. **`/api/agents`** - Agent management endpoints (require authentication)

### Test Functions

Authentication testing is handled through the HTTP endpoints and Playwright tests.

## Usage

To use authentication in your Convex functions:

```typescript
// In HTTP actions
const authHeader = request.headers.get('Authorization') || undefined;
const user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

// User object contains: { id, email, customClaims }
```

## Next Steps

1. Configure WorkOS SSO/OIDC settings in the WorkOS dashboard
2. Implement frontend authentication flow using WorkOS SDK
3. Ensure proper JWT handling in your frontend application
