import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuth, requireAuth, DEV_USER_CONFIG, validateDevConfig } from "./lib/auth";

// Query to get the current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Try to find the user in our database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    return user;
  },
});

// Mutation to create or update a user when they sign in
export const syncUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
      await ctx.db.insert("users", {
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

// Query to test if authentication is working
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
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    return {
      authenticated: true,
      user,
    };
  },
});

// Query to get the count of users in the database
export const getUserCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

// Query to get a sample user (for health check)
export const getSampleUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    
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

// Mutation to initialize dev user (call this once to set up dev environment)
// SECURITY: This function is restricted to development environments only
export const initializeDevUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Production environment protection
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'initializeDevUser is not allowed in production environment. ' +
        'This function creates unauthorized development users and must only be used in development.'
      );
    }
    
    // Validate that dev config is properly set
    validateDevConfig();
    
    const DEV_USER = {
      tokenIdentifier: DEV_USER_CONFIG.tokenIdentifier,
      email: DEV_USER_CONFIG.email,
      name: DEV_USER_CONFIG.name,
    };
    
    // Ensure all required fields are present
    if (!DEV_USER.tokenIdentifier || !DEV_USER.email || !DEV_USER.name) {
      throw new Error(
        'Cannot initialize dev user: Missing required environment variables. ' +
        'Please set DEV_USER_ID, DEV_USER_EMAIL, and DEV_USER_NAME in your Convex environment.'
      );
    }
    
    // Check if dev user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", DEV_USER.tokenIdentifier))
      .first();
    
    if (existingUser) {
      return { message: "Dev user already exists", userId: existingUser._id };
    }
    
    // Create dev user
    const userId = await ctx.db.insert("users", {
      ...DEV_USER,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { message: "Dev user created", userId };
  },
});