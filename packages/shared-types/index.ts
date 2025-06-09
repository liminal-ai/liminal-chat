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

// Streaming types directly in main index
export type ProviderStreamEvent = 
  | { type: 'content'; data: string; eventId?: string }
  | { type: 'usage'; data: UsageData; eventId?: string }
  | { type: 'done'; eventId?: string }
  | { type: 'error'; data: StreamError; eventId?: string };

export interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface StreamError {
  message: string;
  code: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export const StreamErrorCode = {
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  NETWORK: 'NETWORK',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  PARSE_ERROR: 'PARSE_ERROR',
  MALFORMED_JSON: 'MALFORMED_JSON',
  PROVIDER_RATE_LIMIT: 'PROVIDER_RATE_LIMIT',
  PROVIDER_INVALID_RESPONSE: 'PROVIDER_INVALID_RESPONSE',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  UNKNOWN: 'UNKNOWN'
} as const;

export type StreamErrorCode = typeof StreamErrorCode[keyof typeof StreamErrorCode];