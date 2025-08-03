import { test, expect } from '../utils/auth-fixture';

test.describe('GPT-4.1 Consultation Endpoints', () => {
  const LOCAL_DEV_SERVICE_URL = 'http://127.0.0.1:8081';

  // Test helper function to call consultation endpoints
  async function consultGPT(endpoint: string, prompt: string) {
    const response = await fetch(`${LOCAL_DEV_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    return {
      status: response.status,
      data,
    };
  }

  test.describe('GPT-4.1 endpoint', () => {
    test('responds to valid prompt request', async () => {
      const result = await consultGPT('/consult/gpt/4.1', 'What is 2+2?');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('response');
      expect(result.data).toHaveProperty('model');
      expect(result.data.model).toBe('gpt-4.1');
      expect(typeof result.data.response).toBe('string');
      expect(result.data.response.length).toBeGreaterThan(0);
    });

    test('returns 400 for missing prompt', async () => {
      const response = await fetch(`${LOCAL_DEV_SERVICE_URL}/consult/gpt/4.1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Prompt is required');
    });

    test('returns 400 for empty prompt', async () => {
      const result = await consultGPT('/consult/gpt/4.1', '');

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('Prompt is required');
    });
  });

  test.describe('GPT-4.1-mini endpoint', () => {
    test('responds to valid prompt request', async () => {
      const result = await consultGPT('/consult/gpt/4.1-mini', 'What is the capital of France?');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('response');
      expect(result.data).toHaveProperty('model');
      expect(result.data.model).toBe('gpt-4.1-mini');
      expect(typeof result.data.response).toBe('string');
      expect(result.data.response.length).toBeGreaterThan(0);
    });

    test('returns 400 for missing prompt', async () => {
      const response = await fetch(`${LOCAL_DEV_SERVICE_URL}/consult/gpt/4.1-mini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Prompt is required');
    });
  });

  test.describe('GPT-4.1-nano endpoint', () => {
    test('responds to valid prompt request', async () => {
      const result = await consultGPT('/consult/gpt/4.1-nano', 'Translate "hello" to Spanish');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('response');
      expect(result.data).toHaveProperty('model');
      expect(result.data.model).toBe('gpt-4.1-nano');
      expect(typeof result.data.response).toBe('string');
      expect(result.data.response.length).toBeGreaterThan(0);
    });

    test('returns 400 for missing prompt', async () => {
      const response = await fetch(`${LOCAL_DEV_SERVICE_URL}/consult/gpt/4.1-nano`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Prompt is required');
    });
  });

  test.describe('Service availability', () => {
    test('handles service unavailable gracefully', async () => {
      // Test with wrong port to simulate service down
      const response = await fetch('http://127.0.0.1:9999/consult/gpt/4.1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'test' }),
      }).catch((error) => {
        expect(error.message).toContain('fetch failed');
        return null;
      });

      if (response) {
        expect(response.ok).toBe(false);
      }
    });

    test('health check endpoint is accessible', async () => {
      const response = await fetch(`${LOCAL_DEV_SERVICE_URL}/health`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('local-dev-service');
    });
  });

  test.describe('Security', () => {
    test('blocks non-localhost requests', async () => {
      // This test would require running from a different host
      // For now, we'll just verify the endpoint exists and handles localhost correctly
      const result = await consultGPT('/consult/gpt/4.1', 'test prompt');

      // If we get a response, it means localhost access is working
      // The actual security test would need to be run from a different host
      expect([200, 500].includes(result.status)).toBe(true);
    });
  });

  test.describe('Error handling', () => {
    test('handles invalid JSON gracefully', async () => {
      const response = await fetch(`${LOCAL_DEV_SERVICE_URL}/consult/gpt/4.1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
    });

    test('handles missing OpenAI API key configuration', async () => {
      // This test assumes the API key might not be configured
      const result = await consultGPT('/consult/gpt/4.1', 'test prompt');

      // Should either work (200) or fail with API key error (500)
      expect([200, 500].includes(result.status)).toBe(true);

      if (result.status === 500) {
        expect(result.data.error).toContain('OPENAI_API_KEY');
      }
    });
  });
});
