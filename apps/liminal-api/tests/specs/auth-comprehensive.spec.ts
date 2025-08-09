import { test, expect } from '../utils/auth-fixture';
import { getInvalidToken } from '../utils/helpers';

test.describe('Comprehensive Authentication Tests', () => {
  // ===== NO TOKEN TESTS =====

  test('GET /health - no token returns 401 with header error', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('POST /api/agents - no token returns 401 with header error', async ({ request }) => {
    const response = await request.post('/api/agents', {
      data: { name: 'test', systemPrompt: 'test', provider: 'openai', model: 'gpt-4' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('POST /api/chat-text - no token returns 401 with header error', async ({ request }) => {
    const response = await request.post('/api/chat-text', {
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('POST /api/chat - no token returns 401 with header error', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { messages: [{ role: 'user', content: 'Hello' }] },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('POST /api/completion - no token returns 401 with header error', async ({ request }) => {
    const response = await request.post('/api/completion', {
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('POST /api/perplexity - no token returns 401 with header error', async ({ request }) => {
    const response = await request.post('/api/perplexity', {
      data: { query: 'test query' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('GET /api/conversations - no token returns 401 with header error', async ({ request }) => {
    const response = await request.get('/api/conversations');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  test('POST /api/conversations - no token returns 401 with header error', async ({ request }) => {
    const response = await request.post('/api/conversations', {
      data: { title: 'Test Conversation' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(/authorization header/i.test(body.error)).toBeTruthy();
  });

  // ===== INVALID TOKEN TESTS =====

  test('GET /health - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.get('/health', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('POST /api/agents - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.post('/api/agents', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { name: 'test', systemPrompt: 'test', provider: 'openai', model: 'gpt-4' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('POST /api/chat-text - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.post('/api/chat-text', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('POST /api/chat - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.post('/api/chat', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { messages: [{ role: 'user', content: 'Hello' }] },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('POST /api/completion - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.post('/api/completion', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('POST /api/perplexity - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.post('/api/perplexity', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { query: 'test query' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('GET /api/conversations - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.get('/api/conversations', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });

  test('POST /api/conversations - invalid token returns 401 with invalid token message', async ({
    request,
  }) => {
    const response = await request.post('/api/conversations', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { title: 'Test Conversation' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired authorization token');
  });
});
