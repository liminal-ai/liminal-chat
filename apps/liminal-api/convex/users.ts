import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to sync user data");
    }

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
    const identity = await ctx.auth.getUserIdentity();
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