import fetch from 'node-fetch';
import { EdgeClientConfig } from '../utils/config';

export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  domain_available?: boolean;
}

export interface LLMPromptRequest {
  prompt: string;
  provider?: string;
}

export interface LLMPromptResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProvidersResponse {
  defaultProvider: string;
  availableProviders: string[];
  providers: {
    [key: string]: {
      available: boolean;
      status: string;
      models: string[];
      description?: string;
    };
  };
}

export interface ErrorResponse {
  error: string | {
    code: string;
    message: string;
    details?: any;
  };
  code?: string;
}

export class EdgeClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: EdgeClientConfig | string = 'http://localhost:8787') {
    if (typeof config === 'string') {
      // Legacy constructor support
      this.baseUrl = config;
      this.timeout = 30000;
    } else {
      this.baseUrl = config.baseUrl;
      this.apiKey = config.apiKey;
      this.timeout = config.timeout;
    }
  }

  async health(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json() as HealthResponse;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}`);
      }
      throw error;
    }
  }

  async prompt(text: string, options?: { provider?: string }): Promise<LLMPromptResponse> {
    try {
      const body: LLMPromptRequest = { prompt: text };
      if (options?.provider) {
        body.provider = options.provider;
      }
      
      const response = await fetch(`${this.baseUrl}/api/v1/llm/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        // Edge server returns error as string, not object
        let errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : errorData.error?.message || `Request failed: ${response.status}`;
        
        // Edge server prefixes domain errors with "Domain server error: "
        if (errorMessage.startsWith('Domain server error: ')) {
          // Try to extract the actual domain error
          const domainErrorPart = errorMessage.substring('Domain server error: '.length);
          try {
            const domainError = JSON.parse(domainErrorPart);
            errorMessage = domainError.error?.message || errorMessage;
          } catch {
            // If not JSON, use as is
            errorMessage = domainErrorPart;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json() as LLMPromptResponse;
      return result;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}`);
      }
      throw error;
    }
  }

  async getProviders(): Promise<ProvidersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/llm/providers`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        const errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : errorData.error?.message || 'Failed to fetch providers';
        throw new Error(errorMessage);
      }

      return await response.json() as ProvidersResponse;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}`);
      }
      throw error;
    }
  }

  // NOTE: The following methods are commented out as they depend on endpoints
  // that don't exist in the current Echo Provider implementation.
  // They can be uncommented when conversation management is added to the server.

  /*
  async createConversation(title?: string): Promise<ConversationResponse> {
    // Implementation removed - endpoint doesn't exist
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    // Implementation removed - endpoint doesn't exist
  }

  async addMessage(conversationId: string, content: string): Promise<MessageResponse> {
    // Implementation removed - endpoint doesn't exist
  }

  async *streamChat(params: { conversationId: string; message: string }): AsyncGenerator<ChatEvent> {
    // Implementation removed - endpoint doesn't exist
  }
  */
}