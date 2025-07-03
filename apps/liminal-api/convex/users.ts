import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuth, requireAuth, getDEV_USER_CONFIG, validateDevConfig } from './lib/auth';
import { env } from './lib/env';

/**
 * Gets the current authenticated user from the database.
 *
 * @returns The user object if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * const user = await ctx.runQuery(api.users.getCurrentUser);
 * if (user) {
 *   console.log(`Welcome ${user.name}`);
 * }
 * ```
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Try to find the user in our database
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    return user;
  },
});

/**
 * Synchronizes user data from authentication provider to the database.
 * Creates a new user if they don't exist, or updates existing user data.
 *
 * @param args - The mutation arguments
 * @param args.email - User's email address
 * @param args.name - User's display name (optional)
 * @param args.imageUrl - URL to user's profile image (optional)
 *
 * @throws Error if not authenticated
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.users.syncUser, {
 *   email: "user@example.com",
 *   name: "John Doe",
 *   imageUrl: "https://example.com/avatar.jpg"
 * });
 * ```
 */
export const syncUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
    } else {
      // Create new user
      await ctx.db.insert('users', {
        tokenIdentifier: identity.tokenIdentifier,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Tests the authentication status and returns user information.
 * Useful for debugging auth issues and health checks.
 *
 * @returns Object with authentication status and user data
 *
 * @example
 * ```typescript
 * const { authenticated, user } = await ctx.runQuery(api.users.testAuth);
 * console.log(`Auth status: ${authenticated}`);
 * ```
 */
export const testAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuth(ctx);
    if (!identity) {
      return {
        authenticated: false,
        user: null,
      };
    }

    // Get the user from database
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    return {
      authenticated: true,
      user,
    };
  },
});

/**
 * Gets the total count of users in the database.
 * Used for health checks and monitoring.
 *
 * @returns The total number of users
 *
 * @example
 * ```typescript
 * const count = await ctx.runQuery(api.users.getUserCount);
 * console.log(`Total users: ${count}`);
 * ```
 */
export const getUserCount = query({
  args: {},
  handler: async (ctx) => {
    // Require authentication for administrative data
    await requireAuth(ctx);

    const users = await ctx.db.query('users').collect();
    return users.length;
  },
});

/**
 * Gets a sanitized sample user for health checks.
 * Returns only non-sensitive user data.
 *
 * @returns Sanitized user data or null if no users exist
 *
 * @example
 * ```typescript
 * const sampleUser = await ctx.runQuery(api.users.getSampleUser);
 * if (sampleUser) {
 *   console.log(`Found user created at ${new Date(sampleUser.createdAt)}`);
 * }
 * ```
 */
export const getSampleUser = query({
  args: {},
  handler: async (ctx) => {
    // Require authentication for user data access
    await requireAuth(ctx);

    const user = await ctx.db.query('users').first();

    if (!user) {
      return null;
    }

    // Return sanitized user data
    return {
      id: user._id,
      hasEmail: !!user.email,
      hasName: !!user.name,
      hasImage: !!user.imageUrl,
      createdAt: user.createdAt,
    };
  },
});

/**
 * Initializes the default development user for local testing.
 *
 * @security This function is restricted to development environments only.
 * It will throw an error if NODE_ENV is set to "production".
 *
 * @throws Error if called in production environment
 * @throws Error if dev environment variables are not configured
 *
 * @returns Object with creation status
 *
 * @example
 * ```typescript
 * // First set environment variables:
 * // npx convex env set DEV_AUTH_DEFAULT true
 * // npx convex env set DEV_USER_ID "user_2zINPyhtT9Wem9OeVW4eZDs21KI"
 * // npx convex env set DEV_USER_EMAIL "dev@liminal.chat"
 * // npx convex env set DEV_USER_NAME "Dev User"
 *
 * // Then initialize:
 * const result = await ctx.runMutation(api.users.initializeDevUser);
 * console.log(result.message); // "Dev user created" or "Dev user already exists"
 * ```
 */
export const initializeDevUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Production environment protection
    if (env.isProduction) {
      throw new Error(
        '🚫 Security Error: initializeDevUser is not allowed in production\n\n' +
          'This function creates unauthorized development users and must only be used in development.\n' +
          'If you need to test authentication in production, please use proper Clerk authentication.\n\n' +
          'To use this function:\n' +
          '1. Ensure NODE_ENV is set to "development"\n' +
          '2. Set DEV_AUTH_DEFAULT=true in your environment\n' +
          '3. Configure DEV_USER_ID, DEV_USER_EMAIL, and DEV_USER_NAME',
      );
    }

    // Validate that dev config is properly set
    validateDevConfig();

    const devUserConfig = getDEV_USER_CONFIG();
    const DEV_USER = {
      tokenIdentifier: devUserConfig.tokenIdentifier,
      email: devUserConfig.email,
      name: devUserConfig.name,
    };

    // Ensure all required fields are present
    if (!DEV_USER.tokenIdentifier || !DEV_USER.email || !DEV_USER.name) {
      throw new Error(
        'Cannot initialize dev user: Missing required environment variables. ' +
          'Please set DEV_USER_ID, DEV_USER_EMAIL, and DEV_USER_NAME in your Convex environment.',
      );
    }

    // Check if dev user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', DEV_USER.tokenIdentifier))
      .first();

    if (existingUser) {
      return { message: 'Dev user already exists', userId: existingUser._id };
    }

    // Create dev user
    const userId = await ctx.db.insert('users', {
      ...DEV_USER,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { message: 'Dev user created', userId };
  },
});
