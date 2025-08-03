/**
 * # WorkOS Edge Authentication for Liminal Chat
 *
 * This module provides lightweight WorkOS JWT authentication for the Convex edge runtime.
 * Runs in Convex's default V8 isolate environment without Node.js dependencies.
 *
 * ## Overview
 *
 * The authentication system uses WorkOS JWKS endpoint directly:
 * - **Runtime**: Edge/V8 runtime (no Node.js required)
 * - **Dependencies**: Only 'jose' library for JWT verification
 * - **Integration**: Direct JWT validation using WorkOS JWKS endpoint
 * - **Performance**: Optimized for edge runtime with minimal overhead
 *
 * ## Environment Variables
 *
 * **Required:**
 * - `WORKOS_CLIENT_ID` - WorkOS Client ID for JWKS URL construction
 *
 * **Not Required:**
 * - `WORKOS_API_KEY` - Not needed for edge runtime authentication
 *
 * ## Key Differences from Node Version
 *
 * 1. **No WorkOS SDK** - Uses direct JWKS verification
 * 2. **Lightweight** - Minimal dependencies and memory footprint
 * 3. **Edge-optimized** - Runs in V8 isolate, not Node.js
 * 4. **Simplified error handling** - Returns standard errors for HTTP layer
 *
 * ## Available Functions
 *
 * 1. **`requireAuth`** - Validates JWT and returns user info (throws on failure)
 * 2. **`optionalAuth`** - Optional authentication (returns null if no header)
 *
 * ## Usage in HTTP Actions
 * ```typescript
 * const authHeader = request.headers.get('Authorization') || undefined;
 * const user = await ctx.runAction(api.edge.auth.requireAuth, { authHeader });
 * ```
 *
 * ## Security Notes
 *
 * - JWT validation uses WorkOS JWKS endpoint for secure verification
 * - JWKS URL pattern: https://api.workos.com/sso/jwks/{CLIENT_ID}
 * - Includes retry logic for transient network failures
 * - No local caching of keys (fetched on demand)
 */

import { action } from '../_generated/server';
import { v } from 'convex/values';
import { jwtVerify, createRemoteJWKSet } from 'jose';

export interface AuthenticatedUser {
  id: string;
  email: string;
  customClaims: {
    system_user?: string;
    test_context?: string;
    environment?: string;
    permissions?: string[];
  };
}

interface AuthErrorContext {
  operation: string;
  timestamp: number;
  tokenLength?: number;
  hasClientId: boolean;
  originalError?: string;
}

function isRetryableError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes('network') || msg.includes('timeout') || msg.includes('fetch failed');
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === retries - 1 || !isRetryableError(e as Error)) throw e;
      await new Promise((r) => setTimeout(r, 2 ** (attempt + 1) * 1000));
    }
  }
  throw new Error('Retry limit exceeded');
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (jwks) return jwks;

  const clientId = process.env.WORKOS_CLIENT_ID;
  if (!clientId) {
    const context: AuthErrorContext = {
      operation: 'environment_validation',
      timestamp: Date.now(),
      hasClientId: false,
      originalError: 'WORKOS_CLIENT_ID environment variable is required',
    };
    console.error('Edge auth: Environment validation failed', context);
    throw new Error('WORKOS_CLIENT_ID environment variable is required');
  }

  const url = `https://api.workos.com/sso/jwks/${clientId}`;
  jwks = createRemoteJWKSet(new URL(url));
  return jwks;
}

// Fallback JWKS for User Management (password grant) tokens
const userManagementJwks = createRemoteJWKSet(
  new URL('https://api.workos.com/user_management/jwks'),
);

async function verifyToken(token: string): Promise<AuthenticatedUser | null> {
  const clean = token.replace(/^Bearer\s+/i, '');
  if (!clean) return null;

  try {
    const { payload } = await withRetry(() => jwtVerify(clean, getJwks()));
    return buildUserFromPayload(clean.length, payload);
  } catch (primaryError) {
    // Retry with User Management JWKS in case token came from password authentication
    try {
      const { payload } = await withRetry(() => jwtVerify(clean, userManagementJwks));
      console.warn('Edge auth: Verified JWT using User Management JWKS fallback');
      return buildUserFromPayload(clean.length, payload);
    } catch (secondaryError) {
      const context: AuthErrorContext = {
        operation: 'jwt_verification',
        timestamp: Date.now(),
        tokenLength: token.length,
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        originalError: (secondaryError as Error).message,
      };
      console.error('Edge auth: JWT verification failed', context);
      return null;
    }
  }
}

// Helper to build the AuthenticatedUser object from JWT payload without duplicating logic
function buildUserFromPayload(
  tokenLength: number,
  payload: Record<string, any>,
): AuthenticatedUser {
  const id = typeof payload.sub === 'string' ? payload.sub : '';
  const email =
    typeof payload['urn:myapp:email'] === 'string'
      ? payload['urn:myapp:email']
      : typeof payload.email === 'string'
        ? payload.email
        : '';

  console.log('Edge auth: JWT verification successful', {
    userId: id,
    userEmail: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'none',
    hasSystemUser: !!payload.system_user,
    tokenLength,
  });

  return {
    id,
    email,
    customClaims: {
      system_user: typeof payload.system_user === 'string' ? payload.system_user : undefined,
      test_context: typeof payload.test_context === 'string' ? payload.test_context : undefined,
      environment: typeof payload.environment === 'string' ? payload.environment : undefined,
      permissions:
        Array.isArray(payload.permissions) &&
        payload.permissions.every((p) => typeof p === 'string')
          ? payload.permissions
          : undefined,
    },
  };
}

export const requireAuth = action({
  args: { authHeader: v.optional(v.string()) },
  returns: v.object({
    id: v.string(),
    email: v.string(),
    customClaims: v.object({
      system_user: v.optional(v.string()),
      test_context: v.optional(v.string()),
      environment: v.optional(v.string()),
      permissions: v.optional(v.array(v.string())),
    }),
  }),
  handler: async (_ctx, { authHeader }) => {
    if (!authHeader) {
      // Matches createErrorResponse auth pattern
      throw new Error('Missing authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new Error('Missing authorization token in Bearer header');
    }
    const user = await verifyToken(token);
    if (!user) throw new Error('Invalid or expired authorization token');
    return user;
  },
});

export const optionalAuth = action({
  args: { authHeader: v.optional(v.string()) },
  returns: v.union(
    v.object({
      id: v.string(),
      email: v.string(),
      customClaims: v.object({
        system_user: v.optional(v.string()),
        test_context: v.optional(v.string()),
        environment: v.optional(v.string()),
        permissions: v.optional(v.array(v.string())),
      }),
    }),
    v.null(),
  ),
  handler: async (_ctx, { authHeader }) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return null;
    return await verifyToken(token);
  },
});
