export default {
  providers: [
    {
      domain: 'https://api.workos.com/sso/oidc',
      applicationID: process.env.WORKOS_CLIENT_ID,
    },
  ],
};
