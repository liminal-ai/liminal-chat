# Authentication in Liminal Chat

## Overview

Liminal Chat uses a combination of Clerk for authentication and Convex for data persistence. This document explains how authentication works in both development and production environments.

### Architecture
- **Authentication Provider**: Clerk (handles user registration, login, JWT tokens)
- **Backend Integration**: Convex (verifies Clerk JWTs, manages user data)
- **Development Mode**: Default dev user for local development without Clerk setup

## Development Authentication

### Default Dev User

During development, we use a default dev user instead of requiring full Clerk authentication setup. This allows developers to:
- Start working immediately without Clerk configuration
- Test features that require authentication
- Maintain consistent user context across sessions

### Environment Configuration

With the new environment system implemented on July 2, 2025, dev user configuration is now managed through environment variables:

```bash
# Enable dev auth (development only)
npx convex env set DEV_AUTH_DEFAULT true

# Set dev user configuration
npx convex env set DEV_USER_ID "user_2zINPyhtT9Wem9OeVW4eZDs21KI"
npx convex env set DEV_USER_EMAIL "dev@liminal.chat"
npx convex env set DEV_USER_NAME "Dev User"
```

### Security Protection

The dev auth system includes multiple security layers:
- **Production Protection**: Dev auth is automatically disabled when `NODE_ENV === 'production'`
- **Lazy Evaluation**: Dev user config is only loaded when needed, preventing startup failures
- **Validation**: The system validates all required env vars are set when dev auth is enabled

### Setting Up Dev User

1. **Enable Default Dev Auth**
   ```bash
   cd apps/liminal-api
   npx convex env set DEV_AUTH_DEFAULT true
   npx convex env set DEV_USER_ID "user_2zINPyhtT9Wem9OeVW4eZDs21KI"
   npx convex env set DEV_USER_EMAIL "dev@liminal.chat"
   npx convex env set DEV_USER_NAME "Dev User"
   ```

2. **Initialize Dev User in Database**
   ```bash
   npx convex run users:initializeDevUser
   ```

3. **Verify Setup**
   ```bash
   # Check health endpoint
   curl https://your-deployment.convex.site/health
   # Should show userCount: 1
   ```

### When Default Dev Auth is Active

- `DEV_AUTH_DEFAULT=true` in Convex environment
- `NODE_ENV !== 'production'`
- All auth checks return the dev user
- No Clerk tokens required

## Production Authentication

### Clerk Integration

In production, authentication works as follows:

1. **User Registration/Login**: Handled by Clerk's UI components
2. **JWT Token Generation**: Clerk issues signed JWT tokens
3. **Token Verification**: Convex verifies tokens using Clerk's public key
4. **User Synchronization**: User data synced from Clerk to Convex database

### Configuration Requirements

1. **Environment Variables** (in Convex cloud):
   ```bash
   npx convex env set CLERK_ISSUER_URL "https://your-instance.clerk.accounts.dev"
   npx convex env set CLERK_WEBHOOK_SECRET "whsec_your_webhook_secret"
   ```

2. **Next.js Environment** (when we build the frontend):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

### Webhook Security

The Clerk webhook endpoint now includes Svix signature verification:
- Validates webhook signatures to prevent spoofing
- Requires `CLERK_WEBHOOK_SECRET` to be set
- Returns proper error messages for missing configuration

## Auth Helper Functions

### requireAuth(ctx)

Used in mutations and queries that require authentication.

```typescript
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  // In development with bypass enabled, return the dev user
  if (env.isDevAuthEnabled) {
    return await getDevUser(ctx);
  }
  
  // Normal auth flow
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
}
```

**When to use**:
- Mutations that create/modify user data
- Queries that return user-specific data
- Any operation that must have a user context

**Behavior**:
- Dev auth: Returns dev user
- Production: Throws error if no auth

### getAuth(ctx)

Used in queries where authentication enhances but isn't required.

```typescript
export async function getAuth(ctx: QueryCtx | MutationCtx) {
  // In development with default auth enabled, return the dev user
  if (env.isDevAuthEnabled) {
    return await getDevUser(ctx);
  }
  
  return await ctx.auth.getUserIdentity();
}
```

**When to use**:
- Public endpoints that personalize with auth
- Queries that return different data based on auth status
- Health checks and status endpoints

**Behavior**:
- Dev auth: Returns dev user
- Production: Returns null if no auth

### getAuthForAction(ctx)

