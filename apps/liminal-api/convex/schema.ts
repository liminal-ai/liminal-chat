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

    // Conversations table - stores chat sessions
    conversations: defineTable({
      // User who owns this conversation
      userId: v.string(), // tokenIdentifier from Clerk
      // Conversation title (auto-generated or user-provided)
      title: v.string(),
      // Type of conversation determines orchestration needs
      type: v.union(v.literal("standard"), v.literal("roundtable"), v.literal("pipeline")),
      // Optional metadata for flexibility
      metadata: v.optional(v.object({
        provider: v.optional(v.string()),
        model: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        archived: v.optional(v.boolean()),
      })),
      // Track last activity for sorting
      lastMessageAt: v.number(),
      // Timestamps
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId", "lastMessageAt"])
      .index("by_user_archived", ["userId", "metadata.archived", "lastMessageAt"]),

    // Messages table - stores all messages in conversations
    messages: defineTable({
      // Which conversation this message belongs to
      conversationId: v.id("conversations"),
      // Who created this message
      authorType: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
      authorId: v.string(), // userId for users, agent name for agents
      // What kind of message
      type: v.union(
        v.literal("text"),
        v.literal("tool_call"),
        v.literal("tool_output"),
        v.literal("chain_of_thought"),
        v.literal("error")
      ),
      // The content - structure depends on type
      content: v.any(), // Typed based on message type
      // When it was created
      createdAt: v.number(),
      // Optional metadata
      metadata: v.optional(v.object({
        model: v.optional(v.string()),
        provider: v.optional(v.string()),
        promptTokens: v.optional(v.number()),
        completionTokens: v.optional(v.number()),
        totalTokens: v.optional(v.number()),
        finishReason: v.optional(v.string()),
        visibility: v.optional(v.array(v.string())), // Who can see this message
      })),
    })
      .index("by_conversation", ["conversationId", "createdAt"]),
  },
  { schemaValidation: true }
);