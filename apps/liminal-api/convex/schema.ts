// Liminal Chat Convex Schema
// This schema includes user authentication via Clerk

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    // Users table for storing user profiles from Clerk
    users: defineTable({
      // Clerk user ID (this will be the tokenIdentifier from Clerk JWT)
      tokenIdentifier: v.string(),
      // User's email from Clerk
      email: v.string(),
      // User's name from Clerk
      name: v.optional(v.string()),
      // User's profile image URL from Clerk
      imageUrl: v.optional(v.string()),
      // Timestamps
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_token", ["tokenIdentifier"])
      .index("by_email", ["email"]),
    
    // Placeholder table for system configuration
    // This will be expanded to include actual data models
    systemConfig: defineTable({
      key: v.string(),
      value: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_key", ["key"]),
  },
  { schemaValidation: true }
);