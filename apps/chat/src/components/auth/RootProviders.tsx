import { Component, ReactNode, ErrorInfo, useRef, useEffect } from 'react';
import { AuthKitProvider } from '@workos-inc/authkit-react';
import { ConvexProviderWithAuth, ConvexProvider } from 'convex/react';
import { convex } from '@/lib/convex';
import { useDevConvexAuth } from '@/lib/useDevConvexAuth';
import { useAuthFromWorkOS } from '@/lib/useAuthFromWorkOS';
import { AuthContext } from '@/lib/auth';
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
  return (
    <ErrorBoundary>
      {MODE === 'workos' ? (
        <WorkOSProviders>{children}</WorkOSProviders>
      ) : (
        <DevAuthShim>{children}</DevAuthShim>
      )}
    </ErrorBoundary>
  );
}

function WorkOSProviders({ children }: { children: ReactNode }) {
  let cfg: { clientId: string; redirectUri: string } | null = null;
  try {
    cfg = getValidatedWorkOSConfig();
  } catch {
    /* render fallback below */
  }
  if (!cfg) {
    return (
      <div style={{ padding: '1rem', color: '#b91c1c' }}>
        Missing WorkOS env vars (VITE_WORKOS_CLIENT_ID / VITE_WORKOS_REDIRECT_URI)
      </div>
    );
  }

  return (
    <AuthKitProvider clientId={cfg.clientId} redirectUri={cfg.redirectUri}>
      <WorkOSConvexProvider>{children}</WorkOSConvexProvider>
    </AuthKitProvider>
  );
}

function WorkOSConvexProvider({ children }: { children: ReactNode }) {
  // Wrap the WorkOS auth state in a ref so we can hand Convex a *stable* hook
  // identity. Convex resets auth state whenever the function identity changes.
  const latestAuth = useAuthFromWorkOS();
  const authRef = useRef(latestAuth);
  authRef.current = latestAuth; // keep snapshot fresh

  const useStableAuth = () => authRef.current;

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useStableAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
function DevAuthShim({ children }: { children: ReactNode }) {
  const dev = useDevConvexAuth();

  // Build auth context value expected by existing components
  const authContextValue = {
    isAuthenticated: !!dev.token,
    isLoading: dev.isLoading,
    user: dev.user,
    token: dev.token,
    error: dev.error,
    authMode: 'dev' as const,
    login: dev.login,
    logout: dev.logout,
    refreshToken: dev.refreshToken,
    getAuthHeaders: async (): Promise<Record<string, string>> => {
      if (dev.token) return { Authorization: `Bearer ${dev.token}` };
      return {};
    },
  };
  // --- Convex docs note: if the useAuth prop function identity changes, Convex resets to loading.
  // We keep a stable function identity and feed it the latest state via refs so Convex doesn't churn.
  const authStateRef = useRef({
    isLoading: dev.isLoading,
    isAuthenticated: !!dev.token,
    fetchAccessToken: async (_opts?: { forceRefreshToken?: boolean }) => dev.token ?? null,
  });
  // Update ref each render with latest snapshot (no new function identity passed to Convex).
  useEffect(() => {
    authStateRef.current = {
      isLoading: dev.isLoading,
      isAuthenticated: !!dev.token,
      fetchAccessToken: async (_opts?: { forceRefreshToken?: boolean }) => {
        return dev.token ?? null;
      },
    };
  }, [dev.isLoading, dev.token]);

  const _useDevAuth = () => authStateRef.current;

  // Manual auth path: set token directly on convex client
  useEffect(() => {
    if (dev.token) {
      convex.setAuth(async () => dev.token as string);
    } else {
      convex.clearAuth();
    }
  }, [dev.token]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </AuthContext.Provider>
  );
}
