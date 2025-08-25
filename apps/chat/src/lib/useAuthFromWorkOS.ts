import { useCallback, useMemo } from 'react';
import { useAuth } from '@workos-inc/authkit-react';

/**
 * Custom hook that bridges WorkOS AuthKit with Convex authentication.
 * Provides the interface expected by ConvexProviderWithAuth.
 *
 * @returns Auth state and token fetching function compatible with Convex
 */
export function useAuthFromWorkOS() {
  const { isLoading, user, getAccessToken } = useAuth();

  const isAuthenticated = !!user;

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}) => {
      if (!user) {
        return null;
      }

      try {
        // getAccessToken from WorkOS AuthKit returns the JWT
        const token = await getAccessToken({
          // Force refresh if requested
          forceRefresh: forceRefreshToken,
        });
        return token;
      } catch (error) {
        console.error('Failed to fetch WorkOS access token:', error);
        return null;
      }
    },
    [user, getAccessToken],
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken],
  );
}
