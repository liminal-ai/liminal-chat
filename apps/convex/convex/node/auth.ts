'use node';

import { action } from '../_generated/server';
import { v } from 'convex/values';
import { WorkOS } from '@workos-inc/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { AuthenticatedUser } from '@liminal/shared-types';

// Lazy initialization of WorkOS
let workosClient: WorkOS | null = null;
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function initializeWorkOS() {
  if (workosClient && jwks) {
    return { workosClient, jwks };
  }

  const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
  const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;

  if (!WORKOS_API_KEY) {
    throw new Error('WORKOS_API_KEY environment variable is required');
  }

  if (!WORKOS_CLIENT_ID) {
    throw new Error('WORKOS_CLIENT_ID environment variable is required');
  }

  // Initialize WorkOS client for JWKS URL
  workosClient = new WorkOS(WORKOS_API_KEY);

  // Create JWKS for WorkOS token verification
  const jwksUrl = workosClient.userManagement.getJwksUrl(WORKOS_CLIENT_ID);
  jwks = createRemoteJWKSet(new URL(jwksUrl));

  return { workosClient, jwks };
}

/**
 * Internal function to validate WorkOS JWT token
 */
async function validateWorkOSTokenInternal(token: string): Promise<AuthenticatedUser | null> {
  try {
    // Initialize WorkOS if not already done
    const { jwks } = initializeWorkOS();

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Verify JWT using WorkOS JWKS
    const { payload } = await jwtVerify(cleanToken, jwks);

    // Extract user information from JWT claims with runtime validation
    const id = typeof payload.sub === 'string' ? payload.sub : '';
    const email = typeof payload['urn:myapp:email'] === 'string' ? payload['urn:myapp:email'] : '';

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
  } catch (error) {
    return null;
  }
}

/**
 * Validates a WorkOS JWT token and returns user information
 * This runs in Node.js runtime to access WorkOS SDK
 */
export const validateWorkOSToken = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<AuthenticatedUser | null> => {
    return await validateWorkOSTokenInternal(args.token);
  },
});

/**
 * Validates authorization header and returns authenticated user
 * This runs in Node.js runtime for WorkOS integration
 */
export const requireAuth = action({
  args: {
    authHeader: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthenticatedUser> => {
    if (!args.authHeader || !args.authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format');
    }

    // Extract token from header
    const token = args.authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new Error('Missing authorization token');
    }

    // Validate token using WorkOS
    const user = await validateWorkOSTokenInternal(token);
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    return user;
  },
});

/**
 * Optional authentication - returns null if no auth header provided
 * This runs in Node.js runtime for WorkOS integration
 */
export const optionalAuth = action({
  args: {
    authHeader: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthenticatedUser | null> => {
    if (!args.authHeader || !args.authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract token from header
    const token = args.authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return null;
    }

    // Validate token using WorkOS
    return await validateWorkOSTokenInternal(token);
  },
});
