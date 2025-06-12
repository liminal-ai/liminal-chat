export class TestDataFactory {
  // TODO: Implement resource tracking when test data creation requires cleanup
  // private createdResources: string[] = []

  createPromptRequest(overrides = {}) {
    return {
      prompt: 'Hello, AI assistant!',
      provider: 'openrouter',
      model: 'anthropic/claude-3.5-sonnet',
      ...overrides
    }
  }

  createMessagesRequest(overrides = {}) {
    return {
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello!' }
      ],
      provider: 'openrouter', 
      ...overrides
    }
  }

  createStreamingRequest(overrides = {}) {
    return {
      ...this.createPromptRequest(),
      stream: true,
      ...overrides
    }
  }

  async cleanup() {
    // TODO: Implement cleanup logic when test data creation requires resource management
    // Currently no resources need cleanup as methods only return static data
  }
} 