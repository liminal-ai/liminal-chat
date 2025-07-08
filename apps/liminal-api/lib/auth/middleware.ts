// Authentication middleware for WorkOS JWT validation
import { validateWorkOSToken, extractBearerToken } from './workos-auth';
import { AuthenticatedUser } from '@liminal/shared-types';

/**
 * Secure JWT authentication middleware for WorkOS tokens
 * Uses proper signature verification via WorkOS JWKS
 */
export async function requireAuth(authHeader: string | undefined): Promise<AuthenticatedUser> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format');
  }

  const token = extractBearerToken(authHeader);
  if (!token) {
    throw new Error('Missing authorization token');
  }

  const user = await validateWorkOSToken(token);
  if (!user) {
    throw new Error('Invalid or expired token');
  }

  return {
    id: user.id,
    email: user.email,
    customClaims: {
      system_user: user.customClaims?.system_user,
      test_context: user.customClaims?.test_context,
      environment: user.customClaims?.environment,
      permissions: user.customClaims?.permissions,
    },
  };
}

/**
 * Authentication middleware for Convex HTTP actions (streaming endpoints)
 */
export async function requireAuthForRequest(request: Request): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('Authorization');
  return await requireAuth(authHeader || undefined);
}
