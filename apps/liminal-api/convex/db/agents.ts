import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

/**
 * Creates a new agent for the authenticated user.
 * Agent names must be unique per user.
 *
 * @param args.userId - The authenticated user ID from WorkOS
 * @param args.name - Unique identifier like "alice" or "jarvis" (automatically normalized to lowercase for storage)
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

    // Normalize name to lowercase for consistent storage and comparison
    // This ensures "Alice", "alice", and "ALICE" are treated as the same agent name
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
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Updates an existing agent for the authenticated user.
 * Only provided fields will be updated - partial updates are supported.
 * Agent names must be unique per user and will be normalized to lowercase.
 *
 * @param args.agentId - The ID of the agent to update
 * @param args.userId - The authenticated user ID from WorkOS
 * @param args.name - New unique identifier (optional, will be normalized)
 * @param args.systemPrompt - New personality/behavior prompt (optional)
 * @param args.provider - New provider like "openai" or "anthropic" (optional)
 * @param args.model - New model like "gpt-4" or "claude-3-sonnet" (optional)
 * @param args.config - New configuration object (optional, replaces existing)
 * @param args.archived - New archived status (optional)
 * @throws Error if agent not found, not owned by user, or name conflicts
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.db.agents.update, {
 *   agentId: "j123...",
 *   userId: "user_123",
 *   systemPrompt: "You are a more helpful assistant.",
 *   config: {
 *     temperature: 0.8,
 *     maxTokens: 2000
 *   }
 * });
 * ```
 */
export const update = mutation({
  args: {
    agentId: v.id('agents'),
    userId: v.string(),
    name: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    config: v.optional(
      v.object({
        temperature: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
        topP: v.optional(v.number()),
        reasoning: v.optional(v.boolean()),
        streamingSupported: v.optional(v.boolean()),
      }),
    ),
    archived: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get agent and validate ownership
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error('Agent not found or access denied');
    }

    if (agent.userId !== args.userId) {
      throw new Error('Agent not found or access denied');
    }

    // Handle name update if provided
    let normalizedName: string | undefined = undefined;
    if (args.name !== undefined) {
      // Check for empty name
      if (!args.name || args.name.trim().length === 0) {
        throw new Error('Agent name cannot be empty');
      }

      // Validate name format before normalization
      const originalNameRegex = /^[a-zA-Z0-9-]+$/;
      if (!originalNameRegex.test(args.name.trim())) {
        throw new Error('Agent name must contain only letters, numbers, and hyphens');
      }

      // Normalize name to lowercase
      const newNormalizedName = args.name.toLowerCase().trim();
      normalizedName = newNormalizedName;

      // Check for name conflicts with OTHER agents (not current agent)
      if (newNormalizedName !== agent.name) {
        const existingAgent = await ctx.db
          .query('agents')
          .withIndex('by_user_and_name', (q) =>
            q.eq('userId', args.userId).eq('name', newNormalizedName),
          )
          .unique();

        if (existingAgent && existingAgent._id !== args.agentId) {
          throw new Error('Agent with this name already exists for this user');
        }
      }
    }

    // Build updates object with only provided fields
    interface AgentUpdates {
      updatedAt: number;
      name?: string;
      systemPrompt?: string;
      provider?: string;
      model?: string;
      config?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        reasoning?: boolean;
        streamingSupported?: boolean;
      };
      archived?: boolean;
    }

    const updates: AgentUpdates = {
      updatedAt: Date.now(),
    };

    if (normalizedName !== undefined) {
      updates.name = normalizedName;
    }
    if (args.systemPrompt !== undefined) {
      updates.systemPrompt = args.systemPrompt;
    }
    if (args.provider !== undefined) {
      updates.provider = args.provider;
    }
    if (args.model !== undefined) {
      updates.model = args.model;
    }
    if (args.config !== undefined) {
      updates.config = args.config;
    }
    if (args.archived !== undefined) {
      updates.archived = args.archived;
    }

    // Apply updates
    await ctx.db.patch(args.agentId, updates);

    return null;
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
      archived: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);

    if (!agent || agent.userId !== args.userId || agent.archived) {
      return null;
    }

    return agent;
  },
});

/**
 * Lists all agents for the authenticated user with optional filtering.
 *
 * @param args.userId - The authenticated user ID
 * @param args.includeArchived - Include archived agents in results (optional, defaults to false)
 * @returns Array of agents owned by the user
 *
 * @example
 * ```typescript
 * const activeAgents = await ctx.runQuery(api.db.agents.list, {
 *   userId: "user_123",
 *   includeArchived: false
 * });
 * ```
 */
export const list = query({
  args: {
    userId: v.string(),
    includeArchived: v.optional(v.boolean()),
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
      archived: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    if (args.includeArchived) {
      // Return all agents regardless of archived status
      return await ctx.db
        .query('agents')
        .withIndex('by_user_and_archived', (q) => q.eq('userId', args.userId))
        .order('desc')
        .collect();
    } else {
      // Default behavior: return only non-archived agents
      return await ctx.db
        .query('agents')
        .withIndex('by_user_and_archived', (q) => q.eq('userId', args.userId).eq('archived', false))
        .order('desc')
        .collect();
    }
  },
});

/**
 * Archives (soft deletes) an agent for the authenticated user.
 * Archived agents become invisible in all queries and endpoints.
 *
 * @param args.agentId - The ID of the agent to archive
 * @param args.userId - The authenticated user ID from WorkOS
 * @returns null on success
 * @throws Error if agent not found or not owned by user
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.db.agents.archive, {
 *   agentId: "j123...",
 *   userId: "user_123"
 * });
 * ```
 */
export const archive = mutation({
  args: {
    agentId: v.id('agents'),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get agent and validate ownership
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error('Agent not found or access denied');
    }

    if (agent.userId !== args.userId) {
      throw new Error('Agent not found or access denied');
    }

    // Archive the agent
    await ctx.db.patch(args.agentId, {
      archived: true,
      updatedAt: Date.now(),
    });

    return null;
  },
});
