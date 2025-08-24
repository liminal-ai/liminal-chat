import { ReactNode } from 'react';
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react';
import { ConvexProviderWithAuthKit } from '@convex-dev/workos';
import { ConvexProvider } from 'convex/react';
import { convex } from '@/lib/convex';
import { AuthProvider } from './AuthProvider';
import { getValidatedWorkOSConfig } from '@/lib/workosConfig';

const MODE = (import.meta.env.VITE_AUTH_MODE || 'dev') as 'dev' | 'workos';

function SimpleErrorBoundary({ children }: { children: ReactNode }) {
  try {
    return <>{children}</>;
  } catch (err) {
    // Render minimal fallback; avoid crashing app
    return (
      <div style={{ padding: '1rem', color: '#b91c1c' }}>
        Authentication provider failed to initialize. Please refresh.
      </div>
    );
  }
}

export function RootProviders({ children }: { children: ReactNode }) {
  if (MODE === 'workos') {
    let clientId = '';
    let redirectUri = '';
    try {
      const cfg = getValidatedWorkOSConfig();
      clientId = cfg.clientId;
      redirectUri = cfg.redirectUri;
    } catch {
      return (
        <div style={{ padding: '1rem', color: '#b91c1c' }}>
          Missing WorkOS env vars: VITE_WORKOS_CLIENT_ID and/or VITE_WORKOS_REDIRECT_URI
        </div>
      );
    }

    return (
      <SimpleErrorBoundary>
        <AuthKitProvider clientId={clientId} redirectUri={redirectUri}>
          <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
            {children}
          </ConvexProviderWithAuthKit>
        </AuthKitProvider>
      </SimpleErrorBoundary>
    );
  }

  // Default: local dev auth using Fastify-issued tokens
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
