// Authentication middleware for WorkOS JWT validation
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

/**
 * Simple JWT authentication middleware for WorkOS tokens
 * Uses basic JWT decoding without signature verification for integration testing
 */
export function requireAuth(authHeader: string | undefined): AuthenticatedUser {
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  // Extract token
  const token = authHeader.replace(/^Bearer\s+/i, '');

  // Simple JWT decode
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  try {
    // Decode base64 payload (Edge runtime compatible)
    const payload = JSON.parse(atob(parts[1]));

    return {
      id: payload.sub || '',
      email: payload['urn:myapp:email'] || '',
      customClaims: {
        system_user: payload.system_user,
        test_context: payload.test_context,
        environment: payload.environment,
        permissions: payload.permissions,
      },
    };
  } catch (error) {
    throw new Error('Invalid token payload');
  }
}

/**
 * Authentication middleware for Convex HTTP actions (streaming endpoints)
 */
export function requireAuthForRequest(request: Request): AuthenticatedUser {
  const authHeader = request.headers.get('Authorization');
  return requireAuth(authHeader || undefined);
}
