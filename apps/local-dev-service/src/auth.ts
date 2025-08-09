import { WorkOS } from '@workos-inc/node';
import { jwtDecode } from 'jwt-decode';

interface TokenResponse {
  token: string;
  expiresAt: number;
  email: string;
}

interface TokenClaims {
  sub: string;
  email: string;
  exp: number;
  [key: string]: any;
}

class DevAuthService {
  private workos: WorkOS;
  private email: string;
  private password: string;
  private clientId: string;
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    // Validate environment variables
    const email = process.env.SYSTEM_USER_EMAIL;
    const password = process.env.SYSTEM_USER_PASSWORD;
    const clientId = process.env.WORKOS_CLIENT_ID;
    const apiKey = process.env.WORKOS_API_KEY;

    if (!email || !password || !clientId || !apiKey) {
      throw new Error(
        'Missing required environment variables: SYSTEM_USER_EMAIL, SYSTEM_USER_PASSWORD, WORKOS_CLIENT_ID, WORKOS_API_KEY',
      );
    }

    this.email = email;
    this.password = password;
    this.clientId = clientId;
    this.workos = new WorkOS(apiKey, { clientId });
  }

  async getDevToken(): Promise<TokenResponse> {
    // Check if we have a valid cached token
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      const claims = jwtDecode<TokenClaims>(this.cachedToken.token);
      return {
        token: this.cachedToken.token,
        expiresAt: this.cachedToken.expiresAt,
        email: claims.email,
      };
    }

    try {
      // Authenticate with WorkOS using password
      const response = await this.workos.userManagement.authenticateWithPassword({
        email: this.email,
        password: this.password,
        clientId: this.clientId,
      });

      // Derive cache expiry from JWT exp with a safety buffer (5 minutes)
      const claims = jwtDecode<TokenClaims>(response.accessToken);
      const jwtExpiresAtMs = (claims.exp || 0) * 1000;
      const safetyBufferMs = 5 * 60 * 1000; // 5 minutes
      const expiresAt = Math.max(0, jwtExpiresAtMs - safetyBufferMs);

      this.cachedToken = {
        token: response.accessToken,
        expiresAt,
      };

      return {
        token: response.accessToken,
        expiresAt,
        email: claims.email,
      };
    } catch (error) {
      console.error('Failed to authenticate with WorkOS:', error);
      throw new Error('Authentication failed');
    }
  }
}

let devAuthService: DevAuthService | null = null;

export function getDevAuthService(): DevAuthService {
  if (!devAuthService) {
    devAuthService = new DevAuthService();
  }
  return devAuthService;
}
