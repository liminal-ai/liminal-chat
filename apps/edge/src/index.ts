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
  message: string;
  details?: unknown;
};

/**
 * Parses Domain error response and extracts proper error structure
 * Falls back to raw text if JSON parsing fails
 */
function parseDomainError(errorText: string, statusCode: number, statusText: string): EdgeError {
  try {
    const parsed = JSON.parse(errorText);
    
    // If Domain returned a structured error, extract the fields
    if (parsed && typeof parsed === 'object' && parsed.error && parsed.code) {
      return {
        error: parsed.error,
        code: parsed.code,
        message: parsed.message || `Domain service error: ${statusCode} ${statusText}`,
        details: parsed.details
      };
    }
    
    // If JSON but not structured error, treat as raw content
    return {
      error: `Domain server error: ${errorText}`,
      code: ERROR_CODES.DOMAIN.INVALID_RESPONSE,
      message: `Domain service returned error: ${statusCode} ${statusText}`
    };
  } catch {
    // Not JSON, treat as raw text
    return {
      error: `Domain server error: ${errorText}`,
      code: ERROR_CODES.DOMAIN.INVALID_RESPONSE,
      message: `Domain service returned error: ${statusCode} ${statusText}`
    };
  }
}

/**
 * Validates request content type
 */
function validateContentType(request: Request): EdgeError | null {
  const contentType = request.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    return {
      error: 'Invalid Content-Type',
      code: ERROR_CODES.EDGE.INVALID_REQUEST,
      message: 'Content-Type must be application/json'
    };
  }
  return null;
}

/**
 * Validates request body for prompt endpoints
 * Matches Domain's OneOfPromptOrMessagesConstraint logic
 */
function validatePromptRequest(body: any): EdgeError | null {
  // Check if request body is valid
  if (!body || typeof body !== 'object') {
    return {
      error: 'Invalid request body',
      code: ERROR_CODES.EDGE.INVALID_REQUEST,
      message: 'Request body must be a valid JSON object'
    };
  }

  const hasPrompt = body.prompt !== undefined && body.prompt !== null;
  const hasMessages = body.messages !== undefined && body.messages !== null;

  // Exactly one should be provided (matching Domain's OneOfPromptOrMessagesConstraint)
  if (!(hasPrompt && !hasMessages) && !(!hasPrompt && hasMessages)) {
    return {
      error: 'Invalid request format',
      code: ERROR_CODES.EDGE.INVALID_REQUEST,
      message: 'Either prompt or messages must be provided, but not both'
    };
  }

  // Validate prompt if provided
  if (hasPrompt) {
    if (typeof body.prompt !== 'string' || body.prompt.trim() === '') {
      return {
        error: 'Invalid prompt',
        code: ERROR_CODES.EDGE.VALIDATION_ERROR,
        message: 'Prompt cannot be empty or whitespace only'
      };
    }
  }

  // Validate messages if provided
  if (hasMessages) {
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return {
        error: 'Invalid messages',
        code: ERROR_CODES.EDGE.VALIDATION_ERROR,
        message: 'Messages must be a non-empty array'
      };
    }
  }

  return null;
}

/**
 * Max request size in bytes (1MB)
 */
const MAX_REQUEST_SIZE = 1024 * 1024;

/**
 * Validates request size
 */
function validateRequestSize(request: Request): EdgeError | null {
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return {
      error: 'Request too large',
      code: ERROR_CODES.EDGE.INVALID_REQUEST,
      message: `Request size cannot exceed ${MAX_REQUEST_SIZE} bytes`
    };
  }
  return null;
}

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

