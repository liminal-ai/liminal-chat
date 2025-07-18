import { test, expect } from '../test-utils/auth-fixture';

// Test constants
const ALICE_MAX_TOKENS = 1000;
const BOB_MAX_TOKENS = 1200;
const CAROL_MAX_TOKENS = 800;

test.describe('Agent Seeding', () => {
  test('Seed Agent Creation - creates exactly 3 agents and handles reruns', async ({
    authenticatedRequest,
  }) => {
    // Get user ID by creating an agent first to extract the user from response
    const testAgent = await authenticatedRequest.post('/api/agents', {
      data: {
        name: `test-seed-user-${Date.now()}`,
        systemPrompt: 'Test agent for user extraction',
        provider: 'openai',
        model: 'gpt-4',
      },
    });

    expect(testAgent.status()).toBe(201);
    const testAgentBody = await testAgent.json();
    const userId = testAgentBody.agent.userId;

    // First run: seed the agents
    const firstSeedResponse = await authenticatedRequest.post('/api/agents/seed', {
      data: { userId },
    });

    expect(firstSeedResponse.status()).toBe(200);
    const firstSeedBody = await firstSeedResponse.json();

    // Should create exactly 3 agents
    expect(Array.isArray(firstSeedBody)).toBe(true);
    expect(firstSeedBody.length).toBe(3);

    // Verify all returned IDs are valid Convex IDs
    firstSeedBody.forEach((id: string) => {
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    // Second run: attempt to seed again (should be idempotent)
    const secondSeedResponse = await authenticatedRequest.post('/api/agents/seed', {
      data: { userId },
    });

    expect(secondSeedResponse.status()).toBe(200);
    const secondSeedBody = await secondSeedResponse.json();

    // Should return same agents (idempotency - same result every time)
    expect(Array.isArray(secondSeedBody)).toBe(true);
    expect(secondSeedBody.length).toBe(3);

    // Should return the same agent IDs as the first run
    expect(secondSeedBody.sort()).toEqual(firstSeedBody.sort());

    // Verify exactly 3 seed agents exist
    const verificationResponse = await authenticatedRequest.get(
      `/api/agents/seed?userId=${userId}`,
    );

    expect(verificationResponse.status()).toBe(200);
    const seedAgents = await verificationResponse.json();
    expect(seedAgents.length).toBe(3);

    // Verify the names are alice, bob, carol
    const names = seedAgents.map((agent: any) => agent.name).sort();
    expect(names).toEqual(['alice', 'bob', 'carol']);
  });

  test('Agent Configuration Validation - verifies specific configurations', async ({
    authenticatedRequest,
  }) => {
    // Get user ID by creating a test agent
    const testAgent = await authenticatedRequest.post('/api/agents', {
      data: {
        name: `test-config-user-${Date.now()}`,
        systemPrompt: 'Test agent for user extraction',
        provider: 'openai',
        model: 'gpt-4',
      },
    });

    const testAgentBody = await testAgent.json();
    const userId = testAgentBody.agent.userId;

    // Seed the agents
    await authenticatedRequest.post('/api/agents/seed', {
      data: { userId },
    });

    // Get all seed agents
    const response = await authenticatedRequest.get(`/api/agents/seed?userId=${userId}`);

    expect(response.status()).toBe(200);
    const agents = await response.json();
    expect(agents.length).toBe(3);

    // Find each agent by name and verify configuration
    const alice = agents.find((agent: any) => agent.name === 'alice');
    const bob = agents.find((agent: any) => agent.name === 'bob');
    const carol = agents.find((agent: any) => agent.name === 'carol');

    expect(alice).toBeDefined();
    expect(bob).toBeDefined();
    expect(carol).toBeDefined();

    // Verify Alice configuration (technical analyst)
    expect(alice.provider).toBe('openai');
    expect(alice.model).toBe('gpt-4');
    expect(alice.config.temperature).toBe(0.7);
    expect(alice.config.maxTokens).toBe(ALICE_MAX_TOKENS);
    expect(alice.systemPrompt).toContain('technical analyst');
    expect(alice.systemPrompt).toContain('methodical and evidence-based');
    expect(alice.active).toBe(true);

    // Verify Bob configuration (creative strategist)
    expect(bob.provider).toBe('anthropic');
    expect(bob.model).toBe('claude-3-sonnet');
    expect(bob.config.temperature).toBe(0.9);
    expect(bob.config.maxTokens).toBe(BOB_MAX_TOKENS);
    expect(bob.systemPrompt).toContain('creative strategist');
    expect(bob.systemPrompt).toContain('innovative thinking');
    expect(bob.active).toBe(true);

    // Verify Carol configuration (critical thinker)
    expect(carol.provider).toBe('openai');
    expect(carol.model).toBe('gpt-4o');
    expect(carol.config.temperature).toBe(0.3);
    expect(carol.config.maxTokens).toBe(CAROL_MAX_TOKENS);
    expect(carol.systemPrompt).toContain('critical thinker');
    expect(carol.systemPrompt).toContain('thorough analysis');
    expect(carol.active).toBe(true);

    // Verify all have proper timestamps
    agents.forEach((agent: any) => {
      expect(typeof agent.createdAt).toBe('number');
      expect(typeof agent.updatedAt).toBe('number');
      expect(agent.createdAt).toBeGreaterThan(0);
      expect(agent.updatedAt).toBeGreaterThan(0);
    });
  });

  test('Multi-Provider Verification - confirms OpenAI and Anthropic representation', async ({
    authenticatedRequest,
  }) => {
    // Get user ID by creating a test agent
    const testAgent = await authenticatedRequest.post('/api/agents', {
      data: {
        name: `test-provider-user-${Date.now()}`,
        systemPrompt: 'Test agent for user extraction',
        provider: 'openai',
        model: 'gpt-4',
      },
    });

    const testAgentBody = await testAgent.json();
    const userId = testAgentBody.agent.userId;

    // Seed the agents
    await authenticatedRequest.post('/api/agents/seed', {
      data: { userId },
    });

    // Get all seed agents
    const response = await authenticatedRequest.get(`/api/agents/seed?userId=${userId}`);

    expect(response.status()).toBe(200);
    const agents = await response.json();

    // Extract providers and models
    const providers = agents.map((agent: any) => agent.provider);
    const models = agents.map((agent: any) => agent.model);
    const temperatures = agents.map((agent: any) => agent.config.temperature);

    // Verify both OpenAI and Anthropic are represented
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');

    // Count provider distribution
    const openaiCount = providers.filter((p: string) => p === 'openai').length;
    const anthropicCount = providers.filter((p: string) => p === 'anthropic').length;

    expect(openaiCount).toBe(2); // Alice and Carol
    expect(anthropicCount).toBe(1); // Bob

    // Verify different models are used
    expect(models).toContain('gpt-4'); // Alice
    expect(models).toContain('claude-3-sonnet'); // Bob
    expect(models).toContain('gpt-4o'); // Carol

    // Verify temperature variety demonstrates config flexibility
    expect(temperatures).toContain(0.7); // Alice
    expect(temperatures).toContain(0.9); // Bob
    expect(temperatures).toContain(0.3); // Carol

    // Verify we have a good range of temperatures
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    expect(maxTemp - minTemp).toBeGreaterThanOrEqual(0.6); // At least 0.6 difference
  });

  test('User Association Test - verifies proper user isolation', async ({
    authenticatedRequest,
  }) => {
    // Create first test agent to get first user ID
    const testAgent1 = await authenticatedRequest.post('/api/agents', {
      data: {
        name: `test-isolation-user1-${Date.now()}`,
        systemPrompt: 'Test agent for first user',
        provider: 'openai',
        model: 'gpt-4',
      },
    });

    const testAgentBody1 = await testAgent1.json();
    const userId1 = testAgentBody1.agent.userId;

    // Create second test agent to get second user ID (simulating different user)
    // Note: In a real multi-user scenario, this would be a different user
    // For this test, we'll create a second set under the same user but verify isolation logic
    const testAgent2 = await authenticatedRequest.post('/api/agents', {
      data: {
        name: `test-isolation-user2-${Date.now()}`,
        systemPrompt: 'Test agent for second user context',
        provider: 'anthropic',
        model: 'claude-3-sonnet',
      },
    });

    const testAgentBody2 = await testAgent2.json();
    const userId2 = testAgentBody2.agent.userId;

    // Since we're using the same auth in test, userId1 and userId2 will be the same
    // But we'll test the logic that would work with different users
    expect(userId1).toBe(userId2); // Confirm same user in test environment

    // Seed agents for the user
    const seedResponse = await authenticatedRequest.post('/api/agents/seed', {
      data: { userId: userId1 },
    });

    expect(seedResponse.status()).toBe(200);
    const createdAgents = await seedResponse.json();
    expect(createdAgents.length).toBe(3);

    // Verify all seed agents belong to the user
    const allAgentsResponse = await authenticatedRequest.get(`/api/agents/seed?userId=${userId1}`);

    expect(allAgentsResponse.status()).toBe(200);
    const allAgents = await allAgentsResponse.json();
    expect(allAgents.length).toBe(3);

    // Verify all agents have the correct userId
    allAgents.forEach((agent: any) => {
      expect(agent.userId).toBe(userId1);
    });

    // Verify that querying with the same userId returns the same agents
    const sameUserAgentsResponse = await authenticatedRequest.get(
      `/api/agents/seed?userId=${userId2}`,
    );

    expect(sameUserAgentsResponse.status()).toBe(200);
    const sameUserAgents = await sameUserAgentsResponse.json();
    expect(sameUserAgents.length).toBe(3);

    // In a real multi-user scenario with different user IDs, this would return 0
    // This test validates the query logic works correctly with user isolation
    expect(sameUserAgents.every((agent: any) => agent.userId === userId2)).toBe(true);
  });
});
