import { jwtVerify, createRemoteJWKSet } from 'jose';
import { WorkOS } from '@workos-inc/node';

// Initialize WorkOS client for JWKS URL
const workos = new WorkOS(process.env.WORKOS_API_KEY);

// Create JWKS for WorkOS token verification using the correct method
const jwksUrl = workos.userManagement.getJwksUrl(process.env.WORKOS_CLIENT_ID!);
const JWKS = createRemoteJWKSet(jwksUrl);

export interface WorkOSUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  profilePictureUrl?: string;
  customClaims?: Record<string, any>;
  rawClaims?: Record<string, any>;
}

/**
 * Validates a WorkOS JWT token and returns user information
 */
export async function validateWorkOSToken(token: string): Promise<WorkOSUser | null> {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Verify JWT using WorkOS JWKS (following WorkOS example pattern)
    const { payload } = await jwtVerify(cleanToken, JWKS);

    // Extract user information from JWT claims
    return {
      id: payload.sub || '',
      email: (payload['urn:myapp:email'] as string) || '',
      firstName: undefined, // Not in this JWT structure
      lastName: undefined, // Not in this JWT structure
      emailVerified: true, // Assume verified since it's from WorkOS
      profilePictureUrl: undefined,
      customClaims: {
        system_user: payload.system_user,
        test_context: payload.test_context,
        environment: payload.environment,
        permissions: payload.permissions,
        full_name: payload['urn:myapp:full_name'],
        organization_tier: payload['urn:myapp:organization_tier'],
        user_language: payload['urn:myapp:user_language'],
      },
      rawClaims: payload as Record<string, any>,
    };
  } catch (error) {
    console.error('WorkOS token validation failed:', error);
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Middleware function to validate WorkOS authentication
 */
export async function requireWorkOSAuth(authHeader?: string): Promise<WorkOSUser> {
  const token = extractBearerToken(authHeader);

  if (!token) {
    throw new Error('Missing authorization token');
  }

  const user = await validateWorkOSToken(token);

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}
