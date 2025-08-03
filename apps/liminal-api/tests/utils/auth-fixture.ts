import { test as base, APIRequestContext } from '@playwright/test';
import { LocalDevAuth } from './local-dev-auth';

// Cache auth instance per worker process to avoid repeated initialization
let cachedAuth: LocalDevAuth | null = null;

async function getOrCreateAuth(): Promise<LocalDevAuth> {
  // Initialize auth instance if not exists
  if (!cachedAuth) {
    console.log('🔄 Initializing local dev service authentication...');
    cachedAuth = await LocalDevAuth.createForTesting();

    const tokenInfo = cachedAuth.getTokenInfo();
    if (tokenInfo.expiresAt) {
      console.log(
        '✅ Auth initialized via local dev service, token cached until:',
        new Date(tokenInfo.expiresAt).toISOString(),
      );
    }
  }

  return cachedAuth;
}

// Create authenticated request fixture
export const test = base.extend<{
  authenticatedRequest: APIRequestContext;
}>({
  authenticatedRequest: async ({ request }, use) => {
    const auth = await getOrCreateAuth();

    // Create proxy that adds auth header to all requests
    const authenticatedRequest = new Proxy(request, {
      get(target, prop) {
        const original = target[prop as keyof APIRequestContext];

        if (
          typeof original === 'function' &&
          ['get', 'post', 'put', 'patch', 'delete', 'head'].includes(prop as string)
        ) {
          return async function (url: string, options: any = {}) {
            // Get fresh auth headers (handles token refresh automatically)
            const authHeaders = await auth.getAuthHeaders();

            const headers: Record<string, string> = {
              ...options.headers,
              ...authHeaders,
            };

            return (original as any).call(target, url, {
              ...options,
              headers,
            });
          };
        }

        return original;
      },
    });

    await use(authenticatedRequest as APIRequestContext);
  },
});

export { expect } from '@playwright/test';
