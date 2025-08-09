import { useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext, AuthState, AuthActions, createAuthManager } from '../../lib/auth';
import { convex } from '../../lib/convex';

interface AuthProviderProps {
  children: ReactNode;
}

interface TokenClaims {
  sub: string;
  email?: string;
  'urn:myapp:email'?: string;
  exp: number;
  [key: string]: unknown;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    error: null,
    authMode: 'production',
  });

  const { authMode, devAuth } = createAuthManager();

  // Set auth mode on component mount
  useEffect(() => {
    setState((prev) => ({ ...prev, authMode }));
  }, [authMode]);

  const extractUserFromToken = useCallback((token: string) => {
    try {
      const claims = jwtDecode<TokenClaims>(token);
      const email = claims['urn:myapp:email'] || claims.email || '';

      return {
        id: claims.sub,
        email,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }, []);

  const login = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (authMode === 'dev' && devAuth) {
        // Dev mode: get token from local service
        const token = await devAuth.getValidToken();
        const user = extractUserFromToken(token);

        if (!user) {
          throw new Error('Invalid token received from dev service');
        }

        // Wire Convex auth to always fetch a fresh valid token (LocalDevAuth caches until exp-5m)
        convex.setAuth(async () => {
          return await devAuth.getValidToken();
        });

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          user,
          token,
          error: null,
        }));
      } else {
        // Production mode: would use WorkOS OAuth flow
        throw new Error('Production auth not implemented yet');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: errorMessage,
      }));
    }
  }, [authMode, devAuth, extractUserFromToken]);

  const logout = useCallback(() => {
    if (devAuth) {
      devAuth.clearCache();
    }

    // Clear Convex auth so future requests are anonymous
    convex.setAuth(async () => null as unknown as string);

    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,
    }));
  }, [devAuth]);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (authMode === 'dev' && devAuth) {
      return await devAuth.getAuthHeaders();
    }

    if (state.token) {
      return { Authorization: `Bearer ${state.token}` };
    }

    return {};
  }, [authMode, devAuth, state.token]);

  const refreshToken = useCallback(async () => {
    if (authMode === 'dev' && devAuth) {
      devAuth.clearCache();
      await login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMode, devAuth]); // Intentionally omitting login to avoid circular dependency

  // Auto-login in dev mode on mount
  useEffect(() => {
    if (authMode === 'dev' && state.isLoading) {
      login().catch((error) => {
        console.error('Auto-login failed:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      });
    } else if (authMode === 'production') {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMode, state.isLoading]); // Intentionally omitting login to avoid circular dependency

  const contextValue: AuthState & AuthActions = {
    ...state,
    login,
    logout,
    getAuthHeaders,
    refreshToken,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
