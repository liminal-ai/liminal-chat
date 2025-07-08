// Validate required environment variables
if (!process.env.WORKOS_CLIENT_ID) {
  throw new Error('WORKOS_CLIENT_ID environment variable is required for auth configuration');
}

export default {
  providers: [
    {
      domain: 'https://api.workos.com/sso/oidc',
      applicationID: process.env.WORKOS_CLIENT_ID,
    },
  ],
};
