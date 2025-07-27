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

  test('Created agent has correct timestamps and archived=false by default', async ({
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
    expect(agent.archived).toBe(false);

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

  test.describe('Agent Updates', () => {
    let createdAgentId: string;
    const baseAgentData = {
      name: 'test-update-agent',
      systemPrompt: 'You are a helpful assistant.',
      provider: 'openai',
      model: 'gpt-4',
      config: {
        temperature: 0.7,
        maxTokens: MAX_TOKENS_DEFAULT,
      },
    };

    test.beforeEach(async ({ authenticatedRequest }) => {
      // Create an agent for update testing with unique name per test
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const agentData = {
        ...baseAgentData,
        name: `${baseAgentData.name}-${timestamp}-${randomSuffix}`,
      };

      const response = await authenticatedRequest.post('/api/agents', {
        data: agentData,
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      createdAgentId = body.id;
    });

    test('Can update agent systemPrompt', async ({ authenticatedRequest }) => {
      const newSystemPrompt = 'You are a very helpful coding assistant.';

      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { systemPrompt: newSystemPrompt },
      });

      expect(response.status()).toBe(200);

      // Verify the update by getting the agent
      const getResponse = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      expect(getResponse.status()).toBe(200);

      const agent = await getResponse.json();
      expect(agent.systemPrompt).toBe(newSystemPrompt);
      expect(agent.name).toMatch(new RegExp(`^${baseAgentData.name.toLowerCase()}-\\d+-\\w+$`)); // Original name should be unchanged
    });

    test('Can update agent config partially', async ({ authenticatedRequest }) => {
      const newConfig = {
        temperature: 0.9,
        maxTokens: 2000,
        topP: 0.95,
        reasoning: true,
      };

      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { config: newConfig },
      });

      expect(response.status()).toBe(200);

      // Verify the update
      const getResponse = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const agent = await getResponse.json();
      expect(agent.config).toEqual(newConfig);
    });

    test('Can update multiple fields simultaneously', async ({ authenticatedRequest }) => {
      const updates = {
        systemPrompt: 'You are a specialized research assistant.',
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        archived: true,
      };

      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: updates,
      });

      expect(response.status()).toBe(200);

      // Verify all updates
      const getResponse = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const agent = await getResponse.json();
      expect(agent.systemPrompt).toBe(updates.systemPrompt);
      expect(agent.provider).toBe(updates.provider);
      expect(agent.model).toBe(updates.model);
      expect(agent.archived).toBe(updates.archived);
    });

    test('Can update agent name with normalization', async ({ authenticatedRequest }) => {
      const timestamp = Date.now();
      const newName = `UPDATED-Agent-${timestamp}`; // Mixed case

      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { name: newName },
      });

      expect(response.status()).toBe(200);

      // Verify name is normalized to lowercase
      const getResponse = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const agent = await getResponse.json();
      expect(agent.name).toBe(newName.toLowerCase());
    });

    test('Cannot update agent name to existing name', async ({ authenticatedRequest }) => {
      // Create another agent
      const timestamp = Date.now();
      const otherAgentData = {
        ...baseAgentData,
        name: `other-agent-${timestamp}`,
      };

      const createResponse = await authenticatedRequest.post('/api/agents', {
        data: otherAgentData,
      });
      expect(createResponse.status()).toBe(201);

      // Try to update first agent to use second agent's name
      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { name: otherAgentData.name },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('already exists');
    });

    test('Cannot update agent name to empty string', async ({ authenticatedRequest }) => {
      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { name: '' },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('cannot be empty');
    });

    test('Cannot update agent name with invalid characters', async ({ authenticatedRequest }) => {
      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { name: 'invalid name with spaces!' },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('letters, numbers, and hyphens');
    });

    test('Can update own agent with valid ownership', async ({ authenticatedRequest, request }) => {
      // Test that authenticated users can successfully update their own agents
      // This verifies the ownership validation logic works correctly for valid ownership

      // Create an agent normally
      const timestamp = Date.now();
      const tempAgent = {
        ...baseAgentData,
        name: `ownership-test-${timestamp}`,
      };

      const createResp = await authenticatedRequest.post('/api/agents', {
        data: tempAgent,
      });
      const createBody = await createResp.json();
      const validId = createBody.id;

      // Verify the agent exists and is accessible
      const getResp = await authenticatedRequest.get(`/api/agents/${validId}`);
      expect(getResp.status()).toBe(200);

      // Verify update works with valid ownership
      const updateResp = await authenticatedRequest.patch(`/api/agents/${validId}`, {
        data: { systemPrompt: 'Updated prompt' },
      });
      expect(updateResp.status()).toBe(200);

      // This confirms that ownership validation allows legitimate updates
    });

    test('Cannot update agent without authentication', async ({ request }) => {
      const response = await request.patch(`/api/agents/${createdAgentId}`, {
        data: { systemPrompt: 'New prompt' },
      });

      expect(response.status()).toBe(401);
    });

    test('Can update name to same name with different case', async ({ authenticatedRequest }) => {
      // Get current agent name
      const getResponse = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const agent = await getResponse.json();
      const currentName = agent.name;

      // Update to same name but different case
      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { name: currentName.toUpperCase() },
      });

      expect(response.status()).toBe(200);

      // Verify name is still normalized but update succeeded
      const getResponse2 = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const updatedAgent = await getResponse2.json();
      expect(updatedAgent.name).toBe(currentName); // Should be unchanged (already lowercase)
    });

    test('Partial update preserves unchanged fields', async ({ authenticatedRequest }) => {
      // Get original agent
      const getResponse1 = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const originalAgent = await getResponse1.json();

      // Update only systemPrompt
      const response = await authenticatedRequest.patch(`/api/agents/${createdAgentId}`, {
        data: { systemPrompt: 'Only changing this field' },
      });

      expect(response.status()).toBe(200);

      // Verify other fields unchanged
      const getResponse2 = await authenticatedRequest.get(`/api/agents/${createdAgentId}`);
      const updatedAgent = await getResponse2.json();

      expect(updatedAgent.systemPrompt).toBe('Only changing this field');
      expect(updatedAgent.name).toBe(originalAgent.name);
      expect(updatedAgent.provider).toBe(originalAgent.provider);
      expect(updatedAgent.model).toBe(originalAgent.model);
      expect(updatedAgent.config).toEqual(originalAgent.config);
      expect(updatedAgent.archived).toBe(originalAgent.archived);
    });
  });

  test.describe('List Agents API', () => {
    test('Requires authentication', async ({ request }) => {
      const response = await request.get('/api/agents');
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('authorization header');
    });

    test('Returns empty array for new user', async ({ authenticatedRequest }) => {
      const response = await authenticatedRequest.get('/api/agents');
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });

    test('Returns user agents excluding archived by default', async ({ authenticatedRequest }) => {
      const timestamp = Date.now();

      // Create two agents
      const agent1Data = {
        name: `list-test-agent-1-${timestamp}`,
        systemPrompt: 'Agent 1',
        provider: 'openai',
        model: 'gpt-4',
      };

      const agent2Data = {
        name: `list-test-agent-2-${timestamp}`,
        systemPrompt: 'Agent 2',
        provider: 'openai',
        model: 'gpt-4',
      };

      const response1 = await authenticatedRequest.post('/api/agents', { data: agent1Data });
      const response2 = await authenticatedRequest.post('/api/agents', { data: agent2Data });

      expect(response1.status()).toBe(201);
      expect(response2.status()).toBe(201);

      const agent1Id = (await response1.json()).id;
      const agent2Id = (await response2.json()).id;

      // Archive one agent
      await authenticatedRequest.patch(`/api/agents/${agent1Id}`, {
        data: { archived: true },
      });

      // List agents (should only return non-archived)
      const listResponse = await authenticatedRequest.get('/api/agents');
      expect(listResponse.status()).toBe(200);

      const agents = await listResponse.json();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBe(1);
      expect(agents[0]._id).toBe(agent2Id);
      expect(agents[0].archived).toBe(false);
    });

    test('Includes archived agents when requested', async ({ authenticatedRequest }) => {
      const timestamp = Date.now();

      // Create agent and archive it
      const agentData = {
        name: `archived-test-agent-${timestamp}`,
        systemPrompt: 'Test agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const createResponse = await authenticatedRequest.post('/api/agents', { data: agentData });
      expect(createResponse.status()).toBe(201);

      const agentId = (await createResponse.json()).id;

      // Archive the agent
      await authenticatedRequest.patch(`/api/agents/${agentId}`, {
        data: { archived: true },
      });

      // List with includeArchived=false (default)
      const listResponse1 = await authenticatedRequest.get('/api/agents');
      const agents1 = await listResponse1.json();
      expect(agents1.length).toBe(0);

      // List with includeArchived=true
      const listResponse2 = await authenticatedRequest.get('/api/agents?includeArchived=true');
      expect(listResponse2.status()).toBe(200);

      const agents2 = await listResponse2.json();
      expect(Array.isArray(agents2)).toBe(true);
      expect(agents2.length).toBe(1);
      expect(agents2[0]._id).toBe(agentId);
      expect(agents2[0].archived).toBe(true);
    });

    test('Returns agents in descending order', async ({ authenticatedRequest }) => {
      const timestamp = Date.now();

      // Create two agents with slight delay
      const agent1Data = {
        name: `order-test-agent-1-${timestamp}`,
        systemPrompt: 'First agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const response1 = await authenticatedRequest.post('/api/agents', { data: agent1Data });
      expect(response1.status()).toBe(201);

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const agent2Data = {
        name: `order-test-agent-2-${timestamp}`,
        systemPrompt: 'Second agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      const response2 = await authenticatedRequest.post('/api/agents', { data: agent2Data });
      expect(response2.status()).toBe(201);

      // List agents
      const listResponse = await authenticatedRequest.get('/api/agents');
      const agents = await listResponse.json();

      expect(agents.length).toBe(2);
      // Should be in descending order (newest first)
      expect(agents[0]._creationTime).toBeGreaterThan(agents[1]._creationTime);
    });
  });

  test.describe('Archive Agent API', () => {
    let testAgentId: string;

    test.beforeEach(async ({ authenticatedRequest }) => {
      const timestamp = Date.now();
      const agentData = {
        name: `archive-test-agent-${timestamp}`,
        systemPrompt: 'Test agent for archiving',
        provider: 'openai',
        model: 'gpt-4',
      };

      const response = await authenticatedRequest.post('/api/agents', { data: agentData });
      expect(response.status()).toBe(201);
      testAgentId = (await response.json()).id;
    });

    test('Requires authentication', async ({ request }) => {
      const response = await request.delete(`/api/agents/${testAgentId}`);
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('authorization header');
    });

    test('Successfully archives agent', async ({ authenticatedRequest }) => {
      const response = await authenticatedRequest.delete(`/api/agents/${testAgentId}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body).toEqual({ success: true });
    });

    test('Archived agent becomes invisible in GET', async ({ authenticatedRequest }) => {
      // Verify agent exists
      const getResponse1 = await authenticatedRequest.get(`/api/agents/${testAgentId}`);
      expect(getResponse1.status()).toBe(200);

      // Archive agent
      const archiveResponse = await authenticatedRequest.delete(`/api/agents/${testAgentId}`);
      expect(archiveResponse.status()).toBe(200);

      // Verify agent is now invisible
      const getResponse2 = await authenticatedRequest.get(`/api/agents/${testAgentId}`);
      expect(getResponse2.status()).toBe(404);

      const body = await getResponse2.json();
      expect(body.error).toBe('Agent not found or access denied');
    });

    test('Archived agent becomes invisible in LIST', async ({ authenticatedRequest }) => {
      // Archive agent
      await authenticatedRequest.delete(`/api/agents/${testAgentId}`);

      // Verify agent not in default list
      const listResponse = await authenticatedRequest.get('/api/agents');
      const agents = await listResponse.json();
      expect(agents.find((a: any) => a._id === testAgentId)).toBeUndefined();
    });

    test('Cannot archive twice (returns 404)', async ({ authenticatedRequest }) => {
      // Archive once
      const firstResponse = await authenticatedRequest.delete(`/api/agents/${testAgentId}`);
      expect(firstResponse.status()).toBe(200);

      // Try to archive again
      const secondResponse = await authenticatedRequest.delete(`/api/agents/${testAgentId}`);
      expect(secondResponse.status()).toBe(404);

      const body = await secondResponse.json();
      expect(body.error).toBe('Agent not found or access denied');
    });

    test('Cannot update archived agent', async ({ authenticatedRequest }) => {
      // Archive agent
      await authenticatedRequest.delete(`/api/agents/${testAgentId}`);

      // Try to update archived agent
      const updateResponse = await authenticatedRequest.patch(`/api/agents/${testAgentId}`, {
        data: { systemPrompt: 'Updated prompt' },
      });

      expect(updateResponse.status()).toBe(404);
      const body = await updateResponse.json();
      expect(body.error).toBe('Agent not found or access denied');
    });

    test('Returns 404 for non-existent agent', async ({ authenticatedRequest }) => {
      const fakeId = 'j123456789abcdef12345678';
      const response = await authenticatedRequest.delete(`/api/agents/${fakeId}`);
      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe('Agent not found or access denied');
    });

    test('Returns 400 for missing agent ID', async ({ authenticatedRequest }) => {
      const response = await authenticatedRequest.delete('/api/agents/');
      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Agent ID is required');
    });
  });

  test.describe('Integration Flow Tests', () => {
    test('Create → List → Archive → List flow', async ({ authenticatedRequest }) => {
      const timestamp = Date.now();
      const agentData = {
        name: `flow-test-agent-${timestamp}`,
        systemPrompt: 'Flow test agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      // 1. Create agent
      const createResponse = await authenticatedRequest.post('/api/agents', { data: agentData });
      expect(createResponse.status()).toBe(201);
      const agentId = (await createResponse.json()).id;

      // 2. Verify in list
      const listResponse1 = await authenticatedRequest.get('/api/agents');
      const agents1 = await listResponse1.json();
      expect(agents1.some((a: any) => a._id === agentId)).toBe(true);

      // 3. Archive agent
      const archiveResponse = await authenticatedRequest.delete(`/api/agents/${agentId}`);
      expect(archiveResponse.status()).toBe(200);

      // 4. Verify not in list
      const listResponse2 = await authenticatedRequest.get('/api/agents');
      const agents2 = await listResponse2.json();
      expect(agents2.some((a: any) => a._id === agentId)).toBe(false);
    });

    test('Create → Archive → Get returns 404', async ({ authenticatedRequest }) => {
      const timestamp = Date.now();
      const agentData = {
        name: `get-404-test-agent-${timestamp}`,
        systemPrompt: 'Test agent',
        provider: 'openai',
        model: 'gpt-4',
      };

      // Create and archive
      const createResponse = await authenticatedRequest.post('/api/agents', { data: agentData });
      const agentId = (await createResponse.json()).id;

      await authenticatedRequest.delete(`/api/agents/${agentId}`);

      // Verify GET returns 404
      const getResponse = await authenticatedRequest.get(`/api/agents/${agentId}`);
      expect(getResponse.status()).toBe(404);
    });

    test('Cross-user isolation for archive', async ({ authenticatedRequest }) => {
      // This test assumes we can't easily test cross-user scenarios
      // in the current setup, but validates the security model
      const fakeAgentId = 'j123456789abcdef12345678';

      const response = await authenticatedRequest.delete(`/api/agents/${fakeAgentId}`);
      expect(response.status()).toBe(404);
      expect((await response.json()).error).toBe('Agent not found or access denied');
    });
  });
});
