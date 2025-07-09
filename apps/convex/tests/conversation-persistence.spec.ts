import { test, expect } from '../test-utils/auth-fixture';

// Import test config properly
const TEST_CONFIG = {
  BASE_URL: process.env.CONVEX_HTTP_URL || 'https://modest-squirrel-498.convex.site',
  TIMEOUT: 30000,
};

const TEST_PROMPTS = {
  simple: 'Respond with only: OK',
};

async function makeChatRequest(requestContext: any, endpoint: string, body: any) {
  const response = await requestContext.post(`${TEST_CONFIG.BASE_URL}${endpoint}`, {
    data: body,
    timeout: TEST_CONFIG.TIMEOUT,
  });

  return {
    response,
    body: response.ok() ? await response.json() : null,
  };
}

test.describe('Conversation Persistence Tests', () => {
  test('1. Create conversation and persist messages', async ({ authenticatedRequest }) => {
    // First chat without conversationId - should create new conversation
    const { response: firstResponse, body: firstBody } = await makeChatRequest(
      authenticatedRequest,
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
      authenticatedRequest,
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
    const conversationResponse = await authenticatedRequest.get(
      `${TEST_CONFIG.BASE_URL}/api/conversations/${conversationId}`,
    );

    expect(conversationResponse.status()).toBe(200);
  });

  test('2. List conversations endpoint', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.get(`${TEST_CONFIG.BASE_URL}/api/conversations`);

    // Should return 200 even if empty (for authenticated users)
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('isDone');
  });

  test('3. Create conversation via API', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.post(`${TEST_CONFIG.BASE_URL}/api/conversations`, {
      data: {
        title: 'Test Conversation',
        type: 'standard',
        metadata: {
          provider: 'openrouter',
          model: 'google/gemini-2.5-flash',
        },
      },
    });

    // Should succeed with authentication
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
  });

  test('4. Streaming chat preserves conversation', async ({ authenticatedRequest }) => {
    const response = await authenticatedRequest.post(`${TEST_CONFIG.BASE_URL}/api/chat`, {
      data: {
        messages: [{ role: 'user', content: TEST_PROMPTS.simple }],
        provider: 'openrouter',
      },
    });

    expect(response.ok()).toBeTruthy();

    // Check for conversation ID header
    const conversationIdHeader = response.headers()['x-conversation-id'];
    expect(conversationIdHeader).toBeTruthy();
  });
});
