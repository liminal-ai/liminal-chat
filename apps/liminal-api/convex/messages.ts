import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireAuth, getAuth } from "./lib/auth";

// Message type validators based on type
const _messageContentValidators = {
  text: v.string(),
  tool_call: v.object({
    toolId: v.string(),
    toolName: v.string(),
    arguments: v.any(),
  }),
  tool_output: v.object({
    toolCallId: v.string(),
    output: v.any(),
    error: v.optional(v.string()),
  }),
  chain_of_thought: v.object({
    reasoning: v.string(),
    steps: v.array(v.string()),
  }),
  error: v.object({
    message: v.string(),
    code: v.optional(v.string()),
    details: v.optional(v.any()),
  }),
};

// Create a new message
export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    authorType: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
    authorId: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("tool_call"),
      v.literal("tool_output"),
      v.literal("chain_of_thought"),
      v.literal("error")
    ),
    content: v.any(), // Validated based on type
    metadata: v.optional(v.object({
      model: v.optional(v.string()),
      provider: v.optional(v.string()),
      promptTokens: v.optional(v.number()),
      completionTokens: v.optional(v.number()),
      totalTokens: v.optional(v.number()),
      finishReason: v.optional(v.string()),
      visibility: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    // For user messages, ensure authorId matches authenticated user
    if (args.authorType === "user" && args.authorId !== identity.tokenIdentifier) {
      throw new Error("Invalid author ID for user message");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      authorType: args.authorType,
      authorId: args.authorId,
      type: args.type,
      content: args.content,
      createdAt: Date.now(),
      metadata: args.metadata,
    });

    // Update conversation's last message timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// List messages for a conversation with pagination
export const list = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.optional(v.union(v.string(), v.null())),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return { page: [], isDone: true };

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      return { page: [], isDone: true };
    }

    const { paginationOpts = { numItems: 50, cursor: null } } = args;

    // Ensure cursor is always defined for pagination
    const paginationOptions = {
      numItems: paginationOpts.numItems,
      cursor: paginationOpts.cursor ?? null,
    };

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .order("asc") // Oldest first for chat display
      .paginate(paginationOptions);
  },
});

// Get all messages for a conversation with pagination protection
export const getAll = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return { messages: [], hasMore: false, nextCursor: null };

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      return { messages: [], hasMore: false, nextCursor: null };
    }

    // Validate and set limit (default: 100, max: 1000)
    const requestedLimit = args.limit ?? 100;
    const effectiveLimit = Math.min(Math.max(1, requestedLimit), 1000);

    // Get cursor message if provided
    let cursorCreatedAt: number | null = null;
    if (args.cursor) {
      const cursorMessage = await ctx.db.get(args.cursor as Id<"messages">);
      if (cursorMessage && cursorMessage.conversationId === args.conversationId) {
        cursorCreatedAt = cursorMessage.createdAt;
      }
    }

    // Build query with cursor filter if needed
    const baseQuery = ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.conversationId)
      );

    // Apply cursor filter and order, then take limit + 1
    const messages = await (cursorCreatedAt !== null
      ? baseQuery.filter((q) => q.gt(q.field("createdAt"), cursorCreatedAt))
      : baseQuery)
      .order("asc")
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

// Create multiple messages at once (useful for initial context)
export const createBatch = mutation({
  args: {
    conversationId: v.id("conversations"),
    messages: v.array(v.object({
      authorType: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
      authorId: v.string(),
      type: v.union(
        v.literal("text"),
        v.literal("tool_call"),
        v.literal("tool_output"),
        v.literal("chain_of_thought"),
        v.literal("error")
      ),
      content: v.any(),
      metadata: v.optional(v.object({
        model: v.optional(v.string()),
        provider: v.optional(v.string()),
        promptTokens: v.optional(v.number()),
        completionTokens: v.optional(v.number()),
        totalTokens: v.optional(v.number()),
        finishReason: v.optional(v.string()),
        visibility: v.optional(v.array(v.string())),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      throw new Error("Conversation not found");
    }

    const now = Date.now();
    const messageIds: Id<"messages">[] = [];

    // Insert all messages
    for (const message of args.messages) {
      // For user messages, ensure authorId matches authenticated user
      if (message.authorType === "user" && message.authorId !== identity.tokenIdentifier) {
        throw new Error("Invalid author ID for user message");
      }

      const messageId = await ctx.db.insert("messages", {
        conversationId: args.conversationId,
        authorType: message.authorType,
        authorId: message.authorId,
        type: message.type,
        content: message.content,
        createdAt: now,
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

// Count messages in a conversation
export const count = query({
  args: {
    conversationId: v.id("conversations"),
    type: v.optional(v.union(
      v.literal("text"),
      v.literal("tool_call"),
      v.literal("tool_output"),
      v.literal("chain_of_thought"),
      v.literal("error")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return 0;

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      return 0;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Filter by type if specified
    if (args.type !== undefined) {
      return messages.filter(m => m.type === args.type).length;
    }

    return messages.length;
  },
});

// Get latest messages (useful for context windows)
export const getLatest = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return [];

    // Verify user owns the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== identity.tokenIdentifier) {
      return [];
    }

    const limit = args.limit || 10;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => 
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);

    // Return in chronological order
    return messages.reverse();
  },
});