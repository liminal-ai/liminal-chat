'use node';

/**
 * # WorkOS Authentication for Liminal Chat
 *
 * This module provides comprehensive WorkOS JWT authentication for the Convex backend.
 * All authentication runs in Node.js runtime to access the WorkOS SDK.
 *
 * ## Overview
 *
 * The authentication system uses WorkOS (https://workos.com) with the following setup:
 * - **WorkOS Client**: Configured with SSO/OIDC
 * - **Authentication Provider**: WorkOS with OAuth providers configured
 * - **Integration**: Direct JWT validation using WorkOS JWKS endpoint
 * - **Runtime**: Node.js runtime required for WorkOS SDK access
 *
 * ## Environment Variables
 *
 * Set these in the Convex dashboard using `npx convex env set`:
 *
 * **Required:**
 * - `WORKOS_CLIENT_ID` - WorkOS Client ID for JWT verification
 * - `WORKOS_API_KEY` - WorkOS API Key for backend operations
 *
 * **Optional (Development Only):**
 * - `DEV_AUTH_DEFAULT=true` - Bypass auth in development (REMOVE FOR PRODUCTION)
 *
 * ## Configuration
 *
 * WorkOS is configured in `auth.config.js` with:
 * - Domain: https://api.workos.com/sso/oidc
 * - Application ID: WORKOS_CLIENT_ID environment variable
 *
 * ## Database Schema
 *
 * User information is stored in the agents table with WorkOS user IDs:
 * ```typescript
 * agents: {
 *   userId: string          // WorkOS user ID from JWT
 *   // ... other agent fields
 * }
 *
 * // Note: No dedicated users table - WorkOS manages user data
 * ```
 *
 * ## Available Functions
 *
 * ### Main Actions
 * 1. **`requireAuth`** - Validates WorkOS JWT and returns user info (throws on failure)
 * 2. **`optionalAuth`** - Optional authentication (returns null if no header)
 * 3. **`validateWorkOSToken`** - Direct token validation function
 *
 * ## Usage Examples
 *
 * ### In HTTP Actions
 * ```typescript
 * // Required authentication
 * const authHeader = request.headers.get('Authorization') || undefined;
 * const user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });
 * // user: { id: string, email: string, customClaims: {...} }
 *
 * // Optional authentication
 * const user = await ctx.runAction(api.node.auth.optionalAuth, { authHeader });
 * // user: AuthenticatedUser | null
 * ```
 *
 * ### HTTP Endpoints Using Authentication
 * - `GET /health` - Health check endpoint (requires authentication)
 * - `POST /api/chat` - Chat endpoints (require authentication)
 * - `POST /api/agents` - Agent management endpoints (require authentication)
 * - All conversation management endpoints
 *
 * ## Setup Instructions
 *
 * ### 1. Configure WorkOS Dashboard
 * 1. Create a WorkOS application at [workos.com](https://workos.com)
 * 2. Configure SSO/OIDC settings
 * 3. Set up JWT claims template with custom claims:
 *    ```json
 *    {
 *      "system_user": "{{ user.metadata.purpose == 'integration_testing' }}",
 *      "test_context": "{{ user.metadata.environment }}",
 *      "permissions": ["api_access"],
 *      "environment": "{{ user.metadata.environment }}"
 *    }
 *    ```
 * 4. Copy WorkOS Client ID and API Key
 *
 * ### 2. Configure Convex Environment
 * ```bash
 * npx convex env set WORKOS_CLIENT_ID "client_your_workos_client_id"
 * npx convex env set WORKOS_API_KEY "sk_live_your_workos_api_key"
 * ```
 *
 * ### 3. Frontend Integration
 * Implement frontend authentication flow using WorkOS SDK and pass JWT tokens
 * in Authorization headers as `Bearer <token>`.
 *
 * ## Testing Setup
 *
 * For integration testing, create a system user with test metadata:
 *
 * ### Environment Variables for Testing
 * ```bash
 * SYSTEM_USER_EMAIL=system-test@your-domain.com
 * SYSTEM_USER_PASSWORD=your_secure_password_32_chars_minimum
 * ```
 *
 * ### Create System User
 * ```bash
 * npx tsx scripts/create-system-user.ts
 * ```
 *
 * This creates a WorkOS user with system metadata for integration testing.
 * See `test-utils/system-auth.ts` for test token management utilities.
 *
 * ## Security Notes
 *
 * - All JWT validation uses WorkOS JWKS endpoint for secure verification
 * - Tokens are validated on every request (no local caching of secrets)
 * - Custom claims provide flexible authorization context
 * - Environment separation supported (dev/staging/prod)
 * - Never commit API keys to version control
 *
 * ## Troubleshooting
 *
 * ### Authentication Issues
 * - Verify WorkOS Client ID and API Key are correctly set in Convex
 * - Check that WorkOS SSO/OIDC is properly configured
 * - Ensure Authorization header format is `Bearer <token>`
 * - Verify JWT claims include required fields
 *
 * ### Environment Variables
 * ```bash
 * # Check current variables
 * npx convex env list
 *
 * # Test in any Convex function
 * console.log('Auth check:', {
 *   hasClientId: !!process.env.WORKOS_CLIENT_ID,
 *   hasApiKey: !!process.env.WORKOS_API_KEY,
 * });
 * ```
 */

