import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ERROR_CODES } from '@liminal-chat/shared-utils';
import { 
  validateContentType, 
  validateRequestSize, 
  validatePromptRequest, 
  parseDomainError,
  type EdgeError 
} from './validation';

type Bindings = {
  DOMAIN_URL: string;
  CORS_ALLOW_ORIGIN?: string;
  CORS_ALLOW_HEADERS?: string;
  CORS_EXPOSE_HEADERS?: string;
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

// Proxy LLM prompt requests to domain server (non-streaming)
app.post('/api/v1/llm/prompt', async (c) => {
  try {
    // Validate Content-Type
    const contentTypeValidation = validateContentType(c.req.raw.headers.get('Content-Type') || '');
    if (!contentTypeValidation.isValid) {
      const errorResponse: EdgeError = {
        error: 'Invalid Content-Type',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: contentTypeValidation.errors.join(', ')
      };
      return c.json(errorResponse, 415);
    }

    let bodyText: string;
    try {
      bodyText = await c.req.text();
    } catch (error) {
      const parseError: EdgeError = {
        error: 'Failed to read request body',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Unable to read request body'
      };
      return c.json(parseError, 400);
    }

    // Validate request size
    const sizeValidation = validateRequestSize(bodyText);
    if (!sizeValidation.isValid) {
      const errorResponse: EdgeError = {
        error: 'Request too large',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: sizeValidation.errors.join(', ')
      };
      return c.json(errorResponse, 413);
    }

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      const parseError: EdgeError = {
        error: 'Invalid JSON',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Request body must be valid JSON'
      };
      return c.json(parseError, 400);
    }

    // Validate prompt request
    const promptValidation = validatePromptRequest(body);
    if (!promptValidation.isValid) {
      // Use VALIDATION_ERROR code for prompt/message validation issues
      const isEmptyPromptOrMessages = promptValidation.errors.some(err => 
        err.includes('empty') || err.includes('whitespace') || err.includes('non-empty array')
      );
      const errorCode = isEmptyPromptOrMessages ? ERROR_CODES.EDGE.VALIDATION_ERROR : ERROR_CODES.EDGE.INVALID_REQUEST;
      
      const errorResponse: EdgeError = {
        error: promptValidation.errors[0].includes('must be provided') ? 'Invalid request format' : 
               promptValidation.errors[0].includes('empty') || promptValidation.errors[0].includes('whitespace') ? 'Invalid prompt' :
               promptValidation.errors[0].includes('non-empty array') ? 'Invalid messages' : 'Invalid request format',
        code: errorCode,
        message: promptValidation.errors.join(', ')
      };
      return c.json(errorResponse, 400);
    }

    const domainUrl = c.env.DOMAIN_URL;
    
    // Forward request to domain server
    const response = await fetch(`${domainUrl}/domain/llm/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorResponse = parseDomainError(response, errorText);
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
    const contentTypeValidation = validateContentType(c.req.raw.headers.get('Content-Type') || '');
    if (!contentTypeValidation.isValid) {
      const errorResponse: EdgeError = {
        error: 'Invalid Content-Type',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: contentTypeValidation.errors.join(', ')
      };
      return c.json(errorResponse, 415);
    }

    let bodyText: string;
    try {
      bodyText = await c.req.text();
    } catch (error) {
      const parseError: EdgeError = {
        error: 'Failed to read request body',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Unable to read request body'
      };
      return c.json(parseError, 400);
    }

    // Validate request size
    const sizeValidation = validateRequestSize(bodyText);
    if (!sizeValidation.isValid) {
      const errorResponse: EdgeError = {
        error: 'Request too large',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: sizeValidation.errors.join(', ')
      };
      return c.json(errorResponse, 413);
    }

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      const parseError: EdgeError = {
        error: 'Invalid JSON',
        code: ERROR_CODES.EDGE.INVALID_REQUEST,
        message: 'Request body must be valid JSON'
      };
      return c.json(parseError, 400);
    }

    // Validate prompt request
    const promptValidation = validatePromptRequest(body);
    if (!promptValidation.isValid) {
      // Use VALIDATION_ERROR code for prompt/message validation issues
      const isEmptyPromptOrMessages = promptValidation.errors.some(err => 
        err.includes('empty') || err.includes('whitespace') || err.includes('non-empty array')
      );
      const errorCode = isEmptyPromptOrMessages ? ERROR_CODES.EDGE.VALIDATION_ERROR : ERROR_CODES.EDGE.INVALID_REQUEST;
      
      const errorResponse: EdgeError = {
        error: promptValidation.errors[0].includes('must be provided') ? 'Invalid request format' : 
               promptValidation.errors[0].includes('empty') || promptValidation.errors[0].includes('whitespace') ? 'Invalid prompt' :
               promptValidation.errors[0].includes('non-empty array') ? 'Invalid messages' : 'Invalid request format',
        code: errorCode,
        message: promptValidation.errors.join(', ')
      };
      return c.json(errorResponse, 400);
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
      body: bodyText,
    });

    if (!response.ok) {
      // For streaming endpoints, we need to handle errors carefully
      const errorText = await response.text();
      const errorData = parseDomainError(response, errorText);
      
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