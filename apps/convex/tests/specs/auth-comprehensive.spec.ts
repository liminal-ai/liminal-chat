import { test, expect } from '../utils/auth-fixture';
import { getInvalidToken } from '../utils/helpers';

test.describe('Comprehensive Authentication Tests', () => {
  // ===== NO TOKEN TESTS =====

  test('GET /health - no token returns 401', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(401);
  });

  test('POST /api/agents - no token returns 401', async ({ request }) => {
    const response = await request.post('/api/agents', {
      data: { name: 'test', systemPrompt: 'test', provider: 'openai', model: 'gpt-4' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/chat-text - no token returns 401', async ({ request }) => {
    const response = await request.post('/api/chat-text', {
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/chat-stream - no token returns 401', async ({ request }) => {
    const response = await request.post('/api/chat-stream', {
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /api/conversations - no token returns 401', async ({ request }) => {
    const response = await request.get('/api/conversations');
    expect(response.status()).toBe(401);
  });

  test('POST /api/conversations - no token returns 401', async ({ request }) => {
    const response = await request.post('/api/conversations', {
      data: { title: 'Test Conversation' },
    });
    expect(response.status()).toBe(401);
  });

  // ===== INVALID TOKEN TESTS =====

  test('GET /health - invalid token returns 401', async ({ request }) => {
    const response = await request.get('/health', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/agents - invalid token returns 401', async ({ request }) => {
    const response = await request.post('/api/agents', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { name: 'test', systemPrompt: 'test', provider: 'openai', model: 'gpt-4' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/chat-text - invalid token returns 401', async ({ request }) => {
    const response = await request.post('/api/chat-text', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/chat-stream - invalid token returns 401', async ({ request }) => {
    const response = await request.post('/api/chat-stream', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { prompt: 'Hello' },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /api/conversations - invalid token returns 401', async ({ request }) => {
    const response = await request.get('/api/conversations', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/conversations - invalid token returns 401', async ({ request }) => {
    const response = await request.post('/api/conversations', {
      headers: { Authorization: `Bearer ${getInvalidToken()}` },
      data: { title: 'Test Conversation' },
    });
    expect(response.status()).toBe(401);
  });
});
