import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id as _Id } from './_generated/dataModel';
import { requireAuth, getAuth } from './lib/auth';

/**
 * Creates a new conversation for the authenticated user.
 *
 * @param args.title - The title of the conversation
 * @param args.type - Type of conversation: "standard", "roundtable", or "pipeline" (defaults to "standard")
 * @param args.metadata - Optional metadata including provider, model, and tags
 * @returns The ID of the created conversation
 * @throws Error if not authenticated
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
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const now = Date.now();
    return await ctx.db.insert('conversations', {
      userId: identity.tokenIdentifier,
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
 * Lists the authenticated user's conversations with pagination support.
 *
 * @param args.archived - Filter by archived status (optional)
 * @param args.paginationOpts - Pagination options
 * @param args.paginationOpts.numItems - Number of items per page (default: 50)
 * @param args.paginationOpts.cursor - Cursor for pagination (optional)
 * @returns Paginated conversation list with page array and isDone flag
 * @returns Empty result if not authenticated
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
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return { page: [], isDone: true };

    const { archived = false, paginationOpts = { numItems: 50, cursor: null } } = args;

    // Ensure cursor is always defined for pagination
    const paginationOptions = {
      numItems: paginationOpts.numItems,
      cursor: paginationOpts.cursor ?? null,
    };

    // Use the appropriate index based on whether we're filtering by archived
    if (archived !== undefined) {
      return await ctx.db
        .query('conversations')
        .withIndex('by_user_archived', (q) =>
          q.eq('userId', identity.tokenIdentifier).eq('metadata.archived', archived),
        )
        .order('desc')
        .paginate(paginationOptions);
    }

    return await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', identity.tokenIdentifier))
      .order('desc')
      .paginate(paginationOptions);
  },
});

/**
 * Gets a single conversation by ID.
 * Verifies ownership before returning the conversation.
 *
 * @param args.conversationId - The ID of the conversation to retrieve
 * @returns The conversation object or null if not found/not owned by user
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
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return null;

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      return null;
    }

    return conversation;
  },
});

/**
 * Updates a conversation's title and/or metadata.
 * Only the conversation owner can update it.
 *
 * @param args.conversationId - The ID of the conversation to update
 * @param args.title - New title (optional)
 * @param args.metadata - Metadata to update (optional, merged with existing)
 * @throws Error "Conversation not found" if not found or not owned by user
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
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
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
        ...conversation.metadata,
        ...args.metadata,
      };
    }

    await ctx.db.patch(args.conversationId, updates);
  },
});

/**
 * Archives a conversation (soft delete).
 * The conversation remains in the database but is marked as archived.
 *
 * @param args.conversationId - The ID of the conversation to archive
 * @throws Error "Conversation not found" if not found or not owned by user
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
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error('Conversation not found');
    }

    await ctx.db.patch(args.conversationId, {
      metadata: {
        ...conversation.metadata,
        archived: true,
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Updates the last message timestamp for a conversation.
 * Called internally when new messages are added to maintain sort order.
 *
 * @param args.conversationId - The ID of the conversation to update
 * @throws Error "Conversation not found" if not found or not owned by user
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
export const updateLastMessageAt = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);

    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error('Conversation not found');
    }

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Counts the total number of conversations for the authenticated user.
 *
 * @param args.archived - Filter by archived status (optional)
 * @returns The count of conversations matching the filter
 * @returns 0 if not authenticated
 *
 * @example
 * ```typescript
 * const activeCount = await ctx.runQuery(api.conversations.count, {
 *   archived: false
 * });
 * console.log(`You have ${activeCount} active conversations`);
 * ```
 */
export const count = query({
  args: {
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return 0;

    const { archived } = args;

    const query = ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', identity.tokenIdentifier));

    const conversations = await query.collect();

    // Filter by archived status if specified
    if (archived !== undefined) {
      return conversations.filter((c) => c.metadata?.archived === archived).length;
    }

    return conversations.length;
  },
});
