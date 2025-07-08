import { SystemUserTokenManager } from '../auth/system-user-token-manager';
import { jwtDecode } from 'jwt-decode';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from project root
const rootDir = path.resolve(__dirname, '../../../../../');
config({ path: path.join(rootDir, '.env') });

interface SystemTokenClaims {
  sub: string;
  email: string;
  system_user?: string; // Now contains "integration_testing" instead of boolean
  test_context?: string;
  permissions?: string[];
  environment?: string;
  metadata?: Record<string, any>;
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Helper class for system user authentication in tests.
 * Provides methods to get tokens, headers, and validate system user claims.
 */
export class SystemAuthHelper {
  private tokenManager: SystemUserTokenManager;

  constructor(tokenManager?: SystemUserTokenManager) {
    // Use provided token manager or create from environment
    this.tokenManager = tokenManager || SystemUserTokenManager.fromEnv();
  }

  /**
   * Gets authentication headers for API requests.
   * @returns Promise<Record<string, string>> Headers with Bearer token
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    return this.tokenManager.getAuthHeaders();
  }

  /**
   * Gets a valid JWT access token.
   * @returns Promise<string> JWT access token
   */
  async getAccessToken(): Promise<string> {
    return this.tokenManager.getValidToken();
  }

  /**
   * Decodes and validates the system user JWT token.
   * @returns Promise<SystemTokenClaims> Decoded token claims
   */
  async getTokenClaims(): Promise<SystemTokenClaims> {
    const token = await this.getAccessToken();
    const claims = jwtDecode<SystemTokenClaims>(token);

    // Validate this is actually a system user token
    if (claims.system_user !== 'integration_testing') {
      console.warn(
        '⚠️  Token does not have system_user claim set to "integration_testing". JWT template may not be configured.',
      );
    }

    return claims;
  }

  /**
   * Validates that the token has system user claims.
   * @returns Promise<boolean> True if token has system_user claim
   */
  async isSystemUserToken(): Promise<boolean> {
    try {
      const claims = await this.getTokenClaims();
      return claims.system_user === 'integration_testing';
    } catch (error) {
      console.error('Failed to validate system user token:', error);
      return false;
    }
  }

  /**
   * Forces token refresh.
   */
  async refreshToken(): Promise<void> {
    await this.tokenManager.forceRefresh();
  }

  /**
   * Gets token expiration info.
   */
  getTokenInfo(): { hasToken: boolean; expiresAt?: number; timeUntilExpiry?: number } {
    return this.tokenManager.getTokenInfo();
  }

  /**
   * Creates a fetch options object with authentication headers.
   * @param options Optional fetch options to merge
   * @returns Promise<RequestInit> Fetch options with auth headers
   */
  async createFetchOptions(options: RequestInit = {}): Promise<RequestInit> {
    const authHeaders = await this.getAuthHeaders();

    return {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };
  }

  /**
   * Makes an authenticated API request.
   * @param url Request URL
   * @param options Fetch options
   * @returns Promise<Response> Fetch response
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const fetchOptions = await this.createFetchOptions(options);
    return fetch(url, fetchOptions);
  }

  /**
   * Helper for common GET requests.
   * @param url Request URL
   * @returns Promise<Response> Fetch response
   */
  async get(url: string): Promise<Response> {
    return this.authenticatedFetch(url, { method: 'GET' });
  }

  /**
   * Helper for common POST requests.
   * @param url Request URL
   * @param body Request body
   * @returns Promise<Response> Fetch response
   */
  async post(url: string, body?: any): Promise<Response> {
    return this.authenticatedFetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Helper for common PUT requests.
   * @param url Request URL
   * @param body Request body
   * @returns Promise<Response> Fetch response
   */
  async put(url: string, body?: any): Promise<Response> {
    return this.authenticatedFetch(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Helper for common DELETE requests.
   * @param url Request URL
   * @returns Promise<Response> Fetch response
   */
  async delete(url: string): Promise<Response> {
    return this.authenticatedFetch(url, { method: 'DELETE' });
  }

  /**
   * Creates a SystemAuthHelper for testing.
   * Validates environment and provides helpful error messages.
   */
  static async createForTesting(): Promise<SystemAuthHelper> {
    try {
      const helper = new SystemAuthHelper();

      // Test that we can get a token
      await helper.getAccessToken();

      // Validate it's a system user token
      const isSystemUser = await helper.isSystemUserToken();
      if (!isSystemUser) {
        console.warn('⚠️  JWT template may not be configured for system user claims');
      }

      return helper;
    } catch (error) {
      throw new Error(
        `Failed to create SystemAuthHelper: ${String(error)}\\n\\n` +
          'Make sure you have:\\n' +
          '1. Created a system user (run: npx tsx scripts/create-system-user.ts)\\n' +
          '2. Set environment variables: SYSTEM_USER_EMAIL, SYSTEM_USER_PASSWORD\\n' +
          '3. Configured JWT template in WorkOS dashboard\\n',
      );
    }
  }
}

/**
 * Global singleton instance for tests.
 * Use this in test setup to avoid creating multiple instances.
 */
let globalSystemAuthHelper: SystemAuthHelper | null = null;

/**
 * Gets or creates the global SystemAuthHelper instance.
 * @returns Promise<SystemAuthHelper> Global auth helper
 */
export async function getSystemAuthHelper(): Promise<SystemAuthHelper> {
  if (!globalSystemAuthHelper) {
    globalSystemAuthHelper = await SystemAuthHelper.createForTesting();
  }
  return globalSystemAuthHelper;
}
