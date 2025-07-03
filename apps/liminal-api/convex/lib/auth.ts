import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { env } from "./env";

// Development-only default auth user
const DEV_AUTH_DEFAULT = env.isDevAuthEnabled;

/**
 * Gets the development user configuration.
 * Uses lazy evaluation to prevent module loading failures when env vars are missing.
 * 
 * @returns Development user configuration object
 * @returns {string} tokenIdentifier - Clerk user ID for dev user
 * @returns {string} email - Dev user's email
 * @returns {string} name - Dev user's display name
 * @returns {string} subject - Same as tokenIdentifier (for Clerk compatibility)
 * 
 * @example
 * const config = getDEV_USER_CONFIG();
 * console.log(`Dev user: ${config.email}`);
 */
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

/**
 * Validates that development user configuration is properly set.
 * Throws helpful errors if required environment variables are missing.
 * 
 * @throws ConvexError if dev auth is enabled but required env vars are missing
 * 
 * @example
 * // Call before using dev auth to ensure config is valid
 * validateDevConfig();
 */
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

/**
 * Requires authentication for a query or mutation.
 * In development with DEV_AUTH_DEFAULT=true, returns the dev user.
 * In production, throws an error if user is not authenticated.
 * 
 * @param ctx - Convex query or mutation context
 * @returns User identity object with tokenIdentifier
 * @throws Error "Authentication required" if not authenticated in production
 * 
 * @example
 * export const createItem = mutation({
 *   handler: async (ctx, args) => {
 *     const identity = await requireAuth(ctx);
 *     return await ctx.db.insert("items", {
 *       userId: identity.tokenIdentifier,
 *       ...args
 *     });
 *   }
 * });
 */
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

/**
 * Gets authentication if available, returns null if not authenticated.
 * In development with DEV_AUTH_DEFAULT=true, always returns the dev user.
 * Use this for queries that work with or without authentication.
 * 
 * @param ctx - Convex query or mutation context
 * @returns User identity object or null
 * 
 * @example
 * export const listItems = query({
 *   handler: async (ctx) => {
 *     const identity = await getAuth(ctx);
 *     if (identity) {
 *       // Return user-specific items
 *       return await ctx.db.query("items")
 *         .withIndex("by_user", q => q.eq("userId", identity.tokenIdentifier))
 *         .collect();
 *     }
 *     // Return public items
 *     return await ctx.db.query("items")
 *       .filter(q => q.eq(q.field("isPublic"), true))
 *       .collect();
 *   }
 * });
 */
export async function getAuth(ctx: QueryCtx | MutationCtx) {
  // In development with default auth enabled, return the dev user
  if (DEV_AUTH_DEFAULT) {
    return await getDevUser(ctx);
  }
  
  return await ctx.auth.getUserIdentity();
}

/**
 * Gets authentication for Convex actions.
 * Actions don't have database access, so this returns the config directly
 * rather than looking up the user in the database.
 * 
 * @param ctx - Convex action context
 * @returns User identity object or null
 * 
 * @example
 * export const callExternalAPI = action({
 *   handler: async (ctx, args) => {
 *     const identity = await getAuthForAction(ctx);
 *     if (!identity) {
 *       throw new Error("Authentication required");
 *     }
 *     // Use identity.tokenIdentifier for external API calls
 *   }
 * });
 */
export async function getAuthForAction(ctx: ActionCtx) {
  // In development with default auth enabled, return the dev user config
  if (DEV_AUTH_DEFAULT) {
    validateDevConfig();
    return getDEV_USER_CONFIG();
  }
  
  return await ctx.auth.getUserIdentity();
}