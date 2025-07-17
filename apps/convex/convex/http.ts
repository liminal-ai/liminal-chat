import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

// Create HTTP router
const http = httpRouter();

// Health check endpoint with authentication
http.route({
  path: '/health',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'liminal-api',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      // Handle authentication errors
      if (
        error instanceof Error &&
        (error.message.includes('Authentication required') ||
          error.message.includes('Invalid token'))
      ) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          service: 'liminal-api',
          error: 'Service unavailable',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),
});

// TypeScript types for conversation endpoints
interface CreateConversationRequest {
  title: string;
  type?: 'standard' | 'roundtable' | 'pipeline';
  metadata?: {
    provider?: string;
    model?: string;
    [key: string]: unknown;
  };
}

// TypeScript types for agent endpoints
interface CreateAgentRequest {
  name: string;
  systemPrompt: string;
  provider: string;
  model: string;
  config?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    reasoning?: boolean;
    streamingSupported?: boolean;
  };
}


/**
 * Common error response handler for HTTP endpoints
 */
function createErrorResponse(error: unknown, defaultStatus = 500): Response {
  // Handle authentication errors
  if (
    error instanceof Error &&
    (error.message.includes('Authentication required') ||
      error.message.includes('Invalid token'))
  ) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
    {
      status: defaultStatus,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

// Non-streaming text chat endpoint
http.route({
  path: '/api/chat-text',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body = await request.json();
      const { prompt, model, conversationId, provider } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Call the action with conversation support
      const result = await ctx.runAction(api.node.chat.simpleChatAction, {
        prompt,
        model,
        provider,
        conversationId,
      });

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Perplexity search endpoint
http.route({
  path: '/api/perplexity',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body = await request.json();
      const { query, model, systemPrompt } = body;

      if (!query) {
        return new Response(JSON.stringify({ error: 'Search query is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Enhanced system prompt for Perplexity research
      const defaultSystemPrompt = `You are a professional research assistant with access to real-time web information. Provide comprehensive, accurate, and current information with proper citations.

Guidelines:
- Always include citations and sources for your information
- Focus on authoritative and recent sources
- Provide technical details when relevant
- Structure your response clearly with headings if helpful
- If information is conflicting across sources, note the discrepancy
- Include relevant links when available`;

      const finalPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser Query: ${query}`
        : `${defaultSystemPrompt}\n\nUser Query: ${query}`;

      // Use best Perplexity model by default
      const selectedModel = model || 'llama-3.1-sonar-huge-128k-online';

      const result = await ctx.runAction(api.node.chat.simpleChatAction, {
        prompt: finalPrompt,
        model: selectedModel,
        provider: 'perplexity',
      });

      return new Response(
        JSON.stringify({
          ...result,
          metadata: {
            model: selectedModel,
            provider: 'perplexity',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      // Handle authentication errors
      if (
        error instanceof Error &&
        (error.message.includes('Authentication required') ||
          error.message.includes('Invalid token'))
      ) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          provider: 'perplexity',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),
});

// List conversations
http.route({
  path: '/api/conversations',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const url = new URL(request.url);
      const archived = url.searchParams.get('archived') === 'true';
      const cursor = url.searchParams.get('cursor') || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const result = await ctx.runQuery(api.db.conversations.list, {
        archived,
        paginationOpts: {
          numItems: limit,
          cursor,
        },
      });

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Create conversation
http.route({
  path: '/api/conversations',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body: CreateConversationRequest = await request.json();
      const { title, type = 'standard', metadata } = body;

      if (!title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const conversationId = await ctx.runMutation(api.db.conversations.create, {
        title,
        type,
        metadata,
      });

      return new Response(JSON.stringify({ id: conversationId }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Get conversation with messages
http.route({
  pathPrefix: '/api/conversations/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const conversationId = pathParts[pathParts.length - 1] as Id<'conversations'>;

      // Get conversation details
      const conversation = await ctx.runQuery(api.db.conversations.get, {
        conversationId,
      });

      if (!conversation) {
        return new Response(JSON.stringify({ error: 'Conversation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get messages
      const messages = await ctx.runQuery(api.db.messages.getAll, {
        conversationId,
      });

      return new Response(
        JSON.stringify({
          conversation,
          messages,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Update conversation
http.route({
  pathPrefix: '/api/conversations/',
  method: 'PATCH',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const conversationId = pathParts[pathParts.length - 1] as Id<'conversations'>;
      const body: UpdateConversationRequest = await request.json();
      const { title, metadata } = body;

      await ctx.runMutation(api.db.conversations.update, {
        conversationId,
        title,
        metadata,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Archive conversation
http.route({
  pathPrefix: '/api/conversations/',
  method: 'DELETE',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const conversationId = pathParts[pathParts.length - 1] as Id<'conversations'>;

      await ctx.runMutation(api.db.conversations.archive, {
        conversationId,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Seed agents (for testing and setup)
http.route({
  path: '/api/agents/seed',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;

      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body = await request.json();
      const { userId } = body;

      // Verify the requesting user matches the userId (for security)
      if (userId && userId !== user.id) {
        return new Response(JSON.stringify({ error: 'Can only seed agents for your own user' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const actualUserId = userId || user.id;

      const agentIds = await ctx.runAction(api.db.seed.seedAgents, {
        userId: actualUserId,
      });

      return new Response(JSON.stringify(agentIds), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Get seed agents (for testing and verification)
http.route({
  path: '/api/agents/seed',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;

      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const url = new URL(request.url);
      const userId = url.searchParams.get('userId') || user.id;

      // Verify the requesting user matches the userId (for security)
      if (userId !== user.id) {
        return new Response(JSON.stringify({ error: 'Can only access your own agents' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const seedAgents = await ctx.runAction(api.db.seed.getSeedAgents, {
        userId,
      });

      return new Response(JSON.stringify(seedAgents), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Create agent
http.route({
  path: '/api/agents',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;

      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body: CreateAgentRequest = await request.json();
      const { name, systemPrompt, provider, model, config } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: 'Agent name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!systemPrompt) {
        return new Response(JSON.stringify({ error: 'System prompt is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!provider) {
        return new Response(JSON.stringify({ error: 'Provider is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!model) {
        return new Response(JSON.stringify({ error: 'Model is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const agentId = await ctx.runMutation(api.db.agents.create, {
          userId: user.id,
          name,
          systemPrompt,
          provider,
          model,
          config,
        });

        // Get the created agent to return it
        const agent = await ctx.runQuery(api.db.agents.get, {
          agentId,
          userId: user.id,
        });

        return new Response(
          JSON.stringify({
            id: agentId,
            agent,
          }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      } catch (dbError) {
        if (dbError instanceof Error) {
          if (dbError.message.includes('Agent with this name already exists')) {
            return new Response(
              JSON.stringify({ error: 'Agent with this name already exists for this user' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }
          if (
            dbError.message.includes('letters, numbers, and hyphens') ||
            dbError.message.includes('Agent name cannot be empty')
          ) {
            return new Response(JSON.stringify({ error: dbError.message }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
        throw dbError;
      }
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Streaming chat endpoint
http.route({
  path: '/api/chat',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body = await request.json();
      const { messages, model: requestedModel, provider = 'openrouter', conversationId } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Messages array is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Handle conversation persistence
      const chatContext = await ctx.runAction(api.node.chat.streamingChatAction, {
        messages,
        model: requestedModel,
        provider,
        conversationId,
      });

      // Use AI service to stream response
      const { aiService } = await import('./edge/aiService');
      const result = await aiService.streamText({
        provider,
        modelId: requestedModel,
        messages,
      });

      // Add conversationId to headers
      const headers = new Headers();
      headers.set('X-Vercel-AI-Data-Stream', 'v1');
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      if (chatContext.conversationId) {
        headers.set('X-Conversation-Id', chatContext.conversationId);
      }

      // Create a streaming response that saves the result when done
      const stream = result.toDataStreamResponse({ headers });

      // Note: We'll need to handle saving the final response differently
      // since we can't use onFinish callback in edge runtime
      return stream;
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

// Streaming completion endpoint
http.route({
  path: '/api/completion',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Require authentication using Node.js action
      const authHeader = request.headers.get('Authorization') || undefined;
      const _user = await ctx.runAction(api.node.auth.requireAuth, { authHeader });

      const body = await request.json();
      const { prompt, model: requestedModel, provider = 'openrouter' } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Use AI service to stream response
      const { aiService } = await import('./edge/aiService');
      const result = await aiService.streamText({
        provider,
        modelId: requestedModel,
        prompt,
      });

      // Return streaming response
      const headers = new Headers();
      headers.set('X-Vercel-AI-Data-Stream', 'v1');
      headers.set('Content-Type', 'text/plain; charset=utf-8');

      return result.toDataStreamResponse({ headers });
    } catch (error) {
      return createErrorResponse(error);
    }
  }),
});

/**
 * HTTP router configuration for Convex.
 * Combines Hono routes for RESTful endpoints with native Convex HTTP actions for streaming.
 *
 * Available endpoints:
 * - GET /health - System health check
 * - Clerk webhook removed
 * - POST /api/chat-text - Non-streaming chat completion
 * - POST /api/chat - Streaming chat (Vercel AI SDK format)
 * - POST /api/completion - Streaming completion
 * - GET /api/conversations - List conversations
 * - POST /api/conversations - Create conversation
 * - GET /api/conversations/:id - Get conversation with messages
 * - PATCH /api/conversations/:id - Update conversation
 * - DELETE /api/conversations/:id - Archive conversation
 * - POST /api/agents - Create agent
 * - POST /api/agents/seed - Seed agents for testing
 * - GET /api/agents/seed - Get seed agents
 */
export default http;
