import { createContext, useContext, useCallback } from 'react';
import { LocalDevAuth } from './local-dev-auth';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { email: string; id: string } | null;
  token: string | null;
  error: string | null;
  authMode: 'dev' | 'production';
}

export interface AuthActions {
  login: () => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Promise<Record<string, string>>;
  refreshToken: () => Promise<void>;
}

export type AuthContextType = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to get auth headers for Convex functions.
 * Automatically handles token refresh in dev mode.
 */
export function useAuthHeaders() {
  const { getAuthHeaders, isAuthenticated } = useAuth();

  return useCallback(async () => {
    if (!isAuthenticated) {
      return {};
    }

    try {
      return await getAuthHeaders();
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      return {};
    }
  }, [getAuthHeaders, isAuthenticated]);
}

/**
 * Creates auth state manager based on environment.
 */
export function createAuthManager(): {
  authMode: 'dev' | 'production';
  devAuth?: LocalDevAuth;
} {
  const authMode = (import.meta.env.VITE_AUTH_MODE || 'production') as 'dev' | 'production';
  // Singleton to avoid multiple instances & cache duplication
  // (module scope variable retained across re-renders / hooks usage)
  if (!(globalThis as Record<string, unknown>).__DEV_LOCAL_AUTH_INSTANCE) {
    // Only create when needed
    if (authMode === 'dev') {
      (globalThis as Record<string, unknown>).__DEV_LOCAL_AUTH_INSTANCE = new LocalDevAuth();
    }
  }
  const devAuth: LocalDevAuth | undefined = (globalThis as Record<string, unknown>)
    .__DEV_LOCAL_AUTH_INSTANCE as LocalDevAuth;
  if (authMode === 'dev') {
    return { authMode, devAuth };
  }
  return { authMode };
}
