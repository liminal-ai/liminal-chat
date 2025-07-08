import { WorkOS } from '@workos-inc/node';
import { config } from 'dotenv';
import * as path from 'path';
import { findProjectRoot } from '../utils/project-root';

// Load environment variables from project root
const rootDir = findProjectRoot(__dirname);
config({ path: path.join(rootDir, '.env') });

interface SystemUserTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SystemUserConfig {
  email: string;
  password: string;
  clientId: string;
  apiKey: string;
}

/**
 * Manages authentication tokens for a system user in WorkOS.
 * Provides automatic token refresh and secure token storage for integration testing.
 */
export class SystemUserTokenManager {
  private tokens: SystemUserTokens | null = null;
  private workos: WorkOS;
  private config: SystemUserConfig;

  constructor(config: SystemUserConfig) {
    this.config = config;
    this.workos = new WorkOS(config.apiKey, {
      clientId: config.clientId,
    });
  }

  /**
   * Gets a valid access token, refreshing if necessary.
   * @returns Promise<string> Valid JWT access token
   */
  async getValidToken(): Promise<string> {
    if (!this.tokens || this.isTokenExpired()) {
      await this.refreshTokens();
    }
    return this.tokens!.accessToken;
  }

  /**
   * Gets authentication headers for API requests.
   * @returns Promise<Record<string, string>> Headers object with Authorization and Content-Type
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Forces token refresh from WorkOS.
   */
  async forceRefresh(): Promise<void> {
    await this.refreshTokens();
  }

  /**
   * Clears stored tokens.
   */
  clearTokens(): void {
    this.tokens = null;
  }

  /**
   * Gets token expiration info.
   * @returns Object with expiration details
   */
  getTokenInfo(): { hasToken: boolean; expiresAt?: number; timeUntilExpiry?: number } {
    if (!this.tokens) {
      return { hasToken: false };
    }

    const timeUntilExpiry = this.tokens.expiresAt - Date.now();
    return {
      hasToken: true,
      expiresAt: this.tokens.expiresAt,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
    };
  }

  private async refreshTokens(): Promise<void> {
    try {
      // If we have a refresh token, try to use it first
      if (this.tokens?.refreshToken) {
        try {
          const response = await this.workos.userManagement.authenticateWithRefreshToken({
            refreshToken: this.tokens.refreshToken,
            clientId: this.config.clientId,
          });

          this.updateTokens(response.accessToken, response.refreshToken);
          return;
        } catch (error) {
          console.warn('Refresh token failed, falling back to password authentication:', error);
        }
      }

      // Fall back to password authentication
      const response = await this.workos.userManagement.authenticateWithPassword({
        email: this.config.email,
        password: this.config.password,
        clientId: this.config.clientId,
      });

      this.updateTokens(response.accessToken, response.refreshToken);
    } catch (error) {
      this.tokens = null;
      throw new Error(`Failed to authenticate system user: ${String(error)}`);
    }
  }

  private updateTokens(accessToken: string, refreshToken: string): void {
    // Set expiration to 50 minutes from now (tokens typically expire in 1 hour)
    // This ensures we refresh before actual expiration
    const expiresAt = Date.now() + 50 * 60 * 1000;

    this.tokens = {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expiresAt;
  }

  /**
   * Creates a SystemUserTokenManager from environment variables.
   * @returns SystemUserTokenManager configured from environment
   */
  static fromEnv(): SystemUserTokenManager {
    const email = process.env.SYSTEM_USER_EMAIL;
    const password = process.env.SYSTEM_USER_PASSWORD;
    const clientId = process.env.WORKOS_CLIENT_ID;
    const apiKey = process.env.WORKOS_API_KEY;

    // Validate all required environment variables
    const missingVars: string[] = [];
    if (!email) missingVars.push('SYSTEM_USER_EMAIL');
    if (!password) missingVars.push('SYSTEM_USER_PASSWORD');
    if (!clientId) missingVars.push('WORKOS_CLIENT_ID');
    if (!apiKey) missingVars.push('WORKOS_API_KEY');

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
          'Please ensure all variables are set before using SystemUserTokenManager.',
      );
    }

    return new SystemUserTokenManager({
      email,
      password,
      clientId,
      apiKey,
    });
  }
}

/**
 * Global singleton instance for integration testing.
 * Use this in tests to avoid creating multiple token managers.
 */
export const systemUserTokenManager = SystemUserTokenManager.fromEnv();