import { action } from '../_generated/server';
import { v } from 'convex/values';
import { WorkOS } from '@workos-inc/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { webcrypto } from 'node:crypto';

// TypeScript interfaces for authentication
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

// Polyfill globalThis.crypto for Node.js 18
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

// Enhanced error types for better debugging
interface AuthErrorContext {
  operation: string;
  timestamp: number;
  tokenLength?: number;
  hasClientId: boolean;
  hasApiKey: boolean;
  retryCount?: number;
  originalError?: string;
}

/**
 * Retry utility with exponential backoff for transient failures
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  operation: string = 'unknown',
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on final attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Check if error is retryable
      const isRetryable = isRetryableError(error as Error);
      if (!isRetryable) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      console.warn(
        `Auth operation '${operation}' failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms:`,
        (error as Error).message,
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Determines if an error should be retried
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network-related errors that are likely transient
  const retryablePatterns = [
    'fetch failed',
    'network',
    'timeout',
    'econnreset',
    'enotfound',
    'service unavailable',
    'internal server error',
    'bad gateway',
    'gateway timeout',
  ];

  // JWT verification errors that are NOT retryable
  const nonRetryablePatterns = [
    'jws',
    'invalid signature',
    'malformed',
    'expired',
    'invalid authorization header',
    'missing authorization token',
  ];

  // Check for non-retryable patterns first
  if (nonRetryablePatterns.some((pattern) => message.includes(pattern) || name.includes(pattern))) {
    return false;
  }

  // Check for retryable patterns
  return retryablePatterns.some((pattern) => message.includes(pattern) || name.includes(pattern));
}

// Lazy initialization of WorkOS
let workosClient: WorkOS | null = null;
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function initializeWorkOS() {
  if (workosClient && jwks) {
    return { workosClient, jwks };
  }

  const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
  const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;

  // Enhanced environment variable validation with context
  const envVars = Object.keys(process.env).filter((k) => k.includes('WORKOS'));
  const hasApiKey = !!WORKOS_API_KEY;
  const hasClientId = !!WORKOS_CLIENT_ID;

  if (!WORKOS_API_KEY) {
    const context: AuthErrorContext = {
      operation: 'environment_validation',
      timestamp: Date.now(),
      hasClientId,
      hasApiKey: false,
      originalError: `WORKOS_API_KEY missing. Available WorkOS env vars: ${envVars.join(', ') || 'none'}`,
    };
    console.error('Environment validation failed:', context);
    throw new Error('WORKOS_API_KEY environment variable is required');
  }

  if (!WORKOS_CLIENT_ID) {
    const context: AuthErrorContext = {
      operation: 'environment_validation',
      timestamp: Date.now(),
      hasClientId: false,
      hasApiKey,
      originalError: `WORKOS_CLIENT_ID missing. Available WorkOS env vars: ${envVars.join(', ') || 'none'}`,
    };
    console.error('Environment validation failed:', context);
    throw new Error('WORKOS_CLIENT_ID environment variable is required');
  }

  try {
    // Initialize WorkOS client for JWKS URL
    workosClient = new WorkOS(WORKOS_API_KEY);

    // Create JWKS for WorkOS token verification with retry support
    const jwksUrl = workosClient.userManagement.getJwksUrl(WORKOS_CLIENT_ID);
    jwks = createRemoteJWKSet(new URL(jwksUrl));

    console.log('WorkOS initialized successfully', {
      jwksUrl,
      hasApiKey: true,
      hasClientId: true,
      timestamp: new Date().toISOString(),
    });

    return { workosClient, jwks };
  } catch (error) {
    const context: AuthErrorContext = {
      operation: 'workos_initialization',
      timestamp: Date.now(),
      hasClientId,
      hasApiKey,
      originalError: (error as Error).message,
    };
    console.error('WorkOS initialization failed:', context);
    throw new Error(`Failed to initialize WorkOS: ${(error as Error).message}`);
  }
}

/**
 * Internal function to validate WorkOS JWT token with retry logic
 * Handles JWT verification using WorkOS JWKS endpoint with enhanced error handling
 */
