import { jwtDecode } from 'jwt-decode';

interface LocalDevTokenResponse {
  token: string;
  expiresAt: number;
  email: string;
}

interface TokenClaims {
  sub: string;
  email: string;
  system_user?: string;
  test_context?: string;
  permissions?: string[];
  environment?: string;
  metadata?: Record<string, any>;
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Authentication client for local development service.
 * Retrieves JWT tokens from the local Fastify auth endpoint.
 */
export class LocalDevAuth {
  private baseUrl: string;
  private cachedToken: LocalDevTokenResponse | null = null;

  constructor(baseUrl: string = 'http://127.0.0.1:8081') {
    this.baseUrl = baseUrl;
  }

  /**
   * Gets a valid access token from the local dev service.
   * Uses cached token if still valid.
   */
  async getValidToken(): Promise<string> {
    if (this.cachedToken) {
      const now = Date.now();
      const refreshBufferMs = 5 * 60 * 1000; // 5 minutes
      if (now < this.cachedToken.expiresAt - refreshBufferMs) {
        return this.cachedToken.token;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to get token: ${error.error || response.statusText}`);
      }

      const data: LocalDevTokenResponse = await response.json();
      this.cachedToken = data;
      return data.token;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        throw new Error(
          `Local dev service not running at ${this.baseUrl}. ` +
            'Please run: npm run dev:start in apps/local-dev-service',
        );
      }
      throw error;
    }
  }

  /**
   * Gets authentication headers for API requests.
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Decodes and returns token claims.
   */
  async getTokenClaims(): Promise<TokenClaims> {
    const token = await this.getValidToken();
    return jwtDecode<TokenClaims>(token);
  }

  /**
   * Validates that the token has system user claims.
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
   * Forces token refresh by clearing cache.
   */
  clearCache(): void {
    this.cachedToken = null;
  }

  /**
   * Gets token expiration info.
   */
  getTokenInfo(): { hasToken: boolean; expiresAt?: number; timeUntilExpiry?: number } {
    if (!this.cachedToken) {
      return { hasToken: false };
    }

    const timeUntilExpiry = this.cachedToken.expiresAt - Date.now();
    return {
      hasToken: true,
      expiresAt: this.cachedToken.expiresAt,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
    };
  }

  /**
   * Creates and validates a LocalDevAuth instance for testing.
   */
  static async createForTesting(): Promise<LocalDevAuth> {
    const auth = new LocalDevAuth();

    try {
      // Test that we can get a token
      await auth.getValidToken();

      // Validate it's a system user token
      const isSystemUser = await auth.isSystemUserToken();
      if (!isSystemUser) {
        console.warn('⚠️  JWT template may not be configured for system user claims');
      }

      return auth;
    } catch (error) {
      throw new Error(
        `Failed to create LocalDevAuth: ${String(error)}\n\n` +
          'Make sure you have:\n' +
          '1. Started local-dev-service: cd apps/local-dev-service && npm run dev:start\n' +
          '2. Configured .env file in apps/local-dev-service with WorkOS credentials\n',
      );
    }
  }
}