Special version for Convex actions (which don't have database access).

```typescript
export async function getAuthForAction(ctx: ActionCtx) {
  // In development with default auth enabled, return the dev user config
  if (env.isDevAuthEnabled) {
    validateDevConfig();
    return getDEV_USER_CONFIG();
  }
  
  return await ctx.auth.getUserIdentity();
}
```

**When to use**:
- In Convex actions that need auth context
- When calling mutations/queries from actions

**Why different**: Actions can't access the database directly, so they can't look up the dev user.

## Environment System Integration

The authentication system is now integrated with the centralized environment configuration:

### Type-Safe Access
```typescript
import { env } from "./lib/env";

// Check if dev auth is enabled (with production protection)
if (env.isDevAuthEnabled) {
  // Use dev auth
}

// Access dev user config (throws helpful errors if not set)
const userId = env.DEV_USER_ID;
const userEmail = env.DEV_USER_EMAIL;
const userName = env.DEV_USER_NAME;
```

### Error Messages
When environment variables are missing, you'll see helpful error messages:
```
Missing required environment variable: DEV_USER_ID
Description: Development user Clerk ID
Example: user_2zINPyhtT9Wem9OeVW4eZDs21KI
Note: Required when DEV_AUTH_DEFAULT is true (development only)

To set this variable in Convex:
npx convex env set DEV_USER_ID "your-value-here"
```

## Common Patterns

### Protected Queries/Mutations

```typescript
export const getUserData = query({
  args: { },
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);
    
    return await ctx.db
      .query("userData")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();
  },
});
```

### Ownership Verification

```typescript
export const updateItem = mutation({
  args: { itemId: v.id("items"), data: v.object({...}) },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== identity.tokenIdentifier) {
      throw new Error("Item not found");
    }
    
    // Update item...
  },
});
```

### Public Endpoints with Optional Auth

```typescript
export const listPublicItems = query({
  args: { },
  handler: async (ctx) => {
    const identity = await getAuth(ctx);
    
    const items = await ctx.db.query("items")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    // Enhance with user-specific data if authenticated
    if (identity) {
      // Add user's favorites, etc.
    }
    
    return items;
  },
});
```

## Troubleshooting

### Common Issues

#### Empty Conversation Lists
**Symptom**: `/api/conversations` returns empty array despite data existing

**Cause**: HTTP actions don't automatically propagate auth context to queries

**Solution**: Ensure queries use auth helper functions

#### Module Loading Errors
**Symptom**: "Cannot access 'env' before initialization" errors

**Cause**: Circular dependencies or eager evaluation of env vars

**Solution**: Use lazy evaluation pattern with getDEV_USER_CONFIG()

#### Dev Auth in Production
**Symptom**: Security error when trying to use dev auth in production

**Cause**: Production protection is working correctly

**Solution**: Use proper Clerk authentication in production

### Debug Steps

1. **Check Environment Variables**
   ```bash
   npx convex env list
   # Verify DEV_AUTH_DEFAULT and dev user vars
   ```

2. **Validate Environment**
   ```bash
   npx convex run startup:validateStartup
   # Check for any configuration errors
   ```

3. **Test Auth Flow**
   ```bash
   # Create a conversation
   curl -X POST https://your-deployment.convex.site/api/chat-text \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Test","provider":"openai"}'
   
   # Check if it returns conversationId
   ```

4. **Check Specific User**
   ```bash
   npx convex run users:getCurrentUser
   # Should return user details if auth is working
   ```

## Security Considerations

1. **Production Protection**
   - Dev auth automatically disabled in production
   - initializeDevUser mutation blocked in production
   - Clear error messages explain security implications

2. **Webhook Security**
   - Svix signature verification on all Clerk webhooks
   - Prevents unauthorized user creation
   - Proper error handling for missing secrets

3. **Environment Variable Security**
   - All sensitive values stored in Convex cloud
   - No hardcoded credentials in code
   - Lazy evaluation prevents accidental exposure

4. **User Data Privacy**
   - Always verify ownership before returning data
   - Use indexes for efficient user-scoped queries
   - Consistent auth handling across all endpoints

## Migration Notes

When migrating from the old NestJS system:
1. User IDs change format (from database IDs to Clerk IDs)
2. Sessions are managed by Clerk, not the backend
3. No need for custom JWT logic - Clerk handles it
4. User sync happens through webhooks or on-demand

## Related Documentation

- Environment Configuration: See `convex/lib/env.ts` for the complete environment system
- Error Handling: See `convex/lib/errors.ts` for error utilities
- Testing: Integration tests demonstrate auth flows in `tests/integration.spec.ts`