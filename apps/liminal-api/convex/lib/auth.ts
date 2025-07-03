import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { env } from "./env";

// Development-only default auth user
const DEV_AUTH_DEFAULT = env.isDevAuthEnabled;

// Development user configuration - lazy evaluation to prevent module loading failure
export function getDEV_USER_CONFIG() {
  if (!DEV_AUTH_DEFAULT) {
    return {
      tokenIdentifier: '',
      email: '',
      name: '',
      subject: ''
    };
  }
  
  return {
    tokenIdentifier: env.DEV_USER_ID,
    email: env.DEV_USER_EMAIL,
    name: env.DEV_USER_NAME,
    subject: env.DEV_USER_ID
  };
}

// Validate dev user configuration
export function validateDevConfig() {
  if (DEV_AUTH_DEFAULT) {
    // The env module will throw with helpful errors if vars are missing
    getDEV_USER_CONFIG();
  }
}

async function getDevUser(ctx: QueryCtx | MutationCtx) {
  validateDevConfig();
  const devUserConfig = getDEV_USER_CONFIG();
  
  // Check if dev user exists in database
  const _existingUser = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", devUserConfig.tokenIdentifier))
    .first();

  // If user doesn't exist, still return the config
  // The user should be created using the initializeDevUser mutation
  return devUserConfig;
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
    validateDevConfig();
    return getDEV_USER_CONFIG();
  }
  
  return await ctx.auth.getUserIdentity();
}