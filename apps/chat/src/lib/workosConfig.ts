export function getValidatedWorkOSConfig(): { clientId: string; redirectUri: string } {
  const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_WORKOS_REDIRECT_URI as string | undefined;

  if (!clientId || !redirectUri) {
    // Helpful console log for diagnostics in staging
    // Note: we still render a visible banner in RootProviders when missing
    // This log adds observability without crashing the app.
    console.error('WorkOS configuration error', {
      hasClientId: Boolean(clientId),
      hasRedirectUri: Boolean(redirectUri),
    });
    throw new Error('Missing WorkOS envs');
  }

  return { clientId, redirectUri };
}
