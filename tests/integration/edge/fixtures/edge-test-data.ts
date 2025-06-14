import { TestDataFactory } from '../../../utils/test-data'
import type { 
  PromptRequest, 
  PromptResponse, 
  HealthResponse, 
  ProviderStreamEvent,
  StreamError,
  StreamErrorCode 
} from '../../../../packages/shared-types'

/**
 * Edge Integration Test Data Factory
 * Extends base TestDataFactory with Edge-specific test data
 * Focus on contract-based testing (response shapes, not exact content)
 */
export class EdgeTestDataFactory extends TestDataFactory {
  
  // =============================================================================
  // Basic Edge Request Data
  // =============================================================================
  
  createEdgePromptRequest(overrides: Partial<PromptRequest> = {}): PromptRequest {
    return {
      prompt: 'Hello, Edge test!',
      provider: 'echo',
      ...overrides
    }
  }

  createValidProviderRequest(provider = 'echo') {
    return this.createEdgePromptRequest({
      prompt: 'Test prompt for provider validation',
      provider
    })
  }

  createInvalidProviderRequest() {
    return this.createEdgePromptRequest({
      prompt: 'Test with invalid provider',
      provider: 'nonexistent-provider'
    })
  }

  // =============================================================================
  // Streaming Request Data
  // =============================================================================
  
  createEdgeStreamingRequest(overrides = {}) {
    return {
      ...this.createEdgePromptRequest(),
      stream: true,
      ...overrides
    }
  }

  createLongStreamingRequest() {
    return this.createEdgeStreamingRequest({
      prompt: 'Generate a longer response for streaming test purposes with multiple chunks'
    })
  }

  // =============================================================================
  // Error Scenario Data
  // =============================================================================
  
  createMalformedRequest() {
    return {
      // Missing required prompt field
      provider: 'echo'
    }
  }

  createEmptyPromptRequest() {
    return this.createEdgePromptRequest({
      prompt: ''
    })
  }

  createOversizedPromptRequest() {
    const largeString = new Array(100000).join('A') // Very large prompt to test limits
    return this.createEdgePromptRequest({
      prompt: largeString
    })
  }

  // =============================================================================
  // Response Shape Validation Data
  // =============================================================================
  
  /**
   * Expected shape for valid LLM responses from Edge
   * Returns object with type validators (to be used with expect)
   */
  getExpectedLLMResponseShape() {
    return {
      content: 'string',
      model: 'string',
      usage: {
        promptTokens: 'number',
        completionTokens: 'number',
        totalTokens: 'number'
      }
    }
  }

  /**
   * Expected shape for health responses from Edge
   */
  getExpectedHealthResponseShape() {
    return {
      status: 'healthy|degraded',
      domain_available: 'boolean',
      timestamp: 'string'
    }
  }

  /**
   * Expected shape for provider list responses
   */
  getExpectedProviderListShape() {
    return {
      defaultProvider: 'string',
      availableProviders: 'array',
      providers: 'object'
    }
  }

  /**
   * Expected shape for error responses
   */
  getExpectedErrorResponseShape() {
    return {
      error: 'string',
      message: 'string',
      code: 'string'
    }
  }

  // =============================================================================
  // Security Testing Data
  // =============================================================================
  
  createRequestWithCustomHeaders() {
    return {
      request: this.createEdgePromptRequest(),
      headers: {
        'X-Custom-Header': 'test-value',
        'X-Request-ID': 'test-123',
        'Content-Type': 'application/json'
      }
    }
  }

  createRequestWithPotentiallyMaliciousHeaders() {
    return {
      request: this.createEdgePromptRequest(),
      headers: {
        'X-Forwarded-For': '127.0.0.1',
        'X-Real-IP': '10.0.0.1',
        'Host': 'malicious-host.com',
        'Authorization': 'Bearer fake-token'
      }
    }
  }

  // =============================================================================
  // Performance Testing Data
  // =============================================================================
  
  createConcurrentRequests(count = 5) {
    const requests = []
    for (let i = 0; i < count; i++) {
      requests.push(this.createEdgePromptRequest({
        prompt: `Concurrent test request ${i + 1}`
      }))
    }
    return requests
  }

  createLargePayloadRequest() {
    const largePayload = 'Large payload test: ' + new Array(10000).join('x')
    return this.createEdgePromptRequest({
      prompt: largePayload
    })
  }

  // =============================================================================
  // Streaming Event Validation Data
  // =============================================================================
  
  /**
   * Expected streaming event shapes for contract validation
   */
  getExpectedStreamEventShapes() {
    return {
      content: {
        type: 'content',
        data: 'string',
        eventId: 'string'
      },
      usage: {
        type: 'usage',
        data: {
          promptTokens: 'number',
          completionTokens: 'number',
          totalTokens: 'number',
          model: 'string'
        },
        eventId: 'string'
      },
      done: {
        type: 'done',
        eventId: 'string'
      },
      error: {
        type: 'error',
        data: {
          message: 'string',
          code: 'string',
          retryable: 'boolean'
        },
        eventId: 'string'
      }
    }
  }

  // =============================================================================
  // Network Interception Mock Data
  // =============================================================================
  
  /**
   * Mock responses for network interception during error simulation
   */
  getMockNetworkResponses() {
    return {
      domainUnavailable: {
        status: 503,
        body: { error: 'Service Unavailable', message: 'Domain service is down' }
      },
      domainTimeout: {
        status: 504,
        body: { error: 'Gateway Timeout', message: 'Domain service timeout' }
      },
      domainError: {
        status: 500,
        body: { error: 'Internal Server Error', message: 'Domain service error' }
      },
      authenticationError: {
        status: 401,
        body: { error: 'Unauthorized', message: 'Authentication failed' }
      },
      rateLimitError: {
        status: 429,
        body: { error: 'Too Many Requests', message: 'Rate limit exceeded' }
      }
    }
  }

  // =============================================================================
  // Validation Helpers
  // =============================================================================
  
  /**
   * Validate that a response matches expected LLM response contract
   */
  validateLLMResponseContract(response: any): boolean {
    return (
      typeof response.content === 'string' &&
      typeof response.model === 'string' &&
      typeof response.usage === 'object' &&
      typeof response.usage.promptTokens === 'number' &&
      typeof response.usage.completionTokens === 'number' &&
      typeof response.usage.totalTokens === 'number' &&
      response.usage.totalTokens === response.usage.promptTokens + response.usage.completionTokens
    )
  }

  /**
   * Validate that a stream event matches expected contract
   */
  validateStreamEventContract(event: ProviderStreamEvent): boolean {
    if (!event.type) return false
    
    switch (event.type) {
      case 'content':
        return typeof event.data === 'string'
      case 'usage':
        return (
          typeof event.data === 'object' &&
          typeof event.data.promptTokens === 'number' &&
          typeof event.data.completionTokens === 'number' &&
          typeof event.data.totalTokens === 'number' &&
          typeof event.data.model === 'string'
        )
      case 'done':
        return true
      case 'error':
        return (
          typeof event.data === 'object' &&
          typeof event.data.message === 'string' &&
          typeof event.data.code === 'string' &&
          typeof event.data.retryable === 'boolean'
        )
      default:
        return false
    }
  }
}