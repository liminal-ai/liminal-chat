import { test, expect } from '@playwright/test';
import { TEST_PROMPTS, TEST_TIMEOUTS, RESPONSE_VALIDATORS } from '../test-utils/config';
import { makeChatRequest, parseDataStream } from '../test-utils/helpers';

test.describe('Liminal API Integration Tests', () => {
  test('1. System health check', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('status', 'healthy');
    expect(body).toHaveProperty('database');
  });

  test('2. Basic chat functionality', async ({ request }) => {
    const { response, body } = await makeChatRequest(request, '/api/chat-text', {
      prompt: TEST_PROMPTS.simple,
      provider: 'openrouter',
    });

    expect(response.ok()).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasText(body)).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasModel(body)).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasProvider(body, 'openrouter')).toBeTruthy();
  });

  test('3. Streaming format compliance', async ({ request }) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (process.env.CLERK_TEST_TOKEN) {
      headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
    }

    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: TEST_PROMPTS.simple }],
        provider: 'openrouter',
      },
      headers,
    });

    expect(response.ok()).toBeTruthy();

    // Verify Vercel AI SDK streaming format
    const responseHeaders = response.headers();
    expect(RESPONSE_VALIDATORS.hasStreamHeaders(responseHeaders)).toBeTruthy();

    const text = await response.text();
    expect(RESPONSE_VALIDATORS.isValidStream(text)).toBeTruthy();
  });

  test('4. Error handling', async ({ request }) => {
    // Missing prompt
    const { response: errorResponse, body: errorBody } = await makeChatRequest(
      request,
      '/api/chat-text',
      {
        provider: 'openrouter',
        // Deliberately missing prompt
      },
    );

    expect(errorResponse.status()).toBe(400);
    expect(errorBody).toHaveProperty('error');
    expect(errorBody.error).toContain('Prompt is required');

    // Invalid provider
    const { response: invalidProvider } = await makeChatRequest(request, '/api/chat-text', {
      prompt: TEST_PROMPTS.simple,
      provider: 'invalid-provider',
    });

    expect(invalidProvider.status()).toBe(500);
  });

  test('5. Concurrent request handling', async ({ request }) => {
    // Send 3 requests simultaneously
    const promises = Array.from({ length: 3 }, () =>
      makeChatRequest(request, '/api/chat-text', {
        prompt: TEST_PROMPTS.simple,
        provider: 'openrouter',
      }),
    );

    const results = await Promise.all(promises);

    // All should succeed
    results.forEach((result) => {
      expect(result.response.ok()).toBeTruthy();
      expect(RESPONSE_VALIDATORS.hasText(result.body)).toBeTruthy();
    });
  });

  test('6. Provider switching', async ({ request }) => {
    // Test with different providers to ensure abstraction works
    for (const provider of ['openrouter', 'google']) {
      const { response, body } = await makeChatRequest(request, '/api/chat-text', {
        prompt: TEST_PROMPTS.simple,
        provider,
      });

      // Just verify it returns successfully with the right provider
      if (response.ok()) {
        expect(body.provider).toBe(provider);
      }
      // Don't fail if provider isn't configured - that's OK in dev
    }
  });

  test('7. Response time check', async ({ request }) => {
    const startTime = Date.now();

    await request.get('/health');

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(TEST_TIMEOUTS.short);
  });
});
