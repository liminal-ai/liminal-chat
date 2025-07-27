// Liminal Chat Convex Schema
// Mixed API schema - agents require authentication, conversations are public

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema(
  {
    // Users table removed - no authentication system

    // Agents table - stores AI agent configurations
    agents: defineTable({
      // Which user owns this agent (authenticated user ID from WorkOS)
      userId: v.string(),
      // Unique identifier like "alice" or "jarvis" (unique per user)
      name: v.string(),
      // The personality/behavior prompt
      systemPrompt: v.string(),
      // Provider like "openai" or "anthropic"
      provider: v.string(),
      // Model like "gpt-4" or "claude-3-sonnet"
      model: v.string(),
      // Configuration object with optional fields
      config: v.optional(
        v.object({
          temperature: v.optional(v.number()),
          maxTokens: v.optional(v.number()),
          topP: v.optional(v.number()),
          reasoning: v.optional(v.boolean()),
          streamingSupported: v.optional(v.boolean()),
        }),
      ),
      // Archived status (defaults to false - not archived)
      archived: v.optional(v.boolean()),
      // Timestamps
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index('by_user_and_name', ['userId', 'name'])
      .index('by_user_and_archived', ['userId', 'archived']),

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
    messages: defineTable(
      v.union(
        // Text message
        v.object({
          conversationId: v.id('conversations'),
          authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
          authorId: v.string(),
          type: v.literal('text'),
          content: v.string(),
          createdAt: v.number(),
          updatedAt: v.number(),
          metadata: v.optional(
            v.object({
              model: v.optional(v.string()),
              provider: v.optional(v.string()),
              promptTokens: v.optional(v.number()),
              completionTokens: v.optional(v.number()),
              totalTokens: v.optional(v.number()),
              finishReason: v.optional(v.string()),
              visibility: v.optional(v.array(v.string())),
            }),
          ),
        }),
        // Tool call message
        v.object({
          conversationId: v.id('conversations'),
          authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
          authorId: v.string(),
          type: v.literal('tool_call'),
          content: v.object({
            toolId: v.string(),
            toolName: v.string(),
            arguments: v.any(), // Tool arguments can be any structure
          }),
          createdAt: v.number(),
          updatedAt: v.number(),
          metadata: v.optional(
            v.object({
              model: v.optional(v.string()),
              provider: v.optional(v.string()),
              promptTokens: v.optional(v.number()),
              completionTokens: v.optional(v.number()),
              totalTokens: v.optional(v.number()),
              finishReason: v.optional(v.string()),
              visibility: v.optional(v.array(v.string())),
            }),
          ),
        }),
        // Tool output message
        v.object({
          conversationId: v.id('conversations'),
          authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
          authorId: v.string(),
          type: v.literal('tool_output'),
          content: v.object({
            toolCallId: v.string(),
            output: v.any(), // Tool output can be any structure
            error: v.optional(v.string()),
          }),
          createdAt: v.number(),
          updatedAt: v.number(),
          metadata: v.optional(
            v.object({
              model: v.optional(v.string()),
              provider: v.optional(v.string()),
              promptTokens: v.optional(v.number()),
              completionTokens: v.optional(v.number()),
              totalTokens: v.optional(v.number()),
              finishReason: v.optional(v.string()),
              visibility: v.optional(v.array(v.string())),
            }),
          ),
        }),
        // Chain of thought message
        v.object({
          conversationId: v.id('conversations'),
          authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
          authorId: v.string(),
          type: v.literal('chain_of_thought'),
          content: v.object({
            reasoning: v.string(),
            steps: v.array(v.string()),
          }),
          createdAt: v.number(),
          updatedAt: v.number(),
          metadata: v.optional(
            v.object({
              model: v.optional(v.string()),
              provider: v.optional(v.string()),
              promptTokens: v.optional(v.number()),
              completionTokens: v.optional(v.number()),
              totalTokens: v.optional(v.number()),
              finishReason: v.optional(v.string()),
              visibility: v.optional(v.array(v.string())),
            }),
          ),
        }),
        // Error message
        v.object({
          conversationId: v.id('conversations'),
          authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
          authorId: v.string(),
          type: v.literal('error'),
          content: v.object({
            message: v.string(),
            code: v.optional(v.string()),
            details: v.optional(v.any()),
          }),
          createdAt: v.number(),
          updatedAt: v.number(),
          metadata: v.optional(
            v.object({
              model: v.optional(v.string()),
              provider: v.optional(v.string()),
              promptTokens: v.optional(v.number()),
              completionTokens: v.optional(v.number()),
              totalTokens: v.optional(v.number()),
              finishReason: v.optional(v.string()),
              visibility: v.optional(v.array(v.string())),
            }),
          ),
        }),
      ),
    ).index('by_conversation', ['conversationId', 'createdAt']),
  },
  { schemaValidation: true },
);
