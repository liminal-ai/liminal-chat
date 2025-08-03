import { test, expect } from '../utils/auth-fixture';
import { LocalDevAuth } from '../utils/local-dev-auth';

test.describe('Local Dev Service Authentication', () => {
  test('can obtain valid JWT token from local dev service', async () => {
    const auth = new LocalDevAuth();
    const token = await auth.getValidToken();

    expect(token).toBeTruthy();
    expect(token.split('.')).toHaveLength(3); // JWT format
  });

  test('authenticated request fixture works with local dev service', async ({
    authenticatedRequest,
  }) => {
    const response = await authenticatedRequest.get('/health');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('token includes expected claims', async () => {
    const auth = new LocalDevAuth();
    const claims = await auth.getTokenClaims();

    // WorkOS uses namespaced email claim
    expect(claims['urn:myapp:email'] || claims.email).toBeTruthy();
    expect(claims.sub).toBeTruthy();
    expect(claims.exp).toBeGreaterThan(Date.now() / 1000);
  });

  test('handles local dev service not running gracefully', async () => {
    const auth = new LocalDevAuth('http://127.0.0.1:9999'); // Wrong port

    await expect(auth.getValidToken()).rejects.toThrow(
      'Local dev service not running at http://127.0.0.1:9999',
    );
  });
});