async function validateWorkOSTokenInternal(token: string): Promise<AuthenticatedUser | null> {
  const startTime = Date.now();

  try {
    // Initialize WorkOS if not already done
    const { jwks } = initializeWorkOS();

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    if (!cleanToken) {
      const context: AuthErrorContext = {
        operation: 'token_extraction',
        timestamp: Date.now(),
        tokenLength: token.length,
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        hasApiKey: !!process.env.WORKOS_API_KEY,
        originalError: 'Empty token after removing Bearer prefix',
      };
      console.error('Token extraction failed:', context);
      throw new Error('Missing authorization token');
    }

    // Verify JWT using WorkOS JWKS with retry logic
    const { payload } = await withRetry(() => jwtVerify(cleanToken, jwks), 3, 'jwt_verification');

    // Extract user information from JWT claims with runtime validation
    const id = typeof payload.sub === 'string' ? payload.sub : '';
    const email = typeof payload['urn:myapp:email'] === 'string' ? payload['urn:myapp:email'] : '';

    // Log successful authentication (but not the token details)
    console.log('WorkOS JWT validation successful', {
      userId: id,
      userEmail: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'none',
      hasSystemUser: !!payload.system_user,
      validationTime: Date.now() - startTime,
      tokenLength: cleanToken.length,
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
  } catch (error) {
    const context: AuthErrorContext = {
      operation: 'jwt_validation',
      timestamp: Date.now(),
      tokenLength: token.length,
      hasClientId: !!process.env.WORKOS_CLIENT_ID,
      hasApiKey: !!process.env.WORKOS_API_KEY,
      originalError: (error as Error).message,
    };

    // Enhanced error logging with categorization
    const isRetryable = isRetryableError(error as Error);
    const errorType = categorizeAuthError(error as Error);

    console.error('WorkOS JWT validation failed:', {
      error: (error as Error).message,
      errorType,
      isRetryable,
      context,
      validationTime: Date.now() - startTime,
    });

    return null;
  }
}

/**
 * Categorizes authentication errors for better debugging
 */
function categorizeAuthError(error: Error): string {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (name.includes('jws') || message.includes('signature')) {
    return 'INVALID_SIGNATURE';
  }
  if (message.includes('expired')) {
    return 'TOKEN_EXPIRED';
  }
  if (message.includes('malformed') || message.includes('invalid')) {
    return 'MALFORMED_TOKEN';
  }
  if (message.includes('network') || message.includes('fetch failed')) {
    return 'NETWORK_ERROR';
  }
  if (message.includes('timeout')) {
    return 'TIMEOUT_ERROR';
  }
  if (message.includes('not found') || message.includes('enotfound')) {
    return 'DNS_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Validates a WorkOS JWT token and returns user information
 * This runs in Node.js runtime to access WorkOS SDK
 *
 * @param token - JWT token string
 * @returns AuthenticatedUser | null
 */
export const validateWorkOSToken = action({
  args: {
    token: v.string(),
  },
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
  handler: async (_ctx, args): Promise<AuthenticatedUser | null> => {
    return await validateWorkOSTokenInternal(args.token);
  },
});

/**
 * Validates authorization header and returns authenticated user
 * This runs in Node.js runtime for WorkOS integration
 *
 * Throws error if authentication fails - use for protected endpoints
 *
 * @param authHeader - Authorization header (optional)
 * @returns AuthenticatedUser
 * @throws Error if authentication fails
 */
export const requireAuth = action({
  args: {
    authHeader: v.optional(v.string()),
  },
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
  handler: async (_ctx, args): Promise<AuthenticatedUser> => {
    const hasAuthHeader = !!args.authHeader;
    const startsWithBearer = args.authHeader?.startsWith('Bearer ') || false;

    // Enhanced authorization header validation with context
    if (!hasAuthHeader) {
      const context: AuthErrorContext = {
        operation: 'header_validation',
        timestamp: Date.now(),
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        hasApiKey: !!process.env.WORKOS_API_KEY,
        originalError: 'No Authorization header provided',
      };
      console.error('Auth validation failed:', context);
      throw new Error('Missing authorization header. Expected format: "Bearer <token>"');
    }

    if (!startsWithBearer) {
      const context: AuthErrorContext = {
        operation: 'header_validation',
        timestamp: Date.now(),
        tokenLength: args.authHeader?.length || 0,
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        hasApiKey: !!process.env.WORKOS_API_KEY,
        originalError: `Invalid header format: "${args.authHeader?.substring(0, 20)}...". Expected: "Bearer <token>"`,
      };
      console.error('Auth validation failed:', context);
      throw new Error('Invalid authorization header format. Expected: "Bearer <token>"');
    }

    // Extract token from header (we've already validated authHeader exists above)
    const token = args.authHeader!.replace(/^Bearer\s+/i, '');
    if (!token) {
      const context: AuthErrorContext = {
        operation: 'token_extraction',
        timestamp: Date.now(),
        tokenLength: 0,
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        hasApiKey: !!process.env.WORKOS_API_KEY,
        originalError: 'Empty token after removing Bearer prefix',
      };
      console.error('Auth validation failed:', context);
      throw new Error('Missing authorization token in Bearer header');
    }

    // Validate token using WorkOS with enhanced error handling
    const user = await validateWorkOSTokenInternal(token);
    if (!user) {
      const context: AuthErrorContext = {
        operation: 'token_validation',
        timestamp: Date.now(),
        tokenLength: token.length,
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        hasApiKey: !!process.env.WORKOS_API_KEY,
        originalError: 'Token validation returned null (invalid or expired)',
      };
      console.error('Auth validation failed:', context);
      throw new Error('Invalid or expired authorization token');
    }

    return user;
  },
});

/**
 * Optional authentication - returns null if no auth header provided
 * This runs in Node.js runtime for WorkOS integration
 *
 * Use for endpoints that work with or without authentication
 *
 * @param authHeader - Authorization header (optional)
 * @returns AuthenticatedUser | null
 */
export const optionalAuth = action({
  args: {
    authHeader: v.optional(v.string()),
  },
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
  handler: async (_ctx, args): Promise<AuthenticatedUser | null> => {
    // Return null for missing or invalid header format (no error throwing)
    if (!args.authHeader || !args.authHeader.startsWith('Bearer ')) {
      if (args.authHeader) {
        // Log invalid format for debugging, but don't throw
        console.warn('Optional auth: Invalid header format', {
          headerLength: args.authHeader.length,
          headerPrefix: args.authHeader.substring(0, 10),
          timestamp: new Date().toISOString(),
        });
      }
      return null;
    }

    // Extract token from header
    const token = args.authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      console.warn('Optional auth: Empty token after Bearer prefix removal', {
        originalHeader: args.authHeader.substring(0, 20),
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    // Validate token using WorkOS (with enhanced error handling and retry logic)
    return await validateWorkOSTokenInternal(token);
  },
});
