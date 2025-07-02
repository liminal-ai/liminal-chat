import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// Development-only default auth user
const DEV_AUTH_DEFAULT = process.env.DEV_AUTH_DEFAULT === 'true';

// Development user configuration - matches your Clerk dev user
const DEV_USER_CONFIG = {
  tokenIdentifier: 'user_2zINPyhtT9Wem9OeVW4eZDs21KI',
  email: 'dev@liminal.chat', // Using a more appropriate dev email
  name: 'Dev User',
  subject: 'user_2zINPyhtT9Wem9OeVW4eZDs21KI'
};

async function getDevUser(ctx: QueryCtx | MutationCtx) {
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
    return DEV_USER_CONFIG;
  }
  
  return await ctx.auth.getUserIdentity();
}