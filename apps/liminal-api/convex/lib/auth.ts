import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { env } from "./env";

// Development-only default auth user
const DEV_AUTH_DEFAULT = env.isDevAuthEnabled;

// Development user configuration - from environment variables
export const DEV_USER_CONFIG = {
  tokenIdentifier: DEV_AUTH_DEFAULT ? env.DEV_USER_ID : '',
  email: DEV_AUTH_DEFAULT ? env.DEV_USER_EMAIL : '',
  name: DEV_AUTH_DEFAULT ? env.DEV_USER_NAME : '',
  subject: DEV_AUTH_DEFAULT ? env.DEV_USER_ID : ''
};

// Validate dev user configuration
export function validateDevConfig() {
  if (DEV_AUTH_DEFAULT) {
    // The env module will throw with helpful errors if vars are missing
    const _id = env.DEV_USER_ID;
    const _email = env.DEV_USER_EMAIL;
    const _name = env.DEV_USER_NAME;
  }
}

async function getDevUser(ctx: QueryCtx | MutationCtx) {
  validateDevConfig();
  // Check if dev user exists in database
  const _existingUser = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", DEV_USER_CONFIG.tokenIdentifier))
    .first();

  // If user doesn't exist, still return the config
  // The user should be created using the initializeDevUser mutation
  return DEV_USER_CONFIG;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  // In development with bypass enabled, return the dev user
  if (DEV_AUTH_DEFAULT) {
    return await getDevUser(ctx);
  }
  
  // Normal auth flow
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
}

export async function getAuth(ctx: QueryCtx | MutationCtx) {
  // In development with default auth enabled, return the dev user
  if (DEV_AUTH_DEFAULT) {
    return await getDevUser(ctx);
  }
  
  return await ctx.auth.getUserIdentity();
}

// Special version for actions (no database access)
export async function getAuthForAction(ctx: ActionCtx) {
  // In development with default auth enabled, return the dev user config
  if (DEV_AUTH_DEFAULT) {
    return DEV_USER_CONFIG;
  }
  
  return await ctx.auth.getUserIdentity();
}