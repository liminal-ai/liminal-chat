import { describe, it, expect, vi } from 'vitest';
import app from '../index';

// Mock the global fetch
global.fetch = vi.fn();

describe('Edge Server', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const req = new Request('http://localhost/health');
      const env = { DOMAIN_URL: 'http://localhost:8766' };
      
      const res = await app.fetch(req, env);
      const json = await res.json() as any;
      
      expect(res.status).toBe(200);
      expect(json).toMatchObject({
        status: 'ok',
        service: 'liminal-chat-edge',
        domainUrl: 'http://localhost:8766',
      });
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('POST /api/v1/llm/prompt', () => {
    it('should proxy request to domain server', async () => {
      const mockResponse = new Response(JSON.stringify({ response: 'Hello' }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);
      
      const req = new Request('http://localhost/api/v1/llm/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ content: 'Hi', role: 'user' }] }),
      });
      
      const env = { DOMAIN_URL: 'http://localhost:8766' };
      const res = await app.fetch(req, env);
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json).toEqual({ response: 'Hello' });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8766/domain/llm/prompt',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle streaming responses', async () => {
      // Create a mock readable stream that will close immediately
      const mockStream = new ReadableStream({
        start(controller) {
          controller.close();
        }
      });
      const mockResponse = new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
      
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);
      
      const req = new Request('http://localhost/api/v1/llm/prompt/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ content: 'Hello', role: 'user' }], stream: true }),
      });
      
      const env = { DOMAIN_URL: 'http://localhost:8766' };
      const res = await app.fetch(req, env);
      
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should handle domain server errors', async () => {
      const mockResponse = new Response('Internal Server Error', { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);
      
      const req = new Request('http://localhost/api/v1/llm/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ content: 'Hello', role: 'user' }] }),
      });
      
      const env = { DOMAIN_URL: 'http://localhost:8766' };
      const res = await app.fetch(req, env);
      const json = await res.json() as any;
      
      expect(res.status).toBe(500);
      expect(json.error).toContain('Domain server error');
    });
  });

  describe('GET /api/v1/llm/providers', () => {
    it('should proxy providers request', async () => {
      const mockProviders = [{ name: 'echo', displayName: 'Echo' }];
      const mockResponse = new Response(JSON.stringify(mockProviders), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);
      
      const req = new Request('http://localhost/api/v1/llm/providers');
      const env = { DOMAIN_URL: 'http://localhost:8766' };
      
      const res = await app.fetch(req, env);
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json).toEqual(mockProviders);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8766/domain/llm/providers'
      );
    });
  });

  describe('Request validation', () => {
    describe('POST /api/v1/llm/prompt', () => {
      it('should reject requests with missing Content-Type', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          body: JSON.stringify({ prompt: 'Hello' }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(415);
        expect(json.code).toBe('EDGE_INVALID_REQUEST');
        expect(json.message).toBe('Content-Type must be application/json');
      });

      it('should reject requests with invalid JSON', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json',
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(400);
        expect(json.code).toBe('EDGE_INVALID_REQUEST');
        expect(json.message).toBe('Request body must be valid JSON');
      });

      it('should reject requests with neither prompt nor messages', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'echo' }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(400);
        expect(json.code).toBe('EDGE_INVALID_REQUEST');
        expect(json.message).toBe('Either prompt or messages must be provided, but not both');
      });

      it('should reject requests with both prompt and messages', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: 'Hello',
            messages: [{ content: 'Hi', role: 'user' }]
          }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(400);
        expect(json.code).toBe('EDGE_INVALID_REQUEST');
        expect(json.message).toBe('Either prompt or messages must be provided, but not both');
      });

      it('should reject requests with empty prompt', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '' }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(400);
        expect(json.code).toBe('EDGE_VALIDATION_ERROR');
        expect(json.message).toBe('Prompt cannot be empty or whitespace only');
      });

      it('should reject requests with whitespace-only prompt', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '   \n\t  ' }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(400);
        expect(json.code).toBe('EDGE_VALIDATION_ERROR');
        expect(json.message).toBe('Prompt cannot be empty or whitespace only');
      });

      it('should reject requests with empty messages array', async () => {
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json() as any;
        
        expect(res.status).toBe(400);
        expect(json.code).toBe('EDGE_VALIDATION_ERROR');
        expect(json.message).toBe('Messages must be a non-empty array');
      });

      it('should accept valid prompt request', async () => {
        const mockResponse = new Response(JSON.stringify({ response: 'Hello' }), {
          headers: { 'Content-Type': 'application/json' },
        });
        
        vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);
        
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Hello' }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json();
        
        expect(res.status).toBe(200);
        expect(json).toEqual({ response: 'Hello' });
      });

      it('should accept valid messages request', async () => {
        const mockResponse = new Response(JSON.stringify({ response: 'Hello' }), {
          headers: { 'Content-Type': 'application/json' },
        });
        
        vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);
        
        const req = new Request('http://localhost/api/v1/llm/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ content: 'Hello', role: 'user' }] }),
        });
        const env = { DOMAIN_URL: 'http://localhost:8766' };
        
        const res = await app.fetch(req, env);
        const json = await res.json();
        
        expect(res.status).toBe(200);
        expect(json).toEqual({ response: 'Hello' });
      });
    });
  });

  describe('Undefined routes', () => {
    it('should return 404 for unknown routes', async () => {
      const req = new Request('http://localhost/unknown');
      const env = { DOMAIN_URL: 'http://localhost:8766' };
      
      const res = await app.fetch(req, env);
      const json = await res.json();
      
      expect(res.status).toBe(404);
      expect(json).toEqual({ 
        error: 'Not found',
        code: 'EDGE_NOT_FOUND',
        message: 'The requested endpoint /unknown was not found'
      });
    });
  });
});