import { useEffect, useState, useCallback, useRef } from 'react';
import { LocalDevAuth } from './local-dev-auth';
import { jwtDecode } from 'jwt-decode';

// Singleton local dev auth client
const devAuth = new LocalDevAuth();

interface TokenClaims {
  sub: string;
  email?: string;
  'urn:myapp:email'?: string;
  exp?: number;
  [k: string]: unknown;
}

export interface DevConvexAuthHook {
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: ({
    forceRefreshToken,
  }: {
    forceRefreshToken?: boolean;
  }) => Promise<string | null>;
  token: string | null;
  user: { id: string; email: string } | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  attempts: number;
}

export function useDevConvexAuth(): DevConvexAuthHook {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const attemptRef = useRef(0);

  const decodeUser = useCallback((t: string) => {
    try {
      const claims = jwtDecode<TokenClaims>(t);
      const email = claims['urn:myapp:email'] || claims.email || '';
      return { id: claims.sub, email };
    } catch (e) {
      return null;
    }
  }, []);

  const getExpiryInfo = useCallback((t: string | null) => {
    if (!t)
      return { exp: undefined as number | undefined, msRemaining: undefined as number | undefined };
    try {
      const claims = jwtDecode<TokenClaims>(t);
      if (!claims.exp) return { exp: undefined, msRemaining: undefined };
      const expMs = claims.exp * 1000;
      return { exp: claims.exp, msRemaining: expMs - Date.now() };
    } catch {
      return { exp: undefined, msRemaining: undefined };
    }
  }, []);

  const performLogin = useCallback(async () => {
    attemptRef.current += 1;
    setIsLoading(true);
    setError(null);
    try {
      const t = await devAuth.getValidToken();
      setToken(t);
      setUser(decodeUser(t));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [decodeUser]);

  // Initial login once
  useEffect(() => {
    if (!token && !refreshing) {
      void performLogin();
    }
  }, [token, refreshing, performLogin]);

  const refreshToken = useCallback(async () => {
    setRefreshing(true);
    try {
      devAuth.clearCache();
      const t = await devAuth.getValidToken();
      setToken(t);
      setUser(decodeUser(t));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }, [decodeUser]);

  const logout = useCallback(() => {
    devAuth.clearCache();
    setToken(null);
    setUser(null);
  }, []);

  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken: _forceRefreshToken }: { forceRefreshToken?: boolean } = {}) => {
      if (!tokenRef.current) {
        await performLogin();
        return tokenRef.current;
      }
      return tokenRef.current;
    },
    [performLogin],
  );

  const derivedIsLoading = isLoading || (!token && !error);
  if (typeof window !== 'undefined') {
    const _expInfo = getExpiryInfo(token);
  }

  return {
    isLoading: derivedIsLoading,
    isAuthenticated: !!token,
    fetchAccessToken,
    token,
    user,
    error,
    login: performLogin,
    logout,
    refreshToken,
    attempts: attemptRef.current,
  };
}
