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

/**
 * Returns the predefined development user configuration, regardless of whether the user exists in the database.
 *
 * Intended for use in development environments. The actual user record should be created separately if not present.
 * 
 * @returns The static development user configuration object
 */
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

/**
 * Ensures that a user is authenticated, returning their identity or throwing an error if not.
 *
 * In development mode with default authentication enabled and not in production, returns a predefined development user. Otherwise, retrieves the authenticated user's identity from the context. Throws an error if no authenticated user is found.
 *
 * @returns The authenticated user's identity.
 * @throws Error if authentication is required but not present.
 */
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

/**
 * Retrieves the authenticated user identity from the context, or returns a predefined development user in development mode with default auth enabled.
 *
 * @returns The authenticated user identity, or the development user configuration if in development mode with default auth enabled.
 */
export async function getAuth(ctx: QueryCtx | MutationCtx) {
  // In development with default auth enabled, return the dev user
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    return await getDevUser(ctx);
  }
  
  return await ctx.auth.getUserIdentity();
}

/**
 * Retrieves the authenticated user identity for an action context.
 *
 * In development mode with default authentication enabled and not in production, returns a predefined development user configuration. Otherwise, returns the authenticated user identity from the action context.
 *
 * @returns The authenticated user identity, or `undefined` if not authenticated.
 */
export async function getAuthForAction(ctx: ActionCtx) {
  // In development with default auth enabled, return the dev user config
  if (DEV_AUTH_DEFAULT && process.env.NODE_ENV !== 'production') {
    return DEV_USER_CONFIG;
  }
  
  return await ctx.auth.getUserIdentity();
}