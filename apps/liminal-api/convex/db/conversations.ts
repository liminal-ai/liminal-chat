import { v } from 'convex/values';
import { mutation, query, internalMutation } from '../_generated/server';
import { Id as _Id } from '../_generated/dataModel';

/**
 * Creates a new conversation in the public API.
 * All conversations are created as anonymous and publicly accessible.
 *
 * @param args.title - The title of the conversation
 * @param args.type - Type of conversation: "standard", "roundtable", or "pipeline" (defaults to "standard")
 * @param args.metadata - Optional metadata including provider, model, and tags
 * @returns The ID of the created conversation
 *
 * @example
 * ```typescript
 * const conversationId = await ctx.runMutation(api.conversations.create, {
 *   title: "Chat about TypeScript",
 *   type: "standard",
 *   metadata: {
 *     provider: "openai",
 *     model: "gpt-4",
 *     tags: ["programming", "typescript"]
 *   }
 * });
 * ```
 */
export const create = mutation({
  args: {
    title: v.string(),
    type: v.optional(
      v.union(v.literal('standard'), v.literal('roundtable'), v.literal('pipeline')),
    ),
    metadata: v.optional(
      v.object({
        provider: v.optional(v.string()),
        model: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  returns: v.id('conversations'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');
    const userId = identity.subject;

    const now = Date.now();
    return await ctx.db.insert('conversations', {
      userId,
      title: args.title,
      type: args.type || 'standard',
      metadata: args.metadata,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Lists all conversations in the public API with pagination support.
 * Returns all conversations without user filtering since the API is public.
 *
 * @param args.archived - Filter by archived status (optional)
 * @param args.paginationOpts - Pagination options
 * @param args.paginationOpts.numItems - Number of items per page (default: 50)
 * @param args.paginationOpts.cursor - Cursor for pagination (optional)
 * @returns Paginated conversation list with page array and isDone flag
 *
 * @example
 * ```typescript
 * const { page, isDone } = await ctx.runQuery(api.conversations.list, {
 *   archived: false,
 *   paginationOpts: { numItems: 20 }
 * });
 * console.log(`Found ${page.length} conversations`);
 * ```
 */
export const list = query({
  args: {
    archived: v.optional(v.boolean()),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.optional(v.union(v.string(), v.null())),
      }),
    ),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true } as any;
    const userId = identity.subject;

    const { archived: _archived = false, paginationOpts = { numItems: 50, cursor: null } } = args;

    // Ensure cursor is always defined for pagination
    const paginationOptions = {
      numItems: paginationOpts.numItems,
      cursor: paginationOpts.cursor ?? null,
    };

    return await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('userId'), userId))
      .order('desc')
      .paginate(paginationOptions);
  },
});

/**
 * Gets a single conversation by ID from the public API.
 * Returns any conversation since all are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation to retrieve
 * @returns The conversation object or null if not found
 *
 * @example
 * ```typescript
 * const conversation = await ctx.runQuery(api.conversations.get, {
 *   conversationId: "j123..."
 * });
 * if (conversation) {
 *   console.log(`Conversation: ${conversation.title}`);
 * }
 * ```
 */
export const get = query({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== userId) {
      return null;
    }

    return conversation;
  },
});

/**
 * Updates a conversation's title and/or metadata in the public API.
 * Any conversation can be updated since all are publicly accessible.
 *
 * @param args.conversationId - The ID of the conversation to update
 * @param args.title - New title (optional)
 * @param args.metadata - Metadata to update (optional, merged with existing)
 * @throws Error "Conversation not found" if conversation doesn't exist
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.conversations.update, {
 *   conversationId: "j123...",
 *   title: "Updated Title",
 *   metadata: {
 *     tags: ["important", "work"]
 *   }
 * });
 * ```
 */
export const update = mutation({
  args: {
    conversationId: v.id('conversations'),
    title: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        provider: v.optional(v.string()),
        model: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        archived: v.optional(v.boolean()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');
    const userId = identity.subject;

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== userId) {
      throw new Error('Conversation not found');
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }

    if (args.metadata !== undefined) {
      updates.metadata = {
        ...(conversation.metadata || {}),
        ...args.metadata,
      };
    }

    await ctx.db.patch(args.conversationId, updates);
    return null;
  },
});

/**
 * Archives a conversation (soft delete) in the public API.
 * The conversation remains in the database but is marked as archived.
 *
 * @param args.conversationId - The ID of the conversation to archive
 * @throws Error "Conversation not found" if conversation doesn't exist
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.conversations.archive, {
 *   conversationId: "j123..."
 * });
 * ```
 */
export const archive = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');
    const userId = identity.subject;

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== userId) {
      throw new Error('Conversation not found');
    }

    await ctx.db.patch(args.conversationId, {
      metadata: {
        ...(conversation.metadata || {}),
        archived: true,
      },
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Updates the last message timestamp for a conversation.
 * Called internally when new messages are added to maintain sort order.
 *
 * @param args.conversationId - The ID of the conversation to update
 * @throws Error "Conversation not found" if conversation doesn't exist
 * @internal
 *
 * @example
 * ```typescript
 * // Usually called after creating a message
 * await ctx.runMutation(api.conversations.updateLastMessageAt, {
 *   conversationId: "j123..."
 * });
 * ```
 */
export const updateLastMessageAt = internalMutation({
  args: {
    conversationId: v.id('conversations'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Internal only; caller must ensure auth/ownership

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Counts the total number of conversations in the public API.
 *
 * @param args.archived - Filter by archived status (optional)
 * @returns The count of conversations matching the filter
 *
 * @example
 * ```typescript
 * const activeCount = await ctx.runQuery(api.conversations.count, {
 *   archived: false
 * });
 * console.log(`Found ${activeCount} active conversations`);
 * ```
 */
export const count = query({
  args: {
    archived: v.optional(v.boolean()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const userId = identity.subject;

    const { archived: _archived } = args;

    const conversations = await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    // Filter by archived status if specified
    if (_archived !== undefined) {
      return conversations.filter((c) => c.metadata?.archived === _archived).length;
    }

    return conversations.length;
  },
});
