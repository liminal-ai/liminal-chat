import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { Id } from '../_generated/dataModel';
// Auth system removed

/**
 * Creates a new message in a conversation using the public API.
 * All conversations and messages are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation
 * @param args.authorType - Type of author: "user", "agent", or "system"
 * @param args.authorId - ID of the author ("anonymous" for users, provider name for agents)
 * @param args.type - Message type: "text", "tool_call", "tool_output", "chain_of_thought", or "error"
 * @param args.content - Message content (structure depends on type)
 * @param args.metadata - Optional metadata like model, tokens, etc.
 * @returns The ID of the created message
 * @throws Error if conversation not found
 *
 * @example
 * ```typescript
 * const messageId = await ctx.runMutation(api.messages.create, {
 *   conversationId: "j123...",
 *   authorType: "user",
 *   authorId: "anonymous",
 *   type: "text",
 *   content: "Hello, AI!"
 * });
 * ```
 */
export const create = mutation({
  args: {
    conversationId: v.id('conversations'),
    authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
    authorId: v.string(),
    type: v.union(
      v.literal('text'),
      v.literal('tool_call'),
      v.literal('tool_output'),
      v.literal('chain_of_thought'),
      v.literal('error'),
    ),
    content: v.any(), // Content structure depends on type
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
  },
  handler: async (ctx, args) => {
    // Public endpoint - no auth required

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Public endpoint - no validation required

    // Create the message with proper timestamps
    const now = Date.now();
    const messageId = await ctx.db.insert('messages', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    // Update conversation's last message timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Lists messages in a conversation with pagination support.
 * Messages are returned in chronological order (oldest first).
 * All conversations are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation
 * @param args.paginationOpts - Pagination options
 * @param args.paginationOpts.numItems - Number of items per page (default: 50)
 * @param args.paginationOpts.cursor - Cursor for pagination
 * @returns Paginated message list with page array and isDone flag
 * @returns Empty result if conversation not found
 *
 * @example
 * ```typescript
 * const { page, isDone } = await ctx.runQuery(api.messages.list, {
 *   conversationId: "j123...",
 *   paginationOpts: { numItems: 20 }
 * });
 * ```
 */
export const list = query({
  args: {
    conversationId: v.id('conversations'),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.optional(v.union(v.string(), v.null())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Public endpoint - no auth required
    // Public endpoint

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return { page: [], isDone: true };
    }

    const { paginationOpts = { numItems: 50, cursor: null } } = args;

    // Ensure cursor is always defined for pagination
    const paginationOptions = {
      numItems: paginationOpts.numItems,
      cursor: paginationOpts.cursor ?? null,
    };

    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .order('asc') // Oldest first for chat display
      .paginate(paginationOptions);
  },
});

/**
 * Gets all messages for a conversation with cursor-based pagination.
 * Includes protection against loading too many messages at once.
 * All conversations are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation
 * @param args.limit - Maximum messages to return (default: 100, max: 1000)
 * @param args.cursor - Message ID to start after (for pagination)
 * @returns Object with messages array, hasMore flag, and nextCursor
 * @returns Empty result if conversation not found
 *
 * @example
 * ```typescript
 * // First page
 * const { messages, hasMore, nextCursor } = await ctx.runQuery(api.messages.getAll, {
 *   conversationId: "j123...",
 *   limit: 50
 * });
 *
 * // Next page
 * if (hasMore && nextCursor) {
 *   const nextPage = await ctx.runQuery(api.messages.getAll, {
 *     conversationId: "j123...",
 *     limit: 50,
 *     cursor: nextCursor
 *   });
 * }
 * ```
 */
export const getAll = query({
  args: {
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Public endpoint - no auth required
    // Public endpoint

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return { messages: [], hasMore: false, nextCursor: null };
    }

    // Validate and set limit (default: 100, max: 1000)
    const requestedLimit = args.limit ?? 100;
    const effectiveLimit = Math.min(Math.max(1, requestedLimit), 1000);

    // Get cursor message if provided
    let cursorCreatedAt: number | null = null;
    if (args.cursor) {
      const cursorMessage = await ctx.db.get(args.cursor as Id<'messages'>);
      if (cursorMessage && cursorMessage.conversationId === args.conversationId) {
        cursorCreatedAt = cursorMessage.createdAt;
      }
    }

    // Build query with cursor filter if needed
    const baseQuery = ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId));

    // Apply cursor filter and order, then take limit + 1
    const messages = await (
      cursorCreatedAt !== null
        ? baseQuery.filter((q) => q.gt(q.field('createdAt'), cursorCreatedAt))
        : baseQuery
    )
      .order('asc')
      .take(effectiveLimit + 1);

    // Check if there are more messages
    const hasMore = messages.length > effectiveLimit;
    let nextCursor: string | null = null;

    if (hasMore) {
      // Remove the extra message
      messages.pop();
      // Set cursor to the last message's ID
      if (messages.length > 0) {
        nextCursor = messages[messages.length - 1]._id;
      }
    }

    return {
      messages,
      hasMore,
      nextCursor,
    };
  },
});

/**
 * Creates multiple messages at once in a conversation using the public API.
 * Useful for importing chat history or setting up initial context.
 * All conversations are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation
 * @param args.messages - Array of message objects to create
 * @returns Array of created message IDs
 * @throws Error if conversation not found
 *
 * @example
 * ```typescript
 * const messageIds = await ctx.runMutation(api.messages.createBatch, {
 *   conversationId: "j123...",
 *   messages: [
 *     {
 *       authorType: "user",
 *       authorId: "anonymous",
 *       type: "text",
 *       content: "What is TypeScript?"
 *     },
 *     {
 *       authorType: "agent",
 *       authorId: "openai",
 *       type: "text",
 *       content: "TypeScript is a typed superset of JavaScript...",
 *       metadata: {
 *         model: "gpt-4",
 *         provider: "openai",
 *         totalTokens: 125
 *       }
 *     }
 *   ]
 * });
 * ```
 */
export const createBatch = mutation({
  args: {
    conversationId: v.id('conversations'),
    messages: v.array(
      v.object({
        authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
        authorId: v.string(),
        type: v.union(
          v.literal('text'),
          v.literal('tool_call'),
          v.literal('tool_output'),
          v.literal('chain_of_thought'),
          v.literal('error'),
        ),
        content: v.any(),
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
  },
  handler: async (ctx, args) => {
    // Public endpoint - no auth required

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const now = Date.now();
    const messageIds: Id<'messages'>[] = [];

    // Insert all messages
    for (const message of args.messages) {
      // Public endpoint - no validation required

      const messageId = await ctx.db.insert('messages', {
        conversationId: args.conversationId,
        authorType: message.authorType,
        authorId: message.authorId,
        type: message.type,
        content: message.content,
        createdAt: now,
        updatedAt: now,
        metadata: message.metadata,
      });

      messageIds.push(messageId);
    }

    // Update conversation's last message timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageIds;
  },
});

/**
 * Counts messages in a conversation, optionally filtered by type.
 * All conversations are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation
 * @param args.type - Optional filter by message type
 * @returns The count of messages matching the criteria
 * @returns 0 if conversation not found
 *
 * @example
 * ```typescript
 * // Count all messages
 * const total = await ctx.runQuery(api.messages.count, {
 *   conversationId: "j123..."
 * });
 *
 * // Count only error messages
 * const errors = await ctx.runQuery(api.messages.count, {
 *   conversationId: "j123...",
 *   type: "error"
 * });
 * ```
 */
export const count = query({
  args: {
    conversationId: v.id('conversations'),
    type: v.optional(
      v.union(
        v.literal('text'),
        v.literal('tool_call'),
        v.literal('tool_output'),
        v.literal('chain_of_thought'),
        v.literal('error'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Public endpoint - no auth required
    // Public endpoint

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return 0;
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    // Filter by type if specified
    if (args.type !== undefined) {
      return messages.filter((m) => m.type === args.type).length;
    }

    return messages.length;
  },
});

/**
 * Gets the latest messages from a conversation.
 * Returns messages in chronological order, useful for building context windows.
 * All conversations are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation
 * @param args.limit - Number of messages to return (default: 10)
 * @returns Array of the latest messages in chronological order
 * @returns Empty array if conversation not found
 *
 * @example
 * ```typescript
 * // Get last 5 messages for context
 * const context = await ctx.runQuery(api.messages.getLatest, {
 *   conversationId: "j123...",
 *   limit: 5
 * });
 * ```
 */
export const getLatest = query({
  args: {
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Public endpoint - no auth required
    // Public endpoint

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return [];
    }

    const limit = args.limit || 10;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .order('desc')
      .take(limit);

    // Return in chronological order
    return messages.reverse();
  },
});
