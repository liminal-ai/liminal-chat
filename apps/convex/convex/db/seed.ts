import { v } from 'convex/values';
import { action } from '../_generated/server';
import { api } from '../_generated/api';
import { Id } from '../_generated/dataModel';

/**
 * Seeds the database with 3 pre-configured agents for testing and demonstration.
 * These agents represent different personalities and LLM provider configurations.
 *
 * Agents created:
 * - Alice: Technical analyst (OpenAI GPT-4)
 * - Bob: Creative strategist (Anthropic Claude-3-Sonnet)
 * - Carol: Critical thinker (OpenAI GPT-4o)
 *
 * @param args.userId - The user ID to associate with the seeded agents
 * @returns Array of created agent IDs (empty if agents already exist)
 *
 * @example
 * ```typescript
 * const agentIds = await ctx.runMutation(api.db.seed.seedAgents, {
 *   userId: "user_123"
 * });
 * ```
 */
export const seedAgents = action({
  args: {
    userId: v.string(),
  },
  returns: v.array(v.id('agents')),
  handler: async (ctx, args): Promise<Id<'agents'>[]> => {
    const { userId } = args;

    // Define the seed agents configuration
    const seedAgentConfigs = [
      {
        name: 'alice',
        systemPrompt: `You are Alice, a technical analyst with expertise in system architecture and data-driven decision making. Your approach is methodical and evidence-based. When participating in discussions:

- Break down complex problems into manageable components
- Focus on technical feasibility and implementation details
- Provide data-driven analysis and concrete recommendations
- Ask clarifying questions about requirements and constraints
- Emphasize best practices and proven methodologies

Keep your responses analytical but accessible, and always ground your suggestions in practical experience.`,
        provider: 'openai',
        model: 'gpt-4',
        config: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
      {
        name: 'bob',
        systemPrompt: `You are Bob, a creative strategist who thrives on innovative thinking and exploring unconventional approaches. Your role is to inspire breakthrough ideas and find novel connections. When participating in discussions:

- Generate multiple creative alternatives and possibilities
- Build upon others' ideas to create something new
- Challenge conventional thinking with "what if" scenarios
- Connect seemingly unrelated concepts to spark innovation
- Focus on future opportunities and emerging trends

Keep your responses energetic and possibility-focused, encouraging bold thinking while remaining constructive.`,
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        config: {
          temperature: 0.9,
          maxTokens: 1200,
        },
      },
      {
        name: 'carol',
        systemPrompt: `You are Carol, a critical thinker focused on thorough analysis and risk assessment. Your role is to ensure ideas are robust and well-examined. When participating in discussions:

- Identify potential problems, gaps, and weak points in proposals
- Ask probing questions to test assumptions and logic
- Analyze risks and unintended consequences
- Ensure thoroughness and attention to detail
- Challenge ideas constructively to strengthen them

Keep your responses thoughtful and precise, helping to refine ideas through careful examination.`,
        provider: 'openai',
        model: 'gpt-4o',
        config: {
          temperature: 0.3,
          maxTokens: 800,
        },
      },
    ];

    // Check which agents already exist to ensure idempotency
    const existingAgents: any[] = await ctx.runQuery(api.db.agents.list, {
      userId,
    });

    const existingNames = new Set(existingAgents.map((agent: any) => agent.name));
    const existingAgentMap = new Map(existingAgents.map((agent: any) => [agent.name, agent._id]));
    const seedAgentIds: Id<'agents'>[] = [];

    // Create agents that don't exist, collect IDs of all seed agents
    for (const config of seedAgentConfigs) {
      if (!existingNames.has(config.name)) {
        try {
          const agentId = await ctx.runMutation(api.db.agents.create, {
            userId,
            name: config.name,
            systemPrompt: config.systemPrompt,
            provider: config.provider,
            model: config.model,
            config: config.config,
          });
          seedAgentIds.push(agentId);
        } catch (error) {
          // If creation fails for any reason, log but continue with other agents
          console.error(`Failed to create seed agent ${config.name}:`, error);
        }
      } else {
        const existingId = existingAgentMap.get(config.name);
        if (existingId) {
          seedAgentIds.push(existingId);
        }
      }
    }

    return seedAgentIds;
  },
});

/**
 * Gets all seed agents for a user, useful for verification.
 *
 * @param args.userId - The user ID to query agents for
 * @returns Array of seed agents (alice, bob, carol) if they exist
 */
export const getSeedAgents = action({
  args: {
    userId: v.string(),
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
  handler: async (ctx, args): Promise<any[]> => {
    const seedNames = ['alice', 'bob', 'carol'];

    const agents: any[] = await ctx.runQuery(api.db.agents.list, {
      userId: args.userId,
    });

    // Filter to only include seed agents and sort by name for consistency
    return agents
      .filter((agent: any) => seedNames.includes(agent.name))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  },
});
