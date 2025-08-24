import { ReactNode } from 'react';
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react';
import { ConvexProviderWithAuthKit } from '@convex-dev/workos';
import { ConvexProvider } from 'convex/react';
import { convex } from '@/lib/convex';
import { AuthProvider } from './AuthProvider';

const MODE = (import.meta.env.VITE_AUTH_MODE || 'dev') as 'dev' | 'workos';

export function RootProviders({ children }: { children: ReactNode }) {
  if (MODE === 'workos') {
    const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_WORKOS_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return (
        <div style={{ padding: '1rem', color: '#b91c1c' }}>
          Missing WorkOS env vars: VITE_WORKOS_CLIENT_ID and/or VITE_WORKOS_REDIRECT_URI
        </div>
      );
    }

    return (
      <AuthKitProvider clientId={clientId} redirectUri={redirectUri}>
        <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithAuthKit>
      </AuthKitProvider>
    );
  }

  // Default: local dev auth using Fastify-issued tokens
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
