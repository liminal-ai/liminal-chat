import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { Hono } from 'hono';
import {
  HonoWithConvex,
  HttpRouterWithHono as _HttpRouterWithHono,
} from 'convex-helpers/server/hono';
import { ActionCtx } from './_generated/server';
import { api } from './_generated/api';
// Svix import removed
import { Id } from './_generated/dataModel';
// Env import removed

// Create Hono app with Convex context
const app: HonoWithConvex<ActionCtx> = new Hono();

// Simple health check endpoint - no auth required for testing
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'liminal-api',
  });
});

// Clerk types removed

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

interface UpdateConversationRequest {
  title?: string;
  metadata?: {
    provider?: string;
    model?: string;
    [key: string]: unknown;
  };
}

// Clerk webhook removed

// Non-streaming text chat endpoint - returns complete text response
app.post('/api/chat-text', async (c) => {
  const ctx = c.env;
  try {
    const body = await c.req.json();
    const { prompt, model, conversationId } = body;

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Call the action with conversation support
    const result = await ctx.runAction(api.chat.simpleChatAction, {
      prompt,
      model,
      provider: body.provider,
      conversationId,
    });

    return c.json(result);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Perplexity search endpoint - enhanced web research with citations
app.post('/api/perplexity', async (c) => {
  const ctx = c.env;
  try {
    const body = await c.req.json();
    const { query, model, systemPrompt } = body;

    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
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

    const result = await ctx.runAction(api.chat.simpleChatAction, {
      prompt: finalPrompt,
      model: selectedModel,
      provider: 'perplexity',
    });

    return c.json({
      ...result,
      metadata: {
        model: selectedModel,
        provider: 'perplexity',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Perplexity endpoint error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
        provider: 'perplexity',
      },
      500,
    );
  }
});

// Conversation management endpoints
// List conversations
app.get('/api/conversations', async (c) => {
  const ctx = c.env;
  try {
    const archived = c.req.query('archived') === 'true';
    const cursor = c.req.query('cursor') || undefined;
    const limit = parseInt(c.req.query('limit') || '50');

    const result = await ctx.runQuery(api.conversations.list, {
      archived,
      paginationOpts: {
        numItems: limit,
        cursor,
      },
    });

    return c.json(result);
  } catch (error) {
    console.error('List conversations error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Create conversation
app.post('/api/conversations', async (c) => {
  const ctx = c.env;
  try {
    const body: CreateConversationRequest = await c.req.json();
    const { title, type = 'standard', metadata } = body;

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const conversationId = await ctx.runMutation(api.conversations.create, {
      title,
      type,
      metadata,
    });

    return c.json({ id: conversationId }, 201);
  } catch (error) {
    console.error('Create conversation error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Get conversation with messages - NOW WITH PROPER PATH PARAMS!
app.get('/api/conversations/:id', async (c) => {
  const ctx = c.env;
  try {
    const conversationId = c.req.param('id') as Id<'conversations'>;

    // Get conversation details
    const conversation = await ctx.runQuery(api.conversations.get, {
      conversationId,
    });

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Get messages
    const messages = await ctx.runQuery(api.messages.getAll, {
      conversationId,
    });

    return c.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Update conversation - NOW WITH PROPER PATH PARAMS!
app.patch('/api/conversations/:id', async (c) => {
  const ctx = c.env;
  try {
    const conversationId = c.req.param('id') as Id<'conversations'>;
    const body: UpdateConversationRequest = await c.req.json();
    const { title, metadata } = body;

    await ctx.runMutation(api.conversations.update, {
      conversationId,
      title,
      metadata,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Update conversation error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Archive conversation - NOW WITH PROPER PATH PARAMS!
app.delete('/api/conversations/:id', async (c) => {
  const ctx = c.env;
  try {
    const conversationId = c.req.param('id') as Id<'conversations'>;

    await ctx.runMutation(api.conversations.archive, {
      conversationId,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Archive conversation error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// For streaming endpoints, we need to handle them separately
// Create a traditional httpRouter for streaming endpoints
const http = httpRouter();

// Messages-based chat endpoint - Vercel AI SDK standard streaming
http.route({
  path: '/api/chat',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    'use node';

    const { streamText } = await import('ai');
    const { createModelForHttp, getStreamingHeaders } = await import('./ai/httpHelpers');

    try {
      const body = await request.json();
      const { messages, model: requestedModel, provider = 'openrouter', conversationId } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Messages array is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Handle conversation persistence
      const chatContext = await ctx.runAction(api.chat.streamingChatAction, {
        messages,
        model: requestedModel,
        provider,
        conversationId,
      });

      // Use helper to create model
      const model = await createModelForHttp(provider, requestedModel);

      // Stream the response with onFinish callback for persistence
      const result = streamText({
        model,
        messages,
        onFinish: async ({ text, usage, finishReason }) => {
          // Save the assistant response after streaming completes
          if (chatContext.conversationId) {
            await ctx.runMutation(api.messages.create, {
              conversationId: chatContext.conversationId,
              authorType: 'agent',
              authorId: provider,
              type: 'text',
              content: text,
              metadata: {
                model: requestedModel,
                provider,
                promptTokens: usage?.promptTokens,
                completionTokens: usage?.completionTokens,
                totalTokens: usage?.totalTokens,
                finishReason,
              },
            });
          }
        },
      });

      // Add conversationId to headers so client knows which conversation this is for
      const headers = getStreamingHeaders();
      if (chatContext.conversationId) {
        headers.set('X-Conversation-Id', chatContext.conversationId);
      }

      // Return data stream response with headers
      return result.toDataStreamResponse({ headers });
    } catch (error) {
      console.error('Chat endpoint error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),
});

// Completion endpoint - streaming with prompt (Vercel AI SDK standard)
http.route({
  path: '/api/completion',
  method: 'POST',
  handler: httpAction(async (_ctx, request) => {
    'use node';

    const { streamText } = await import('ai');
    const { createModelForHttp, getStreamingHeaders } = await import('./ai/httpHelpers');

    try {
      const body = await request.json();
      const { prompt, model: requestedModel, provider = 'openrouter' } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Use helper to create model
      const model = await createModelForHttp(provider, requestedModel);

      // Stream the response
      const result = streamText({
        model,
        prompt,
      });

      // Return data stream response with headers
      return result.toDataStreamResponse({ headers: getStreamingHeaders() });
    } catch (error) {
      console.error('Completion endpoint error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),
});

// Delegate all other routes to Hono
http.route({
  pathPrefix: '/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

http.route({
  pathPrefix: '/',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

http.route({
  pathPrefix: '/',
  method: 'PATCH',
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

http.route({
  pathPrefix: '/',
  method: 'DELETE',
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
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
 */
export default http;
