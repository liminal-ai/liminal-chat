// Edge API Types (snake_case for API-facing interfaces)

export interface PromptRequest {
  prompt: string;
  provider?: string;
}

export interface PromptResponse {
  message: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionRequest {
  prompt: string;
}

export interface ChatCompletionResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  domain_available: boolean;
  timestamp: string;
}

// Domain Service Response Types (camelCase from domain service)
export interface DomainLLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface DomainHealthResponse {
  status: 'healthy';
  service: string;
  timestamp: string;
  uptime: number;
}