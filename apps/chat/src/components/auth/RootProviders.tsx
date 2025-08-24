import { Component, ReactNode, ErrorInfo } from 'react';
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react';
import { ConvexProviderWithAuthKit } from '@convex-dev/workos';
import { ConvexProvider } from 'convex/react';
import { convex } from '@/lib/convex';
import { AuthProvider } from './AuthProvider';
import { getValidatedWorkOSConfig } from '@/lib/workosConfig';

const MODE = (import.meta.env.VITE_AUTH_MODE || 'dev') as 'dev' | 'workos';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    // Swallow provider init errors to keep app usable; log for diagnostics
    // TODO(telemetry): Send error and errorInfo to telemetry once implemented
    console.error('Auth provider boundary caught an error', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '1rem', color: '#b91c1c' }}>
          Authentication provider failed to initialize. Please refresh.
        </div>
      );
    }
    return this.props.children;
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
      <ErrorBoundary>
        <AuthKitProvider clientId={clientId} redirectUri={redirectUri}>
          <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
            {children}
          </ConvexProviderWithAuthKit>
        </AuthKitProvider>
      </ErrorBoundary>
    );
  }

  // Default: local dev auth using Fastify-issued tokens
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
