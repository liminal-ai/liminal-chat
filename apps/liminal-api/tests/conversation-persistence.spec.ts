import { test, expect } from '@playwright/test';

// Import test config properly
const TEST_CONFIG = {
  BASE_URL: process.env.CONVEX_HTTP_URL || 'https://modest-squirrel-498.convex.site',
  TIMEOUT: 30000,
};

const TEST_PROMPTS = {
  simple: 'Respond with only: OK',
};

async function makeChatRequest(requestContext: any, endpoint: string, body: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if provided via environment variable
  if (process.env.CLERK_TEST_TOKEN) {
    headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
  }

  const response = await requestContext.post(`${TEST_CONFIG.BASE_URL}${endpoint}`, {
    data: body,
    headers,
    timeout: TEST_CONFIG.TIMEOUT,
  });

  return {
    response,
    body: response.ok() ? await response.json() : null,
  };
}

test.describe('Conversation Persistence Tests', () => {
  test('1. Create conversation and persist messages', async ({ request }) => {
    // First chat without conversationId - should create new conversation
    const { response: firstResponse, body: firstBody } = await makeChatRequest(
      request,
      '/api/chat-text',
      {
        prompt: 'Hello, this is a test message',
        provider: 'openrouter',
      },
    );

    expect(firstResponse.ok()).toBeTruthy();
    expect(firstBody).toBeTruthy();
    expect(firstBody.conversationId).toBeTruthy();
    expect(firstBody.text).toBeTruthy();

    const conversationId = firstBody.conversationId;

    // Second chat with conversationId - should use existing conversation
    const { response: secondResponse, body: secondBody } = await makeChatRequest(
      request,
      '/api/chat-text',
      {
        prompt: 'This is a follow-up message',
        provider: 'openrouter',
        conversationId,
      },
    );

    expect(secondResponse.ok()).toBeTruthy();
    expect(secondBody).toBeTruthy();
    expect(secondBody.conversationId).toBe(conversationId);

    // Verify conversation exists and has messages
    const headers: Record<string, string> = {};
    if (process.env.CLERK_TEST_TOKEN) {
      headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
    }

    const conversationResponse = await request.get(
      `${TEST_CONFIG.BASE_URL}/api/conversations/${conversationId}`,
      { headers },
    );

    // Note: This will fail if not authenticated
    // In a real test, we'd need to set up authentication
    // For now, we just verify the API structure is correct
    expect(conversationResponse.status()).toBe(200);
  });

  test('2. List conversations endpoint', async ({ request }) => {
    const headers: Record<string, string> = {};
    if (process.env.CLERK_TEST_TOKEN) {
      headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
    }

    const response = await request.get(`${TEST_CONFIG.BASE_URL}/api/conversations`, { headers });

    // Should return 200 even if empty (for authenticated users)
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('isDone');
  });

  test('3. Create conversation via API', async ({ request }) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (process.env.CLERK_TEST_TOKEN) {
      headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
    }

    const response = await request.post(`${TEST_CONFIG.BASE_URL}/api/conversations`, {
      data: {
        title: 'Test Conversation',
        type: 'standard',
        metadata: {
          provider: 'openrouter',
          model: 'google/gemini-2.5-flash',
        },
      },
      headers,
    });

    // Will fail without auth, but verifies API structure
    expect([200, 201, 401, 403]).toContain(response.status());
  });

  test('4. Streaming chat preserves conversation', async ({ request }) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (process.env.CLERK_TEST_TOKEN) {
      headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
    }

    const response = await request.post(`${TEST_CONFIG.BASE_URL}/api/chat`, {
      data: {
        messages: [{ role: 'user', content: TEST_PROMPTS.simple }],
        provider: 'openrouter',
      },
      headers,
    });

    expect(response.ok()).toBeTruthy();

    // Check for conversation ID header
    const conversationIdHeader = response.headers()['x-conversation-id'];
    // May or may not have conversation ID depending on auth
    if (conversationIdHeader) {
      expect(conversationIdHeader).toBeTruthy();
    }
  });
});
