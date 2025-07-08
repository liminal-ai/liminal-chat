/**
 * Authentication types shared across the liminal-chat application
 */

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