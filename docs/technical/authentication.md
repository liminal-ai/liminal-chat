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

### Configuration

The dev user is configured in `/apps/liminal-api/convex/lib/auth.ts`:

```typescript
const DEV_USER_CONFIG = {
  tokenIdentifier: 'user_2zINPyhtT9Wem9OeVW4eZDs21KI',
  email: 'dev@liminal.chat',
  name: 'Dev User',
  subject: 'user_2zINPyhtT9Wem9OeVW4eZDs21KI'
};
```

### Setting Up Dev User

1. **Enable Default Dev Auth**
   ```bash
   cd apps/liminal-api
   npx convex env set DEV_AUTH_DEFAULT true
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

1. **Clerk Keys** (in `.env.local`):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

2. **Convex Environment**:
   ```bash
   npx convex env set CLERK_ISSUER_URL https://your-instance.clerk.accounts.dev
   ```

### User Synchronization

Users are synchronized to Convex through:
- Webhook endpoint at `/clerk-webhook`
- Manual sync via `users.syncUser` mutation
- Automatic sync on first authenticated request

## Auth Helper Functions

### requireAuth(ctx)

Used in mutations and queries that require authentication.

```typescript
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    return await getDevUser(ctx);
  }
  
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
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
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
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    return DEV_USER_CONFIG;
  }
  
  return await ctx.auth.getUserIdentity();
}
```

**When to use**:
- In Convex actions that need auth context
- When calling mutations/queries from actions

**Why different**: Actions can't access the database directly, so they can't look up the dev user.

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

#### 404 on Resource Access
**Symptom**: Fetching specific resources returns 404

**Causes**:
1. User doesn't own the resource
2. Auth context not propagated
3. Route configuration issues

**Solution**: Check ownership verification logic and auth propagation

#### Auth Context Not Propagating
**Symptom**: Queries work directly but fail when called from HTTP actions

**Cause**: Convex HTTP actions need explicit auth handling

**Solution**: Use auth helpers in both the action and the queries it calls

### Debug Steps

1. **Check Environment Variables**
   ```bash
   npx convex env list
   # Verify DEV_AUTH_DEFAULT=true
   ```

2. **Verify User Creation**
   ```bash
   npx convex run users:getUserCount
   # Should return at least 1
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

1. **Never use DEV_AUTH_DEFAULT in production**
   - Always check `NODE_ENV !== 'production'`
   - Remove or set to false before deployment

2. **Verify Webhook Signatures**
   - Clerk webhooks should verify signatures
   - Prevents unauthorized user creation

3. **Token Expiration**
   - Clerk tokens expire and refresh automatically
   - Convex handles this transparently

4. **User Data Privacy**
   - Always verify ownership before returning data
   - Use indexes for efficient user-scoped queries

## Migration Notes

When migrating from the old NestJS system:
1. User IDs change format (from database IDs to Clerk IDs)
2. Sessions are managed by Clerk, not the backend
3. No need for custom JWT logic - Clerk handles it
4. User sync happens through webhooks or on-demand