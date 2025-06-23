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
  | { type: 'content'; data: { delta: string; model: string }; eventId?: string }
  | { type: 'usage'; data: UsageData; eventId?: string }
  | { type: 'done'; data?: string; eventId?: string }
  | { type: 'error'; data: StreamError; eventId?: string };

export interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface StreamError {
  message: string;
  code: StreamErrorCode;
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
  CONNECTION_LOST: 'CONNECTION_LOST',
  PARSE_ERROR: 'PARSE_ERROR',
  MALFORMED_JSON: 'MALFORMED_JSON',
  PROVIDER_RATE_LIMIT: 'PROVIDER_RATE_LIMIT',
  PROVIDER_INVALID_RESPONSE: 'PROVIDER_INVALID_RESPONSE',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  UNKNOWN: 'UNKNOWN'
} as const;

export type StreamErrorCode = typeof StreamErrorCode[keyof typeof StreamErrorCode];

// Model Configuration Types
export interface ModelCost {
  input: number;
  output: number;
}

export type ModelLatencyClass = 'fast' | 'standard' | 'slow';
export type ModelStatus = 'active' | 'beta' | 'deprecated';

export interface ModelConfig {
  key: string;
  name: string;
  modelString: string;
  providerKey: string;
  description: string;
  contextWindow: number;
  outputWindow?: number;
  knowledgeCutoff?: string;
  isDefault?: boolean;
  capabilities?: string[];
  supportedModes?: string[];
  costPer1kTokens?: ModelCost;
  latencyClass?: ModelLatencyClass;
  status?: ModelStatus;
  features?: string[];
  limitations?: string[];
  warning?: string;
}

export interface ModelsMap {
  [key: string]: ModelConfig;
}

// Provider Configuration Types
export type ProviderStatus = 'active' | 'beta' | 'deprecated';

export interface ProviderConfig {
  key: string;
  name: string;
  description: string;
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
  defaultModel?: string;
  status: ProviderStatus;
  capabilities?: string[];
  requiresPaidPlan?: boolean;
  planDetails?: string;
}

export interface ProvidersMap {
  [key: string]: ProviderConfig;
}