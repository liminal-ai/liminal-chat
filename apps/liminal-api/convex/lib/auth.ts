import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// Development-only default auth user
const DEV_AUTH_DEFAULT = process.env.DEV_AUTH_DEFAULT === 'true';

// Development user configuration - from environment variables
export const DEV_USER_CONFIG = {
  tokenIdentifier: process.env.DEV_USER_ID || '',
  email: process.env.DEV_USER_EMAIL || '',
  name: process.env.DEV_USER_NAME || '',
  subject: process.env.DEV_USER_ID || ''
};

// Validate dev user configuration
export function validateDevConfig() {
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    if (!process.env.DEV_USER_ID || !process.env.DEV_USER_EMAIL || !process.env.DEV_USER_NAME) {
      throw new Error(
        'Dev auth is enabled but required environment variables are missing. ' +
        'Please set DEV_USER_ID, DEV_USER_EMAIL, and DEV_USER_NAME in your Convex environment.'
      );
    }
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
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
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
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    return await getDevUser(ctx);
  }
  
  return await ctx.auth.getUserIdentity();
}

// Special version for actions (no database access)
export async function getAuthForAction(ctx: ActionCtx) {
  // In development with default auth enabled, return the dev user config
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    validateDevConfig();
    return DEV_USER_CONFIG;
  }
  
  return await ctx.auth.getUserIdentity();
}