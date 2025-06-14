import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EdgeClient } from './edge-client';
import { ProviderStreamEvent } from '@liminal-chat/shared-types';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

const mockFetch = vi.mocked(fetch);

describe('EdgeClient', () => {
  let client: EdgeClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new EdgeClient('http://localhost:8787');
  });

  describe('constructor', () => {
    it('should accept string URL for backward compatibility', () => {
      const clientWithString = new EdgeClient('http://example.com');
      expect(clientWithString).toBeDefined();
    });

    it('should accept config object', () => {
      const clientWithConfig = new EdgeClient({
        baseUrl: 'http://example.com',
        apiKey: 'test-key',
        timeout: 60000
      });
      expect(clientWithConfig).toBeDefined();
    });
  });

  describe('health', () => {
    it('should return health status on success', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2025-01-20T10:00:00Z',
        domain_available: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as any);

      const result = await client.health();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/health',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
      );
    });

    it('should throw error on connection refused', async () => {
      const error = new Error('fetch failed');
      (error as any).code = 'ECONNREFUSED';
      mockFetch.mockRejectedValueOnce(error);

      await expect(client.health()).rejects.toThrow('Cannot connect to server at http://localhost:8787');
    });
  });

  describe('prompt', () => {
    it('should send prompt and return response', async () => {
      const mockResponse = {
        content: 'Echo: Hello',
        model: 'echo-1.0',
        usage: {
          promptTokens: 2,
          completionTokens: 3,
          totalTokens: 5
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as any);

      const result = await client.prompt('Hello');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/llm/prompt',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ prompt: 'Hello' })
        })
      );
    });

    it('should include provider in request when specified', async () => {
      const mockResponse = {
        content: '2 + 2 = 4',
        model: 'gpt-4.1',
        usage: {
          promptTokens: 5,
          completionTokens: 8,
          totalTokens: 13
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as any);

      const result = await client.prompt('What is 2+2?', { provider: 'openai' });
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/llm/prompt',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ prompt: 'What is 2+2?', provider: 'openai' })
        })
      );
    });

    it('should not include provider field when not specified', async () => {
      const mockResponse = {
        content: 'Echo: Test',
        model: 'echo-1.0',
        usage: {
          promptTokens: 1,
          completionTokens: 2,
          totalTokens: 3
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as any);

      await client.prompt('Test', {});
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/llm/prompt',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ prompt: 'Test' })
        })
      );
    });

    it('should throw error on API error response', async () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Prompt is required'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse
      } as any);

      await expect(client.prompt('')).rejects.toThrow('Prompt is required');
    });

    it('should return token usage from response', async () => {
      const mockResponse = {
        content: 'Echo: Test',
        model: 'echo-1.0',
        usage: {
          promptTokens: 5,
          completionTokens: 10,
          totalTokens: 15
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as any);

      const result = await client.prompt('Test');
      expect(result.usage.totalTokens).toBe(15);
      expect(result.usage.promptTokens).toBe(5);
      expect(result.usage.completionTokens).toBe(10);
    });

    it('should handle provider not found error', async () => {
      const errorResponse = {
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: "Provider 'invalid' not found. Available providers: echo, openai"
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorResponse
      } as any);

      await expect(client.prompt('Test', { provider: 'invalid' }))
        .rejects.toThrow("Provider 'invalid' not found. Available providers: echo, openai");
    });

    it('should handle provider not configured error', async () => {
      const errorResponse = {
        error: {
          code: 'PROVIDER_NOT_CONFIGURED',
          message: "Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable."
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse
      } as any);

      await expect(client.prompt('Test', { provider: 'openai' }))
        .rejects.toThrow("Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable.");
    });
  });

  describe('getProviders', () => {
    it('should fetch and return provider list', async () => {
      const mockProviders = {
        defaultProvider: 'echo',
        availableProviders: ['echo', 'openai'],
        providers: {
          echo: {
            available: true,
            status: 'healthy',
            models: ['echo-1.0'],
            description: 'Echo provider for testing'
          },
          openai: {
            available: false,
            status: 'unhealthy',
            models: ['o4-mini', 'gpt-4.1'],
            description: 'OpenAI GPT models (requires OPENAI_API_KEY)'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProviders
      } as any);

      const result = await client.getProviders();
      expect(result).toEqual(mockProviders);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/llm/providers',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
      );
    });

    it('should handle connection error for providers', async () => {
      const error = new Error('fetch failed');
      (error as any).code = 'ECONNREFUSED';
      mockFetch.mockRejectedValueOnce(error);

      await expect(client.getProviders())
        .rejects.toThrow('Cannot connect to server at http://localhost:8787');
    });

    it('should handle server error for providers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal server error' } })
      } as any);

      await expect(client.getProviders())
        .rejects.toThrow('Internal server error');
    });
  });

  describe('streamChat', () => {
    it('should send correct headers and request body', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type":"content","data":"Hello","eventId":"test-1"}\n') })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type":"done","eventId":"test-2"}\n') })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: vi.fn()
      };

      const mockResponse = {
        ok: true,
        body: {
          getReader: () => mockReader
        }
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const events: ProviderStreamEvent[] = [];
      
      for await (const event of client.streamChat('Hello', { provider: 'openrouter', lastEventId: 'last-123' })) {
        events.push(event);
      }

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/llm/prompt',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Last-Event-ID': 'last-123'
          }),
          body: expect.stringContaining('"prompt":"Hello"') && 
                expect.stringContaining('"provider":"openrouter"') &&
                expect.stringContaining('"stream":true')
        })
      );

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({
        type: 'content',
        data: 'Hello',
        eventId: 'test-1'
      });
      expect(events[1]).toEqual({
        type: 'done',
        eventId: 'test-2'
      });
    });

    it('should parse SSE events correctly', async () => {
      const sseData = [
        'data: {"type":"content","data":"Hello","eventId":"1"}\n',
        'data: {"type":"content","data":" World","eventId":"2"}\n',
        ': comment line\n',
        'data: {"type":"usage","data":{"promptTokens":2,"completionTokens":3,"totalTokens":5,"model":"test"},"eventId":"3"}\n',
        'data: {"type":"done","eventId":"4"}\n'
      ].join('');

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(sseData) })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: vi.fn()
      };

      const mockResponse = {
        ok: true,
        body: { getReader: () => mockReader }
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const events: ProviderStreamEvent[] = [];
      
      for await (const event of client.streamChat('Test')) {
        events.push(event);
      }

      expect(events).toHaveLength(4);
      expect(events[0]).toEqual({ type: 'content', data: 'Hello', eventId: '1' });
      expect(events[1]).toEqual({ type: 'content', data: ' World', eventId: '2' });
      expect(events[2]).toEqual({ 
        type: 'usage', 
        data: { promptTokens: 2, completionTokens: 3, totalTokens: 5, model: 'test' },
        eventId: '3'
      });
      expect(events[3]).toEqual({ type: 'done', eventId: '4' });
    });

    it('should handle [DONE] signal correctly', async () => {
      const sseData = 'data: {"type":"content","data":"Test","eventId":"1"}\ndata: [DONE]\n';

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(sseData) })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: vi.fn()
      };

      const mockResponse = {
        ok: true,
        body: { getReader: () => mockReader }
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const events: ProviderStreamEvent[] = [];
      
      for await (const event of client.streamChat('Test')) {
        events.push(event);
      }

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ type: 'content', data: 'Test', eventId: '1' });
    });

    it('should handle malformed JSON gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const sseData = 'data: {invalid json}\ndata: {"type":"content","data":"Valid","eventId":"1"}\ndata: [DONE]\n';

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(sseData) })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: vi.fn()
      };

      const mockResponse = {
        ok: true,
        body: { getReader: () => mockReader }
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const events: ProviderStreamEvent[] = [];
      
      for await (const event of client.streamChat('Test')) {
        events.push(event);
      }

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ type: 'content', data: 'Valid', eventId: '1' });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse SSE event:', '{invalid json}');
      
      consoleSpy.mockRestore();
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' })
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(async () => {
        for await (const event of client.streamChat('Test')) {
          // Should not reach here
        }
      }).rejects.toThrow('Bad request');
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      (error as any).code = 'ECONNREFUSED';
      
      mockFetch.mockRejectedValue(error);

      await expect(async () => {
        for await (const event of client.streamChat('Test')) {
          // Should not reach here
        }
      }).rejects.toThrow('Cannot connect to server at http://localhost:8787');
    });
  });
});