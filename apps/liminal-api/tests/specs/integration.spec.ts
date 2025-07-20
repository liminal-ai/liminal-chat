import { test, expect } from '../utils/auth-fixture';
import { TEST_PROMPTS, TEST_TIMEOUTS, RESPONSE_VALIDATORS } from '../utils/config';
import { makeChatRequest, parseDataStream } from '../utils/helpers';

test.describe('Liminal API Integration Tests', () => {
  test('Health endpoint responds successfully', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.get('/health');

    expect(
      response.status(),
      `Expected 200 but got ${response.status()} ${response.statusText()}`,
    ).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status', 'healthy');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('service', 'liminal-api');
  });

  test('Basic chat returns valid response', async ({ authenticatedRequest }) => {
    const { response, body } = await makeChatRequest(authenticatedRequest, '/api/chat-text', {
      prompt: TEST_PROMPTS.simple,
      provider: 'openrouter',
    });

    expect(response.ok()).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasText(body)).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasModel(body)).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasProvider(body, 'openrouter')).toBeTruthy();
  });

  test('Streaming chat returns valid headers', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: TEST_PROMPTS.simple }],
        provider: 'openrouter',
      },
    });

    expect(response.ok()).toBeTruthy();

    // Verify Vercel AI SDK streaming format
    const responseHeaders = response.headers();
    expect(RESPONSE_VALIDATORS.hasStreamHeaders(responseHeaders)).toBeTruthy();
  });

  test('Streaming chat returns valid data format', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: TEST_PROMPTS.simple }],
        provider: 'openrouter',
      },
    });

    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(RESPONSE_VALIDATORS.isValidStream(text)).toBeTruthy();
  });

  test('Missing prompt returns 400 error', async ({ authenticatedRequest }) => {
    const { response: errorResponse, body: errorBody } = await makeChatRequest(
      authenticatedRequest,
      '/api/chat-text',
      {
        provider: 'openrouter',
        // Deliberately missing prompt
      },
    );

    expect(errorResponse.status()).toBe(400);
    expect(errorBody).toHaveProperty('error');
    expect(errorBody.error).toContain('Prompt is required');
  });

  test('Invalid provider returns 500 error', async ({ authenticatedRequest }) => {
    const { response: invalidProvider } = await makeChatRequest(
      authenticatedRequest,
      '/api/chat-text',
      {
        prompt: TEST_PROMPTS.simple,
        provider: 'invalid-provider',
      },
    );

    expect(invalidProvider.status()).toBe(500);
  });

  test('First concurrent request succeeds', async ({ authenticatedRequest }) => {
    const promises = Array.from({ length: 3 }, () =>
      makeChatRequest(authenticatedRequest, '/api/chat-text', {
        prompt: TEST_PROMPTS.simple,
        provider: 'openrouter',
      }),
    );

    const results = await Promise.all(promises);
    const firstResult = results[0];

    expect(firstResult.response.ok()).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasText(firstResult.body)).toBeTruthy();
  });

  test('Second concurrent request succeeds', async ({ authenticatedRequest }) => {
    const promises = Array.from({ length: 3 }, () =>
      makeChatRequest(authenticatedRequest, '/api/chat-text', {
        prompt: TEST_PROMPTS.simple,
        provider: 'openrouter',
      }),
    );

    const results = await Promise.all(promises);
    const secondResult = results[1];

    expect(secondResult.response.ok()).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasText(secondResult.body)).toBeTruthy();
  });

  test('Third concurrent request succeeds', async ({ authenticatedRequest }) => {
    const promises = Array.from({ length: 3 }, () =>
      makeChatRequest(authenticatedRequest, '/api/chat-text', {
        prompt: TEST_PROMPTS.simple,
        provider: 'openrouter',
      }),
    );

    const results = await Promise.all(promises);
    const thirdResult = results[2];

    expect(thirdResult.response.ok()).toBeTruthy();
    expect(RESPONSE_VALIDATORS.hasText(thirdResult.body)).toBeTruthy();
  });

  test('OpenRouter provider works correctly', async ({ authenticatedRequest }) => {
    const { response, body } = await makeChatRequest(authenticatedRequest, '/api/chat-text', {
      prompt: TEST_PROMPTS.simple,
      provider: 'openrouter',
    });

    // Should succeed and return correct provider
    expect(response.ok()).toBeTruthy();
    expect(body.provider).toBe('openrouter');
  });

  test('Google provider works correctly', async ({ authenticatedRequest }) => {
    const { response, body } = await makeChatRequest(authenticatedRequest, '/api/chat-text', {
      prompt: TEST_PROMPTS.simple,
      provider: 'google',
    });

    // Should succeed and return correct provider
    expect(response.ok()).toBeTruthy();
    expect(body.provider).toBe('google');
  });

  test('Health endpoint responds under 2 seconds', async ({ authenticatedRequest }) => {
    const startTime = Date.now();

    const response = await authenticatedRequest.get('/health');

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(TEST_TIMEOUTS.short);
    expect(response.ok()).toBeTruthy();
  });
});
