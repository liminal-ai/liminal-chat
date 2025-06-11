export class TestDataFactory {
  private createdResources: string[] = []

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
    // Cleanup any created test resources
    this.createdResources = []
  }
} 