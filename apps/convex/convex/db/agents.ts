import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

/**
 * Creates a new agent for the authenticated user.
 * Agent names must be unique per user.
 *
 * @param args.userId - The authenticated user ID from WorkOS
 * @param args.name - Unique identifier like "alice" or "jarvis"
 * @param args.systemPrompt - The personality/behavior prompt
 * @param args.provider - Provider like "openai" or "anthropic"
 * @param args.model - Model like "gpt-4" or "claude-3-sonnet"
 * @param args.config - Optional configuration object
 * @returns The ID of the created agent
 * @throws Error if agent name already exists for this user
 *
 * @example
 * ```typescript
 * const agentId = await ctx.runMutation(api.db.agents.create, {
 *   userId: "user_123",
 *   name: "assistant",
 *   systemPrompt: "You are a helpful assistant.",
 *   provider: "openai",
 *   model: "gpt-4",
 *   config: {
 *     temperature: 0.7,
 *     maxTokens: 1000
 *   }
 * });
 * ```
 */
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    systemPrompt: v.string(),
    provider: v.string(),
    model: v.string(),
    config: v.optional(
      v.object({
        temperature: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
        topP: v.optional(v.number()),
        reasoning: v.optional(v.boolean()),
        streamingSupported: v.optional(v.boolean()),
      }),
    ),
  },
  returns: v.id('agents'),
  handler: async (ctx, args) => {
    // Check for empty name first
    if (!args.name || args.name.trim().length === 0) {
      throw new Error('Agent name cannot be empty');
    }

    // Validate original name format before normalization
    // Only allow letters, numbers, and hyphens (will be converted to lowercase)
    const originalNameRegex = /^[a-zA-Z0-9-]+$/;
    if (!originalNameRegex.test(args.name.trim())) {
      throw new Error('Agent name must contain only letters, numbers, and hyphens');
    }

    // Normalize name
    const normalizedName = args.name.toLowerCase().trim();

    // Check if agent with this name already exists for this user
    const existingAgent = await ctx.db
      .query('agents')
      .withIndex('by_user_and_name', (q) => q.eq('userId', args.userId).eq('name', normalizedName))
      .unique();

    if (existingAgent) {
      throw new Error('Agent with this name already exists for this user');
    }

    const now = Date.now();
    return await ctx.db.insert('agents', {
      userId: args.userId,
      name: normalizedName,
      systemPrompt: args.systemPrompt,
      provider: args.provider,
      model: args.model,
      config: args.config,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Gets an agent by ID for the authenticated user.
 *
 * @param args.agentId - The ID of the agent to retrieve
 * @param args.userId - The authenticated user ID
 * @returns The agent object or null if not found/not owned by user
 *
 * @example
 * ```typescript
 * const agent = await ctx.runQuery(api.db.agents.get, {
 *   agentId: "j123...",
 *   userId: "user_123"
 * });
 * ```
 */
export const get = query({
  args: {
    agentId: v.id('agents'),
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id('agents'),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      systemPrompt: v.string(),
      provider: v.string(),
      model: v.string(),
      config: v.optional(
        v.object({
          temperature: v.optional(v.number()),
          maxTokens: v.optional(v.number()),
          topP: v.optional(v.number()),
          reasoning: v.optional(v.boolean()),
          streamingSupported: v.optional(v.boolean()),
        }),
      ),
      active: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);

    if (!agent || agent.userId !== args.userId) {
      return null;
    }

    return agent;
  },
});

/**
 * Lists all agents for the authenticated user with optional filtering.
 *
 * @param args.userId - The authenticated user ID
 * @param args.active - Filter by active status (optional)
 * @returns Array of agents owned by the user
 *
 * @example
 * ```typescript
 * const activeAgents = await ctx.runQuery(api.db.agents.list, {
 *   userId: "user_123",
 *   active: true
 * });
 * ```
 */
export const list = query({
  args: {
    userId: v.string(),
    active: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id('agents'),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      systemPrompt: v.string(),
      provider: v.string(),
      model: v.string(),
      config: v.optional(
        v.object({
          temperature: v.optional(v.number()),
          maxTokens: v.optional(v.number()),
          topP: v.optional(v.number()),
          reasoning: v.optional(v.boolean()),
          streamingSupported: v.optional(v.boolean()),
        }),
      ),
      active: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    if (args.active !== undefined) {
      // Use the full index when active filter is specified
      return await ctx.db
        .query('agents')
        .withIndex('by_user_and_active', (q) =>
          q.eq('userId', args.userId).eq('active', args.active),
        )
        .order('desc')
        .collect();
    } else {
      // When no active filter, just query by userId
      return await ctx.db
        .query('agents')
        .withIndex('by_user_and_active', (q) => q.eq('userId', args.userId))
        .order('desc')
        .collect();
    }
  },
});
