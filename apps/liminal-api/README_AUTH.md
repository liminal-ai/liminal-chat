# Clerk Authentication Setup for Liminal Chat

This document describes the Clerk authentication setup for the Liminal Chat Convex backend.

## Overview

The authentication is configured to use Clerk (https://clerk.com) with the following setup:

- **Clerk Domain**: deep-shrew-9.clerk.accounts.dev
- **Authentication Provider**: Clerk with OAuth providers configured
- **Integration**: Direct JWT validation through Convex's built-in auth

## Environment Variables

The following environment variables are configured in `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVlcC1zaHJldy05LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_OgiGADO9Djug291YKQfQ4kuI6aeVx8Yg1xnGQrv0iK
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_ISSUER_URL=https://deep-shrew-9.clerk.accounts.dev
```

## Database Schema

The `users` table stores authenticated user information:

```typescript
users: {
  tokenIdentifier: string   // Clerk's JWT token identifier
  email: string            // User's email
  name?: string           // Optional display name
  imageUrl?: string       // Optional profile image
  createdAt: number       // Timestamp
  updatedAt: number       // Timestamp
}
```

## Available Functions

### Authentication Functions (`convex/users.ts`)

1. **`getCurrentUser`** - Query to get the current authenticated user
2. **`syncUser`** - Mutation to create/update user profile from Clerk data
3. **`testAuth`** - Query to verify authentication is working

### HTTP Endpoints (`convex/http.ts`)

1. **`/health`** - Health check endpoint
2. **`/clerk-webhook`** - Webhook endpoint for Clerk events

### Test Function (`convex/test.ts`)

1. **`ping`** - Simple query to test Convex connectivity

## Usage

To use authentication in your Convex functions:

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated");
}
```

## Next Steps

1. Configure Clerk webhook in the Clerk dashboard to point to your Convex HTTP endpoint
2. Implement frontend authentication flow using Clerk React components
3. Call `syncUser` mutation after successful authentication to sync user data