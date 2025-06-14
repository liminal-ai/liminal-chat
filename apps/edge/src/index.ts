import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ERROR_CODES } from '@liminal-chat/shared-utils';

type Bindings = {
  DOMAIN_URL: string;
  CORS_ALLOW_ORIGIN?: string;
  CORS_ALLOW_HEADERS?: string;
  CORS_EXPOSE_HEADERS?: string;
};

type EdgeError = {
  error: string;
  code: string;
  details?: unknown;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use('/*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'liminal-chat-edge',
    timestamp: new Date().toISOString(),
    domainUrl: c.env.DOMAIN_URL
  });
});

// Proxy LLM prompt requests to domain server (unified endpoint for streaming and non-streaming)
app.post('/api/v1/llm/prompt', async (c) => {
  try {
    const body = await c.req.json();
    const domainUrl = c.env.DOMAIN_URL;
    
    // Forward headers including Last-Event-ID for streaming requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const lastEventId = c.req.header('Last-Event-ID');
    if (lastEventId) {
      headers['Last-Event-ID'] = lastEventId;
    }
    
    // Forward request to unified domain server endpoint
    const response = await fetch(`${domainUrl}/domain/llm/prompt`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorResponse: EdgeError = {
        error: `Domain server error: ${errorText}`,
        code: ERROR_CODES.DOMAIN.INVALID_RESPONSE
      };
      return c.json(errorResponse, response.status as any);
    }

    // Handle streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      // Pass through the stream with configurable CORS headers
      const corsOrigin = c.env.CORS_ALLOW_ORIGIN || '*';
      const corsHeaders = c.env.CORS_ALLOW_HEADERS || 'Last-Event-ID';
      const corsExposeHeaders = c.env.CORS_EXPOSE_HEADERS || 'Last-Event-ID';
      
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Headers': corsHeaders,
          'Access-Control-Expose-Headers': corsExposeHeaders,
        },
      });
    }

    // Handle JSON response
    const data = await response.json() as any;
    return c.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    const errorResponse: EdgeError = {
      error: 'Failed to proxy request to domain server',
      code: ERROR_CODES.EDGE.DOMAIN_UNAVAILABLE,
      details: error instanceof Error ? error.message : undefined
    };
    return c.json(errorResponse, 500);
  }
});


// Get available providers
app.get('/api/v1/llm/providers', async (c) => {
  try {
    const domainUrl = c.env.DOMAIN_URL;
    const response = await fetch(`${domainUrl}/domain/llm/providers`);
    
    if (!response.ok) {
      const errorResponse: EdgeError = {
        error: 'Failed to fetch providers',
        code: ERROR_CODES.DOMAIN.INVALID_RESPONSE
      };
      return c.json(errorResponse, response.status as any);
    }
    
    const data = await response.json() as any;
    return c.json(data);
  } catch (error) {
    console.error('Providers fetch error:', error);
    const errorResponse: EdgeError = {
      error: 'Failed to fetch providers',
      code: ERROR_CODES.EDGE.DOMAIN_UNAVAILABLE,
      details: error instanceof Error ? error.message : undefined
    };
    return c.json(errorResponse, 500);
  }
});

// Catch-all for undefined routes
app.all('*', (c) => {
  const errorResponse: EdgeError = {
    error: 'Not found',
    code: ERROR_CODES.EDGE.NOT_FOUND
  };
  return c.json(errorResponse, 404);
});

export default app;