// Proxy LLM prompt requests to domain server (non-streaming)
app.post('/api/v1/llm/prompt', async (c) => {
  try {
    // Validate Content-Type
    const contentTypeError = validateContentType(c.req.raw);
    if (contentTypeError) {
      return c.json(contentTypeError, 415);
    }

    // Validate request size
    const sizeError = validateRequestSize(c.req.raw);
    if (sizeError) {
      return c.json(sizeError, 413);
    }

    let body: any;
    try {
      body = await c.req.json();
    } catch (error) {
      const parseError: EdgeError = {
        error: 'Invalid JSON',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Request body must be valid JSON'
      };
      return c.json(parseError, 400);
    }

    // Validate prompt request
    const validationError = validatePromptRequest(body);
    if (validationError) {
      return c.json(validationError, 400);
    }

    const domainUrl = c.env.DOMAIN_URL;
    
    // Forward request to domain server
    const response = await fetch(`${domainUrl}/domain/llm/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorResponse = parseDomainError(errorText, response.status, response.statusText);
      return c.json(errorResponse, response.status as any);
    }

    // Handle JSON response
    const data = await response.json() as any;
    return c.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    const errorResponse: EdgeError = {
      error: 'Failed to proxy request to domain server',
      code: ERROR_CODES.EDGE.DOMAIN_UNAVAILABLE,
      message: 'Domain service is currently unavailable. Please try again later.',
      details: error instanceof Error ? error.message : undefined
    };
    return c.json(errorResponse, 500);
  }
});

// Dedicated streaming endpoint for LLM prompt requests
app.post('/api/v1/llm/prompt/stream', async (c) => {
  try {
    // Validate Content-Type
    const contentTypeError = validateContentType(c.req.raw);
    if (contentTypeError) {
      return c.json(contentTypeError, 415);
    }

    // Validate request size
    const sizeError = validateRequestSize(c.req.raw);
    if (sizeError) {
      return c.json(sizeError, 413);
    }

    let body: any;
    try {
      body = await c.req.json();
    } catch (error) {
      const parseError: EdgeError = {
        error: 'Invalid JSON',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Request body must be valid JSON'
      };
      return c.json(parseError, 400);
    }

    // Validate prompt request
    const validationError = validatePromptRequest(body);
    if (validationError) {
      return c.json(validationError, 400);
    }

    const domainUrl = c.env.DOMAIN_URL;
    
    // Validate that stream is true in the request body
    if (!body.stream) {
      const errorResponse: EdgeError = {
        error: 'Invalid streaming request',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Streaming endpoint requires stream: true in request body'
      };
      return c.json(errorResponse, 400);
    }
    
    // Forward headers including Last-Event-ID for streaming requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const lastEventId = c.req.header('Last-Event-ID');
    if (lastEventId) {
      headers['Last-Event-ID'] = lastEventId;
    }
    
    // Forward request to domain server
    const response = await fetch(`${domainUrl}/domain/llm/prompt`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // For streaming endpoints, we need to handle errors carefully
      const errorText = await response.text();
      const errorData = parseDomainError(errorText, response.status, response.statusText);
      
      // Check if this is a validation error that should return JSON
      if (response.status >= 400 && response.status < 500) {
        return c.json(errorData, response.status as any);
      }
      
      // For server errors, return as SSE error event
      const corsOrigin = c.env.CORS_ALLOW_ORIGIN || '*';
      const corsHeaders = c.env.CORS_ALLOW_HEADERS || 'Last-Event-ID';
      const corsExposeHeaders = c.env.CORS_EXPOSE_HEADERS || 'Last-Event-ID';
      
      const sseError = `event: error\ndata: ${JSON.stringify(errorData)}\n\n`;
      
      return new Response(sseError, {
        status: 200,
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

    // Handle streaming response - should always be SSE from domain
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      // Transform the stream to client-friendly format
      const corsOrigin = c.env.CORS_ALLOW_ORIGIN || '*';
      const corsHeaders = c.env.CORS_ALLOW_HEADERS || 'Last-Event-ID';
      const corsExposeHeaders = c.env.CORS_EXPOSE_HEADERS || 'Last-Event-ID';
      
      // Create a transform stream that processes SSE events
      const transformedStream = new ReadableStream({
        start(controller) {
          const processStream = async () => {
            try {
              const reader = response.body?.getReader();
              if (!reader) {
                controller.close();
                return;
              }

              const decoder = new TextDecoder();
              let buffer = '';
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // Process complete SSE events
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                
                let currentEvent: any = {};
                
                for (const line of lines) {
                  if (line.startsWith('id:')) {
                    currentEvent.id = line.substring(3).trim();
                  } else if (line.startsWith('event:')) {
                    currentEvent.event = line.substring(6).trim();
                  } else if (line.startsWith('data:')) {
                    currentEvent.data = line.substring(5).trim();
                  } else if (line === '') {
                    // End of event, process and transform it
                    if (currentEvent.event) {
                      let transformedData = currentEvent.data;
                      
                      if (currentEvent.event === 'content') {
                        // Transform content events: extract just the text content
                        try {
                          const contentObj = JSON.parse(currentEvent.data);
                          if (contentObj.delta && typeof contentObj.delta === 'string') {
                            transformedData = JSON.stringify(contentObj.delta);
                          }
                        } catch (e) {
                          // If parsing fails, keep original data
                        }
                      } else if (currentEvent.event === 'done') {
                        // Transform done events: empty data
                        transformedData = '';
                      } else if (currentEvent.event === 'error' || currentEvent.event === 'usage') {
                        // Keep error and usage events as-is (already JSON stringified)
                        transformedData = currentEvent.data;
                      }
                      
                      // Write transformed event
                      let eventMessage = '';
                      if (currentEvent.id) {
                        eventMessage += `id: ${currentEvent.id}\n`;
                      }
                      eventMessage += `event: ${currentEvent.event}\n`;
                      eventMessage += `data: ${transformedData}\n\n`;
                      
                      controller.enqueue(new TextEncoder().encode(eventMessage));
                    }
                    currentEvent = {};
                  }
                }
              }
              
              // Process any remaining event in buffer when stream ends
              if (buffer.trim()) {
                const lines = buffer.split('\n');
                let currentEvent: any = {};
                
                for (const line of lines) {
                  if (line.startsWith('id:')) {
                    currentEvent.id = line.substring(3).trim();
                  } else if (line.startsWith('event:')) {
                    currentEvent.event = line.substring(6).trim();
                  } else if (line.startsWith('data:')) {
                    currentEvent.data = line.substring(5).trim();
                  }
                }
                
                // Process final event if it exists
                if (currentEvent.event) {
                  let transformedData = currentEvent.data;
                  
                  if (currentEvent.event === 'content') {
                    try {
                      const contentObj = JSON.parse(currentEvent.data);
                      if (contentObj.delta && typeof contentObj.delta === 'string') {
                        transformedData = JSON.stringify(contentObj.delta);
                      }
                    } catch (e) {
                      // If parsing fails, keep original data
                    }
                  } else if (currentEvent.event === 'done') {
                    transformedData = '';
                  } else if (currentEvent.event === 'error' || currentEvent.event === 'usage') {
                    transformedData = currentEvent.data;
                  }
                  
                  // Write final transformed event
                  let eventMessage = '';
                  if (currentEvent.id) {
                    eventMessage += `id: ${currentEvent.id}\n`;
                  }
                  eventMessage += `event: ${currentEvent.event}\n`;
                  eventMessage += `data: ${transformedData}\n\n`;
                  
                  controller.enqueue(new TextEncoder().encode(eventMessage));
                }
              }
              
              controller.close();
            } catch (error) {
              console.error('Stream processing error:', error);
              controller.error(error);
            }
          };
          
          processStream();
        },
      });
      
      return new Response(transformedStream, {
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

    // If domain doesn't return streaming response, this is an error
    const errorResponse: EdgeError = {
      error: 'Domain server did not return streaming response',
      code: ERROR_CODES.DOMAIN.INVALID_RESPONSE,
      message: 'Domain service returned non-streaming response for streaming request'
    };
    return c.json(errorResponse, 500);
  } catch (error) {
    console.error('Streaming proxy error:', error);
    
    // For streaming endpoints, return errors as SSE events when possible
    const corsOrigin = c.env.CORS_ALLOW_ORIGIN || '*';
    const corsHeaders = c.env.CORS_ALLOW_HEADERS || 'Last-Event-ID';
    const corsExposeHeaders = c.env.CORS_EXPOSE_HEADERS || 'Last-Event-ID';
    
    const errorData = {
      error: 'Failed to proxy streaming request to domain server',
      code: ERROR_CODES.EDGE.DOMAIN_UNAVAILABLE,
      message: 'Domain service is currently unavailable. Please try again later.',
      details: error instanceof Error ? error.message : undefined
    };
    
    const sseError = `event: error\ndata: ${JSON.stringify(errorData)}\n\n`;
    
    return new Response(sseError, {
      status: 200,
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
});


// Get available providers
app.get('/api/v1/llm/providers', async (c) => {
  try {
    const domainUrl = c.env.DOMAIN_URL;
    const response = await fetch(`${domainUrl}/domain/llm/providers`);
    
    if (!response.ok) {
      const errorResponse: EdgeError = {
        error: 'Failed to fetch providers',
        code: ERROR_CODES.DOMAIN.INVALID_RESPONSE,
        message: `Unable to retrieve providers: ${response.status} ${response.statusText}`
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
      message: 'Unable to retrieve providers. Domain service is currently unavailable.',
      details: error instanceof Error ? error.message : undefined
    };
    return c.json(errorResponse, 500);
  }
});

// Catch-all for undefined routes
app.all('*', (c) => {
  const errorResponse: EdgeError = {
    error: 'Not found',
    code: ERROR_CODES.EDGE.NOT_FOUND,
    message: `The requested endpoint ${c.req.path} was not found`
  };
  return c.json(errorResponse, 404);
});

export default app;