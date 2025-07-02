import { env } from "./lib/env";

export default {
  providers: [
    {
      domain: env.CLERK_ISSUER_URL,
      applicationID: "convex",
    },
  ]
};