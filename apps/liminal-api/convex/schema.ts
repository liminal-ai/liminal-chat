// Liminal Chat Convex Schema
// Public API schema - no authentication

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema(
  {
    // Users table removed - no authentication system

    // Conversations table - stores chat sessions
    conversations: defineTable({
      // Anonymous user identifier
      userId: v.string(), // No authentication system
      // Conversation title (auto-generated or user-provided)
      title: v.string(),
      // Type of conversation determines orchestration needs
      type: v.union(v.literal('standard'), v.literal('roundtable'), v.literal('pipeline')),
      // Optional metadata for flexibility
      metadata: v.optional(
        v.object({
          provider: v.optional(v.string()),
          model: v.optional(v.string()),
          tags: v.optional(v.array(v.string())),
          archived: v.optional(v.boolean()),
        }),
      ),
      // Track last activity for sorting
      lastMessageAt: v.number(),
      // Timestamps
      createdAt: v.number(),
      updatedAt: v.number(),
    }),

    // Messages table - stores all messages in conversations
    messages: defineTable({
      // Which conversation this message belongs to
      conversationId: v.id('conversations'),
      // Who created this message
      authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
      authorId: v.string(), // anonymous for users, agent name for agents
      // What kind of message
      type: v.union(
        v.literal('text'),
        v.literal('tool_call'),
        v.literal('tool_output'),
        v.literal('chain_of_thought'),
        v.literal('error'),
      ),
      // The content - structure depends on type
      content: v.any(), // Typed based on message type
      // When it was created
      createdAt: v.number(),
      // When it was last updated
      updatedAt: v.number(),
      // Optional metadata
      metadata: v.optional(
        v.object({
          model: v.optional(v.string()),
          provider: v.optional(v.string()),
          promptTokens: v.optional(v.number()),
          completionTokens: v.optional(v.number()),
          totalTokens: v.optional(v.number()),
          finishReason: v.optional(v.string()),
          visibility: v.optional(v.array(v.string())), // Who can see this message
        }),
      ),
    }).index('by_conversation', ['conversationId', 'createdAt']),
  },
  { schemaValidation: true },
);
