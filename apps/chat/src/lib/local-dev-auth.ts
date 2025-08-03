interface LocalDevTokenResponse {
  token: string;
  expiresAt: number;
  email: string;
}

/**
 * Authentication client for local development.
 * Retrieves JWT tokens from the local Fastify auth service.
 */
export class LocalDevAuth {
  private baseUrl: string;
  private cachedToken: LocalDevTokenResponse | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_LOCAL_DEV_SERVICE_URL || 'http://127.0.0.1:8081';
  }

  /**
   * Gets a valid access token from the local dev service.
   * Uses cached token if still valid.
   */
  async getValidToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
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
    };
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
}
