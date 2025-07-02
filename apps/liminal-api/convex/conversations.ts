import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id as _Id } from "./_generated/dataModel";
import { requireAuth, getAuth } from "./lib/auth";

// Create a new conversation
export const create = mutation({
  args: {
    title: v.string(),
    type: v.optional(v.union(v.literal("standard"), v.literal("roundtable"), v.literal("pipeline"))),
    metadata: v.optional(v.object({
      provider: v.optional(v.string()),
      model: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const now = Date.now();
    return await ctx.db.insert("conversations", {
      userId: identity.tokenIdentifier,
      title: args.title,
      type: args.type || "standard",
      metadata: args.metadata,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// List user's conversations with pagination
export const list = query({
  args: {
    archived: v.optional(v.boolean()),
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.optional(v.union(v.string(), v.null())),
    })),
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
        .query("conversations")
        .withIndex("by_user_archived", (q) => 
          q.eq("userId", identity.tokenIdentifier)
           .eq("metadata.archived", archived)
        )
        .order("desc")
        .paginate(paginationOptions);
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .paginate(paginationOptions);
  },
});

// Get a single conversation
export const get = query({
  args: {
    conversationId: v.id("conversations"),
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

// Update conversation metadata
export const update = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.optional(v.string()),
    metadata: v.optional(v.object({
      provider: v.optional(v.string()),
      model: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      archived: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    
    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
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

// Archive (soft delete) a conversation
export const archive = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    
    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
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

// Update last message timestamp (called when new messages are added)
export const updateLastMessageAt = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    
    // Check ownership
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Count conversations for a user
export const count = query({
  args: {
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return 0;

    const { archived } = args;

    const query = ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier));

    const conversations = await query.collect();

    // Filter by archived status if specified
    if (archived !== undefined) {
      return conversations.filter(c => c.metadata?.archived === archived).length;
    }

    return conversations.length;
  },
});