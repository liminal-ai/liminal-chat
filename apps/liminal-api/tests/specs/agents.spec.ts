import { test, expect } from '../utils/auth-fixture';

// Test constants
const TIMING_BUFFER_MS = 1000; // Milliseconds buffer for timestamp validation
const MAX_TOKENS_DEFAULT = 1000; // Default max tokens for agent testing

test.describe('Agents API', () => {
  test('Can create an agent with valid data', async ({ authenticatedRequest }) => {
    const timestamp = Date.now();
    const validAgentData = {
      name: `test-agent-${timestamp}`,
      systemPrompt: 'You are a helpful assistant.',
      provider: 'openai',
      model: 'gpt-4',
      config: {
        temperature: 0.7,
        maxTokens: MAX_TOKENS_DEFAULT,
        topP: 0.9,
        streamingSupported: true,
      },
    };

    const response = await authenticatedRequest.post('/api/agents', {
      data: validAgentData,
    });

    // Check response status before parsing
    if (response.status() !== 201) {
      const body = await response.json();
      throw new Error(`Agent creation failed: ${response.status()} - ${JSON.stringify(body)}`);
    }

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
    expect(body.id).toMatch(/^[a-z0-9]+$/); // Convex ID format
  });

  test('Cannot create an agent without authentication', async ({ request }) => {
    const validAgentData = {
      name: 'test-agent',
      systemPrompt: 'You are a helpful assistant.',
      provider: 'openai',
      model: 'gpt-4',
    };

    const response = await request.post('/api/agents', {
      data: validAgentData,
    });

    if (response.status() !== 401) {
      const body = await response.json();
      throw new Error(`Expected 401 but got ${response.status()}: ${JSON.stringify(body)}`);
    }

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('authorization header');
  });

  test('Cannot create an agent with duplicate name for same user', async ({
    authenticatedRequest,
  }) => {
    const timestamp = Date.now();
    const agentData = {
      name: `duplicate-agent-${timestamp}`,
      systemPrompt: 'You are a helpful assistant.',
      provider: 'openai',
      model: 'gpt-4',
    };

    // Create first agent
    const firstResponse = await authenticatedRequest.post('/api/agents', {
      data: agentData,
    });
    expect(firstResponse.status()).toBe(201);

    // Try to create second agent with same name
    const secondResponse = await authenticatedRequest.post('/api/agents', {
      data: agentData,
    });

    expect(secondResponse.status()).toBe(400);

    const body = await secondResponse.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Agent with this name already exists');
  });

  test('Created agent has correct timestamps and active=true by default', async ({
    authenticatedRequest,
  }) => {
    const timestamp = Date.now();
    const agentData = {
      name: `timestamp-test-agent-${timestamp}`,
      systemPrompt: 'You are a helpful assistant.',
      provider: 'openai',
      model: 'gpt-4',
    };

    const beforeCreate = Date.now() - TIMING_BUFFER_MS; // Add bigger buffer for timing

    const response = await authenticatedRequest.post('/api/agents', {
      data: agentData,
    });

    const afterCreate = Date.now() + TIMING_BUFFER_MS; // Add bigger buffer for timing

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('agent');

    const agent = body.agent;

    // Check required fields (name should be lowercase)
    expect(agent.name).toBe(`timestamp-test-agent-${timestamp}`);
    expect(agent.systemPrompt).toBe('You are a helpful assistant.');
    expect(agent.provider).toBe('openai');
    expect(agent.model).toBe('gpt-4');

    // Check defaults
    expect(agent.active).toBe(true);

    // Check timestamps
    expect(typeof agent.createdAt).toBe('number');
    expect(typeof agent.updatedAt).toBe('number');
    expect(agent.createdAt).toBeGreaterThanOrEqual(beforeCreate);
    expect(agent.createdAt).toBeLessThanOrEqual(afterCreate);
    expect(agent.updatedAt).toBe(agent.createdAt);

    // Check userId is present
    expect(typeof agent.userId).toBe('string');
    expect(agent.userId.length).toBeGreaterThan(0);
  });

  test('Cannot create an agent with invalid name format', async ({ authenticatedRequest }) => {
    const timestamp = Date.now();
    const invalidNames = [
      `Agent With Spaces ${timestamp}`,
      `agent_with_underscores_${timestamp}`,
      `agent@symbol${timestamp}`,
      `agent!${timestamp}`,
      `agent.dot${timestamp}`,
      '',
    ];

    for (let i = 0; i < invalidNames.length; i++) {
      const invalidName = invalidNames[i];
      const agentData = {
        name: invalidName,
        systemPrompt: 'You are a helpful assistant.',
        provider: 'openai',
        model: 'gpt-4',
      };

      const response = await authenticatedRequest.post('/api/agents', {
        data: agentData,
      });

      if (response.status() !== 400) {
        const body = await response.json();
        throw new Error(
          `Invalid name "${invalidName}" unexpectedly passed validation. Status: ${response.status()}, Body: ${JSON.stringify(body)}`,
        );
      }

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(
        /(letters, numbers, and hyphens|cannot be empty|Agent name is required)/,
      );
    }
  });

  test('Can create an agent with mixed case name (converts to lowercase)', async ({
    authenticatedRequest,
  }) => {
    const timestamp = Date.now();
    const agentData = {
      name: `Test-Agent-${timestamp}`, // Mixed case
      systemPrompt: 'You are a helpful assistant.',
      provider: 'openai',
      model: 'gpt-4',
    };

    const response = await authenticatedRequest.post('/api/agents', {
      data: agentData,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('agent');

    // Name should be converted to lowercase
    expect(body.agent.name).toBe(`test-agent-${timestamp}`);
  });
});
